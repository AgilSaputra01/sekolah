import React from 'react';
import {
  Building2,
  Users,
  GraduationCap,
  Briefcase,
  UserCheck,
  Layers,
  BookOpen,
  Calendar,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  School as SchoolIcon,
} from 'lucide-react';
import { useTenantAuth } from '../context/TenantAuthContext';
import { StatCard, Card } from '../components/common/Card';
import { StatusBadge, RoleBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Table, Column } from '../components/common/Table';
import { User, Student } from '../types';
import { ActiveNavPage } from '../components/layout/Sidebar';

export const DashboardView: React.FC<{ onNavigate: (page: ActiveNavPage) => void }> = ({
  onNavigate,
}) => {
  const {
    currentSchool,
    schools,
    users,
    students,
    teachersStaff,
    classes,
    rombels,
    academicYears,
    isSuperAdmin,
    currentUser,
  } = useTenantAuth();

  const totalTeachers = teachersStaff.filter((t) => t.type === 'Guru').length;
  const totalStaff = teachersStaff.filter((t) => t.type === 'Staff').length;
  const activeYear = academicYears.find((ay) => ay.status === 'Aktif');

  // Columns for Recent Users
  const userColumns: Column<User>[] = [
    {
      header: 'Nama Pengguna',
      render: (u) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.78rem' }}>
            {u.avatar ? <img src={u.avatar} alt={u.name} /> : u.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      render: (u) => <RoleBadge role={u.role} />,
    },
    {
      header: 'Status',
      render: (u) => <StatusBadge status={u.status} />,
    },
  ];

  // Columns for Recent Students
  const studentColumns: Column<Student>[] = [
    {
      header: 'Nama Siswa',
      render: (s) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.fullName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            NIS: {s.nis} • NISN: {s.nisn}
          </div>
        </div>
      ),
    },
    {
      header: 'Rombel',
      render: (s) => {
        const rombel = rombels.find((r) => r.id === s.rombelId);
        return <span>{rombel ? rombel.name : '-'}</span>;
      },
    },
    {
      header: 'Status',
      render: (s) => <StatusBadge status={s.status} />,
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Page Title & Context Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <SchoolIcon size={28} style={{ color: 'var(--color-primary)' }} />
            Dashboard SaaS School Management
          </h1>
          <p>
            {currentSchool ? (
              <span>
                Konteks Tenant Aktif:{' '}
                <strong style={{ color: 'var(--color-primary)' }}>{currentSchool.name}</strong> (
                {currentSchool.level}) • NPSN: {currentSchool.npsn}
              </span>
            ) : (
              <span>Modus Global Super Admin • Menampilkan statistik lintas sekolah</span>
            )}
          </p>
        </div>

        <div className="page-actions">
          {isSuperAdmin && (
            <Button
              variant="outline"
              icon={<Building2 size={16} />}
              onClick={() => onNavigate('schools')}
            >
              Kelola Sekolah
            </Button>
          )}
          <Button
            variant="primary"
            icon={<GraduationCap size={16} />}
            onClick={() => onNavigate('students')}
          >
            Lihat Siswa
          </Button>
        </div>
      </div>

      {/* SaaS Tenant Subscription & Quota Card */}
      {currentSchool && (
        <div
          className="card"
          style={{
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
            border: '1px solid #c7d2fe',
            padding: '16px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                <Sparkles size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                    Paket EduCore: {currentSchool.planName || 'Professional'}
                  </span>
                  <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                    {currentSchool.subscriptionStatus || 'Aktif'}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Subdomain:{' '}
                  <strong className="font-mono" style={{ color: 'var(--color-primary)' }}>
                    {currentSchool.subdomain ? `${currentSchool.subdomain}.educore.id` : 'sman1jkt.educore.id'}
                  </strong>{' '}
                  • Akses Tenant Terisolasi
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Penggunaan Kuota Siswa: <strong>{students.length}</strong> / {currentSchool.maxStudents || 1200} Siswa
                </div>
                <div style={{ width: '160px', height: '6px', background: '#cbd5e1', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: 'var(--color-primary)',
                      width: `${Math.min(100, Math.round((students.length / (currentSchool.maxStudents || 1200)) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Kuota Staf & Guru: <strong>{teachersStaff.length}</strong> / {currentSchool.maxUsers || 120} Akun
                </div>
                <div style={{ width: '140px', height: '6px', background: '#cbd5e1', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: '#10b981',
                      width: `${Math.min(100, Math.round((teachersStaff.length / (currentSchool.maxUsers || 120)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Week 1 SaaS Implementation Flow Banner */}
      <div className="flow-banner">
        <div className="flow-banner-title">
          <Sparkles size={22} />
          <span>Alur Fondasi SaaS Multi-Tenant (Week 1 Master Flow)</span>
        </div>
        <p className="flow-banner-desc">
          Setiap sekolah adalah tenant yang terisolasi dengan data mandiri. Gunakan alur berikut untuk
          memastikan fondasi akademik sekolah Anda telah siap digunakan.
        </p>

        <div className="flow-steps-row">
          <div className="flow-step-chip">
            <span className="flow-step-num">1</span> Super Admin
          </div>
          <ArrowRight size={14} color="#a5b4fc" />
          <div
            className="flow-step-chip"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('schools')}
          >
            <span className="flow-step-num">2</span> Create School
          </div>
          <ArrowRight size={14} color="#a5b4fc" />
          <div
            className="flow-step-chip"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('users')}
          >
            <span className="flow-step-num">3</span> Admin School
          </div>
          <ArrowRight size={14} color="#a5b4fc" />
          <div
            className="flow-step-chip"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('roles')}
          >
            <span className="flow-step-num">4</span> Roles & Permissions
          </div>
          <ArrowRight size={14} color="#a5b4fc" />
          <div
            className="flow-step-chip"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('teachers')}
          >
            <span className="flow-step-num">5</span> Guru/Staff
          </div>
          <ArrowRight size={14} color="#a5b4fc" />
          <div
            className="flow-step-chip"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('students')}
          >
            <span className="flow-step-num">6</span> Siswa
          </div>
          <ArrowRight size={14} color="#a5b4fc" />
          <div
            className="flow-step-chip"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('academic-years')}
          >
            <span className="flow-step-num">7</span> Tahun Ajaran
          </div>
          <ArrowRight size={14} color="#a5b4fc" />
          <div
            className="flow-step-chip"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('rombels')}
          >
            <span className="flow-step-num">8</span> Rombel & Wali Kelas
          </div>
        </div>
      </div>

      {/* Statistic Cards (Total Sekolah, Total User, Total Siswa, Total Guru, Total Staff, Total Kelas, Total Rombel) */}
      <div className="stat-grid">
        {isSuperAdmin && (
          <StatCard
            label="Total Sekolah"
            value={schools.length}
            trend={`${schools.filter((s) => s.status === 'Aktif').length} Tenant Aktif`}
            icon={<Building2 size={24} />}
            color="indigo"
            onClick={() => onNavigate('schools')}
          />
        )}
        <StatCard
          label="Total User"
          value={users.length}
          trend="Akun Terdaftar"
          icon={<Users size={24} />}
          color="purple"
          onClick={() => onNavigate('users')}
        />
        <StatCard
          label="Total Siswa"
          value={students.length}
          trend={`${students.filter((s) => s.status === 'Aktif').length} Siswa Aktif`}
          icon={<GraduationCap size={24} />}
          color="emerald"
          onClick={() => onNavigate('students')}
        />
        <StatCard
          label="Total Guru"
          value={totalTeachers}
          trend="Tenaga Pengajar"
          icon={<Briefcase size={24} />}
          color="sky"
          onClick={() => onNavigate('teachers')}
        />
        <StatCard
          label="Total Staff"
          value={totalStaff}
          trend="Administrasi & Lab"
          icon={<UserCheck size={24} />}
          color="amber"
          onClick={() => onNavigate('staff')}
        />
        <StatCard
          label="Total Kelas"
          value={classes.length}
          trend="Tingkat Pembelajaran"
          icon={<Layers size={24} />}
          color="rose"
          onClick={() => onNavigate('classes')}
        />
        <StatCard
          label="Total Rombel"
          value={rombels.length}
          trend={`${rombels.filter((r) => r.homeroomTeacherId).length} Terpasang Wali`}
          icon={<BookOpen size={24} />}
          color="indigo"
          onClick={() => onNavigate('rombels')}
        />
      </div>

      {/* Active Academic Year & Context Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <Card
          title="Tahun Ajaran Aktif"
          subtitle="Konfigurasi kalender dasar sekolah"
          icon={<Calendar size={20} color="var(--color-primary)" />}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('academic-years')}
            >
              Ubah Konfigurasi
            </Button>
          }
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {activeYear ? activeYear.year : 'Belum Ditentukan'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Semester:{' '}
                <strong style={{ color: 'var(--color-primary)' }}>
                  {activeYear ? activeYear.activeSemester : '-'}
                </strong>
              </div>
            </div>
            {activeYear && <StatusBadge status={activeYear.status} />}
          </div>
          <div
            style={{
              marginTop: '12px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-subtle)',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
            }}
          >
            Aturan: Hanya boleh ada 1 tahun ajaran aktif per sekolah. Pergantian tahun ajaran
            secara otomatis menonaktifkan tahun sebelumnya.
          </div>
        </Card>

        {/* Tenant Information Card */}
        <Card
          title="Informasi Tenant Sekolah"
          subtitle="Identitas dan status instansi"
          icon={<Building2 size={20} color="var(--color-primary)" />}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate(isSuperAdmin ? 'schools' : 'schools')}
            >
              Detail Sekolah
            </Button>
          }
        >
          {currentSchool ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: '#e2e8f0',
                  }}
                >
                  <img
                    src={currentSchool.logo}
                    alt={currentSchool.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                    {currentSchool.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    NPSN: {currentSchool.npsn} • Jenjang: {currentSchool.level}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <StatusBadge status={currentSchool.status} />
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {currentSchool.address}
              </p>
            </div>
          ) : (
            <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Memilih mode multi-tenant global. Pilih salah satu tenant dari dropdown di atas untuk
              melihat isolasi data spesifik sekolah.
            </div>
          )}
        </Card>
      </div>

      {/* Recent Users & Recent Students Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
        <Card
          title="Recent Users"
          subtitle="Pengguna terdaftar terbaru di sekolah"
          icon={<Users size={18} color="var(--color-primary)" />}
          action={
            <Button variant="ghost" size="sm" onClick={() => onNavigate('users')}>
              Lihat Semua
            </Button>
          }
          noPadding
        >
          <Table
            columns={userColumns}
            data={users.slice(0, 5)}
            keyExtractor={(u) => u.id}
          />
        </Card>

        <Card
          title="Recent Students"
          subtitle="Siswa terdaftar terbaru pada rombel"
          icon={<GraduationCap size={18} color="var(--color-primary)" />}
          action={
            <Button variant="ghost" size="sm" onClick={() => onNavigate('students')}>
              Lihat Semua
            </Button>
          }
          noPadding
        >
          <Table
            columns={studentColumns}
            data={students.slice(0, 5)}
            keyExtractor={(s) => s.id}
          />
        </Card>
      </div>
    </div>
  );
};
