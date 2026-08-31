import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle } from 'lucide-react';
import KPIWidget from '@/components/dashboard/widgets/KPIWidget';
import QuickActionsWidget from '@/components/dashboard/widgets/QuickActionsWidget';
import { ChartSkeleton } from '@/components/ui/skeleton-loaders';
import api from '@/api/axios';
import { DASHBOARD_CONFIG } from '@/config/dashboard.config';
import { usePermissions } from '@/hooks/usePermissions';
import { ROLES } from '@/lib/permissions';
import RecentTrainingWidget from '@/components/dashboard/widgets/RecentTrainingWidget';
import RecentAthletesWidget from '@/components/dashboard/widgets/RecentAthletesWidget';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function CoachDashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [highRiskAthletes, setHighRiskAthletes] = useState([]);
  const { can } = usePermissions();

  const config = DASHBOARD_CONFIG[ROLES.COACH];

  useEffect(() => {
    const fetchCoachStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
        
        // Mocking ACWR data fetch for the demo based on the athletes this coach manages
        // In a real app, this would hit /wellness/coach/{coachId}/acwr-risk
        setHighRiskAthletes([
          { id: 101, name: "Marcus Johnson", acwr: 1.6, status: "Danger Zone" },
          { id: 102, name: "Sarah Williams", acwr: 1.52, status: "High Risk" }
        ]);
      } catch (error) {
        console.error("Failed to fetch coach dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoachStats();
  }, []);

  const visibleActions = config.quickActions.filter(action => !action.requirePermission || can(action.requirePermission));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={itemVariants} className="mb-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-gradient-primary">{config.title}</h1>
        <p className="text-muted-foreground mt-2 text-lg font-medium">{config.description}</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ChartSkeleton className="h-32 rounded-2xl" /><ChartSkeleton className="h-32 rounded-2xl" /><ChartSkeleton className="h-32 rounded-2xl" /><ChartSkeleton className="h-32 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {config.kpis.map(kpi => (
            <motion.div key={kpi.id} variants={itemVariants} className="h-full">
              <KPIWidget 
                title={kpi.label} 
                value={stats ? `${stats[kpi.id] || 0}${kpi.suffix || ''}` : (kpi.suffix ? `0${kpi.suffix}` : '0')} 
                icon={kpi.icon} 
                color={kpi.color} 
                className="h-full rounded-2xl"
              />
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <div className="card-premium rounded-3xl overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-border/50 flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center"><AlertTriangle className="text-red-500 mr-2 w-5 h-5"/> ACWR Injury Risk</h3>
                <span className="bg-red-500/20 text-red-500 text-xs font-bold px-2 py-1 rounded-full">{highRiskAthletes.length} At Risk</span>
              </div>
              <div className="p-6 flex-1 overflow-auto custom-scrollbar space-y-3">
                {highRiskAthletes.map(athlete => (
                  <div key={athlete.id} className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{athlete.name}</p>
                      <p className="text-xs text-red-400">{athlete.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-red-500">{athlete.acwr}</p>
                      <p className="text-[10px] uppercase text-muted-foreground tracking-wider">ACWR Ratio</p>
                    </div>
                  </div>
                ))}
                {highRiskAthletes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">All athletes are in the optimal load zone.</p>
                )}
              </div>
            </div>
            <div className="card-premium rounded-3xl overflow-hidden h-full">
              <RecentAthletesWidget organizationId={user?.organizationId} />
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="card-premium rounded-3xl overflow-hidden h-full">
            <QuickActionsWidget actions={visibleActions} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
