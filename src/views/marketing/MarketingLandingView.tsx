import React, { useState, useMemo } from 'react';
import {
  School as SchoolIcon,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Users,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Star,
  Layers,
  Lock,
  Globe,
  Award,
  Wallet,
  Smartphone,
  ScanLine,
  BookOpen,
  Building2,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  LogIn,
  SlidersHorizontal,
  Calculator,
  TrendingUp,
} from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';
import { useTenantAuth } from '../../context/TenantAuthContext';
import { Button } from '../../components/common/Button';
import { BillingCycle } from '../../types/saas';

export const MarketingLandingView: React.FC = () => {
  const { plans, products, setPortalMode, startRegistrationWithPlan } = useSaaS();
  const { isSuperAdmin, currentUser } = useTenantAuth();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annually');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeDemoTab, setActiveDemoTab] = useState<'admin' | 'guru' | 'ortu'>('admin');

  // Interactive ROI & Cost-Savings Calculator State
  const [calculatorStudents, setCalculatorStudents] = useState<number>(450);

  const calcRecommendedPlan = useMemo(() => {
    if (calculatorStudents <= 50) {
      return plans.find((p) => p.name === 'Free') || plans[0];
    } else if (calculatorStudents <= 300) {
      return plans.find((p) => p.name === 'Basic') || plans[0];
    } else if (calculatorStudents <= 800) {
      return plans.find((p) => p.name === 'Professional') || plans[1];
    } else {
      return plans.find((p) => p.name === 'Enterprise') || plans[plans.length - 1];
    }
  }, [calculatorStudents, plans]);

  const monthlyPrice = calcRecommendedPlan ? calcRecommendedPlan.monthlyPrice : 999000;
  const costPerStudent = Math.max(1200, Math.round(monthlyPrice / (calculatorStudents || 1)));
  const estPaperSavings = calculatorStudents * 48000;
  const estHoursSaved = Math.round(calculatorStudents / 12) + 24;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getProductIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2':
        return <Building2 size={24} />;
      case 'BookOpen':
        return <BookOpen size={24} />;
      case 'Wallet':
        return <Wallet size={24} />;
      case 'ScanLine':
        return <ScanLine size={24} />;
      case 'Smartphone':
        return <Smartphone size={24} />;
      default:
        return <Layers size={24} />;
    }
  };

  const faqs = [
    {
      q: 'Bagaimana keamanan data dan isolasi multi-tenant di EduCore?',
      a: 'EduCore dirancang dengan arsitektur multi-tenant modern yang memisahkan data setiap sekolah secara logis menggunakan tenant_id terenkripsi dan kebijakan Row Level Security (RLS). Tidak ada sekolah yang dapat melihat data sekolah lain.',
    },
    {
      q: 'Apakah bisa menggunakan domain sendiri seperti portal.sekolah.sch.id?',
      a: 'Tentu bisa! Seluruh sekolah otomatis mendapatkan subdomain resmi (contoh: sman1.educore.id), dan untuk pengguna paket Professional serta Enterprise dapat menghubungkan Custom Domain resmi berakhiran .sch.id lengkap dengan SSL otomatis gratis.',
    },
    {
      q: 'Apakah ada masa percobaan (Free Trial)?',
      a: 'Ya, kami menyediakan paket Free Trial selama 14 hari penuh tanpa kewajiban kartu kredit. Anda dapat mencoba manajemen siswa, rombel, guru, dan e-rapor secara leluasa.',
    },
    {
      q: 'Bagaimana integrasi dengan pembayaran SPP online?',
      a: 'EduCore telah terintegrasi dengan Payment Gateway nasional (Virtual Account BCA, Mandiri, BRI, BNI dan QRIS). Begitu orang tua membayar, status SPP langsung tercatat lunas tanpa perlu konfirmasi manual.',
    },
    {
      q: 'Apakah tim kami akan dibantu saat migrasi data awal siswa dan guru?',
      a: 'Ya! Tim Onboarding EduCore menyediakan template Excel import data siswa dan guru serta sesi pelatihan daring untuk staf tata usaha dan guru sekolah Anda.',
    },
  ];

  const testimonials = [
    {
      name: 'Drs. H. Bambang Sudarsono, M.Pd.',
      role: 'Kepala Sekolah SMA Negeri 1 Jakarta',
      school: 'SMA Negeri 1 Jakarta',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      text: 'Sejak beralih ke platform EduCore SaaS, rekapitulasi nilai raport dan pembagian rombel yang biasanya memakan waktu berminggu-minggu kini selesai dalam hitungan jam. Sistemnya sangat stabil dan mudah dipakai guru senior.',
      rating: 5,
    },
    {
      name: 'Ibu Ratna Paramitha, S.T.',
      role: 'Kepala Bagian IT & Kurikulum',
      school: 'SMP Bintang Kejora Bandung',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      text: 'Fitur multi-tenant dan role-permission di EduCore sangat presisi. Wali kelas hanya bisa mengolah rombel binaannya, tata usaha fokus ke SPP, dan orang tua mendapat transparansi penuh lewat aplikasi.',
      rating: 5,
    },
    {
      name: 'Dr. Hendra Wijaya',
      role: 'Ketua Yayasan Pendidikan Harapan Bangsa',
      school: 'Kompleks SD & SMP Cahaya Surabaya',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      text: 'Sebagai pengelola 3 jenjang sekolah sekaligus, dashboard kontrol pusat sangat memudahkan pemantauan keuangan dan kehadiran murid secara real-time dari manapun.',
      rating: 5,
    },
  ];

  return (
    <div className="saas-marketing-page">
      {/* 1. MARKETING NAVBAR */}
      <nav className="marketing-navbar">
        <div className="marketing-nav-container">
          <div className="marketing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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

          <div className="marketing-nav-links">
            <a href="#beranda">Beranda</a>
            <a href="#keunggulan">Fitur</a>
            <a href="#produk">Produk</a>
            <a href="#harga">Harga</a>
            <a href="#testimoni">Testimoni</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className="marketing-nav-actions">
            {isSuperAdmin && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPortalMode('controller')}
                title="Masuk ke SaaS Controller"
              >
                <SlidersHorizontal size={14} />
                <span>SaaS Controller</span>
              </button>
            )}

            <button
              className="btn btn-outline btn-sm"
              onClick={() => setPortalMode('app')}
              title="Buka Aplikasi Sekolah"
            >
              <LogIn size={14} />
              <span>Login Aplikasi</span>
            </button>

            <Button
              variant="primary"
              size="sm"
              icon={<Zap size={14} />}
              onClick={() => setPortalMode('register')}
            >
              Daftar Sekolah
            </Button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section id="beranda" className="marketing-hero">
        <div className="marketing-hero-badge">
          <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />
          <span>Platform Manajemen Sekolah Multi-Tenant Generasi Terbaru</span>
        </div>

        <h1 className="marketing-hero-title">
          Transformasi Digital Ekosistem Sekolah Modern Dalam Satu Platform
        </h1>

        <p className="marketing-hero-desc">
          EduCore menyatukan seluruh tata kelola sekolah: administrasi siswa, tenaga pendidik,
          struktur kurikulum & rombel, presensi cerdas, serta penagihan SPP online secara aman,
          terisolasi, dan berkinerja tinggi.
        </p>

        <div className="marketing-hero-cta">
          <Button
            variant="primary"
            size="lg"
            iconRight={<ArrowRight size={18} />}
            onClick={() => setPortalMode('register')}
          >
            Mulai Registrasi Sekolah
          </Button>
          <a href="#harga" className="btn btn-outline btn-lg">
            Lihat Paket & Harga
          </a>
        </div>

        <div className="marketing-trust-metrics">
          <div className="trust-metric-item">
            <span className="metric-val">120+</span>
            <span className="metric-label">Sekolah Terdaftar</span>
          </div>
          <div className="trust-metric-item">
            <span className="metric-val">45.000+</span>
            <span className="metric-label">Siswa Aktif</span>
          </div>
          <div className="trust-metric-item">
            <span className="metric-val">99.9%</span>
            <span className="metric-label">Uptime SLA</span>
          </div>
          <div className="trust-metric-item">
            <span className="metric-val">100%</span>
            <span className="metric-label">Isolasi Tenant Aman</span>
          </div>
        </div>

        {/* Hero Interactive App Mockup Preview */}
        <div className="hero-mockup-container">
          {/* Floating Pill Badges */}
          <div className="floating-pill-card top-left">
            <div className="float-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#065f46' }}>
                SPP Otomatis Terverifikasi
              </div>
              <div style={{ fontSize: '0.72rem', color: '#047857' }}>
                BCA Virtual Account • Rp 450.000 Lunas
              </div>
            </div>
          </div>

          <div className="floating-pill-card bottom-right">
            <div className="float-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <ScanLine size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e40af' }}>
                Absensi RFID Gerbang Masuk
              </div>
              <div style={{ fontSize: '0.72rem', color: '#1d4ed8' }}>
                Ahmad Faiz (10-MIPA-1) • Hadir 06:48 WIB
              </div>
            </div>
          </div>

          {/* Interactive Demo Tabs */}
          <div className="mockup-demo-tabs-wrap">
            <div className="mockup-demo-tabs">
              <button
                className={`demo-tab-btn ${activeDemoTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveDemoTab('admin')}
              >
                <Building2 size={14} />
                <span>Dashboard Administrator</span>
              </button>
              <button
                className={`demo-tab-btn ${activeDemoTab === 'guru' ? 'active' : ''}`}
                onClick={() => setActiveDemoTab('guru')}
              >
                <BookOpen size={14} />
                <span>Portal Guru & Raport Merdeka</span>
              </button>
              <button
                className={`demo-tab-btn ${activeDemoTab === 'ortu' ? 'active' : ''}`}
                onClick={() => setActiveDemoTab('ortu')}
              >
                <Smartphone size={14} />
                <span>Portal Siswa & Orang Tua</span>
              </button>
            </div>
          </div>

          <div className="mockup-window">
            <div className="mockup-window-header">
              <div className="mockup-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="mockup-url-bar">
                <Lock size={12} style={{ color: '#10b981' }} />
                <span>
                  {activeDemoTab === 'admin' && 'https://sman1jkt.educore.id/dashboard'}
                  {activeDemoTab === 'guru' && 'https://sman1jkt.educore.id/app/academic'}
                  {activeDemoTab === 'ortu' && 'https://sman1jkt.educore.id/parent-portal'}
                </span>
              </div>
              <div className="mockup-tag">
                {activeDemoTab === 'admin' && 'Modul Admin & Tenant Ops'}
                {activeDemoTab === 'guru' && 'Kurikulum Merdeka Ready'}
                {activeDemoTab === 'ortu' && 'Real-time Student Monitoring'}
              </div>
            </div>

            <div className="mockup-inner-body">
              {/* Sidebar */}
              <div className="mockup-sidebar">
                <div className="mockup-brand-mini">
                  <div className="mini-icon"></div>
                  <span>SMA Negeri 1</span>
                </div>
                <div className={`mockup-menu-line ${activeDemoTab === 'admin' ? 'active' : ''}`}></div>
                <div className={`mockup-menu-line ${activeDemoTab === 'guru' ? 'active' : ''}`}></div>
                <div className={`mockup-menu-line ${activeDemoTab === 'ortu' ? 'active' : ''}`}></div>
                <div className="mockup-menu-line"></div>
                <div className="mockup-menu-line"></div>
              </div>

              {/* Dynamic Content based on activeDemoTab */}
              <div className="mockup-content">
                {activeDemoTab === 'admin' && (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="mockup-stat-row">
                      <div className="mockup-stat-card">
                        <div className="mockup-stat-num">1,248</div>
                        <div className="mockup-stat-lbl">Total Siswa Aktif</div>
                      </div>
                      <div className="mockup-stat-card">
                        <div className="mockup-stat-num">84</div>
                        <div className="mockup-stat-lbl">Guru & Staf</div>
                      </div>
                      <div className="mockup-stat-card">
                        <div className="mockup-stat-num">36</div>
                        <div className="mockup-stat-lbl">Rombel Terdaftar</div>
                      </div>
                      <div className="mockup-stat-card">
                        <div className="mockup-stat-num" style={{ color: '#10b981' }}>98.4%</div>
                        <div className="mockup-stat-lbl">Tingkat Kehadiran</div>
                      </div>
                    </div>

                    <div className="mockup-table-preview">
                      <div className="mockup-table-header">
                        <span>Nama Siswa</span>
                        <span>NIS / NISN</span>
                        <span>Rombel</span>
                        <span>Status SPP</span>
                      </div>
                      <div className="mockup-table-row">
                        <span>Ahmad Faiz Pratama</span>
                        <span>10293 / 00781923</span>
                        <span>10-MIPA-1</span>
                        <span className="mockup-badge" style={{ background: '#ecfdf5', color: '#065f46' }}>Lunas (BCA VA)</span>
                      </div>
                      <div className="mockup-table-row">
                        <span>Bunga Putri Cahyani</span>
                        <span>10294 / 00781924</span>
                        <span>10-MIPA-1</span>
                        <span className="mockup-badge" style={{ background: '#ecfdf5', color: '#065f46' }}>Lunas (QRIS)</span>
                      </div>
                      <div className="mockup-table-row">
                        <span>Dimas Aditya Rahman</span>
                        <span>10295 / 00781925</span>
                        <span>10-MIPA-2</span>
                        <span className="mockup-badge" style={{ background: '#fffbeb', color: '#92400e' }}>Pending</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeDemoTab === 'guru' && (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Kelas Binaan: 10-MIPA-1 • Kurikulum Merdeka Fase E</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mata Pelajaran: Matematika Tingkat Lanjut • 32 Siswa</div>
                      </div>
                      <span className="badge badge-primary">e-Rapor Ready</span>
                    </div>

                    <div className="mockup-stat-row">
                      <div className="mockup-stat-card">
                        <div className="mockup-stat-num">100%</div>
                        <div className="mockup-stat-lbl">Nilai Formatif Terisi</div>
                      </div>
                      <div className="mockup-stat-card">
                        <div className="mockup-stat-num">89.2</div>
                        <div className="mockup-stat-lbl">Rata-rata Kelas</div>
                      </div>
                      <div className="mockup-stat-card">
                        <div className="mockup-stat-num">4 TP</div>
                        <div className="mockup-stat-lbl">Capaian Tuntas</div>
                      </div>
                      <div className="mockup-stat-card">
                        <div className="mockup-stat-num" style={{ color: '#4f46e5' }}>PDF</div>
                        <div className="mockup-stat-lbl">Barcode Raport Siap</div>
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-main)' }}>Jadwal Mengajar Hari Ini:</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: '6px' }}>
                        <span>⏰ 07:30 - 09:00 WIB • Ruang 10-MIPA-1</span>
                        <strong style={{ color: 'var(--color-primary)' }}>Materi: Fungsi Trigonometri & Vektor</strong>
                      </div>
                    </div>
                  </div>
                )}

                {activeDemoTab === 'ortu' && (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 800 }}>
                        AF
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Ahmad Faiz Pratama</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Kelas 10-MIPA-1 • NISN: 00781923</div>
                      </div>
                      <span className="badge badge-success">Siswa Terdaftar</span>
                    </div>

                    <div className="mockup-stat-row">
                      <div className="mockup-stat-card">
                        <div className="mockup-stat-num" style={{ color: '#10b981' }}>06:48</div>
                        <div className="mockup-stat-lbl">Hadir di Sekolah</div>
                      </div>
                      <div className="mockup-stat-card">
                        <div className="mockup-stat-num">91.5</div>
                        <div className="mockup-stat-lbl">Rata-rata Nilai</div>
                      </div>
                      <div className="mockup-stat-card">
                        <div className="mockup-stat-num" style={{ color: '#059669' }}>Lunas</div>
                        <div className="mockup-stat-lbl">Tagihan SPP Nov</div>
                      </div>
                      <div className="mockup-stat-card">
                        <div className="mockup-stat-num">Ke-2</div>
                        <div className="mockup-stat-lbl">Peringkat Kelas</div>
                      </div>
                    </div>

                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 14px', borderRadius: '8px', fontSize: '0.8rem', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>💳 Bukti Bayar SPP: Telah Terbit Kwitansi Digital Resmi</span>
                      <button className="btn btn-outline btn-sm" style={{ background: '#ffffff', fontSize: '0.75rem' }}>Unduh Kwitansi</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION KEUNGGULAN */}
      <section id="keunggulan" className="marketing-section bg-subtle">
        <div className="section-header-center">
          <span className="section-badge">Keunggulan Platform</span>
          <h2 className="section-title">Semua Solusi Manajemen Sekolah yang Anda Butuhkan</h2>
          <p className="section-subtitle">
            Didesain khusus untuk memenuhi standar tata kelola pendidikan modern dan kemudahan operasional harian.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-box" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <Building2 size={24} />
            </div>
            <h3>Manajemen Data Sekolah</h3>
            <p>
              Sentralisasi profil sekolah, identitas NPSN resmi, kalender akademik, semester berjalan, dan multi-jenjang dari PAUD hingga SMK.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <Users size={24} />
            </div>
            <h3>Manajemen Siswa & Guru</h3>
            <p>
              Pengelolaan biodata lengkap, NIK, NISN, orang tua/wali, data kepegawaian guru, NIP, serta riwayat penugasan mata pelajaran.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Layers size={24} />
            </div>
            <h3>Struktur Rombel & Wali Kelas</h3>
            <p>
              Hierarki tingkat dan rombongan belajar otomatis dengan kapasitas terkelola serta penugasan wali kelas hanya dalam 1 klik.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box" style={{ background: '#faf5ff', color: '#7c3aed' }}>
              <ShieldCheck size={24} />
            </div>
            <h3>Role-Based Access Control (RBAC)</h3>
            <p>
              Kontrol hak akses ketat untuk 7 role pengguna: Super Admin, Admin Sekolah, Kepala Sekolah, Guru, Staf TU, Siswa, dan Orang Tua.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>
              <Wallet size={24} />
            </div>
            <h3>Otomatisasi Keuangan & SPP</h3>
            <p>
              Tagihan SPP berulang dengan invoice otomatis, integrasi Virtual Account Bank (BCA, Mandiri, BRI) dan verifikasi pelunasan instan.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box" style={{ background: '#fdf2f8', color: '#db2777' }}>
              <Award size={24} />
            </div>
            <h3>Laporan & e-Raport Siap Cetak</h3>
            <p>
              Rekapitulasi nilai capaian kompetensi Kurikulum Merdeka, cetak PDF ber-barcode resmi, dan laporan statistik agregat.
            </p>
          </div>
        </div>
      </section>

      {/* 4. SECTION PRODUK */}
      <section id="produk" className="marketing-section">
        <div className="section-header-center">
          <span className="section-badge">Ekosistem EduCore</span>
          <h2 className="section-title">Katalog Produk Terintegrasi</h2>
          <p className="section-subtitle">
            Pilihan modul terlengkap yang saling terhubung untuk mendigitalkan seluruh lini institusi Anda.
          </p>
        </div>

        <div className="products-showcase-grid">
          {products.map((prod) => (
            <div key={prod.id} className="product-showcase-card">
              <div className="product-card-top">
                <div className="product-icon-wrap">{getProductIcon(prod.icon)}</div>
                <span className="product-category-tag">{prod.category}</span>
              </div>
              <h3 className="product-card-name">{prod.name}</h3>
              <p className="product-card-tagline">{prod.tagline}</p>
              <p className="product-card-desc">{prod.description}</p>
              <div className="product-features-list">
                <span className="features-list-title">Fitur Utama:</span>
                <ul>
                  {prod.features.map((feat, idx) => (
                    <li key={idx}>
                      <CheckCircle2 size={15} style={{ color: '#10b981', flexShrink: 0 }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SECTION PRICING */}
      <section id="harga" className="marketing-section bg-subtle">
        <div className="section-header-center">
          <span className="section-badge">Investasi Terjangkau</span>
          <h2 className="section-title">Pilihan Paket Langganan Sesuai Skala Sekolah</h2>
          <p className="section-subtitle">
            Dikelola langsung secara dinamis melalui SaaS Controller. Tanpa biaya tersembunyi.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="pricing-toggle-wrap">
            <button
              className={`toggle-option ${billingCycle === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Tagihan Bulanan
            </button>
            <button
              className={`toggle-option ${billingCycle === 'annually' ? 'active' : ''}`}
              onClick={() => setBillingCycle('annually')}
            >
              Tagihan Tahunan
              <span className="discount-pill">Hemat 16% + 2 Bln Gratis</span>
            </button>
          </div>
        </div>

        <div className="pricing-cards-grid">
          {plans.map((plan) => {
            const price = billingCycle === 'annually' ? plan.annualPrice : plan.monthlyPrice;
            const isFree = plan.name === 'Free';

            return (
              <div
                key={plan.id}
                className={`pricing-card ${plan.isPopular ? 'popular' : ''}`}
              >
                {plan.badge && <div className="pricing-badge">{plan.badge}</div>}

                <div className="pricing-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <p className="plan-desc">{plan.description}</p>
                </div>

                <div className="plan-price-block">
                  {isFree ? (
                    <div className="price-amount">Rp 0</div>
                  ) : (
                    <div className="price-amount">
                      {formatRupiah(price)}
                      <span className="price-unit">/{billingCycle === 'annually' ? 'tahun' : 'bulan'}</span>
                    </div>
                  )}
                  <span className="quota-tag">
                    Kapasitas: {plan.maxStudents.toLocaleString()} Siswa • {plan.maxUsers} Pengguna
                  </span>
                </div>

                <div className="plan-features">
                  <span className="plan-features-label">Cakupan Layanan:</span>
                  <ul>
                    {plan.features.map((feat, fidx) => (
                      <li key={fidx}>
                        <CheckCircle2 size={16} className="feature-check-icon" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="plan-cta">
                  <Button
                    variant={plan.isPopular ? 'primary' : 'outline'}
                    size="lg"
                    className="w-full"
                    onClick={() => startRegistrationWithPlan(plan.id)}
                  >
                    {isFree ? 'Mulai Trial Gratis' : `Pilih Paket ${plan.name}`}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive ROI & Savings Calculator */}
        <div className="roi-calculator-container animate-fade-in">
          <div className="roi-calculator-header">
            <div className="roi-calc-badge">
              <Calculator size={14} />
              <span>Simulasi Efisiensi Anggaran</span>
            </div>
            <h3>Kalkulator Penghematan & Biaya per Siswa</h3>
            <p>
              Geser jumlah siswa institusi Anda untuk melihat rekomendasi paket dan estimasi efisiensi biaya operasional riil per tahun.
            </p>
          </div>

          <div className="roi-calculator-body">
            {/* Slider Section */}
            <div className="roi-slider-col">
              <div className="roi-slider-label-row">
                <span>Estimasi Jumlah Siswa:</span>
                <strong className="roi-student-count">{calculatorStudents} Siswa</strong>
              </div>
              <input
                type="range"
                min={50}
                max={2000}
                step={25}
                value={calculatorStudents}
                onChange={(e) => setCalculatorStudents(Number(e.target.value))}
                className="roi-slider-input"
              />
              <div className="roi-slider-ticks">
                <span>50 (Free)</span>
                <span>300 (Basic)</span>
                <span>800 (Pro)</span>
                <span>2,000+ (Enterprise)</span>
              </div>

              <div className="roi-benefit-highlights">
                <div className="roi-benefit-item">
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Tanpa biaya sewa server & teknisi mandiri (Cloud SaaS terpelihara 24/7)</span>
                </div>
                <div className="roi-benefit-item">
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Backup data otomatis harian & jaminan reliabilitas sistem 99.9%</span>
                </div>
                <div className="roi-benefit-item">
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Pendampingan migrasi data siswa Dapodik / EMIS secara cuma-cuma</span>
                </div>
              </div>
            </div>

            {/* Result Card */}
            <div className="roi-result-card">
              <div className="roi-rec-badge">Rekomendasi Paket Otomatis</div>
              <div className="roi-plan-title">
                Paket EduCore <strong>{calcRecommendedPlan?.name || 'Professional'}</strong>
              </div>
              <div className="roi-per-student-box">
                <span className="roi-cost-title">Hanya sekitar:</span>
                <div className="roi-cost-amount">
                  {formatRupiah(costPerStudent)}
                  <span className="roi-cost-unit">/ siswa / bulan</span>
                </div>
              </div>

              <div className="roi-stat-breakdown">
                <div className="roi-stat-row">
                  <span>Estimasi Hemat Kertas & Rapor Cetak:</span>
                  <strong>{formatRupiah(estPaperSavings)} / thn</strong>
                </div>
                <div className="roi-stat-row">
                  <span>Efisiensi Waktu Administrasi TU:</span>
                  <strong>~{estHoursSaved} Jam / bln</strong>
                </div>
                <div className="roi-stat-row">
                  <span>Kapasitas Rombel Tercover:</span>
                  <strong>Hingga {calcRecommendedPlan?.maxStudents || 800} Siswa</strong>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                icon={<ArrowRight size={16} />}
                onClick={() => startRegistrationWithPlan(calcRecommendedPlan?.id || plans[0]?.id)}
              >
                Daftar Paket Ini ({calcRecommendedPlan?.trialDays || 14} Hari Trial)
              </Button>
              <div className="roi-guarantee-note">
                ⚡ Otomatis provisioning domain instan tanpa kartu kredit
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION TESTIMONIAL */}
      <section id="testimoni" className="marketing-section">
        <div className="section-header-center">
          <span className="section-badge">Kisah Sukses</span>
          <h2 className="section-title">Dipercaya Oleh Berbagai Jenjang Sekolah di Indonesia</h2>
          <p className="section-subtitle">
            Dengar langsung pengalaman pimpinan sekolah yang telah bertransformasi bersama EduCore.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testi, idx) => (
            <div key={idx} className="testimonial-card">
              <div className="testi-rating">
                {[...Array(testi.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="testi-text">"{testi.text}"</p>
              <div className="testi-author">
                <img src={testi.image} alt={testi.name} className="testi-avatar" />
                <div>
                  <div className="author-name">{testi.name}</div>
                  <div className="author-role">{testi.role}</div>
                  <div className="author-school">{testi.school}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. SECTION FAQ */}
      <section id="faq" className="marketing-section bg-subtle">
        <div className="section-header-center">
          <span className="section-badge">Pertanyaan Umum</span>
          <h2 className="section-title">Kerap Ditanyakan Seputar EduCore SaaS</h2>
          <p className="section-subtitle">
            Temukan jawaban atas pertanyaan teknis, isolasi data, dan prosedur aktivasi.
          </p>
        </div>

        <div className="faq-container">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {isOpen && <div className="faq-answer">{faq.a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="marketing-footer">
        <div className="marketing-footer-top">
          <div className="footer-col-brand">
            <div className="marketing-brand">
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
            <p className="footer-desc">
              Platform Software-as-a-Service (SaaS) manajemen sekolah multi-tenant terbaik di Indonesia.
              Dirancang untuk menghadirkan otomasi operasional institusi pendidikan yang aman, transparan, dan terpercaya.
            </p>
            <div className="security-badges">
              <span className="sec-badge">
                <ShieldCheck size={14} /> ISO 27001 Ready
              </span>
              <span className="sec-badge">
                <Lock size={14} /> 256-bit SSL Enkripsi
              </span>
              <span className="sec-badge">
                <Globe size={14} /> Server Indonesia
              </span>
            </div>
          </div>

          <div className="footer-col">
            <h4>Navigasi</h4>
            <ul>
              <li><a href="#beranda">Beranda</a></li>
              <li><a href="#keunggulan">Fitur Utama</a></li>
              <li><a href="#produk">Produk</a></li>
              <li><a href="#harga">Paket & Harga</a></li>
              <li><a href="#testimoni">Testimoni</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Portal Aplikasi</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setPortalMode('register'); }}>Daftar Sekolah Baru</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setPortalMode('app'); }}>Login Administrator</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setPortalMode('app'); }}>Portal Guru & Rapor</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setPortalMode('app'); }}>Portal Siswa & Wali</a></li>
              {isSuperAdmin && (
                <li><a href="#" onClick={(e) => { e.preventDefault(); setPortalMode('controller'); }}>SaaS Controller</a></li>
              )}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Hubungi Kami</h4>
            <div className="footer-contact-item">
              <MapPin size={16} />
              <span>Gedung EduCore Tech Tower Lt. 12, Jl. Sudirman Kav. 28, Jakarta Pusat</span>
            </div>
            <div className="footer-contact-item">
              <PhoneCall size={16} />
              <span>+62 21 8976 5432 / +62 811 9928 340</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={16} />
              <span>halo@educore.id / support@educore.id</span>
            </div>
          </div>
        </div>

        <div className="marketing-footer-bottom">
          <p>© {new Date().getFullYear()} EduCore Multi-Tenant SaaS Platform. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="footer-bottom-links">
            <a href="#">Ketentuan Layanan</a>
            <a href="#">Kebijakan Privasi</a>
            <a href="#">Perjanjian SLA</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

