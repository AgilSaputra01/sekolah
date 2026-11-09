import {
  SchoolRegistrationData,
  ProvisioningResult,
  SaaSPlan,
  TenantSubscription,
  SaaSTransaction,
  DomainRecord,
  AuditLog,
} from '../types/saas';
import { School, User } from '../types';

export interface ProvisionDependencies {
  schools: School[];
  plans: SaaSPlan[];
  addSchool: (data: Omit<School, 'id' | 'createdAt'>) => School;
  addUser: (data: Omit<User, 'id' | 'createdAt'>) => User;
  addSubscription: (sub: TenantSubscription) => void;
  addTransaction: (trx: SaaSTransaction) => void;
  addDomain: (dom: DomainRecord) => void;
  addAuditLog: (log: AuditLog) => void;
}

/**
 * Idempotent Tenant Provisioning Engine
 * Core engine to instantiate an isolated multi-tenant school ecosystem
 */
export const executeTenantProvisioning = async (
  regData: SchoolRegistrationData,
  deps: ProvisionDependencies
): Promise<ProvisioningResult> => {
  // Artificial delay to simulate cloud provisioning steps (DNS propagation, database migration)
  await new Promise((res) => setTimeout(res, 800));

  // 1. Idempotency check: NPSN and Subdomain collision prevention
  const cleanSubdomain = regData.subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  const existingSubdomain = deps.schools.find(
    (s) => (s.subdomain || '').toLowerCase() === cleanSubdomain
  );
  if (existingSubdomain) {
    return {
      success: false,
      error: `Subdomain "${cleanSubdomain}.educore.id" sudah digunakan oleh sekolah lain. Silakan pilih subdomain lain.`,
    };
  }

  const existingNpsn = deps.schools.find((s) => s.npsn === regData.npsn.trim());
  if (existingNpsn) {
    return {
      success: false,
      error: `Sekolah dengan NPSN ${regData.npsn} sudah terdaftar dalam sistem EduCore.`,
    };
  }

  // 2. Resolve Plan
  const plan = deps.plans.find((p) => p.id === regData.selectedPlanId) || deps.plans[0];
  const isTrial = plan.name === 'Free';

  // 3. Calculate Subscription Duration
  const now = new Date();
  const endDate = new Date(now);
  if (isTrial) {
    endDate.setDate(now.getDate() + (plan.trialDays || 14));
  } else if (regData.billingCycle === 'annually') {
    endDate.setFullYear(now.getFullYear() + 1);
  } else {
    endDate.setMonth(now.getMonth() + 1);
  }

  const basePrice = regData.billingCycle === 'annually' ? plan.annualPrice : plan.monthlyPrice;
  const subtotal = isTrial ? 0 : basePrice;
  const tax = isTrial ? 0 : Math.round(subtotal * 0.11);
  const adminFee = isTrial ? 0 : 4500;
  const total = subtotal + tax + adminFee;

  // 4. Create School Record
  const newSchool = deps.addSchool({
    npsn: regData.npsn.trim(),
    name: regData.schoolName.trim(),
    level: regData.level,
    address: `${regData.address}, Kec. ${regData.district}, ${regData.city}, Prov. ${regData.province}`,
    logo:
      regData.logo ||
      'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',
    academicYear: '2026/2027',
    status: isTrial ? 'Trial' : 'Aktif',
    phone: regData.phone,
    email: regData.email,
    principalName: regData.adminName,
    subdomain: cleanSubdomain,
    planId: plan.id,
    planName: plan.name,
    subscriptionExpiresAt: endDate.toISOString(),
    subscriptionStatus: isTrial ? 'Trial' : 'Aktif',
    maxStudents: plan.maxStudents,
    maxUsers: plan.maxUsers,
    province: regData.province,
    city: regData.city,
    district: regData.district,
    schoolType: regData.schoolType,
  });

  // 5. Create School Administrator User
  const newAdminUser = deps.addUser({
    name: regData.adminName.trim(),
    email: regData.adminEmail.trim().toLowerCase(),
    phone: regData.adminPhone.trim(),
    role: 'Admin Sekolah',
    school_id: newSchool.id,
    status: 'Aktif',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  });

  // 6. Record Tenant Subscription
  const newSubscription: TenantSubscription = {
    id: `sub-${Date.now()}`,
    schoolId: newSchool.id,
    schoolName: newSchool.name,
    planId: plan.id,
    planName: plan.name,
    billingCycle: regData.billingCycle,
    startDate: now.toISOString(),
    endDate: endDate.toISOString(),
    amount: basePrice,
    status: isTrial ? 'Trial' : 'Aktif',
    autoRenew: true,
    notes: isTrial
      ? 'Aktivasi uji coba gratis 14 hari'
      : `Langganan ${regData.billingCycle === 'annually' ? 'Tahunan' : 'Bulanan'} paket ${plan.name}`,
  };
  deps.addSubscription(newSubscription);

  // 7. Record SaaS Transaction & Invoice
  const invoiceNumber = `INV/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/EDU-${Math.floor(
    1000 + Math.random() * 9000
  )}`;
  const newTransaction: SaaSTransaction = {
    id: `trx-${Date.now()}`,
    invoiceNumber,
    schoolId: newSchool.id,
    schoolName: newSchool.name,
    planId: plan.id,
    planName: plan.name,
    billingCycle: regData.billingCycle,
    subtotal,
    tax,
    adminFee,
    total,
    paymentMethod: isTrial ? 'Free Trial' : regData.paymentMethod,
    paymentGateway: isTrial ? 'Manual' : 'Midtrans',
    status: 'Paid',
    paidAt: now.toISOString(),
    createdAt: now.toISOString(),
  };
  deps.addTransaction(newTransaction);

  // 8. Register Domain & SSL
  const newDomain: DomainRecord = {
    id: `dom-${Date.now()}`,
    schoolId: newSchool.id,
    schoolName: newSchool.name,
    subdomain: cleanSubdomain,
    fullSubdomain: `${cleanSubdomain}.educore.id`,
    sslStatus: 'Aktif',
    dnsStatus: 'Connected',
    createdAt: now.toISOString(),
  };
  deps.addDomain(newDomain);

  // 9. Append Platform Audit Log
  const newAudit: AuditLog = {
    id: `log-${Date.now()}`,
    timestamp: now.toISOString(),
    userId: newAdminUser.id,
    userName: `${newAdminUser.name} (Admin Sekolah)`,
    action: 'TENANT_PROVISION_COMPLETE',
    category: 'Tenant',
    details: `Sekolah "${newSchool.name}" (NPSN: ${newSchool.npsn}) berhasil di-provision dengan subdomain ${cleanSubdomain}.educore.id pada paket ${plan.name}`,
    ipAddress: '180.252.128.42',
  };
  deps.addAuditLog(newAudit);

  return {
    success: true,
    tenantId: newSchool.id,
    schoolId: newSchool.id,
    adminUserId: newAdminUser.id,
    subdomain: cleanSubdomain,
    invoiceNumber,
  };
};

