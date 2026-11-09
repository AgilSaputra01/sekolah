import React from 'react';
import { Inbox, FileQuestion } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Tidak Ada Data',
  description = 'Belum ada data yang tersedia pada tabel ini.',
  icon,
  actionText,
  onAction,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {icon || <Inbox size={32} />}
      </div>
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-desc">{description}</div>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export const LoadingSkeleton: React.FC<{ rows?: number; height?: string }> = ({
  rows = 4,
  height = '40px',
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height, width: '100%' }} />
      ))}
    </div>
  );
};
