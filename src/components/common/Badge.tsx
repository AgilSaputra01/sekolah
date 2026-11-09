import React from 'react';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'neutral'
  | 'primary';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  withDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  withDot = true,
  className = '',
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {withDot && <span className="badge-dot" />}
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'Aktif':
      return <Badge variant="success">{status}</Badge>;
    case 'Trial':
      return <Badge variant="warning">{status}</Badge>;
    case 'Nonaktif':
      return <Badge variant="neutral">{status}</Badge>;
    case 'Suspended':
      return <Badge variant="danger">{status}</Badge>;
    case 'Lulus':
      return <Badge variant="info">{status}</Badge>;
    case 'Pindah':
      return <Badge variant="purple">{status}</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

export const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  switch (role) {
    case 'Super Admin':
      return <Badge variant="purple">{role}</Badge>;
    case 'Admin Sekolah':
      return <Badge variant="info">{role}</Badge>;
    case 'Kepala Sekolah':
      return <Badge variant="warning">{role}</Badge>;
    case 'Guru':
      return <Badge variant="success">{role}</Badge>;
    case 'Staff':
      return <Badge variant="neutral">{role}</Badge>;
    case 'Siswa':
      return <Badge variant="info">{role}</Badge>;
    case 'Orang Tua/Wali':
      return <Badge variant="purple">{role}</Badge>;
    default:
      return <Badge variant="neutral">{role}</Badge>;
  }
};
