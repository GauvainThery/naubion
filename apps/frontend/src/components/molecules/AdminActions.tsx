import React from 'react';
import { cn } from '../../utils/classnames';
import Button from '../atoms/Button';

type JobAction = {
  id: string;
  label: string;
  description: string;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: string;
  dangerous?: boolean;
};

type AdminActionsProps = {
  actions: JobAction[];
  onAction: (actionId: string) => Promise<void>;
  loadingStates: Record<string, boolean>;
  className?: string;
};

const AdminActions: React.FC<AdminActionsProps> = ({
  actions,
  onAction,
  loadingStates,
  className = ''
}) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {actions.map(action => (
        <div
          key={action.id}
          className={cn(
            'p-6 border-2 rounded-xl transition-all duration-200 hover:shadow-md border-primary-200/50 bg-primary-50/30 hover:border-primary-300/60 flex flex-col justify-between h-[234px]'
          )}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              {action.icon && <span className="text-2xl">{action.icon}</span>}
              <h3 className="font-semibold text-text-dark">{action.label}</h3>
            </div>
            <p className="text-sm text-text-secondary">{action.description}</p>
          </div>
          <Button
            onClick={() => onAction(action.id)}
            loading={loadingStates[action.id]}
            disabled={loadingStates[action.id]}
            className={cn('w-full')}
          >
            {loadingStates[action.id] ? 'Processing...' : action.label}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default AdminActions;
