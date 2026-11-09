import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="breadcrumb-container" aria-label="Breadcrumb">
      <span className="breadcrumb-root">
        <Home size={14} />
        <span>EduCore</span>
      </span>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight size={12} className="breadcrumb-sep" />
            {isLast || !item.onClick ? (
              <span className="breadcrumb-current">{item.label}</span>
            ) : (
              <button
                onClick={item.onClick}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 'inherit',
                }}
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
