import React, { useState, useEffect } from 'react';
import {
  Menu,
  Building,
  UserCheck,
  RotateCcw,
  Sparkles,
  Globe,
  SlidersHorizontal,
  Search,
  Bell,
} from 'lucide-react';
import { useTenantAuth } from '../../context/TenantAuthContext';
import { useToast } from '../../context/ToastContext';
import { useSaaS } from '../../context/SaaSContext';
import { Breadcrumb, BreadcrumbItem } from '../common/Breadcrumb';
import { ConfirmModal } from '../common/Modal';
import { CommandPalette } from '../common/CommandPalette';
import { NotificationDrawer } from '../common/NotificationDrawer';
import { ActiveNavPage } from './Sidebar';

interface NavbarProps {
  onToggleMobile: () => void;
  activePage: ActiveNavPage;
  onNavigate: (page: ActiveNavPage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobile,
  activePage,
  onNavigate,
}) => {
  const {
    currentSchool,
    schools,
    switchSchool,
    currentUser,
    users,
    switchUser,
    isSuperAdmin,
    resetAllData,
  } = useTenantAuth();

  const { setPortalMode } = useSaaS();
  const { success } = useToast();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate breadcrumb items
  const pageTitles: Record<ActiveNavPage, string> = {
    dashboard: 'Dashboard Overview',
    schools: isSuperAdmin ? 'School Management' : 'School Profile',
    'academic-years': 'Struktur Akademik - Tahun Ajaran',
    users: 'User Management',
    roles: 'Roles & Permission Matrix',
    students: 'Student Profile & Management',
    teachers: 'Teacher Profile',
    staff: 'Staff Profile',
    levels: 'Academic Levels (Jenjang)',
    classes: 'Academic Classes (Tingkat)',
    rombels: 'Rombongan Belajar (Rombel)',
    homeroom: 'Homeroom Teacher Assignment',
    settings: 'System Settings',
  };

  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Home',
      onClick: () => onNavigate('dashboard'),
    },
    {
      label: pageTitles[activePage] || 'Halaman',
    },
  ];

  const handleReset = () => {
    resetAllData();
    setShowResetConfirm(false);
    success('Data Berhasil Direset', 'Semua data seed kembali ke konfigurasi awal.');
  };

  return (
    <>
      <header className="top-navbar">
        <div className="navbar-left">
          <button
            className="sidebar-toggle-btn"
            onClick={onToggleMobile}
            title="Menu Navigasi"
          >
            <Menu size={18} />
          </button>
          <Breadcrumb items={breadcrumbs} />
        </div>

        <div className="navbar-right">
          {/* Global Command Palette Trigger Button */}
          <button
            className="btn btn-outline btn-sm search-trigger-btn"
            onClick={() => setShowCommandPalette(true)}
            title="Cari Cepat & Navigasi (Ctrl + K)"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <Search size={14} style={{ color: 'var(--color-primary)' }} />
            <span>Cari cepat...</span>
            <span className="kbd-pill" style={{ marginLeft: '4px', fontSize: '0.65rem' }}>Ctrl K</span>
          </button>

          {/* Quick Portal Switcher Buttons */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPortalMode('marketing')}
            title="Buka Website Publik Marketing"
            style={{ fontSize: '0.78rem' }}
          >
            <Globe size={13} />
            <span>Landing Page</span>
          </button>

          {isSuperAdmin && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPortalMode('controller')}
              title="Buka SaaS Controller Super Admin"
              style={{ fontSize: '0.78rem' }}
            >
              <SlidersHorizontal size={13} />
              <span>SaaS Controller</span>
            </button>
          )}

          {/* Notification Bell */}
          <button
            className="btn btn-ghost btn-sm notif-bell-btn"
            onClick={() => setShowNotificationDrawer(true)}
            title="Pusat Notifikasi"
            style={{ position: 'relative', padding: '6px 10px' }}
          >
            <Bell size={16} />
            <span
              style={{
                position: 'absolute',
                top: '5px',
                right: '7px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#ef4444',
              }}
            />
          </button>

          {/* Tenant Switcher (Super Admin can switch tenants or view All) */}
          <div className="tenant-selector" title="Pilih Tenant Sekolah">
            <Building size={15} style={{ color: 'var(--color-primary)' }} />
            <select
              value={currentSchool ? currentSchool.id : 'all'}
              onChange={(e) => switchSchool(e.target.value)}
              disabled={!isSuperAdmin}
            >
              {isSuperAdmin && <option value="all">Semua Tenant (Global)</option>}
              {schools.map((sch) => (
                <option key={sch.id} value={sch.id}>
                  {sch.name} ({sch.level})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Role Simulator Switcher for pair review / testing */}
          <div className="role-switcher-badge" title="Ganti Perspektif Pengguna untuk Pengujian Akses">
            <Sparkles size={14} />
            <select
              value={currentUser.id}
              onChange={(e) => {
                switchUser(e.target.value);
                success('Beralih Pengguna', `Sekarang melihat sistem sebagai ${e.target.options[e.target.selectedIndex].text}`);
              }}
            >
              <optgroup label="Pilih Role Pengguna:">
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.role}: {u.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Reset Demo Data Button */}
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setShowResetConfirm(true)}
            title="Reset data ke seed awal"
            style={{ fontSize: '0.78rem' }}
          >
            <RotateCcw size={13} />
            <span>Reset Demo</span>
          </button>

          {/* User Profile Pill */}
          <div className="user-profile-menu">
            <div className="user-avatar">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} />
              ) : (
                <UserCheck size={16} />
              )}
            </div>
            <div className="user-meta">
              <span className="user-name">{currentUser.name.split(',')[0]}</span>
              <span className="user-role-tag">{currentUser.role}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset Seluruh Data Demo?"
        message="Tindakan ini akan mengembalikan data sekolah, siswa, guru, rombel, dan permission ke kondisi default awal."
        confirmText="Ya, Reset Data"
        cancelText="Batal"
        variant="primary"
      />

      {/* Global Command Palette (Ctrl + K) */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigatePage={onNavigate}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
      />
    </>
  );
};
