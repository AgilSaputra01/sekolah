import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CreditCard,
  Trash2,
  Sparkles,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'billing' | 'academic' | 'security' | 'system';
  isRead: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'SPP Online Terverifikasi Otomatis',
    message: 'Pembayaran tagihan SPP Rp 450.000 atas nama Ahmad Faiz Pratama (10-MIPA-1) telah lunas via BCA Virtual Account.',
    timestamp: '5 menit yang lalu',
    type: 'billing',
    isRead: false,
  },
  {
    id: 'notif-2',
    title: 'Pendaftaran Siswa Baru Berhasil',
    message: 'Data siswa Bunga Putri Cahyani (NISN: 00781924) telah diaktifkan di Rombel 10-MIPA-1.',
    timestamp: '1 jam yang lalu',
    type: 'academic',
    isRead: false,
  },
  {
    id: 'notif-3',
    title: 'Masa Aktif Lisensi Segera Berakhir',
    message: 'Langganan paket Basic untuk SMP Bintang Kejora tersisa 5 hari. Segera lakukan perpanjangan.',
    timestamp: '3 jam yang lalu',
    type: 'system',
    isRead: false,
  },
  {
    id: 'notif-4',
    title: 'Sertifikat SSL Domain Aktif',
    message: 'Subdomain sman1jkt.educore.id telah terenkripsi penuh dengan sertifikat SSL Let\'s Encrypt 256-bit.',
    timestamp: '1 hari yang lalu',
    type: 'security',
    isRead: true,
  },
];

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  if (!isOpen) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'billing':
        return <CreditCard size={16} color="#059669" />;
      case 'academic':
        return <CheckCircle2 size={16} color="#4f46e5" />;
      case 'system':
        return <AlertTriangle size={16} color="#d97706" />;
      case 'security':
        return <ShieldCheck size={16} color="#2563eb" />;
    }
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="notification-drawer animate-slide-left">
        <div className="notif-drawer-header">
          <div className="notif-header-title">
            <Bell size={18} style={{ color: 'var(--color-primary)' }} />
            <h3>Pusat Notifikasi</h3>
            {unreadCount > 0 && <span className="notif-badge-pill">{unreadCount} baru</span>}
          </div>
          <button className="notif-close-btn" onClick={onClose} title="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="notif-drawer-actions">
          <button
            className="notif-action-link"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Tandai Semua Dibaca
          </button>
          <button
            className="notif-action-link text-danger"
            onClick={clearAll}
            disabled={notifications.length === 0}
          >
            Hapus Riwayat
          </button>
        </div>

        <div className="notif-list-body">
          {notifications.length === 0 ? (
            <div className="notif-empty-box">
              <Sparkles size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <h4>Tidak Ada Notifikasi Baru</h4>
              <p>Semua aktivitas sistem, pembayaran, dan akademik berjalan lancar.</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`notif-card-item ${!item.isRead ? 'unread' : ''}`}
                onClick={() => {
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
                  );
                }}
              >
                <div className="notif-icon-wrap">{getIcon(item.type)}</div>
                <div className="notif-content-wrap">
                  <div className="notif-item-header">
                    <span className="notif-item-title">{item.title}</span>
                    <span className="notif-time-ago">{item.timestamp}</span>
                  </div>
                  <p className="notif-item-msg">{item.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
};

