import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/classnames';
import CacheStats from '../molecules/CacheStats';
import AdminActions from '../molecules/AdminActions';
import Alert from '../atoms/Alert';
import Button from '../atoms/Button';
import { useAdminApi } from '../../hooks/useAdmin';

type CacheStatsType = {
  totalAnalyses: number;
  uniqueUrls: number;
  ttlHours: number;
  enabled: boolean;
  oldestAnalysis?: string;
  newestAnalysis?: string;
};

type AdminDashboardProps = {
  stats: CacheStatsType | null;
  onRefreshStats: () => Promise<void>;
  onLogout: () => void;
  className?: string;
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  onRefreshStats,
  onLogout,
  className = ''
}) => {
  const { t } = useTranslation('admin');
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [alert, setAlert] = useState<{
    message: string;
    variant: 'success' | 'error' | 'info';
  } | null>(null);
  const { runFullCleanup, cleanupExpired, cleanupOld } = useAdminApi();

  const showAlert = (message: string, variant: 'success' | 'error' | 'info' = 'info') => {
    setAlert({ message, variant });
    setTimeout(() => setAlert(null), 5000);
  };

  const setLoading = (actionId: string, isLoading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [actionId]: isLoading }));
  };

  const handleAction = async (actionId: string) => {
    setLoading(actionId, true);

    try {
      let result;

      switch (actionId) {
        case 'full-cleanup':
          result = await runFullCleanup();
          break;
        case 'cleanup-expired':
          result = await cleanupExpired();
          break;
        case 'cleanup-old':
          result = await cleanupOld(30);
          break;
        case 'refresh-stats':
          await onRefreshStats();
          showAlert(t('messages.statisticsRefreshed'), 'success');
          return;
        default:
          throw new Error(t('messages.unknownAction'));
      }

      showAlert(result.message || t('messages.actionCompleted'), 'success');

      // Refresh stats after successful action
      await onRefreshStats();
    } catch (error) {
      showAlert(error instanceof Error ? error.message : t('messages.actionFailed'), 'error');
    } finally {
      setLoading(actionId, false);
    }
  };

  const actions = [
    {
      id: 'full-cleanup',
      label: t('actions.fullCleanup.label'),
      description: t('actions.fullCleanup.description'),
      icon: '🌿',
      variant: 'primary' as const
    },
    {
      id: 'cleanup-expired',
      label: t('actions.expiredCleanup.label'),
      description: t('actions.expiredCleanup.description'),
      icon: '🍃',
      variant: 'secondary' as const
    },
    {
      id: 'cleanup-old',
      label: t('actions.oldCleanup.label'),
      description: t('actions.oldCleanup.description'),
      icon: '🌱',
      dangerous: true
    },
    {
      id: 'refresh-stats',
      label: t('actions.refreshStats.label'),
      description: t('actions.refreshStats.description'),
      icon: '🔄',
      variant: 'secondary' as const
    }
  ];

  return (
    <div className={cn('flex flex-col gap-8', className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">🛠️ {t('title')}</h1>
          <p className="text-text-secondary">{t('subtitle')}</p>
        </div>
        <Button onClick={onLogout} variant="secondary">
          {t('logout')}
        </Button>
      </div>

      {/* Alert */}
      {alert && (
        <Alert variant={alert.variant} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {/* Cache Statistics */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-text-dark">
          📊 {t('results.sections.cacheStatistics')}
        </h2>
        <CacheStats
          stats={
            stats || {
              totalAnalyses: 0,
              uniqueUrls: 0,
              ttlHours: 0,
              enabled: false
            }
          }
          loading={!stats}
        />
      </section>

      {/* Admin Actions */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-text-dark">⚡ {t('results.sections.actions')}</h2>
        <AdminActions actions={actions} onAction={handleAction} loadingStates={loadingStates} />
      </section>
    </div>
  );
};

export default AdminDashboard;
