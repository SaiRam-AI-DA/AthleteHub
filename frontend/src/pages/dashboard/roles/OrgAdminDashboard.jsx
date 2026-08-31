import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import KPIWidget from '@/components/dashboard/widgets/KPIWidget';
import QuickActionsWidget from '@/components/dashboard/widgets/QuickActionsWidget';
import { ChartSkeleton } from '@/components/ui/skeleton-loaders';
import api from '@/api/axios';
import { DASHBOARD_CONFIG } from '@/config/dashboard.config';
import { usePermissions } from '@/hooks/usePermissions';
import { ROLES } from '@/lib/permissions';
import RecentAthletesWidget from '@/components/dashboard/widgets/RecentAthletesWidget';
import RecentEventsWidget from '@/components/dashboard/widgets/RecentEventsWidget';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function OrgAdminDashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const { can } = usePermissions();

  const config = DASHBOARD_CONFIG[ROLES.ORG_ADMIN];

  useEffect(() => {
    const fetchOrgStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch org dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrgStats();
  }, []);

  const visibleActions = config.quickActions.filter(action => !action.requirePermission || can(action.requirePermission));

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="mb-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-gradient-primary">{config.title}</h1>
        <p className="text-muted-foreground mt-2 text-lg font-medium">{config.description}</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ChartSkeleton className="h-32 rounded-2xl" />
          <ChartSkeleton className="h-32 rounded-2xl" />
          <ChartSkeleton className="h-32 rounded-2xl" />
          <ChartSkeleton className="h-32 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {config.kpis.map((kpi, index) => (
            <motion.div key={kpi.id} variants={itemVariants} className="h-full">
              <KPIWidget 
                title={kpi.label} 
                value={stats ? `${stats[kpi.id] || 0}${kpi.suffix || ''}` : (kpi.suffix ? `0${kpi.suffix}` : '0')} 
                icon={kpi.icon} 
                color={kpi.color} 
                className="h-full card-premium rounded-2xl"
              />
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <div className="card-premium rounded-3xl overflow-hidden h-full">
              <RecentAthletesWidget organizationId={user?.organizationId} />
            </div>
            <div className="card-premium rounded-3xl overflow-hidden h-full">
              <RecentEventsWidget />
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="h-full">
          <div className="card-premium rounded-3xl overflow-hidden h-full">
            <QuickActionsWidget actions={visibleActions} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
