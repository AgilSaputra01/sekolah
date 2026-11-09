import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  Users,
  Building2,
  Layers,
  Settings,
  ShieldCheck,
  Globe,
  SlidersHorizontal,
  Plus,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useTenantAuth } from '../../context/TenantAuthContext';
import { useSaaS } from '../../context/SaaSContext';
import { useToast } from '../../context/ToastContext';
import { ActiveNavPage } from '../layout/Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigatePage: (page: ActiveNavPage) => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Navigasi' | 'Portal' | 'Tenant' | 'Aksi';
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigatePage,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { schools, switchSchool, isSuperAdmin, resetAllData } = useTenantAuth();
  const { setPortalMode } = useSaaS();
  const { success } = useToast();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Commands pool
  const commands: CommandItem[] = [
    // Navigasi
    {
      id: 'nav-dashboard',
      title: 'Buka Dashboard Utama',
      subtitle: 'Overview statistik sekolah & ringkasan',
      category: 'Navigasi',
      icon: <LayoutDashboard size={18} />,
      action: () => {
        setPortalMode('app');
        onNavigatePage('dashboard');
        onClose();
      },
    },
    {
      id: 'nav-students',
      title: 'Manajemen Data Siswa',
      subtitle: 'Profil siswa, NISN, biodata & rombel',
      category: 'Navigasi',
      icon: <GraduationCap size={18} />,
      action: () => {
        setPortalMode('app');
        onNavigatePage('students');
        onClose();
      },
    },
    {
      id: 'nav-teachers',
      title: 'Daftar Tenaga Pendidik (Guru)',
      subtitle: 'Data guru, NIP, & mata pelajaran',
      category: 'Navigasi',
      icon: <Briefcase size={18} />,
      action: () => {
        setPortalMode('app');
        onNavigatePage('teachers');
        onClose();
      },
    },
    {
      id: 'nav-staff',
      title: 'Daftar Tenaga Kependidikan (Staff TU)',
      subtitle: 'Tata usaha, staf IT, & administrasi',
      category: 'Navigasi',
      icon: <Users size={18} />,
      action: () => {
        setPortalMode('app');
        onNavigatePage('staff');
        onClose();
      },
    },
    {
      id: 'nav-academic',
      title: 'Struktur Akademik & Rombel',
      subtitle: 'Jenjang, tingkat kelas, & wali kelas',
      category: 'Navigasi',
      icon: <Layers size={18} />,
      action: () => {
        setPortalMode('app');
        onNavigatePage('rombels');
        onClose();
      },
    },
    {
      id: 'nav-roles',
      title: 'Role & Matriks Hak Akses (RBAC)',
      subtitle: 'Konfigurasi 7 role wewenang modul',
      category: 'Navigasi',
      icon: <ShieldCheck size={18} />,
      action: () => {
        setPortalMode('app');
        onNavigatePage('roles');
        onClose();
      },
    },
    {
      id: 'nav-settings',
      title: 'Pengaturan Sistem Sekolah',
      subtitle: 'Profil sekolah, logo, & konfigurasi',
      category: 'Navigasi',
      icon: <Settings size={18} />,
      action: () => {
        setPortalMode('app');
        onNavigatePage('settings');
        onClose();
      },
    },

    // Portals
    {
      id: 'portal-marketing',
      title: 'Buka Website Publik EduCore',
      subtitle: 'Halaman landing page, fitur, & harga produk',
      category: 'Portal',
      icon: <Globe size={18} />,
      action: () => {
        setPortalMode('marketing');
        onClose();
      },
    },
    {
      id: 'portal-register',
      title: 'Daftarkan Sekolah Baru',
      subtitle: 'Wizard registrasi sekolah multi-step 5 tahap',
      category: 'Portal',
      icon: <Plus size={18} />,
      action: () => {
        setPortalMode('register');
        onClose();
      },
    },
    ...(isSuperAdmin
      ? [
          {
            id: 'portal-controller',
            title: 'SaaS Controller Super Admin',
            subtitle: 'Pusat kendali seluruh tenant & langganan',
            category: 'Portal' as const,
            icon: <SlidersHorizontal size={18} />,
            action: () => {
              setPortalMode('controller');
              onClose();
            },
          },
        ]
      : []),

    // Tenant Switchers
    ...schools.map((sch) => ({
      id: `tenant-${sch.id}`,
      title: `Beralih ke: ${sch.name}`,
      subtitle: `Tenant ID: ${sch.id} • ${sch.level} • Subdomain: ${sch.subdomain || 'sekolah'}.educore.id`,
      category: 'Tenant' as const,
      icon: <Building2 size={18} />,
      action: () => {
        switchSchool(sch.id);
        setPortalMode('app');
        success('Tenant Beralih', `Sekarang mengelola: ${sch.name}`);
        onClose();
      },
    })),

    // Aksi Cepat
    {
      id: 'action-reset',
      title: 'Reset Seluruh Data Demo',
      subtitle: 'Kembalikan data sekolah & siswa ke seed awal',
      category: 'Aksi',
      icon: <RotateCcw size={18} />,
      action: () => {
        resetAllData();
        success('Data Direset', 'Semua data dikembalikan ke default seed.');
        onClose();
      },
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="command-palette-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="command-palette-dialog"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="command-search-header">
          <Search size={18} style={{ color: 'var(--color-primary)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari menu, siswa, portal, atau ganti tenant sekolah... (Gunakan panah ↑↓ & Enter)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <button className="command-close-btn" onClick={onClose} title="Tutup (Esc)">
            <span className="kbd-pill">ESC</span>
          </button>
        </div>

        <div className="command-list-container">
          {filteredCommands.length === 0 ? (
            <div className="command-empty-state">
              <Sparkles size={24} style={{ color: 'var(--text-muted)' }} />
              <p>Tidak ada hasil untuk "{query}". Coba kata kunci lain.</p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  className={`command-item ${isSelected ? 'selected' : ''}`}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="command-icon-box">{cmd.icon}</div>
                  <div className="command-info-box">
                    <div className="command-title-row">
                      <span className="cmd-title">{cmd.title}</span>
                      <span className="cmd-badge">{cmd.category}</span>
                    </div>
                    {cmd.subtitle && <span className="cmd-subtitle">{cmd.subtitle}</span>}
                  </div>
                  {isSelected && <ArrowRight size={14} className="cmd-enter-arrow" />}
                </div>
              );
            })
          )}
        </div>

        <div className="command-footer-hints">
          <span>
            Gunakan <span className="kbd-mini">↑</span> <span className="kbd-mini">↓</span> untuk navigasi
          </span>
          <span>
            Tekan <span className="kbd-mini">Enter</span> untuk memilih
          </span>
          <span>
            Tekan <span className="kbd-mini">Esc</span> untuk menutup
          </span>
        </div>
      </div>
    </div>
  );
};
