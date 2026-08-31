import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Activity, Moon, Battery, BrainCircuit, X } from 'lucide-react';
import KPIWidget from '@/components/dashboard/widgets/KPIWidget';
import QuickActionsWidget from '@/components/dashboard/widgets/QuickActionsWidget';
import { ChartSkeleton } from '@/components/ui/skeleton-loaders';
import api from '@/api/axios';
import { DASHBOARD_CONFIG } from '@/config/dashboard.config';
import { usePermissions } from '@/hooks/usePermissions';
import { ROLES } from '@/lib/permissions';
import RecentTrainingWidget from '@/components/dashboard/widgets/RecentTrainingWidget';
import RecentMatchResultsWidget from '@/components/dashboard/widgets/RecentMatchResultsWidget';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function AthleteDashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showWellnessModal, setShowWellnessModal] = useState(false);
  const [wellnessData, setWellnessData] = useState({
    sleepQuality: 5, soreness: 5, stress: 5, rpe: 5, notes: ''
  });
  
  const { can } = usePermissions();
  const config = DASHBOARD_CONFIG[ROLES.ATHLETE];

  useEffect(() => {
    const fetchAthleteStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
        
        // Check if athlete needs to submit wellness for today
        if (response.data.athlete_id) {
          try {
            const today = new Date().toISOString().split('T')[0];
            await api.get(`/wellness/athletes/${response.data.athlete_id}/date/${today}`);
            // If success, they already submitted
          } catch (e) {
            // 404 means not submitted, show modal
            setShowWellnessModal(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch athlete dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAthleteStats();
  }, []);

  const submitWellness = async () => {
    if (!stats?.athlete_id) return;
    try {
      await api.post(`/wellness/athletes/${stats.athlete_id}`, {
        ...wellnessData,
        date: new Date().toISOString().split('T')[0]
      });
      toast.success("Wellness check-in completed!");
      setShowWellnessModal(false);
    } catch (error) {
      toast.error("Failed to submit wellness check-in");
    }
  };

  const visibleActions = config.quickActions.filter(action => !action.requirePermission || can(action.requirePermission));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      
      {/* Wellness Modal Overlay */}
      <AnimatePresence>
        {showWellnessModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-md rounded-3xl border border-border/50 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border/50 bg-primary/5 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-extrabold text-gradient-primary">Daily Check-in</h3>
                  <p className="text-sm text-muted-foreground">Log your wellness to help us track your ACWR.</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowWellnessModal(false)} className="rounded-full h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="flex items-center text-blue-500"><Moon className="w-4 h-4 mr-2"/> Sleep Quality</span>
                    <span>{wellnessData.sleepQuality}/10</span>
                  </div>
                  <input type="range" min="1" max="10" value={wellnessData.sleepQuality} onChange={(e) => setWellnessData({...wellnessData, sleepQuality: parseInt(e.target.value)})} className="w-full accent-blue-500" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="flex items-center text-red-500"><Activity className="w-4 h-4 mr-2"/> Muscle Soreness</span>
                    <span>{wellnessData.soreness}/10</span>
                  </div>
                  <input type="range" min="1" max="10" value={wellnessData.soreness} onChange={(e) => setWellnessData({...wellnessData, soreness: parseInt(e.target.value)})} className="w-full accent-red-500" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="flex items-center text-purple-500"><BrainCircuit className="w-4 h-4 mr-2"/> Mental Stress</span>
                    <span>{wellnessData.stress}/10</span>
                  </div>
                  <input type="range" min="1" max="10" value={wellnessData.stress} onChange={(e) => setWellnessData({...wellnessData, stress: parseInt(e.target.value)})} className="w-full accent-purple-500" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="flex items-center text-emerald-500"><Battery className="w-4 h-4 mr-2"/> Today's RPE</span>
                    <span>{wellnessData.rpe}/10</span>
                  </div>
                  <input type="range" min="1" max="10" value={wellnessData.rpe} onChange={(e) => setWellnessData({...wellnessData, rpe: parseInt(e.target.value)})} className="w-full accent-emerald-500" />
                </div>
              </div>
              
              <div className="p-6 border-t border-border/50 bg-muted/20">
                <Button onClick={submitWellness} className="w-full rounded-full h-12 text-base font-bold">
                  Submit Wellness Log
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <div className="card-premium rounded-3xl overflow-hidden h-full">
               <RecentTrainingWidget athleteId={stats?.athlete_id} />
            </div>
            <div className="card-premium rounded-3xl overflow-hidden h-full">
               <RecentMatchResultsWidget athleteId={stats?.athlete_id} />
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
