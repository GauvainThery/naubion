import React from 'react';
import { cn } from '../../utils/classnames';

type AdminLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={cn('min-h-screen bg-background-light', className)}>
      <div className="container mx-auto px-10 py-12 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-xl border border-primary-200/20 p-8 relative">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
