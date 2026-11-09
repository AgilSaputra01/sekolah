import React, { useState } from 'react';
import { Settings, Shield, User, Building, Database, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useTenantAuth } from '../context/TenantAuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { RoleBadge } from '../components/common/Badge';

export const SettingsView: React.FC = () => {
  const { currentUser, currentSchool, resetAllData, isSuperAdmin } = useTenantAuth();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'tenant' | 'system'>('profile');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    success('Profil Disimpan', 'Informasi akun Anda telah diperbarui.');
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Settings size={26} color="var(--color-primary)" />
            System Settings & Profile
          </h1>
          <p>Pengaturan preferensi akun pengguna, profil instansi tenant, dan pemeliharaan sistem.</p>
        </div>
      </div>

      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={16} />
          <span>Profil Pengguna</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'tenant' ? 'active' : ''}`}
          onClick={() => setActiveTab('tenant')}
        >
          <Building size={16} />
          <span>Konfigurasi Tenant</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          <Database size={16} />
          <span>Pemeliharaan Data</span>
        </button>
      </div>

      {activeTab === 'profile' && (
        <Card title="Informasi Akun Saat Ini" subtitle="Data profil kredensial aktif">
          <form onSubmit={handleSaveProfile} className="form-grid">
            <div className="form-group form-group-full">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
                <div className="user-avatar" style={{ width: '64px', height: '64px', fontSize: '1.4rem' }}>
                  {currentUser.avatar ? <img src={currentUser.avatar} alt={currentUser.name} /> : currentUser.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{currentUser.name}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <RoleBadge role={currentUser.role} />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input type="text" className="form-input" defaultValue={currentUser.name} />
            </div>

            <div className="form-group">
              <label className="form-label">Alamat Email</label>
              <input type="email" className="form-input" defaultValue={currentUser.email} />
            </div>

            <div className="form-group">
              <label className="form-label">Nomor WhatsApp</label>
              <input type="text" className="form-input" defaultValue={currentUser.phone} />
            </div>

            <div className="form-group">
              <label className="form-label">Role Akses</label>
              <input type="text" className="form-input" value={currentUser.role} disabled />
            </div>

            <div className="form-group form-group-full" style={{ marginTop: '12px' }}>
              <Button type="submit" variant="primary">
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'tenant' && (
        <Card title="Status Tenant Sekolah" subtitle="Identitas lingkungan tenant yang sedang aktif">
          {currentSchool ? (
            <div className="form-grid">
              <div className="form-group">
                <span className="form-label">Nama Sekolah</span>
                <div style={{ fontWeight: 700 }}>{currentSchool.name}</div>
              </div>
              <div className="form-group">
                <span className="form-label">NPSN</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{currentSchool.npsn}</div>
              </div>
              <div className="form-group">
                <span className="form-label">Jenjang Pendidikan</span>
                <div>{currentSchool.level}</div>
              </div>
              <div className="form-group">
                <span className="form-label">Tahun Ajaran</span>
                <div>{currentSchool.academicYear}</div>
              </div>
              <div className="form-group form-group-full">
                <span className="form-label">Alamat</span>
                <div>{currentSchool.address}</div>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>
              Saat ini Anda berada dalam mode Super Admin Global. Pilih salah satu tenant pada dropdown atas
              untuk melihat konfigurasi spesifik sekolah.
            </p>
          )}
        </Card>
      )}

      {activeTab === 'system' && (
        <Card title="Data & Mock State Management" subtitle="Pengaturan penyimpanan lokal demo">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Sistem menyimpan seluruh operasi CRUD (Sekolah, Pengguna, Siswa, Guru, Staff, Tahun Ajaran,
              Kelas, Rombel, dan Matriks Permission) di penyimpanan lokal browser (localStorage).
            </p>
            <div>
              <Button
                variant="outline"
                icon={<RotateCcw size={16} />}
                onClick={() => {
                  resetAllData();
                  success('Data Direset', 'Semua data seed kembali ke konfigurasi pabrik.');
                }}
              >
                Reset Semua Data ke Nilai Awal (Seed Data)
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
