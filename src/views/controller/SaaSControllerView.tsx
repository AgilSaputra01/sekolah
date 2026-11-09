import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Package,
  Layers,
  CreditCard,
  Receipt,
  Globe,
  Settings,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  ShieldCheck,
  DollarSign,
  Users,
  FileText,
  Printer,
} from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';
import { useTenantAuth } from '../../context/TenantAuthContext';
import { useToast } from '../../context/ToastContext';
import { StatCard, Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal, ConfirmModal } from '../../components/common/Modal';
import {
  SaaSPlan,
  SaaSProduct,
  TenantSubscription,
  SaaSTransaction,
  DomainRecord,
  PlanTier,
  BillingCycle,
} from '../../types/saas';
import { School } from '../../types';

export type ControllerTab =
  | 'overview'
  | 'schools'
  | 'products'
  | 'plans'
  | 'subscriptions'
  | 'transactions'
  | 'domains'
  | 'settings';

export const SaaSControllerView: React.FC = () => {
  const {
    products,
    plans,
    subscriptions,
    transactions,
    domains,
    systemSettings,
    auditLogs,
    updatePlan,
    addPlan,
    updateProduct,
    addProduct,
    deleteProduct,
    extendSubscription,
    upgradeTenantSubscription,
    suspendTenant,
    activateTenant,
    verifyTransaction,
    updateDomain,
    checkSubdomainAvailable,
    updateSystemSettings,
    setPortalMode,
  } = useSaaS();

  const {
    schools,
    users,
    students,
    switchSchool,
    deleteSchool,
  } = useTenantAuth();

  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<ControllerTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showSchoolDetailModal, setShowSchoolDetailModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('Pelanggaran ketentuan pembayaran / permintaan administrasi');
  const [showDeleteSchoolConfirm, setShowDeleteSchoolConfirm] = useState(false);

  // Product Modal State
  const [editingProduct, setEditingProduct] = useState<SaaSProduct | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState<Partial<SaaSProduct>>({
    name: '',
    tagline: '',
    description: '',
    category: 'Core',
    basePrice: 500000,
    features: ['Fitur 1', 'Fitur 2'],
    status: 'Aktif',
    icon: 'Building2',
  });

  // Plan Modal State
  const [editingPlan, setEditingPlan] = useState<SaaSPlan | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState<Partial<SaaSPlan>>({
    name: 'Basic',
    description: '',
    monthlyPrice: 499000,
    annualPrice: 4990000,
    maxStudents: 300,
    maxUsers: 30,
    trialDays: 0,
    features: ['Fitur dasar'],
    status: 'Aktif',
  });

  // Extend Subscription Modal
  const [extendingSub, setExtendingSub] = useState<TenantSubscription | null>(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendMonths, setExtendMonths] = useState(1);

  // Upgrade Subscription Modal
  const [upgradingSub, setUpgradingSub] = useState<TenantSubscription | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [targetPlanId, setTargetPlanId] = useState(plans[0]?.id || '');
  const [targetCycle, setTargetCycle] = useState<BillingCycle>('annually');

  // Invoice Modal State
  const [viewingInvoice, setViewingInvoice] = useState<SaaSTransaction | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Domain modal
  const [showCustomDomainModal, setShowCustomDomainModal] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [selectedDomainRecord, setSelectedDomainRecord] = useState<DomainRecord | null>(null);

  // Subdomain checker test
  const [testSubdomain, setTestSubdomain] = useState('');
  const [testSubdomainResult, setTestSubdomainResult] = useState<boolean | null>(null);

  // Format Rupiah
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Calculations for Overview Tab
  const totalSchools = schools.length;
  const activeSchools = schools.filter((s) => s.status === 'Aktif').length;
  const trialSchools = schools.filter((s) => s.status === 'Trial').length;
  const suspendedSchools = schools.filter((s) => s.status === 'Suspended').length;
  const totalPaidRevenue = transactions
    .filter((t) => t.status === 'Paid')
    .reduce((acc, curr) => acc + curr.total, 0);

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'Aktif' || s.status === 'Trial').length;
  const expiringSubscriptions = subscriptions.filter((s) => s.status === 'Expiring').length;

  // Jump / Impersonate to School App as that Tenant
  const handleAccessSchool = (schoolId: string) => {
    switchSchool(schoolId);
    setPortalMode('app');
    success('Beralih ke Dashboard Tenant', `Membuka aplikasi sekolah untuk tenant ID: ${schoolId}`);
  };

  // Confirm Suspend School
  const handleConfirmSuspend = () => {
    if (selectedSchool) {
      suspendTenant(selectedSchool.id, suspendReason);
      setShowSuspendModal(false);
      success('Tenant Ditangguhkan', `Sekolah ${selectedSchool.name} telah di-suspend.`);
    }
  };

  // Confirm Delete School
  const handleConfirmDelete = () => {
    if (selectedSchool) {
      deleteSchool(selectedSchool.id);
      setShowDeleteSchoolConfirm(false);
      setShowSchoolDetailModal(false);
      success('Sekolah Dihapus', `Data tenant ${selectedSchool.name} berhasil dihapus.`);
    }
  };

  // Save Product
  const handleSaveProduct = () => {
    if (!productForm.name) {
      toastError('Nama Produk Wajib', 'Silakan masukkan nama produk.');
      return;
    }
    if (editingProduct) {
      updateProduct(editingProduct.id, productForm);
      success('Produk Diperbarui', `Produk ${productForm.name} berhasil disimpan.`);
    } else {
      addProduct({
        name: productForm.name || 'Produk Baru',
        tagline: productForm.tagline || '',
        description: productForm.description || '',
        category: (productForm.category as any) || 'Core',
        basePrice: Number(productForm.basePrice) || 0,
        features: productForm.features || [],
        status: (productForm.status as any) || 'Aktif',
        icon: productForm.icon || 'Building2',
      });
      success('Produk Ditambahkan', 'Produk baru siap ditawarkan.');
    }
    setShowProductModal(false);
    setEditingProduct(null);
  };

  // Save Plan
  const handleSavePlan = () => {
    if (!planForm.name) {
      toastError('Nama Paket Wajib', 'Silakan tentukan nama paket.');
      return;
    }
    if (editingPlan) {
      updatePlan(editingPlan.id, planForm);
      success('Paket Diperbarui', `Paket ${planForm.name} diperbarui secara real-time.`);
    } else {
      addPlan({
        name: (planForm.name as PlanTier) || 'Basic',
        description: planForm.description || '',
        monthlyPrice: Number(planForm.monthlyPrice) || 0,
        annualPrice: Number(planForm.annualPrice) || 0,
        maxStudents: Number(planForm.maxStudents) || 100,
        maxUsers: Number(planForm.maxUsers) || 10,
        trialDays: Number(planForm.trialDays) || 0,
        features: planForm.features || ['Fitur Standar'],
        status: (planForm.status as any) || 'Aktif',
      });
      success('Paket Ditambahkan', 'Paket langganan baru telah aktif.');
    }
    setShowPlanModal(false);
    setEditingPlan(null);
  };

  // Save Custom Domain
  const handleSaveCustomDomain = () => {
    if (!selectedDomainRecord || !customDomainInput.trim()) return;
    updateDomain(selectedDomainRecord.id, {
      customDomain: customDomainInput.trim().toLowerCase(),
      dnsStatus: 'Pending',
    });
    setShowCustomDomainModal(false);
    success('Domain Terhubung', `Custom domain ${customDomainInput} sedang diverifikasi DNS.`);
  };

  return (
    <div className="saas-controller-layout animate-fade-in">
      {/* SaaS Controller Top Header Banner */}
      <header className="controller-top-header">
        <div className="controller-header-left">
          <div className="controller-title-badge">
            <Sparkles size={16} />
            <span>EduCore Master SaaS Controller</span>
          </div>
          <h1>Pusat Kendali Ekosistem Multi-Tenant EduCore</h1>
          <p>
            Kelola seluruh tenant sekolah, katalog produk, paket lisensi, penagihan, custom domain, dan konfigurasi platform.
          </p>
        </div>

        <div className="controller-header-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPortalMode('marketing')}
            icon={<Globe size={14} />}
          >
            Lihat Website Publik
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setPortalMode('app')}
            icon={<Building2 size={14} />}
          >
            Buka Aplikasi Sekolah
          </Button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="controller-nav-tabs">
        <button
          className={`controller-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <LayoutDashboard size={16} />
          <span>Overview</span>
        </button>

        <button
          className={`controller-tab-btn ${activeTab === 'schools' ? 'active' : ''}`}
          onClick={() => setActiveTab('schools')}
        >
          <Building2 size={16} />
          <span>Tenant & Sekolah</span>
          <span className="tab-pill">{schools.length}</span>
        </button>

        <button
          className={`controller-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={16} />
          <span>Katalog Produk</span>
          <span className="tab-pill">{products.length}</span>
        </button>

        <button
          className={`controller-tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          <Layers size={16} />
          <span>Paket Langganan</span>
          <span className="tab-pill">{plans.length}</span>
        </button>

        <button
          className={`controller-tab-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          <Receipt size={16} />
          <span>Subscriptions</span>
          <span className="tab-pill">{subscriptions.length}</span>
        </button>

        <button
          className={`controller-tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          <CreditCard size={16} />
          <span>Transaksi & Invoice</span>
          <span className="tab-pill">{transactions.length}</span>
        </button>

        <button
          className={`controller-tab-btn ${activeTab === 'domains' ? 'active' : ''}`}
          onClick={() => setActiveTab('domains')}
        >
          <Globe size={16} />
          <span>Domain & SSL</span>
          <span className="tab-pill">{domains.length}</span>
        </button>

        <button
          className={`controller-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={16} />
          <span>Pengaturan Sistem</span>
        </button>
      </nav>

      {/* TAB CONTENT AREA */}
      <div className="controller-tab-content">
        {/* ========================================================================= */}
        {/* A. OVERVIEW TAB */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="overview-container animate-fade-in">
            {/* Stat Cards 4x2 */}
            <div className="stats-grid">
              <StatCard
                label="Total Sekolah Terdaftar"
                value={totalSchools}
                icon={<Building2 size={22} />}
                color="indigo"
                trend="Tenant terdaftar di sistem"
              />
              <StatCard
                label="Sekolah Aktif"
                value={activeSchools}
                icon={<CheckCircle size={22} />}
                color="emerald"
                trend="Tenant beroperasi aktif"
              />
              <StatCard
                label="Sekolah Masa Trial"
                value={trialSchools}
                icon={<Clock size={22} />}
                color="amber"
                trend="Uji coba gratis 14 hari"
              />
              <StatCard
                label="Sekolah Ditangguhkan"
                value={suspendedSchools}
                icon={<AlertTriangle size={22} />}
                color="rose"
                trend="Status suspend / jatuh tempo"
              />
            </div>

            <div className="stats-grid" style={{ marginTop: '16px' }}>
              <StatCard
                label="Total Pendapatan (Paid)"
                value={formatRupiah(totalPaidRevenue)}
                icon={<DollarSign size={22} />}
                color="emerald"
                trend="Akumulasi penerimaan invoice"
              />
              <StatCard
                label="Total Pelanggan & User"
                value={users.length}
                icon={<Users size={22} />}
                color="sky"
                trend="Admin, Guru, Staff terdaftar"
              />
              <StatCard
                label="Subscription Aktif"
                value={activeSubscriptions}
                icon={<Receipt size={22} />}
                color="purple"
                trend="Langganan berjalan"
              />
              <StatCard
                label="Masa Aktif Segera Berakhir"
                value={expiringSubscriptions}
                icon={<Clock size={22} />}
                color="amber"
                trend="Jatuh tempo < 7 hari"
              />
            </div>

            {/* Visual Analytics Grid */}
            <div className="dashboard-grid-2" style={{ marginTop: '24px' }}>
              <Card
                title="Tren Pertumbuhan Tenant Sekolah"
                subtitle="Pendaftaran sekolah baru 6 bulan terakhir"
              >
                <div className="chart-bars-mockup">
                  <div className="chart-bar-col">
                    <div className="chart-bar" style={{ height: '35%' }}>
                      <span className="bar-val">12</span>
                    </div>
                    <span className="bar-lbl">Jun</span>
                  </div>
                  <div className="chart-bar-col">
                    <div className="chart-bar" style={{ height: '48%' }}>
                      <span className="bar-val">18</span>
                    </div>
                    <span className="bar-lbl">Jul</span>
                  </div>
                  <div className="chart-bar-col">
                    <div className="chart-bar" style={{ height: '62%' }}>
                      <span className="bar-val">26</span>
                    </div>
                    <span className="bar-lbl">Ags</span>
                  </div>
                  <div className="chart-bar-col">
                    <div className="chart-bar" style={{ height: '75%' }}>
                      <span className="bar-val">34</span>
                    </div>
                    <span className="bar-lbl">Sep</span>
                  </div>
                  <div className="chart-bar-col">
                    <div className="chart-bar" style={{ height: '90%' }}>
                      <span className="bar-val">42</span>
                    </div>
                    <span className="bar-lbl">Okt</span>
                  </div>
                  <div className="chart-bar-col active">
                    <div className="chart-bar" style={{ height: '100%' }}>
                      <span className="bar-val">{schools.length}</span>
                    </div>
                    <span className="bar-lbl">Nov (Kini)</span>
                  </div>
                </div>
              </Card>

              <Card
                title="Distribusi Paket Berlangganan"
                subtitle="Persentase sekolah berdasarkan tier"
              >
                <div className="plan-dist-list">
                  {plans.map((p) => {
                    const count = schools.filter((s) => s.planName === p.name).length;
                    const pct = schools.length > 0 ? Math.round((count / schools.length) * 100) : 0;
                    return (
                      <div key={p.id} className="dist-row">
                        <div className="dist-info">
                          <strong>Paket {p.name}</strong>
                          <span>
                            {count} Sekolah ({pct}%)
                          </span>
                        </div>
                        <div className="dist-bar-track">
                          <div className="dist-bar-fill" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* B. SCHOOL / TENANT MANAGEMENT TAB */}
        {/* ========================================================================= */}
        {activeTab === 'schools' && (
          <div className="controller-schools-container animate-fade-in">
            <div className="section-toolbar">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Cari nama sekolah, NPSN, subdomain..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="toolbar-actions">
                <Button
                  variant="primary"
                  icon={<Plus size={16} />}
                  onClick={() => setPortalMode('register')}
                >
                  Registrasi Tenant Baru
                </Button>
              </div>
            </div>

            <Card>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sekolah & Tenant</th>
                      <th>NPSN & Jenjang</th>
                      <th>Subdomain</th>
                      <th>Paket & Kuota Siswa</th>
                      <th>Status Tenant</th>
                      <th>Masa Berlaku</th>
                      <th style={{ textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schools
                      .filter((s) =>
                        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.npsn.includes(searchTerm) ||
                        (s.subdomain || '').toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((sch) => {
                        const schoolStudents = students.filter((st) => st.school_id === sch.id).length;
                        const maxStudents = sch.maxStudents || 350;
                        const sub = subscriptions.find((sub) => sub.schoolId === sch.id);

                        return (
                          <tr key={sch.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="tenant-logo-avatar">
                                  {sch.logo ? (
                                    <img src={sch.logo} alt={sch.name} />
                                  ) : (
                                    sch.name.charAt(0)
                                  )}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600 }}>{sch.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    ID: {sch.id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>{sch.npsn}</div>
                              <span className="badge badge-primary">{sch.level}</span>
                            </td>
                            <td>
                              <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>
                                {sch.subdomain ? `${sch.subdomain}.educore.id` : '-'}
                              </span>
                            </td>
                            <td>
                              <div><strong>{sch.planName || 'Basic'}</strong></div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {schoolStudents} / {maxStudents} Siswa
                              </div>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  sch.status === 'Aktif'
                                    ? 'badge-success'
                                    : sch.status === 'Trial'
                                    ? 'badge-warning'
                                    : sch.status === 'Suspended'
                                    ? 'badge-danger'
                                    : 'badge-neutral'
                                }`}
                              >
                                {sch.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.8rem' }}>
                                {sub?.endDate
                                  ? new Date(sub.endDate).toLocaleDateString('id-ID')
                                  : '-'}
                              </div>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button
                                  className="btn btn-outline btn-sm"
                                  title="Akses Langsung Tenant"
                                  onClick={() => handleAccessSchool(sch.id)}
                                >
                                  <ExternalLink size={13} />
                                  <span>Buka</span>
                                </button>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  title="Detail Sekolah"
                                  onClick={() => {
                                    setSelectedSchool(sch);
                                    setShowSchoolDetailModal(true);
                                  }}
                                >
                                  <Eye size={14} />
                                </button>
                                {sch.status === 'Suspended' ? (
                                  <button
                                    className="btn btn-ghost btn-sm"
                                    title="Aktifkan Kembali"
                                    style={{ color: '#10b981' }}
                                    onClick={() => activateTenant(sch.id)}
                                  >
                                    <CheckCircle size={14} />
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-ghost btn-sm"
                                    title="Suspend Tenant"
                                    style={{ color: '#f59e0b' }}
                                    onClick={() => {
                                      setSelectedSchool(sch);
                                      setShowSuspendModal(true);
                                    }}
                                  >
                                    <AlertTriangle size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* C. PRODUCT MANAGEMENT TAB */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="controller-products-container animate-fade-in">
            <div className="section-toolbar">
              <div>
                <h2>Katalog Modul & Produk SaaS EduCore</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Atur daftar modul yang ditampilkan di halaman publik marketing dan paket berlangganan.
                </p>
              </div>

              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: '',
                    tagline: '',
                    description: '',
                    category: 'Core',
                    basePrice: 500000,
                    features: ['Fitur 1', 'Fitur 2'],
                    status: 'Aktif',
                    icon: 'Building2',
                  });
                  setShowProductModal(true);
                }}
              >
                Tambah Produk Baru
              </Button>
            </div>

            <div className="products-grid-controller">
              {products.map((prod) => (
                <div key={prod.id} className="product-ctrl-card">
                  <div className="product-ctrl-header">
                    <div>
                      <span className="badge badge-primary">{prod.category}</span>
                      <h3 style={{ marginTop: '8px' }}>{prod.name}</h3>
                      <p className="product-ctrl-tagline">{prod.tagline}</p>
                    </div>
                    <span
                      className={`badge ${prod.status === 'Aktif' ? 'badge-success' : 'badge-neutral'}`}
                    >
                      {prod.status}
                    </span>
                  </div>

                  <p className="product-ctrl-desc">{prod.description}</p>

                  <div className="product-ctrl-price">
                    <span>Base Price:</span>
                    <strong>{formatRupiah(prod.basePrice)}/bln</strong>
                  </div>

                  <div className="product-ctrl-features">
                    <strong>Fitur Utama:</strong>
                    <ul>
                      {prod.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="product-ctrl-actions">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit2 size={13} />}
                      onClick={() => {
                        setEditingProduct(prod);
                        setProductForm(prod);
                        setShowProductModal(true);
                      }}
                    >
                      Edit Produk
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      style={{ color: '#ef4444' }}
                      icon={<Trash2 size={13} />}
                      onClick={() => {
                        deleteProduct(prod.id);
                        success('Produk Dihapus', `Produk ${prod.name} dihapus dari katalog.`);
                      }}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* D. SUBSCRIPTION PLANS TAB */}
        {/* ========================================================================= */}
        {activeTab === 'plans' && (
          <div className="controller-plans-container animate-fade-in">
            <div className="section-toolbar">
              <div>
                <h2>Kelola Paket Langganan SaaS</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Perubahan harga, kuota, atau fitur langsung terhubung dan tampil di halaman pricing publik.
                </p>
              </div>

              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => {
                  setEditingPlan(null);
                  setPlanForm({
                    name: 'Basic',
                    description: '',
                    monthlyPrice: 499000,
                    annualPrice: 4990000,
                    maxStudents: 300,
                    maxUsers: 30,
                    trialDays: 0,
                    features: ['Fitur Utama'],
                    status: 'Aktif',
                  });
                  setShowPlanModal(true);
                }}
              >
                Buat Paket Baru
              </Button>
            </div>

            <div className="plans-grid-controller">
              {plans.map((p) => (
                <div key={p.id} className="plan-ctrl-card">
                  <div className="plan-ctrl-header">
                    <div>
                      <h3>Paket {p.name}</h3>
                      {p.badge && <span className="badge badge-primary">{p.badge}</span>}
                    </div>
                    <span className="badge badge-success">{p.status}</span>
                  </div>

                  <p className="plan-ctrl-desc">{p.description}</p>

                  <div className="plan-ctrl-pricing">
                    <div className="price-item">
                      <span className="lbl">Bulanan</span>
                      <span className="val">{formatRupiah(p.monthlyPrice)}</span>
                    </div>
                    <div className="price-item">
                      <span className="lbl">Tahunan</span>
                      <span className="val">{formatRupiah(p.annualPrice)}</span>
                    </div>
                  </div>

                  <div className="plan-ctrl-quota">
                    <div>Maksimal Siswa: <strong>{p.maxStudents.toLocaleString()}</strong></div>
                    <div>Maksimal Staf / Pengguna: <strong>{p.maxUsers}</strong></div>
                    <div>Masa Uji Coba: <strong>{p.trialDays} Hari</strong></div>
                  </div>

                  <div className="plan-ctrl-features">
                    <span className="lbl">Daftar Fitur:</span>
                    <ul>
                      {p.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="plan-ctrl-actions">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Edit2 size={13} />}
                      onClick={() => {
                        setEditingPlan(p);
                        setPlanForm(p);
                        setShowPlanModal(true);
                      }}
                    >
                      Ubah Paket & Harga
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* E. SUBSCRIPTION MANAGEMENT TAB */}
        {/* ========================================================================= */}
        {activeTab === 'subscriptions' && (
          <div className="controller-subs-container animate-fade-in">
            <div className="section-toolbar">
              <div>
                <h2>Daftar Langganan Tenant Sekolah</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Pantau masa aktif, perpanjangan, serta kelola upgrade dan downgrade lisensi.
                </p>
              </div>
            </div>

            <Card>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sekolah</th>
                      <th>Paket</th>
                      <th>Siklus Tagihan</th>
                      <th>Mulai Langganan</th>
                      <th>Berakhir</th>
                      <th>Nominal</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((sub) => (
                      <tr key={sub.id}>
                        <td>
                          <strong>{sub.schoolName}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ID: {sub.schoolId}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-primary">{sub.planName}</span>
                        </td>
                        <td>
                          {sub.billingCycle === 'annually' ? 'Tahunan' : 'Bulanan'}
                        </td>
                        <td>{new Date(sub.startDate).toLocaleDateString('id-ID')}</td>
                        <td>{new Date(sub.endDate).toLocaleDateString('id-ID')}</td>
                        <td>{formatRupiah(sub.amount)}</td>
                        <td>
                          <span
                            className={`badge ${
                              sub.status === 'Aktif'
                                ? 'badge-success'
                                : sub.status === 'Trial'
                                ? 'badge-warning'
                                : sub.status === 'Expiring'
                                ? 'badge-warning'
                                : 'badge-danger'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setExtendingSub(sub);
                                setShowExtendModal(true);
                              }}
                            >
                              Perpanjang
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setUpgradingSub(sub);
                                setTargetPlanId(plans[2]?.id || plans[0]?.id || '');
                                setShowUpgradeModal(true);
                              }}
                            >
                              Upgrade
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* F. TRANSACTION & PAYMENT TAB */}
        {/* ========================================================================= */}
        {activeTab === 'transactions' && (
          <div className="controller-trx-container animate-fade-in">
            <div className="section-toolbar">
              <div>
                <h2>Riwayat Transaksi & Invoice SaaS</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Log pembayaran tenant, integrasi gateway, dan verifikasi invoice.
                </p>
              </div>
            </div>

            <Card>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No. Invoice</th>
                      <th>Nama Sekolah</th>
                      <th>Paket & Siklus</th>
                      <th>Metode Bayar</th>
                      <th>Total Tagihan</th>
                      <th>Status</th>
                      <th>Tanggal</th>
                      <th style={{ textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((trx) => (
                      <tr key={trx.id}>
                        <td>
                          <span className="font-mono" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                            {trx.invoiceNumber}
                          </span>
                        </td>
                        <td>{trx.schoolName}</td>
                        <td>
                          {trx.planName} ({trx.billingCycle === 'annually' ? 'Tahunan' : 'Bulanan'})
                        </td>
                        <td>{trx.paymentMethod}</td>
                        <td><strong>{formatRupiah(trx.total)}</strong></td>
                        <td>
                          <span
                            className={`badge ${
                              trx.status === 'Paid'
                                ? 'badge-success'
                                : trx.status === 'Pending'
                                ? 'badge-warning'
                                : 'badge-danger'
                            }`}
                          >
                            {trx.status}
                          </span>
                        </td>
                        <td>{new Date(trx.createdAt).toLocaleDateString('id-ID')}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<FileText size={13} />}
                              onClick={() => {
                                setViewingInvoice(trx);
                                setShowInvoiceModal(true);
                              }}
                            >
                              Lihat Invoice
                            </Button>
                            {trx.status === 'Pending' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  verifyTransaction(trx.id, 'Paid');
                                  success('Pembayaran Terverifikasi', `Invoice ${trx.invoiceNumber} ditandai Paid.`);
                                }}
                              >
                                Verifikasi Paid
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* G. DOMAIN MANAGEMENT TAB */}
        {/* ========================================================================= */}
        {activeTab === 'domains' && (
          <div className="controller-domains-container animate-fade-in">
            <div className="section-toolbar">
              <div>
                <h2>Domain & SSL Multi-Tenant</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Kelola routing subdomain otomatis dan custom domain sekolah (.sch.id).
                </p>
              </div>

              {/* Subdomain Checker Widget */}
              <div className="subdomain-check-widget">
                <input
                  type="text"
                  placeholder="Cek subdomain..."
                  value={testSubdomain}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    setTestSubdomain(val);
                    if (val.length >= 3) {
                      setTestSubdomainResult(checkSubdomainAvailable(val));
                    } else {
                      setTestSubdomainResult(null);
                    }
                  }}
                />
                <span className="check-suffix">.educore.id</span>
                {testSubdomainResult !== null && (
                  <span className={`check-pill ${testSubdomainResult ? 'avail' : 'taken'}`}>
                    {testSubdomainResult ? 'Tersedia' : 'Sudah Dipakai'}
                  </span>
                )}
              </div>
            </div>

            <Card>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nama Sekolah</th>
                      <th>Subdomain Resmi</th>
                      <th>Custom Domain</th>
                      <th>Status SSL</th>
                      <th>Status DNS</th>
                      <th style={{ textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domains.map((dom) => (
                      <tr key={dom.id}>
                        <td><strong>{dom.schoolName}</strong></td>
                        <td>
                          <span className="font-mono text-primary">{dom.fullSubdomain}</span>
                        </td>
                        <td>
                          {dom.customDomain ? (
                            <span className="font-mono">{dom.customDomain}</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Belum Dihubungkan</span>
                          )}
                        </td>
                        <td>
                          <span className="badge badge-success">
                            <ShieldCheck size={12} style={{ marginRight: '4px' }} />
                            {dom.sslStatus}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              dom.dnsStatus === 'Connected' ? 'badge-success' : 'badge-warning'
                            }`}
                          >
                            {dom.dnsStatus}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDomainRecord(dom);
                              setCustomDomainInput(dom.customDomain || '');
                              setShowCustomDomainModal(true);
                            }}
                          >
                            Hubungkan Custom Domain
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* H. SYSTEM SETTINGS & AUDIT LOGS TAB */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="controller-settings-container animate-fade-in">
            <div className="settings-grid-2">
              <Card title="Konfigurasi Metadata Platform">
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Nama Platform SaaS</label>
                  <input
                    type="text"
                    value={systemSettings.platformName}
                    onChange={(e) => updateSystemSettings({ platformName: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Tagline Platform</label>
                  <input
                    type="text"
                    value={systemSettings.tagline}
                    onChange={(e) => updateSystemSettings({ tagline: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Email Support Resmi</label>
                  <input
                    type="email"
                    value={systemSettings.supportEmail}
                    onChange={(e) => updateSystemSettings({ supportEmail: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Tarif PPN (%)</label>
                  <input
                    type="number"
                    value={systemSettings.taxRatePercent}
                    onChange={(e) => updateSystemSettings({ taxRatePercent: Number(e.target.value) })}
                  />
                </div>
              </Card>

              <Card title="Payment Gateway & SMTP Server">
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Gateway Pembayaran Aktif</label>
                  <select
                    value={systemSettings.activePaymentGateway}
                    onChange={(e) =>
                      updateSystemSettings({ activePaymentGateway: e.target.value as any })
                    }
                  >
                    <option value="Midtrans">Midtrans Snap & Core API</option>
                    <option value="Xendit">Xendit Payment Gateway</option>
                    <option value="Manual">Manual Bank Transfer Escrow</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>SMTP Host Notifikasi</label>
                  <input
                    type="text"
                    value={systemSettings.smtpHost}
                    onChange={(e) => updateSystemSettings({ smtpHost: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>SMTP Port</label>
                  <input
                    type="number"
                    value={systemSettings.smtpPort}
                    onChange={(e) => updateSystemSettings({ smtpPort: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Durasi Free Trial Default (Hari)</label>
                  <input
                    type="number"
                    value={systemSettings.trialDurationDays}
                    onChange={(e) =>
                      updateSystemSettings({ trialDurationDays: Number(e.target.value) })
                    }
                  />
                </div>
              </Card>
            </div>

            {/* Audit Logs Table */}
            <div style={{ marginTop: '24px' }}>
              <Card title="Platform Audit Trail & Security Logs">
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Waktu (UTC)</th>
                        <th>Pengguna</th>
                        <th>Aksi</th>
                        <th>Kategori</th>
                        <th>Rincian Aktivitas</th>
                        <th>IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {new Date(log.timestamp).toLocaleString('id-ID')}
                            </span>
                          </td>
                          <td><strong>{log.userName}</strong></td>
                          <td>
                            <span className="font-mono" style={{ fontSize: '0.78rem' }}>
                              {log.action}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-primary">{log.category}</span>
                          </td>
                          <td>{log.details}</td>
                          <td>
                            <span className="font-mono" style={{ fontSize: '0.78rem' }}>
                              {log.ipAddress}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* School Detail Modal */}
      {selectedSchool && (
        <Modal
          isOpen={showSchoolDetailModal}
          onClose={() => setShowSchoolDetailModal(false)}
          title={`Detail Tenant: ${selectedSchool.name}`}
          size="lg"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Button
                variant="danger"
                onClick={() => setShowDeleteSchoolConfirm(true)}
              >
                Hapus Tenant Sekolah
              </Button>
              <Button variant="outline" onClick={() => setShowSchoolDetailModal(false)}>
                Tutup
              </Button>
            </div>
          }
        >
          <div className="form-grid-2">
            <div>
              <strong>NPSN:</strong> <div>{selectedSchool.npsn}</div>
            </div>
            <div>
              <strong>Jenjang:</strong> <div>{selectedSchool.level}</div>
            </div>
            <div>
              <strong>Subdomain:</strong>{' '}
              <div className="font-mono text-primary">
                {selectedSchool.subdomain ? `${selectedSchool.subdomain}.educore.id` : '-'}
              </div>
            </div>
            <div>
              <strong>Paket Aktif:</strong> <div>{selectedSchool.planName || 'Basic'}</div>
            </div>
            <div>
              <strong>Email Kontak:</strong> <div>{selectedSchool.email || '-'}</div>
            </div>
            <div>
              <strong>Telepon:</strong> <div>{selectedSchool.phone || '-'}</div>
            </div>
            <div className="full-width">
              <strong>Alamat:</strong> <div>{selectedSchool.address}</div>
            </div>
          </div>
        </Modal>
      )}

      {/* Suspend Confirmation Modal */}
      <Modal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        title="Konfirmasi Penangguhan (Suspend) Tenant"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowSuspendModal(false)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleConfirmSuspend}>
              Ya, Suspend Tenant
            </Button>
          </>
        }
      >
        <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
          Apakah Anda yakin ingin menangguhkan akses untuk sekolah{' '}
          <strong>{selectedSchool?.name}</strong>? Pengguna tenant tidak akan dapat mengakses data aplikasi hingga diaktifkan kembali.
        </p>
        <div className="form-group">
          <label>Alasan Penangguhan:</label>
          <input
            type="text"
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
          />
        </div>
      </Modal>

      {/* Safe Delete School Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteSchoolConfirm}
        onClose={() => setShowDeleteSchoolConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Tenant Sekolah Secara Permanen?"
        message={`Tindakan ini akan menghapus seluruh data siswa, guru, rombel, dan akun yang terkait dengan ${selectedSchool?.name}. Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus Permanen"
        variant="danger"
      />

      {/* Product Edit/Create Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title={editingProduct ? 'Edit Modul Produk' : 'Tambah Produk Baru'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowProductModal(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveProduct}>
              Simpan Produk
            </Button>
          </>
        }
      >
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label>Nama Produk *</label>
          <input
            type="text"
            value={productForm.name || ''}
            onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
          />
        </div>
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label>Tagline</label>
          <input
            type="text"
            value={productForm.tagline || ''}
            onChange={(e) => setProductForm((p) => ({ ...p, tagline: e.target.value }))}
          />
        </div>
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label>Kategori</label>
          <select
            value={productForm.category || 'Core'}
            onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value as any }))}
          >
            <option value="Core">Core</option>
            <option value="Akademik">Akademik</option>
            <option value="Keuangan">Keuangan</option>
            <option value="Smart Campus">Smart Campus</option>
            <option value="Mobile">Mobile</option>
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label>Harga Base (Rp/bulan)</label>
          <input
            type="number"
            value={productForm.basePrice || 0}
            onChange={(e) => setProductForm((p) => ({ ...p, basePrice: Number(e.target.value) }))}
          />
        </div>
        <div className="form-group">
          <label>Deskripsi Singkat</label>
          <textarea
            rows={2}
            value={productForm.description || ''}
            onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
          />
        </div>
      </Modal>

      {/* Plan Edit/Create Modal */}
      <Modal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        title={editingPlan ? `Edit Paket ${editingPlan.name}` : 'Buat Paket Langganan Baru'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowPlanModal(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSavePlan}>
              Simpan Paket
            </Button>
          </>
        }
      >
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label>Nama Paket</label>
          <select
            value={planForm.name || 'Basic'}
            onChange={(e) => setPlanForm((p) => ({ ...p, name: e.target.value as PlanTier }))}
          >
            <option value="Free">Free</option>
            <option value="Basic">Basic</option>
            <option value="Professional">Professional</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label>Deskripsi</label>
          <input
            type="text"
            value={planForm.description || ''}
            onChange={(e) => setPlanForm((p) => ({ ...p, description: e.target.value }))}
          />
        </div>
        <div className="form-grid-2" style={{ marginBottom: '12px' }}>
          <div className="form-group">
            <label>Harga Bulanan (Rp)</label>
            <input
              type="number"
              value={planForm.monthlyPrice || 0}
              onChange={(e) => setPlanForm((p) => ({ ...p, monthlyPrice: Number(e.target.value) }))}
            />
          </div>
          <div className="form-group">
            <label>Harga Tahunan (Rp)</label>
            <input
              type="number"
              value={planForm.annualPrice || 0}
              onChange={(e) => setPlanForm((p) => ({ ...p, annualPrice: Number(e.target.value) }))}
            />
          </div>
        </div>
        <div className="form-grid-2">
          <div className="form-group">
            <label>Batas Kuota Siswa</label>
            <input
              type="number"
              value={planForm.maxStudents || 100}
              onChange={(e) => setPlanForm((p) => ({ ...p, maxStudents: Number(e.target.value) }))}
            />
          </div>
          <div className="form-group">
            <label>Batas Kuota Pengguna</label>
            <input
              type="number"
              value={planForm.maxUsers || 10}
              onChange={(e) => setPlanForm((p) => ({ ...p, maxUsers: Number(e.target.value) }))}
            />
          </div>
        </div>
      </Modal>

      {/* Extend Subscription Modal */}
      <Modal
        isOpen={showExtendModal}
        onClose={() => setShowExtendModal(false)}
        title="Perpanjang Masa Aktif Subscription"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowExtendModal(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (extendingSub) {
                  extendSubscription(extendingSub.id, extendMonths);
                  setShowExtendModal(false);
                  success('Subscription Diperpanjang', `Masa aktif ${extendingSub.schoolName} ditambah ${extendMonths} bulan.`);
                }
              }}
            >
              Konfirmasi Perpanjangan
            </Button>
          </>
        }
      >
        <p style={{ marginBottom: '12px' }}>
          Sekolah: <strong>{extendingSub?.schoolName}</strong>
        </p>
        <div className="form-group">
          <label>Tambah Durasi (Bulan):</label>
          <select
            value={extendMonths}
            onChange={(e) => setExtendMonths(Number(e.target.value))}
          >
            <option value={1}>1 Bulan</option>
            <option value={3}>3 Bulan</option>
            <option value={6}>6 Bulan</option>
            <option value={12}>1 Tahun (12 Bulan)</option>
          </select>
        </div>
      </Modal>

      {/* Upgrade Subscription Modal */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Upgrade Paket Tenant"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (upgradingSub) {
                  upgradeTenantSubscription(upgradingSub.schoolId, targetPlanId, targetCycle);
                  setShowUpgradeModal(false);
                  success('Paket Berhasil Diupgrade', `Tenant beralih ke paket baru.`);
                }
              }}
            >
              Terapkan Upgrade
            </Button>
          </>
        }
      >
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label>Pilih Paket Tujuan:</label>
          <select
            value={targetPlanId}
            onChange={(e) => setTargetPlanId(e.target.value)}
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                Paket {p.name} ({p.maxStudents} Siswa)
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Siklus Penagihan:</label>
          <select
            value={targetCycle}
            onChange={(e) => setTargetCycle(e.target.value as BillingCycle)}
          >
            <option value="monthly">Bulanan</option>
            <option value="annually">Tahunan</option>
          </select>
        </div>
      </Modal>

      {/* Invoice Modal */}
      {viewingInvoice && (
        <Modal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          title={`Invoice Resmi: ${viewingInvoice.invoiceNumber}`}
          size="md"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Button
                variant="primary"
                icon={<Printer size={16} />}
                onClick={() => window.print()}
              >
                Cetak / Simpan PDF
              </Button>
              <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>
                Tutup Invoice
              </Button>
            </div>
          }
        >
          <div className="invoice-preview-card" style={{ position: 'relative' }}>
            {viewingInvoice.status === 'Paid' && (
              <div className="invoice-stamp-paid">
                <span>Lunas</span>
                <small>{new Date(viewingInvoice.createdAt).toLocaleDateString('id-ID')}</small>
              </div>
            )}
            <div className="invoice-meta-header">
              <div>
                <h2>{systemSettings.platformName}</h2>
                <p>{systemSettings.tagline}</p>
              </div>
              <span className={`badge ${viewingInvoice.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                {viewingInvoice.status}
              </span>
            </div>

            <div className="divider"></div>

            <div className="form-grid-2">
              <div>
                <strong>Ditagihkan Kepada:</strong>
                <div>{viewingInvoice.schoolName}</div>
              </div>
              <div>
                <strong>Tanggal Terbit:</strong>
                <div>{new Date(viewingInvoice.createdAt).toLocaleDateString('id-ID')}</div>
              </div>
              <div>
                <strong>Metode Pembayaran:</strong>
                <div>{viewingInvoice.paymentMethod}</div>
              </div>
              <div>
                <strong>Gateway:</strong>
                <div>{viewingInvoice.paymentGateway}</div>
              </div>
            </div>

            <div className="divider"></div>

            <div className="cost-breakdown-row">
              <span>Paket {viewingInvoice.planName} ({viewingInvoice.billingCycle})</span>
              <span>{formatRupiah(viewingInvoice.subtotal)}</span>
            </div>
            <div className="cost-breakdown-row">
              <span>PPN (11%)</span>
              <span>{formatRupiah(viewingInvoice.tax)}</span>
            </div>
            <div className="cost-breakdown-row">
              <span>Biaya Transaksi Sistem</span>
              <span>{formatRupiah(viewingInvoice.adminFee)}</span>
            </div>

            <div className="divider"></div>

            <div className="total-due-row">
              <span>Total Pelunasan</span>
              <span className="total-highlight">{formatRupiah(viewingInvoice.total)}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Connect Custom Domain Modal */}
      <Modal
        isOpen={showCustomDomainModal}
        onClose={() => setShowCustomDomainModal(false)}
        title="Hubungkan Custom Domain Sekolah"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCustomDomainModal(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveCustomDomain}>
              Hubungkan Domain
            </Button>
          </>
        }
      >
        <p style={{ marginBottom: '12px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Arahkan CNAME DNS domain Anda ke <strong>cname.educore.id</strong>. Sertifikat SSL Let's Encrypt akan di-issue otomatis.
        </p>
        <div className="form-group">
          <label>Domain Resmi Sekolah:</label>
          <input
            type="text"
            placeholder="portal.sekolah.sch.id"
            value={customDomainInput}
            onChange={(e) => setCustomDomainInput(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
