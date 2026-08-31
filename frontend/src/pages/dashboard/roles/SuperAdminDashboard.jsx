import React, { useEffect, useState } from 'react';
import { Server } from 'lucide-react';
import KPIWidget from '@/components/dashboard/widgets/KPIWidget';
import QuickActionsWidget from '@/components/dashboard/widgets/QuickActionsWidget';
import { ChartSkeleton } from '@/components/ui/skeleton-loaders';
import api from '@/api/axios';
import { DASHBOARD_CONFIG } from '@/config/dashboard.config';
import { usePermissions } from '@/hooks/usePermissions';
import { ROLES } from '@/lib/permissions';
import RecentOrganizationsWidget from '@/components/dashboard/widgets/RecentOrganizationsWidget';
import RecentEventsWidget from '@/components/dashboard/widgets/RecentEventsWidget';

export default function SuperAdminDashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const { can } = usePermissions();

  const config = DASHBOARD_CONFIG[ROLES.SUPER_ADMIN];

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch global dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalStats();
  }, []);

  const visibleActions = config.quickActions.filter(action => !action.requirePermission || can(action.requirePermission));

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{config.title}</h1>
        <p className="text-muted-foreground mt-2">{config.description}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ChartSkeleton className="h-32" /><ChartSkeleton className="h-32" /><ChartSkeleton className="h-32" /><ChartSkeleton className="h-32" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {config.kpis.map(kpi => (
            <KPIWidget 
              key={kpi.id}
              title={kpi.label} 
              value={stats ? `${stats[kpi.id] || 0}${kpi.suffix || ''}` : (kpi.suffix ? `0${kpi.suffix}` : '0')} 
              icon={kpi.icon} 
              color={kpi.color} 
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentOrganizationsWidget />
            <RecentEventsWidget />
          </div>
        </div>
        <div>
          <QuickActionsWidget actions={visibleActions} />
        </div>
      </div>
    </div>
  );
}
