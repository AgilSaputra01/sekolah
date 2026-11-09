import React, { useState, useEffect } from 'react';
import {
  School as SchoolIcon,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  UserCheck,
  CreditCard,
  Zap,
  ShieldCheck,
  Lock,
  Globe,
  Loader2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Check,
  Eye,
  EyeOff,
  Copy,
  CopyCheck,
} from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import {
  SchoolRegistrationData,
  BillingCycle,
  PaymentMethod,
  ProvisioningStepStatus,
  ProvisioningResult,
} from '../../types/saas';
import { SchoolLevel } from '../../types';

const SCHOOL_LEVELS: SchoolLevel[] = ['PAUD', 'TK', 'SD', 'SMP', 'SMA', 'SMK', 'MA', 'MTs'];

const PROVINCES = [
  'DKI Jakarta',
  'Jawa Barat',
  'Jawa Tengah',
  'DI Yogyakarta',
  'Jawa Timur',
  'Banten',
  'Bali',
  'Sumatera Utara',
  'Sumatera Barat',
  'Sulawesi Selatan',
];

const PAYMENT_METHODS: { id: PaymentMethod; label: string; desc: string }[] = [
  {
    id: 'BCA Virtual Account',
    label: 'BCA Virtual Account',
    desc: 'Verifikasi instan otomatis 24 jam via ATM / BCA Mobile / KlikBCA',
  },
  {
    id: 'Mandiri Virtual Account',
    label: 'Mandiri Virtual Account',
    desc: 'Verifikasi instan via Livin by Mandiri & ATM Mandiri',
  },
  {
    id: 'BRI Virtual Account',
    label: 'BRI Virtual Account (BRIVA)',
    desc: 'Verifikasi instan via BRImo & ATM BRI seluruh Indonesia',
  },
  {
    id: 'QRIS',
    label: 'QRIS Real-Time',
    desc: 'Pindai kode QR instan menggunakan GoPay, OVO, Dana, ShopeePay & BCA',
  },
  {
    id: 'Transfer Bank',
    label: 'Transfer Bank Manual Escrow',
    desc: 'Rekening Giro PT EduCore Solusi Nusantara (Konfirmasi manual 1-2 jam)',
  },
];

const getPasswordStrength = (pass: string) => {
  if (!pass) return { score: 0, label: '', color: '#cbd5e1', width: '0%' };
  let score = 0;
  if (pass.length >= 6) score += 1;
  if (pass.length >= 8) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 1) return { score: 1, label: 'Lemah (Minimal 6 karakter)', color: '#ef4444', width: '25%' };
  if (score === 2) return { score: 2, label: 'Cukup', color: '#f59e0b', width: '50%' };
  if (score === 3) return { score: 3, label: 'Kuat & Aman', color: '#10b981', width: '75%' };
  return { score: 4, label: 'Sangat Kuat (Kombinasi Sempurna)', color: '#059669', width: '100%' };
};

const LiveSchoolPreview: React.FC<{
  formData: SchoolRegistrationData;
  activePlan: any;
}> = ({ formData, activePlan }) => {
  return (
    <div className="live-portal-preview-card animate-fade-in">
      <div className="preview-browser-bar">
        <div className="preview-browser-dots">
          <span style={{ background: '#ef4444' }}></span>
          <span style={{ background: '#f59e0b' }}></span>
          <span style={{ background: '#10b981' }}></span>
        </div>
        <div className="preview-address-pill">
          <Lock size={11} style={{ color: '#10b981', flexShrink: 0 }} />
          <span>https://{formData.subdomain || 'nama-sekolah'}.educore.id</span>
        </div>
      </div>

      <div className="preview-body-content">
        <div className="preview-badge-row">
          <span className="badge badge-primary">{formData.level} • {formData.schoolType}</span>
          <span className="badge badge-success">Paket {activePlan?.name || 'Basic'}</span>
        </div>

        <div className="preview-school-header">
          <div className="preview-school-avatar">
            {formData.schoolName ? formData.schoolName.charAt(0).toUpperCase() : 'E'}
          </div>
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '1.05rem', margin: 0, color: 'var(--text-main)' }}>
              {formData.schoolName || 'Nama Sekolah Anda'}
            </h4>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              NPSN: {formData.npsn || '10293847'} • {formData.city || 'Kota'}, {formData.province || 'Provinsi'}
            </div>
          </div>
        </div>

        <div className="preview-admin-pill">
          <UserCheck size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-main)' }}>
              {formData.adminName || 'Nama Administrator Sekolah'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {formData.adminPosition || 'Penanggung Jawab IT / Kepala Sekolah'} • {formData.adminEmail || 'admin@sekolah.sch.id'}
            </div>
          </div>
        </div>

        <div className="preview-metrics-grid">
          <div className="preview-metric-box">
            <span className="metric-num">{activePlan?.maxStudents || 350}</span>
            <span className="metric-lbl">Kuota Siswa</span>
          </div>
          <div className="preview-metric-box">
            <span className="metric-num">{activePlan?.maxUsers || 30}</span>
            <span className="metric-lbl">Kuota Guru/Staf</span>
          </div>
          <div className="preview-metric-box">
            <span className="metric-num" style={{ color: '#10b981' }}>Aktif</span>
            <span className="metric-lbl">e-Rapor Merdeka</span>
          </div>
        </div>

        <div className="preview-security-footer">
          <ShieldCheck size={15} style={{ color: '#10b981', flexShrink: 0 }} />
          <span>Isolasi Multi-Tenant Terenkripsi & Row-Level Security</span>
        </div>
      </div>
    </div>
  );
};

export const SchoolRegistrationView: React.FC = () => {
  const {
    plans,
    selectedRegistrationPlanId,
    setPortalMode,
    provisionSchoolTenant,
    checkSubdomainAvailable,
  } = useSaaS();
  const { success, error: toastError } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // Form State
  const [formData, setFormData] = useState<SchoolRegistrationData>({
    schoolName: '',
    npsn: '',
    level: 'SMA',
    schoolType: 'Swasta',
    address: '',
    province: 'DKI Jakarta',
    city: 'Jakarta Selatan',
    district: 'Kebayoran Baru',
    phone: '',
    email: '',
    subdomain: '',
    logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',

    adminName: '',
    adminPosition: 'Kepala Sekolah / Penanggung Jawab IT',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    adminPasswordConfirm: '',

    selectedPlanId: selectedRegistrationPlanId || plans[1]?.id || plans[0]?.id || 'plan-basic',
    billingCycle: 'annually',

    paymentMethod: 'BCA Virtual Account',
    termsAccepted: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState<boolean>(false);
  const [copiedVA, setCopiedVA] = useState<boolean>(false);

  const handleCopyVA = (vaNumber: string) => {
    navigator.clipboard.writeText(vaNumber);
    setCopiedVA(true);
    success('Nomor VA Disalin!', 'Nomor Virtual Account telah disalin ke clipboard.');
    setTimeout(() => setCopiedVA(false), 3000);
  };

  // Provisioning Progress State for Step 5
  const [provisioningResult, setProvisioningResult] = useState<ProvisioningResult | null>(null);
  const [provisionSteps, setProvisionSteps] = useState<ProvisioningStepStatus[]>([
    { step: 1, title: 'Validasi Identitas Sekolah', description: 'Memeriksa keabsahan NPSN dan legalitas institusi', status: 'pending' },
    { step: 2, title: 'Alokasi Subdomain & Enkripsi SSL', description: 'Mengonfigurasi subdomain DNS dan sertifikat keamanan', status: 'pending' },
    { step: 3, title: 'Inisialisasi Database Tenant', description: 'Membuat schema terisolasi & konfigurasi kuota', status: 'pending' },
    { step: 4, title: 'Pembuatan Akun Administrator', description: 'Menghubungkan akun admin sekolah dengan role RBAC', status: 'pending' },
    { step: 5, title: 'Struktur Akademik Awal', description: 'Menyiapkan kalender tahun ajaran, semester & jenjang', status: 'pending' },
  ]);

  // If user selected plan from landing page, sync it
  useEffect(() => {
    if (selectedRegistrationPlanId) {
      setFormData((prev) => ({ ...prev, selectedPlanId: selectedRegistrationPlanId }));
    }
  }, [selectedRegistrationPlanId]);

  // Check Subdomain Debounced
  useEffect(() => {
    if (!formData.subdomain || formData.subdomain.length < 3) {
      setSubdomainStatus('idle');
      return;
    }
    setSubdomainStatus('checking');
    const timer = setTimeout(() => {
      const isAvail = checkSubdomainAvailable(formData.subdomain);
      setSubdomainStatus(isAvail ? 'available' : 'taken');
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.subdomain]);

  const activePlan = plans.find((p) => p.id === formData.selectedPlanId) || plans[0];
  const isFreeTrial = activePlan.name === 'Free';
  const pwStrength = getPasswordStrength(formData.adminPassword);

  // Cost calculation
  const baseCost = formData.billingCycle === 'annually' ? activePlan.annualPrice : activePlan.monthlyPrice;
  const subtotal = isFreeTrial ? 0 : baseCost;
  const taxAmount = isFreeTrial ? 0 : Math.round(subtotal * 0.11);
  const adminFee = isFreeTrial ? 0 : 4500;
  const totalAmount = subtotal + taxAmount + adminFee;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleInputChange = (field: keyof SchoolRegistrationData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.schoolName.trim()) errs.schoolName = 'Nama sekolah wajib diisi';
    if (!formData.npsn.trim() || formData.npsn.length < 6) errs.npsn = 'NPSN resmi wajib diisi (minimal 6 digit)';
    if (!formData.address.trim()) errs.address = 'Alamat sekolah lengkap wajib diisi';
    if (!formData.phone.trim()) errs.phone = 'Nomor telepon sekolah wajib diisi';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Email resmi sekolah wajib valid';
    if (!formData.subdomain.trim() || formData.subdomain.length < 3) {
      errs.subdomain = 'Subdomain minimal 3 karakter alfanumerik';
    } else if (subdomainStatus === 'taken') {
      errs.subdomain = 'Subdomain ini sudah dipakai, silakan gunakan nama lain';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.adminName.trim()) errs.adminName = 'Nama administrator wajib diisi';
    if (!formData.adminEmail.trim() || !formData.adminEmail.includes('@')) errs.adminEmail = 'Email administrator tidak valid';
    if (!formData.adminPhone.trim()) errs.adminPhone = 'Nomor WhatsApp/HP admin wajib diisi';
    if (!formData.adminPassword || formData.adminPassword.length < 6) errs.adminPassword = 'Password minimal 6 karakter';
    if (formData.adminPassword !== formData.adminPasswordConfirm) {
      errs.adminPasswordConfirm = 'Konfirmasi password tidak cocok';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) {
        toastError('Form Belum Lengkap', 'Silakan lengkapi seluruh field sekolah yang diwajibkan.');
        return;
      }
    }
    if (currentStep === 2) {
      if (!validateStep2()) {
        toastError('Data Admin Belum Lengkap', 'Periksa kembali formulir akun administrator.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 4 Checkout Confirmation -> Launch Step 5 Provisioning
  const handleConfirmAndPay = async () => {
    setIsSubmitting(true);
    setCurrentStep(5);

    // Simulate animated step-by-step provisioning
    for (let i = 0; i < 5; i++) {
      setProvisionSteps((steps) =>
        steps.map((st, idx) => (idx === i ? { ...st, status: 'in_progress' } : st))
      );
      await new Promise((res) => setTimeout(res, 600));
      setProvisionSteps((steps) =>
        steps.map((st, idx) => (idx === i ? { ...st, status: 'completed' } : st))
      );
    }

    // Execute actual tenant provisioning
    const result = await provisionSchoolTenant(formData);
    setIsSubmitting(false);
    setProvisioningResult(result);

    if (result.success) {
      success(
        'Tenant Sekolah Berhasil Diaktifkan!',
        `Selamat datang di EduCore! Tenant ${formData.schoolName} siap digunakan.`
      );
    } else {
      toastError('Gagal Provisioning', result.error || 'Terjadi kesalahan sistem saat membuat tenant.');
    }
  };

  const stepsList = [
    { num: 1, title: 'Info Sekolah' },
    { num: 2, title: 'Akun Admin' },
    { num: 3, title: 'Pilih Paket' },
    { num: 4, title: 'Checkout' },
    { num: 5, title: 'Aktivasi' },
  ];

  return (
    <div className="registration-page">
      {/* Top Header */}
      <header className="registration-header">
        <div className="reg-header-inner">
          <div className="marketing-brand" onClick={() => setPortalMode('marketing')}>
            <div className="brand-icon">
              <SchoolIcon size={22} />
            </div>
            <div className="brand-text">
              <span className="brand-title">
                EduCore <span className="brand-badge">SaaS</span>
              </span>
              <span className="brand-sub">School Platform</span>
            </div>
          </div>

          <div className="reg-header-right">
            <span className="step-count-pill">Langkah {currentStep} dari 5</span>
            <Button variant="ghost" size="sm" onClick={() => setPortalMode('marketing')}>
              Batal & Kembali
            </Button>
          </div>
        </div>
      </header>

      <main className="registration-container">
        {/* Step Indicator Progress Bar */}
        <div className="step-progress-wrapper">
          {stepsList.map((step) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            return (
              <div
                key={step.num}
                className={`step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}
              >
                <div className="step-bubble">
                  {isCompleted ? <Check size={16} /> : step.num}
                </div>
                <span className="step-title">{step.title}</span>
              </div>
            );
          })}
        </div>

        {/* STEP 1: INFORMASI SEKOLAH */}
        {currentStep === 1 && (
          <div className="reg-split-layout animate-fade-in">
            <div className="reg-card">
              <div className="reg-card-header">
                <h2>Langkah 1: Informasi Profil Sekolah</h2>
                <p>Lengkapi data identitas institusi pendidikan resmi untuk verifikasi tenant.</p>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Nama Resmi Sekolah *</label>
                  <input
                    type="text"
                    placeholder="Contoh: SMA Negeri 1 Jakarta / SMK Telkom"
                    value={formData.schoolName}
                    onChange={(e) => handleInputChange('schoolName', e.target.value)}
                    className={errors.schoolName ? 'is-invalid' : ''}
                  />
                  {errors.schoolName && <span className="form-error">{errors.schoolName}</span>}
                </div>

                <div className="form-group">
                  <label>Nomor Pokok Sekolah Nasional (NPSN) *</label>
                  <input
                    type="text"
                    placeholder="8 Digit NPSN Kemdikbud"
                    value={formData.npsn}
                    onChange={(e) => handleInputChange('npsn', e.target.value)}
                    className={errors.npsn ? 'is-invalid' : ''}
                  />
                  {errors.npsn && <span className="form-error">{errors.npsn}</span>}
                </div>

                <div className="form-group">
                  <label>Jenjang Pendidikan *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value as SchoolLevel)}
                  >
                    {SCHOOL_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Status Sekolah *</label>
                  <div className="radio-group-horizontal">
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="schoolType"
                        value="Swasta"
                        checked={formData.schoolType === 'Swasta'}
                        onChange={() => handleInputChange('schoolType', 'Swasta')}
                      />
                      <span>Swasta / Yayasan</span>
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="schoolType"
                        value="Negeri"
                        checked={formData.schoolType === 'Negeri'}
                        onChange={() => handleInputChange('schoolType', 'Negeri')}
                      />
                      <span>Negeri (Pemerintah)</span>
                    </label>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Alamat Lengkap Sekolah *</label>
                  <textarea
                    rows={2}
                    placeholder="Jalan, nomor, RT/RW, kelurahan"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={errors.address ? 'is-invalid' : ''}
                  />
                  {errors.address && <span className="form-error">{errors.address}</span>}
                </div>

                <div className="form-group">
                  <label>Provinsi *</label>
                  <select
                    value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                  >
                    {PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Kabupaten / Kota *</label>
                  <input
                    type="text"
                    placeholder="Nama kota / kabupaten"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Kecamatan *</label>
                  <input
                    type="text"
                    placeholder="Kecamatan"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Nomor Telepon Sekolah *</label>
                  <input
                    type="text"
                    placeholder="Contoh: (021) 7891234 / 0812345678"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={errors.phone ? 'is-invalid' : ''}
                  />
                  {errors.phone && <span className="form-error">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label>Email Resmi Sekolah *</label>
                  <input
                    type="email"
                    placeholder="info@sekolah.sch.id"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'is-invalid' : ''}
                  />
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>

                {/* Subdomain Input with Live Checker */}
                <div className="form-group full-width">
                  <label>Pilihan Subdomain Sekolah EduCore *</label>
                  <div className="subdomain-input-group">
                    <input
                      type="text"
                      placeholder="nama-sekolah"
                      value={formData.subdomain}
                      onChange={(e) =>
                        handleInputChange(
                          'subdomain',
                          e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                        )
                      }
                      className={errors.subdomain ? 'is-invalid' : ''}
                    />
                    <span className="subdomain-suffix">.educore.id</span>
                  </div>

                  <div className="subdomain-status-row">
                    {subdomainStatus === 'checking' && (
                      <span className="status-checking">
                        <Loader2 size={13} className="animate-spin" /> Memeriksa ketersediaan...
                      </span>
                    )}
                    {subdomainStatus === 'available' && (
                      <span className="status-avail">
                        <CheckCircle2 size={13} /> Subdomain <strong>{formData.subdomain}.educore.id</strong> tersedia!
                      </span>
                    )}
                    {subdomainStatus === 'taken' && (
                      <span className="status-taken">
                        <AlertCircle size={13} /> Subdomain ini sudah digunakan sekolah lain.
                      </span>
                    )}
                  </div>
                  {errors.subdomain && <span className="form-error">{errors.subdomain}</span>}
                </div>
              </div>

              <div className="reg-actions">
                <div></div>
                <Button variant="primary" iconRight={<ArrowRight size={16} />} onClick={handleNext}>
                  Lanjut ke Data Admin
                </Button>
              </div>
            </div>

            {/* Right Column: Live Realtime School Portal Preview */}
            <div className="reg-preview-col">
              <LiveSchoolPreview formData={formData} activePlan={activePlan} />
            </div>
          </div>
        )}

        {/* STEP 2: INFORMASI ADMINISTRATOR */}
        {currentStep === 2 && (
          <div className="reg-split-layout animate-fade-in">
            <div className="reg-card">
              <div className="reg-card-header">
                <h2>Langkah 2: Informasi Akun Administrator Sekolah</h2>
                <p>Akun ini akan memiliki wewenang Super Admin Sekolah untuk mengatur seluruh staf, guru, dan murid.</p>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Nama Lengkap Administrator *</label>
                  <input
                    type="text"
                    placeholder="Nama lengkap beserta gelar jika ada"
                    value={formData.adminName}
                    onChange={(e) => handleInputChange('adminName', e.target.value)}
                    className={errors.adminName ? 'is-invalid' : ''}
                  />
                  {errors.adminName && <span className="form-error">{errors.adminName}</span>}
                </div>

                <div className="form-group">
                  <label>Jabatan di Sekolah *</label>
                  <input
                    type="text"
                    placeholder="Kepala Sekolah / Wakil Kurikulum / Staf IT"
                    value={formData.adminPosition}
                    onChange={(e) => handleInputChange('adminPosition', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Email Login Administrator *</label>
                  <input
                    type="email"
                    placeholder="admin@sekolah.sch.id"
                    value={formData.adminEmail}
                    onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                    className={errors.adminEmail ? 'is-invalid' : ''}
                  />
                  {errors.adminEmail && <span className="form-error">{errors.adminEmail}</span>}
                </div>

                <div className="form-group">
                  <label>Nomor WhatsApp / HP Aktif *</label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxxx"
                    value={formData.adminPhone}
                    onChange={(e) => handleInputChange('adminPhone', e.target.value)}
                    className={errors.adminPhone ? 'is-invalid' : ''}
                  />
                  {errors.adminPhone && <span className="form-error">{errors.adminPhone}</span>}
                </div>

                <div className="form-group">
                  <label>Kata Sandi (Password) *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimal 6 karakter"
                      value={formData.adminPassword}
                      onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                      className={errors.adminPassword ? 'is-invalid' : ''}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {formData.adminPassword && (
                    <div className="pw-strength-container">
                      <div className="pw-strength-bar">
                        <div
                          className="pw-strength-fill"
                          style={{
                            width: pwStrength.width,
                            backgroundColor: pwStrength.color,
                          }}
                        />
                      </div>
                      <span className="pw-strength-label" style={{ color: pwStrength.color }}>
                        Kekuatan: {pwStrength.label}
                      </span>
                    </div>
                  )}
                  {errors.adminPassword && <span className="form-error">{errors.adminPassword}</span>}
                </div>

                <div className="form-group">
                  <label>Konfirmasi Kata Sandi *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPasswordConfirm ? 'text' : 'password'}
                      placeholder="Ketik ulang password"
                      value={formData.adminPasswordConfirm}
                      onChange={(e) => handleInputChange('adminPasswordConfirm', e.target.value)}
                      className={errors.adminPasswordConfirm ? 'is-invalid' : ''}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      tabIndex={-1}
                    >
                      {showPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.adminPasswordConfirm && (
                    <span className="form-error">{errors.adminPasswordConfirm}</span>
                  )}
                </div>
              </div>

              <div className="reg-actions">
                <Button variant="outline" icon={<ArrowLeft size={16} />} onClick={handleBack}>
                  Kembali
                </Button>
                <Button variant="primary" iconRight={<ArrowRight size={16} />} onClick={handleNext}>
                  Lanjut ke Pemilihan Paket
                </Button>
              </div>
            </div>

            {/* Right Column: Live Realtime School Portal Preview */}
            <div className="reg-preview-col">
              <LiveSchoolPreview formData={formData} activePlan={activePlan} />
            </div>
          </div>
        )}

        {/* STEP 3: PEMILIHAN PAKET */}
        {currentStep === 3 && (
          <div className="reg-card animate-fade-in">
            <div className="reg-card-header">
              <h2>Langkah 3: Pemilihan Paket Berlangganan</h2>
              <p>Tentukan tier paket dan durasi yang paling cocok untuk institusi Anda.</p>
            </div>

            {/* Cycle Selector */}
            <div className="pricing-toggle-wrap" style={{ margin: '0 auto 24px' }}>
              <button
                className={`toggle-option ${formData.billingCycle === 'monthly' ? 'active' : ''}`}
                onClick={() => handleInputChange('billingCycle', 'monthly')}
              >
                Bulanan
              </button>
              <button
                className={`toggle-option ${formData.billingCycle === 'annually' ? 'active' : ''}`}
                onClick={() => handleInputChange('billingCycle', 'annually')}
              >
                Tahunan <span className="discount-pill">Hemat 16%</span>
              </button>
            </div>

            <div className="plan-selection-grid">
              {plans.map((p) => {
                const isSelected = formData.selectedPlanId === p.id;
                const price = formData.billingCycle === 'annually' ? p.annualPrice : p.monthlyPrice;
                const isFree = p.name === 'Free';

                return (
                  <div
                    key={p.id}
                    className={`plan-select-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleInputChange('selectedPlanId', p.id)}
                  >
                    <div className="select-radio-indicator">
                      {isSelected && <Check size={14} color="white" />}
                    </div>
                    <div className="plan-card-body">
                      <div className="plan-title-row">
                        <h3>{p.name}</h3>
                        {p.badge && <span className="badge badge-primary">{p.badge}</span>}
                      </div>
                      <div className="plan-price-text">
                        {isFree ? 'Rp 0' : formatRupiah(price)}
                        <span className="unit">/{formData.billingCycle === 'annually' ? 'thn' : 'bln'}</span>
                      </div>
                      <p className="plan-desc-text">{p.description}</p>
                      <div className="plan-limits-text">
                        Kapasitas: {p.maxStudents} Siswa • {p.maxUsers} Staf
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Plan Summary Banner */}
            <div className="selected-plan-summary-banner">
              <div className="summary-banner-info">
                <span className="banner-label">Paket Terpilih:</span>
                <span className="banner-plan-name">
                  {activePlan.name} ({formData.billingCycle === 'annually' ? 'Tagihan Tahunan' : 'Tagihan Bulanan'})
                </span>
                <span className="banner-amount">
                  {isFreeTrial ? 'Gratis 14 Hari Uji Coba' : formatRupiah(baseCost)}
                </span>
              </div>
            </div>

            <div className="reg-actions">
              <Button variant="outline" icon={<ArrowLeft size={16} />} onClick={handleBack}>
                Kembali
              </Button>
              <Button variant="primary" iconRight={<ArrowRight size={16} />} onClick={handleNext}>
                Lanjut ke Checkout & Pembayaran
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: CHECKOUT & PAYMENT */}
        {currentStep === 4 && (
          <div className="reg-card animate-fade-in">
            <div className="reg-card-header">
              <h2>Langkah 4: Ringkasan Pesanan & Metode Pembayaran</h2>
              <p>Periksa rincian pesanan dan selesaikan transaksi untuk mengaktifkan tenant sekolah.</p>
            </div>

            <div className="checkout-two-col">
              {/* Left Column: Order Summary */}
              <div className="checkout-summary-box">
                <h3>Rincian Tagihan</h3>
                <div className="order-items-list">
                  <div className="order-item-row">
                    <div>
                      <div className="item-name">EduCore SaaS — Paket {activePlan.name}</div>
                      <div className="item-sub">
                        Durasi: {formData.billingCycle === 'annually' ? '1 Tahun' : '1 Bulan'} • Subdomain:{' '}
                        <strong>{formData.subdomain}.educore.id</strong>
                      </div>
                    </div>
                    <div className="item-price">{isFreeTrial ? 'Rp 0' : formatRupiah(subtotal)}</div>
                  </div>

                  <div className="divider"></div>

                  <div className="cost-breakdown-row">
                    <span>Subtotal</span>
                    <span>{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="cost-breakdown-row">
                    <span>PPN (11%)</span>
                    <span>{formatRupiah(taxAmount)}</span>
                  </div>
                  <div className="cost-breakdown-row">
                    <span>Biaya Transaksi Sistem</span>
                    <span>{formatRupiah(adminFee)}</span>
                  </div>

                  <div className="divider"></div>

                  <div className="total-due-row">
                    <span>Total Pembayaran</span>
                    <span className="total-highlight">{formatRupiah(totalAmount)}</span>
                  </div>
                </div>

                <div className="school-summary-pill">
                  <Building2 size={16} />
                  <div>
                    <strong>{formData.schoolName}</strong>
                    <div>{formData.adminName} ({formData.adminEmail})</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Payment Methods */}
              <div className="checkout-payment-box">
                <h3>Pilihan Metode Pembayaran</h3>

                {isFreeTrial ? (
                  <div className="free-trial-box">
                    <Sparkles size={24} style={{ color: 'var(--color-primary)' }} />
                    <h4>Paket Free Trial Aktif</h4>
                    <p>
                      Anda memilih paket Free Trial 14 hari. Tidak ada biaya yang ditagihkan sekarang.
                      Tenant Anda akan langsung di-provision secara otomatis.
                    </p>
                  </div>
                ) : (
                  <div className="payment-options-list">
                    {PAYMENT_METHODS.map((pm) => {
                      const isSel = formData.paymentMethod === pm.id;
                      return (
                        <div
                          key={pm.id}
                          className={`payment-option-card ${isSel ? 'selected' : ''}`}
                          onClick={() => handleInputChange('paymentMethod', pm.id)}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={isSel}
                            onChange={() => handleInputChange('paymentMethod', pm.id)}
                          />
                          <div className="payment-opt-body">
                            <div className="payment-opt-title">{pm.label}</div>
                            <div className="payment-opt-desc">{pm.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!isFreeTrial && (
                  <div className="va-simulator-box animate-fade-in">
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Simulasi Nomor Pembayaran {formData.paymentMethod}:
                    </div>
                    <div className="va-number-pill">
                      <span className="va-number-text">9882 0812 9482 1049</span>
                      <button
                        type="button"
                        className="va-copy-btn"
                        onClick={() => handleCopyVA('9882081294821049')}
                      >
                        {copiedVA ? <CopyCheck size={14} color="#10b981" /> : <Copy size={14} />}
                        <span>{copiedVA ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                    <div>
                      <span className="va-countdown-badge">
                        <Clock size={13} /> Selesaikan transaksi dalam: 23:59:45
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      Buka aplikasi m-Banking / ATM Anda &gt; Pilih Menu Virtual Account &gt; Masukkan nomor di atas.
                    </div>
                  </div>
                )}

                <div className="terms-checkbox-wrap">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                    />
                    <span>
                      Saya menyetujui Ketentuan Layanan, Kebijakan Privasi, dan Perjanjian SLA EduCore Multi-Tenant SaaS.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="reg-actions">
              <Button variant="outline" icon={<ArrowLeft size={16} />} onClick={handleBack}>
                Kembali
              </Button>
              <Button
                variant="primary"
                size="lg"
                icon={<Lock size={16} />}
                disabled={!formData.termsAccepted || isSubmitting}
                loading={isSubmitting}
                onClick={handleConfirmAndPay}
              >
                {isFreeTrial ? 'Aktivasi Trial Tenant Sekarang' : 'Bayar & Aktivasi Tenant'}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: PROVISIONING CONFIRMATION & PROGRESS */}
        {currentStep === 5 && (
          <div className="reg-card animate-fade-in">
            <div className="reg-card-header text-center">
              <div className="activation-icon-circle">
                {isSubmitting ? (
                  <Loader2 size={36} className="animate-spin text-primary" />
                ) : provisioningResult?.success ? (
                  <CheckCircle2 size={36} style={{ color: '#10b981' }} />
                ) : (
                  <AlertCircle size={36} style={{ color: '#ef4444' }} />
                )}
              </div>
              <h2>
                {isSubmitting
                  ? 'SaaS Controller Sedang Melakukan Provisioning...'
                  : provisioningResult?.success
                  ? 'Aktivasi Tenant Sekolah Berhasil!'
                  : 'Aktivasi Tenant Tertunda'}
              </h2>
              <p>
                {isSubmitting
                  ? 'Mohon tunggu, sistem sedang membangun environment database terisolasi untuk sekolah Anda.'
                  : provisioningResult?.success
                  ? 'Tenant Anda telah aktif dan terdaftar di SaaS Controller. Anda dapat langsung mengelola sekolah sekarang.'
                  : provisioningResult?.error || 'Silakan hubungi tim support untuk penyelesaian aktivasi.'}
              </p>
            </div>

            {/* Visual Provisioning Checklist */}
            <div className="provision-steps-list">
              {provisionSteps.map((step) => {
                return (
                  <div key={step.step} className={`prov-step-item status-${step.status}`}>
                    <div className="prov-status-indicator">
                      {step.status === 'completed' && <CheckCircle2 size={18} />}
                      {step.status === 'in_progress' && <Loader2 size={18} className="animate-spin" />}
                      {step.status === 'pending' && <span className="prov-dot"></span>}
                      {step.status === 'failed' && <AlertCircle size={18} />}
                    </div>
                    <div className="prov-step-text">
                      <div className="prov-title">{step.title}</div>
                      <div className="prov-desc">{step.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {provisioningResult?.success && (
              <div className="tenant-ready-box">
                <div className="tenant-ready-header">
                  <Sparkles size={20} style={{ color: 'var(--color-primary)' }} />
                  <h3>Kredensial Akses Aplikasi Sekolah Anda</h3>
                </div>

                <div className="credentials-grid">
                  <div className="cred-item">
                    <span className="cred-label">Subdomain Resmi:</span>
                    <span className="cred-val highlight">
                      https://{formData.subdomain}.educore.id
                    </span>
                  </div>
                  <div className="cred-item">
                    <span className="cred-label">Tenant ID:</span>
                    <span className="cred-val">{provisioningResult.tenantId}</span>
                  </div>
                  <div className="cred-item">
                    <span className="cred-label">Akun Administrator:</span>
                    <span className="cred-val">{formData.adminEmail}</span>
                  </div>
                  <div className="cred-item">
                    <span className="cred-label">Paket Langganan:</span>
                    <span className="cred-val">
                      {activePlan.name} ({formData.billingCycle === 'annually' ? 'Tahunan' : 'Bulanan'})
                    </span>
                  </div>
                  <div className="cred-item">
                    <span className="cred-label">Nomor Invoice:</span>
                    <span className="cred-val">{provisioningResult.invoiceNumber}</span>
                  </div>
                  <div className="cred-item">
                    <span className="cred-label">Status Lisensi:</span>
                    <span className="badge badge-success">Aktif & Terverifikasi</span>
                  </div>
                </div>

                <div className="ready-action-button">
                  <Button
                    variant="primary"
                    size="lg"
                    iconRight={<ArrowRight size={18} />}
                    onClick={() => setPortalMode('app')}
                  >
                    Buka Dashboard Aplikasi Sekolah
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

