import React, { useState } from 'react';
import { TenantAuthProvider, useTenantAuth } from './context/TenantAuthContext';
import { ToastProvider } from './context/ToastContext';
import { SaaSProvider, useSaaS } from './context/SaaSContext';
import { Sidebar, ActiveNavPage } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './views/DashboardView';
import { SchoolManagementView } from './views/SchoolManagementView';
import { UserManagementView } from './views/UserManagementView';
import { RolePermissionView } from './views/RolePermissionView';
import { StudentManagementView } from './views/StudentManagementView';
import { TeacherStaffManagementView } from './views/TeacherStaffManagementView';
import { AcademicStructureView } from './views/AcademicStructureView';
import { SettingsView } from './views/SettingsView';
import { MarketingLandingView } from './views/marketing/MarketingLandingView';
import { SchoolRegistrationView } from './views/marketing/SchoolRegistrationView';
import { SaaSControllerView } from './views/controller/SaaSControllerView';
import { ModuleType } from './types';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from './components/common/Button';

const MainLayout: React.FC = () => {
  const [activePage, setActivePage] = useState<ActiveNavPage>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const { hasPermission, currentUser, currentSchool, isSuperAdmin } = useTenantAuth();
  const { setPortalMode } = useSaaS();

  // Check required module permission for the active page
  const pageModuleMap: Partial<Record<ActiveNavPage, ModuleType>> = {
    schools: 'School',
    'academic-years': 'Academic Year',
    users: 'Users',
    roles: 'Roles',
    students: 'Students',
    teachers: 'Teachers',
    staff: 'Staff',
    levels: 'Levels',
    classes: 'Classes',
    rombels: 'Rombel',
    homeroom: 'Homeroom Teacher',
  };

  const requiredModule = pageModuleMap[activePage];
  const isAuthorized = !requiredModule || hasPermission(requiredModule, 'View');

  // Tenant Status Guard: If school is suspended, limit school app access
  if (currentSchool && currentSchool.status === 'Suspended' && !isSuperAdmin) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '56px 32px',
            maxWidth: '580px',
            margin: '40px auto',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '999px',
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              color: '#ef4444',
            }}
          >
            <ShieldAlert size={36} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            Layanan Tenant Sekolah Ditangguhkan (Suspended)
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
            Akses ke dashboard sekolah <strong>{currentSchool.name}</strong> sementara dibatasi oleh Super Admin Platform.
          </p>
          {currentSchool.suspendedReason && (
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                padding: '12px 16px',
                borderRadius: '8px',
                color: '#92400e',
                fontSize: '0.85rem',
                marginBottom: '24px',
              }}
            >
              <strong>Catatan Sistem:</strong> {currentSchool.suspendedReason}
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button
              variant="outline"
              icon={<ArrowLeft size={16} />}
              onClick={() => setPortalMode('marketing')}
            >
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render view component
  const renderContent = () => {
    if (!isAuthorized) {
      return (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            maxWidth: '540px',
            margin: '40px auto',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '999px',
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              color: '#ef4444',
            }}
          >
            <ShieldAlert size={36} />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            Akses Halaman Dibatasi
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '24px' }}>
            Role Anda (<strong>{currentUser.role}</strong>) tidak memiliki hak akses <strong>View</strong>{' '}
            untuk modul <strong>{requiredModule}</strong>. Hubungi Administrator Sekolah untuk meminta penambahan wewenang.
          </p>
          <Button
            variant="primary"
            icon={<ArrowLeft size={16} />}
            onClick={() => setActivePage('dashboard')}
          >
            Kembali ke Dashboard
          </Button>
        </div>
      );
    }

    switch (activePage) {
      case 'dashboard':
        return <DashboardView onNavigate={setActivePage} />;
      case 'schools':
        return <SchoolManagementView />;
      case 'users':
        return <UserManagementView />;
      case 'roles':
        return <RolePermissionView />;
      case 'students':
        return <StudentManagementView />;
      case 'teachers':
        return <TeacherStaffManagementView initialType="Guru" />;
      case 'staff':
        return <TeacherStaffManagementView initialType="Staff" />;
      case 'academic-years':
        return <AcademicStructureView initialTab="years" />;
      case 'levels':
        return <AcademicStructureView initialTab="levels" />;
      case 'classes':
        return <AcademicStructureView initialTab="classes" />;
      case 'rombels':
        return <AcademicStructureView initialTab="rombels" />;
      case 'homeroom':
        return <AcademicStructureView initialTab="homeroom" />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileDrawerOpen}
        onCloseMobile={() => setMobileDrawerOpen(false)}
      />

      {/* Main Area */}
      <div className="main-wrapper">
        {isSuperAdmin && currentSchool && (
          <div className="impersonation-banner animate-fade-in">
            <div className="impersonation-info">
              <span className="impersonation-tag">
                <ShieldAlert size={12} />
                Super Admin
              </span>
              <span>
                Sedang menginspeksi tenant: <strong>{currentSchool.name}</strong>{' '}
                <span className="impersonation-subdomain">
                  ({currentSchool.subdomain ? `${currentSchool.subdomain}.educore.id` : 'subdomain'})
                </span>
              </span>
            </div>
            <div className="impersonation-actions">
              <button
                className="impersonation-btn"
                onClick={() => setPortalMode('controller')}
                title="Kembali ke Dashboard Super Admin SaaS Controller"
              >
                <ArrowLeft size={13} />
                <span>Kembali ke SaaS Controller</span>
              </button>
            </div>
          </div>
        )}

        <Navbar
          onToggleMobile={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          activePage={activePage}
          onNavigate={setActivePage}
        />

        <main className="content-area">{renderContent()}</main>
      </div>
    </div>
  );
};

// Root Router Component between Marketing, Registration Wizard, Controller, and School App
const RootApp: React.FC = () => {
  const { portalMode } = useSaaS();

  switch (portalMode) {
    case 'marketing':
      return <MarketingLandingView />;
    case 'register':
      return <SchoolRegistrationView />;
    case 'controller':
      return <SaaSControllerView />;
    case 'app':
    default:
      return <MainLayout />;
  }
};

export default function App() {
  return (
    <ToastProvider>
      <TenantAuthProvider>
        <SaaSProvider>
          <RootApp />
        </SaaSProvider>
      </TenantAuthProvider>
    </ToastProvider>
  );
}
