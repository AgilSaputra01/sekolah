import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  UserCheck,
  Layers,
  BookOpen,
  School as SchoolIcon,
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useTenantAuth } from '../../context/TenantAuthContext';
import { ModuleType } from '../../types';

export type ActiveNavPage =
  | 'dashboard'
  | 'schools'
  | 'academic-years'
  | 'users'
  | 'roles'
  | 'students'
  | 'teachers'
  | 'staff'
  | 'levels'
  | 'classes'
  | 'rombels'
  | 'homeroom'
  | 'settings';

interface SidebarProps {
  activePage: ActiveNavPage;
  onNavigate: (page: ActiveNavPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItemConfig {
  id: ActiveNavPage;
  label: string;
  icon: React.ReactNode;
  module?: ModuleType;
  badge?: string | number;
  superAdminOnly?: boolean;
}

interface NavSectionConfig {
  title: string;
  items: NavItemConfig[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { currentSchool, currentUser, isSuperAdmin, hasPermission, students, teachersStaff, schools, users } =
    useTenantAuth();

  const navSections: NavSectionConfig[] = [
    {
      title: 'Menu Utama',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard size={18} />,
        },
      ],
    },
    {
      title: 'School',
      items: [
        {
          id: 'schools',
          label: isSuperAdmin ? 'School List' : 'School Profile',
          icon: <Building2 size={18} />,
          module: 'School',
          badge: isSuperAdmin ? schools.length : undefined,
        },
        {
          id: 'academic-years',
          label: 'Tahun Ajaran',
          icon: <Calendar size={18} />,
          module: 'Academic Year',
        },
      ],
    },
    {
      title: 'User Management',
      items: [
        {
          id: 'users',
          label: 'Users',
          icon: <Users size={18} />,
          module: 'Users',
          badge: users.length,
        },
        {
          id: 'roles',
          label: 'Roles & Permission',
          icon: <ShieldCheck size={18} />,
          module: 'Roles',
        },
      ],
    },
    {
      title: 'People',
      items: [
        {
          id: 'students',
          label: 'Students',
          icon: <GraduationCap size={18} />,
          module: 'Students',
          badge: students.length,
        },
        {
          id: 'teachers',
          label: 'Teachers',
          icon: <Briefcase size={18} />,
          module: 'Teachers',
          badge: teachersStaff.filter((t) => t.type === 'Guru').length,
        },
        {
          id: 'staff',
          label: 'Staff',
          icon: <UserCheck size={18} />,
          module: 'Staff',
          badge: teachersStaff.filter((t) => t.type === 'Staff').length,
        },
      ],
    },
    {
      title: 'Academic Structure',
      items: [
        {
          id: 'levels',
          label: 'Levels (Jenjang)',
          icon: <SchoolIcon size={18} />,
          module: 'Levels',
        },
        {
          id: 'classes',
          label: 'Classes (Tingkat)',
          icon: <Layers size={18} />,
          module: 'Classes',
        },
        {
          id: 'rombels',
          label: 'Rombel',
          icon: <BookOpen size={18} />,
          module: 'Rombel',
        },
        {
          id: 'homeroom',
          label: 'Homeroom Teachers',
          icon: <Sparkles size={18} />,
          module: 'Homeroom Teacher',
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          id: 'settings',
          label: 'System Settings',
          icon: <Settings size={18} />,
        },
      ],
    },
  ];

  const handleItemClick = (pageId: ActiveNavPage) => {
    onNavigate(pageId);
    if (window.innerWidth <= 1024) {
      onCloseMobile();
    }
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="drawer-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${
          mobileOpen ? 'mobile-open' : ''
        }`}
      >
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={() => handleItemClick('dashboard')}>
            <div className="brand-icon">
              <SchoolIcon size={22} />
            </div>
            {!collapsed && (
              <div className="brand-text">
                <span className="brand-title">
                  EduCore <span className="brand-badge">SaaS</span>
                </span>
                <span className="brand-sub">School Platform</span>
              </div>
            )}
          </div>
          <button
            className="sidebar-toggle-btn"
            onClick={onToggleCollapse}
            style={{ display: window.innerWidth <= 1024 ? 'none' : 'flex' }}
            title={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section, idx) => {
            // Filter items based on user's module permissions
            const visibleItems = section.items.filter((item) => {
              if (item.superAdminOnly && !isSuperAdmin) return false;
              if (item.module) {
                return hasPermission(item.module, 'View');
              }
              return true;
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="nav-section">
                {!collapsed && (
                  <div className="nav-section-title">{section.title}</div>
                )}
                {visibleItems.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleItemClick(item.id)}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="nav-item-icon">{item.icon}</span>
                      {!collapsed && (
                        <>
                          <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                          {item.badge !== undefined && (
                            <span className="nav-item-badge">{item.badge}</span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="sidebar-footer">
            <div className="sidebar-tenant-badge">
              <div className="tenant-badge-avatar">
                {currentSchool?.logo ? (
                  <img src={currentSchool.logo} alt={currentSchool.name} />
                ) : (
                  (currentSchool?.name?.charAt(0) || 'E')
                )}
              </div>
              <div className="tenant-badge-info">
                <span className="tenant-badge-name">
                  {currentSchool ? currentSchool.name : 'Global Tenant Mode'}
                </span>
                <span className="tenant-badge-level">
                  {currentSchool
                    ? `${currentSchool.level} • ${currentSchool.academicYear}`
                    : 'Super Admin Multi-Tenant'}
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
