import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/classnames';
import StatCard from '../atoms/StatCard';

type CacheStatsProps = {
  stats: {
    totalAnalyses: number;
    uniqueUrls: number;
    ttlHours: number;
    enabled: boolean;
    oldestAnalysis?: string;
    newestAnalysis?: string;
  };
  loading?: boolean;
  className?: string;
};

const CacheStats: React.FC<CacheStatsProps> = ({ stats, loading = false, className = '' }) => {
  const { t } = useTranslation('admin');

  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-32 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      <StatCard
        label={t('stats.totalAnalyses')}
        value={stats.totalAnalyses}
        icon="🌿"
        variant="default"
      />
      <StatCard
        label={t('stats.uniqueUrls')}
        value={stats.uniqueUrls}
        icon="🔗"
        variant="default"
      />
      <StatCard label={t('stats.ttlHours')} value={stats.ttlHours} icon="⏱️" variant="default" />
      <StatCard
        label={t('stats.cacheStatus')}
        value={stats.enabled ? t('stats.enabled') : t('stats.disabled')}
        icon={stats.enabled ? '🟢' : '🔴'}
        variant={stats.enabled ? 'success' : 'danger'}
      />
    </div>
  );
};

export default CacheStats;
