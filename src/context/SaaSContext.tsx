import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SaaSProduct,
  SaaSPlan,
  TenantSubscription,
  SaaSTransaction,
  DomainRecord,
  SystemSettings,
  AuditLog,
  PortalMode,
  SchoolRegistrationData,
  ProvisioningResult,
  BillingCycle,
} from '../types/saas';
import {
  INITIAL_SAAS_PRODUCTS,
  INITIAL_SAAS_PLANS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_DOMAINS,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_AUDIT_LOGS,
} from '../services/saasMockData';
import { useTenantAuth } from './TenantAuthContext';
import { executeTenantProvisioning } from '../services/provisioningService';

interface SaaSContextType {
  // Navigation & Portal Mode
  portalMode: PortalMode;
  setPortalMode: (mode: PortalMode) => void;
  selectedRegistrationPlanId: string | null;
  startRegistrationWithPlan: (planId: string) => void;

  // Master SaaS Catalogs
  products: SaaSProduct[];
  plans: SaaSPlan[];
  subscriptions: TenantSubscription[];
  transactions: SaaSTransaction[];
  domains: DomainRecord[];
  systemSettings: SystemSettings;
  auditLogs: AuditLog[];

  // Plan Management
  updatePlan: (id: string, updates: Partial<SaaSPlan>) => void;
  addPlan: (plan: Omit<SaaSPlan, 'id'>) => SaaSPlan;
  deletePlan: (id: string) => void;

  // Product Management
  updateProduct: (id: string, updates: Partial<SaaSProduct>) => void;
  addProduct: (product: Omit<SaaSProduct, 'id'>) => SaaSProduct;
  deleteProduct: (id: string) => void;

  // Subscription Management
  updateSubscription: (id: string, updates: Partial<TenantSubscription>) => void;
  extendSubscription: (subscriptionId: string, months: number) => void;
  upgradeTenantSubscription: (schoolId: string, newPlanId: string, cycle: BillingCycle) => void;
  suspendTenant: (schoolId: string, reason: string) => void;
  activateTenant: (schoolId: string) => void;

  // Transaction & Invoice Management
  verifyTransaction: (transactionId: string, newStatus: 'Paid' | 'Failed' | 'Refunded') => void;
  addTransaction: (trx: SaaSTransaction) => void;

  // Domain Management
  updateDomain: (id: string, updates: Partial<DomainRecord>) => void;
  addDomain: (domain: DomainRecord) => void;
  checkSubdomainAvailable: (subdomain: string) => boolean;

  // System Settings
  updateSystemSettings: (updates: Partial<SystemSettings>) => void;
  addAuditLog: (log: AuditLog) => void;

  // Provisioning
  provisionSchoolTenant: (data: SchoolRegistrationData) => Promise<ProvisioningResult>;
}

const STORAGE_PREFIX = 'educore_saas_platform_v1';

const SaaSContext = createContext<SaaSContextType | undefined>(undefined);

export const SaaSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { schools, addSchool, updateSchool, addUser, switchSchool, switchUser } = useTenantAuth();

  // Mode defaults to marketing website for first-time / public visitors
  const [portalMode, setPortalModeState] = useState<PortalMode>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_portal_mode`);
    return (saved as PortalMode) || 'marketing';
  });

  const [selectedRegistrationPlanId, setSelectedRegistrationPlanId] = useState<string | null>(null);

  const [products, setProducts] = useState<SaaSProduct[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_products`);
    return saved ? JSON.parse(saved) : INITIAL_SAAS_PRODUCTS;
  });

  const [plans, setPlans] = useState<SaaSPlan[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_plans`);
    return saved ? JSON.parse(saved) : INITIAL_SAAS_PLANS;
  });

  const [subscriptions, setSubscriptions] = useState<TenantSubscription[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_subscriptions`);
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
  });

  const [transactions, setTransactions] = useState<SaaSTransaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [domains, setDomains] = useState<DomainRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_domains`);
    return saved ? JSON.parse(saved) : INITIAL_DOMAINS;
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_settings`);
    return saved ? JSON.parse(saved) : INITIAL_SYSTEM_SETTINGS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_audit_logs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_portal_mode`, portalMode);
    localStorage.setItem(`${STORAGE_PREFIX}_products`, JSON.stringify(products));
    localStorage.setItem(`${STORAGE_PREFIX}_plans`, JSON.stringify(plans));
    localStorage.setItem(`${STORAGE_PREFIX}_subscriptions`, JSON.stringify(subscriptions));
    localStorage.setItem(`${STORAGE_PREFIX}_transactions`, JSON.stringify(transactions));
    localStorage.setItem(`${STORAGE_PREFIX}_domains`, JSON.stringify(domains));
    localStorage.setItem(`${STORAGE_PREFIX}_settings`, JSON.stringify(systemSettings));
    localStorage.setItem(`${STORAGE_PREFIX}_audit_logs`, JSON.stringify(auditLogs));
  }, [portalMode, products, plans, subscriptions, transactions, domains, systemSettings, auditLogs]);

  const setPortalMode = (mode: PortalMode) => {
    setPortalModeState(mode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startRegistrationWithPlan = (planId: string) => {
    setSelectedRegistrationPlanId(planId);
    setPortalMode('register');
  };

  // Plan CRUD
  const updatePlan = (id: string, updates: Partial<SaaSPlan>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    addAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'usr-001',
      userName: 'Ahmad Faiz (Super Admin)',
      action: 'UPDATE_PLAN',
      category: 'Billing',
      details: `Memperbarui konfigurasi paket: ${id}`,
      ipAddress: '180.252.128.42',
    });
  };

  const addPlan = (planData: Omit<SaaSPlan, 'id'>): SaaSPlan => {
    const newPlan: SaaSPlan = {
      ...planData,
      id: `plan-${Date.now()}`,
    };
    setPlans((prev) => [...prev, newPlan]);
    return newPlan;
  };

  const deletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  // Product CRUD
  const updateProduct = (id: string, updates: Partial<SaaSProduct>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const addProduct = (prodData: Omit<SaaSProduct, 'id'>): SaaSProduct => {
    const newProduct: SaaSProduct = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Subscriptions
  const updateSubscription = (id: string, updates: Partial<TenantSubscription>) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const extendSubscription = (subscriptionId: string, months: number) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === subscriptionId) {
          const currentEnd = new Date(sub.endDate);
          currentEnd.setMonth(currentEnd.getMonth() + months);
          return {
            ...sub,
            endDate: currentEnd.toISOString(),
            status: 'Aktif' as const,
          };
        }
        return sub;
      })
    );
  };

  const upgradeTenantSubscription = (schoolId: string, newPlanId: string, cycle: BillingCycle) => {
    const targetPlan = plans.find((p) => p.id === newPlanId);
    if (!targetPlan) return;

    const amount = cycle === 'annually' ? targetPlan.annualPrice : targetPlan.monthlyPrice;
    const now = new Date();
    const endDate = new Date(now);
    if (cycle === 'annually') {
      endDate.setFullYear(now.getFullYear() + 1);
    } else {
      endDate.setMonth(now.getMonth() + 1);
    }

    setSubscriptions((prev) => {
      const existing = prev.find((s) => s.schoolId === schoolId);
      if (existing) {
        return prev.map((s) =>
          s.schoolId === schoolId
            ? {
                ...s,
                planId: targetPlan.id,
                planName: targetPlan.name,
                billingCycle: cycle,
                startDate: now.toISOString(),
                endDate: endDate.toISOString(),
                amount,
                status: 'Aktif' as const,
              }
            : s
        );
      } else {
        const newSub: TenantSubscription = {
          id: `sub-${Date.now()}`,
          schoolId,
          schoolName: schools.find((s) => s.id === schoolId)?.name || 'Sekolah',
          planId: targetPlan.id,
          planName: targetPlan.name,
          billingCycle: cycle,
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
          amount,
          status: 'Aktif',
          autoRenew: true,
        };
        return [newSub, ...prev];
      }
    });

    // Update School metadata
    updateSchool(schoolId, {
      planId: targetPlan.id,
      planName: targetPlan.name,
      subscriptionStatus: 'Aktif',
      maxStudents: targetPlan.maxStudents,
      maxUsers: targetPlan.maxUsers,
    });
  };

  const suspendTenant = (schoolId: string, reason: string) => {
    updateSchool(schoolId, {
      status: 'Suspended',
      subscriptionStatus: 'Suspended',
      suspendedReason: reason,
    });
    setSubscriptions((prev) =>
      prev.map((s) => (s.schoolId === schoolId ? { ...s, status: 'Suspended' as const, notes: reason } : s))
    );
    addAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'usr-001',
      userName: 'Ahmad Faiz (Super Admin)',
      action: 'SUSPEND_TENANT',
      category: 'Security',
      details: `Menangguhkan tenant ${schoolId} dengan alasan: ${reason}`,
      ipAddress: '180.252.128.42',
    });
  };

  const activateTenant = (schoolId: string) => {
    updateSchool(schoolId, {
      status: 'Aktif',
      subscriptionStatus: 'Aktif',
      suspendedReason: undefined,
    });
    setSubscriptions((prev) =>
      prev.map((s) => (s.schoolId === schoolId ? { ...s, status: 'Aktif' as const } : s))
    );
    addAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'usr-001',
      userName: 'Ahmad Faiz (Super Admin)',
      action: 'ACTIVATE_TENANT',
      category: 'Tenant',
      details: `Mengaktifkan kembali tenant ${schoolId}`,
      ipAddress: '180.252.128.42',
    });
  };

  // Transactions
  const verifyTransaction = (transactionId: string, newStatus: 'Paid' | 'Failed' | 'Refunded') => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId
          ? {
              ...t,
              status: newStatus,
              paidAt: newStatus === 'Paid' ? new Date().toISOString() : t.paidAt,
            }
          : t
      )
    );
  };

  const addTransaction = (trx: SaaSTransaction) => {
    setTransactions((prev) => [trx, ...prev]);
  };

  // Domains
  const updateDomain = (id: string, updates: Partial<DomainRecord>) => {
    setDomains((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const addDomain = (domain: DomainRecord) => {
    setDomains((prev) => [domain, ...prev]);
  };

  const checkSubdomainAvailable = (subdomain: string): boolean => {
    const clean = subdomain.trim().toLowerCase();
    if (!clean || clean.length < 3) return false;
    const existsInSchools = schools.some((s) => (s.subdomain || '').toLowerCase() === clean);
    const existsInDomains = domains.some((d) => d.subdomain.toLowerCase() === clean);
    return !existsInSchools && !existsInDomains;
  };

  const updateSystemSettings = (updates: Partial<SystemSettings>) => {
    setSystemSettings((prev) => ({ ...prev, ...updates }));
  };

  const addAuditLog = (log: AuditLog) => {
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Tenant Provisioning Executor
  const provisionSchoolTenant = async (
    data: SchoolRegistrationData
  ): Promise<ProvisioningResult> => {
    const result = await executeTenantProvisioning(data, {
      schools,
      plans,
      addSchool,
      addUser,
      addSubscription: (sub) => setSubscriptions((prev) => [sub, ...prev]),
      addTransaction: (trx) => setTransactions((prev) => [trx, ...prev]),
      addDomain: (dom) => setDomains((prev) => [dom, ...prev]),
      addAuditLog,
    });

    if (result.success && result.schoolId && result.adminUserId) {
      // Auto switch context to newly created tenant and administrator
      switchSchool(result.schoolId);
      switchUser(result.adminUserId);
    }

    return result;
  };

  return (
    <SaaSContext.Provider
      value={{
        portalMode,
        setPortalMode,
        selectedRegistrationPlanId,
        startRegistrationWithPlan,
        products,
        plans,
        subscriptions,
        transactions,
        domains,
        systemSettings,
        auditLogs,
        updatePlan,
        addPlan,
        deletePlan,
        updateProduct,
        addProduct,
        deleteProduct,
        updateSubscription,
        extendSubscription,
        upgradeTenantSubscription,
        suspendTenant,
        activateTenant,
        verifyTransaction,
        addTransaction,
        updateDomain,
        addDomain,
        checkSubdomainAvailable,
        updateSystemSettings,
        addAuditLog,
        provisionSchoolTenant,
      }}
    >
      {children}
    </SaaSContext.Provider>
  );
};

export const useSaaS = () => {
  const context = useContext(SaaSContext);
  if (!context) {
    throw new Error('useSaaS must be used within a SaaSProvider');
  }
  return context;
};

