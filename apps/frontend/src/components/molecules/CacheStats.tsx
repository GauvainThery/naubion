import React from 'react';
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
      <StatCard label="Total Analyses" value={stats.totalAnalyses} icon="🌿" variant="default" />
      <StatCard label="Unique URLs" value={stats.uniqueUrls} icon="🔗" variant="default" />
      <StatCard label="TTL (Hours)" value={stats.ttlHours} icon="⏱️" variant="default" />
      <StatCard
        label="Cache Status"
        value={stats.enabled ? 'Enabled' : 'Disabled'}
        icon={stats.enabled ? '🟢' : '🔴'}
        variant={stats.enabled ? 'success' : 'danger'}
      />
    </div>
  );
};

export default CacheStats;
