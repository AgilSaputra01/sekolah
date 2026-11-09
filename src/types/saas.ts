// TypeScript Definitions for EduCore Multi-Tenant SaaS Platform

export type BillingCycle = 'monthly' | 'annually';

export type PlanTier = 'Free' | 'Basic' | 'Professional' | 'Enterprise';

export type SubscriptionStatus = 'Aktif' | 'Trial' | 'Expiring' | 'Expired' | 'Suspended';

export type PaymentMethod =
  | 'BCA Virtual Account'
  | 'Mandiri Virtual Account'
  | 'BNI Virtual Account'
  | 'BRI Virtual Account'
  | 'QRIS'
  | 'Transfer Bank'
  | 'Kartu Kredit'
  | 'Free Trial';

export type PaymentGatewayType = 'Midtrans' | 'Xendit' | 'Manual';

export type TransactionStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export type PortalMode = 'marketing' | 'register' | 'controller' | 'app';

export interface SaaSProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  category: 'Core' | 'Akademik' | 'Keuangan' | 'Smart Campus' | 'Mobile';
  basePrice: number;
  features: string[];
  status: 'Aktif' | 'Nonaktif';
}

export interface SaaSPlan {
  id: string;
  name: PlanTier;
  badge?: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  maxStudents: number;
  maxUsers: number;
  features: string[];
  trialDays: number;
  isPopular?: boolean;
  status: 'Aktif' | 'Nonaktif';
}

export interface TenantSubscription {
  id: string;
  schoolId: string;
  schoolName: string;
  planId: string;
  planName: PlanTier;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string;
  amount: number;
  status: SubscriptionStatus;
  autoRenew: boolean;
  notes?: string;
}

export interface SaaSTransaction {
  id: string;
  invoiceNumber: string;
  schoolId: string;
  schoolName: string;
  planId: string;
  planName: PlanTier;
  billingCycle: BillingCycle;
  subtotal: number;
  tax: number;
  adminFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentGateway: PaymentGatewayType;
  status: TransactionStatus;
  paidAt?: string;
  createdAt: string;
  receiptUrl?: string;
}

export interface DomainRecord {
  id: string;
  schoolId: string;
  schoolName: string;
  subdomain: string; // e.g. "sman1"
  fullSubdomain: string; // e.g. "sman1.educore.id"
  customDomain?: string; // e.g. "portal.sman1jakarta.sch.id"
  sslStatus: 'Aktif' | 'Pending' | 'Error';
  dnsStatus: 'Connected' | 'Pending' | 'Config Required';
  createdAt: string;
}

export interface SystemSettings {
  platformName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  logo: string;
  trialDurationDays: number;
  currency: string;
  taxRatePercent: number;
  paymentGatewayEnabled: boolean;
  activePaymentGateway: PaymentGatewayType;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  notifyExpiringDays: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  category: 'Tenant' | 'Billing' | 'Security' | 'System';
  details: string;
  ipAddress: string;
}

// School Registration Multi-Step Payload
export interface SchoolRegistrationData {
  // Step 1: School Info
  schoolName: string;
  npsn: string;
  level: 'PAUD' | 'TK' | 'SD' | 'SMP' | 'SMA' | 'SMK' | 'MA' | 'MTs';
  schoolType: 'Negeri' | 'Swasta';
  address: string;
  province: string;
  city: string;
  district: string;
  phone: string;
  email: string;
  subdomain: string;
  logo?: string;

  // Step 2: Admin Info
  adminName: string;
  adminPosition: string;
  adminEmail: string;
  adminPhone: string;
  adminPassword: string;
  adminPasswordConfirm: string;

  // Step 3: Plan & Cycle
  selectedPlanId: string;
  billingCycle: BillingCycle;

  // Step 4: Checkout
  paymentMethod: PaymentMethod;
  termsAccepted: boolean;
}

export interface ProvisioningStepStatus {
  step: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface ProvisioningResult {
  success: boolean;
  tenantId?: string;
  schoolId?: string;
  adminUserId?: string;
  subdomain?: string;
  invoiceNumber?: string;
  error?: string;
}

