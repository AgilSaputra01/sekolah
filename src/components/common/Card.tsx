import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon,
  action,
  footer,
  className = '',
  noPadding = false,
}) => {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div className="card-header">
          <div className="card-title">
            {icon && <span className="card-icon">{icon}</span>}
            <div>
              {title}
              {subtitle && <div className="card-subtitle">{subtitle}</div>}
            </div>
          </div>
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'card-body'}>{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number | string;
  trend?: string;
  icon: React.ReactNode;
  color?: 'indigo' | 'emerald' | 'amber' | 'sky' | 'purple' | 'rose';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  icon,
  color = 'indigo',
  onClick,
}) => {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {trend && <span className="stat-trend">{trend}</span>}
      </div>
      <div className={`stat-icon stat-icon-${color}`}>{icon}</div>
    </div>
  );
};
