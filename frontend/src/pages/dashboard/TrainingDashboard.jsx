import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Activity, Calendar, Users, Target, CheckCircle, CalendarDays, ArrowUpRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { ChartSkeleton } from '../../components/ui/skeleton-loaders';
import TrainingNav from '../../components/training/TrainingNav';

export default function TrainingDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/training-dashboard/stats');
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch training stats');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 page-enter max-w-7xl mx-auto">
      {/* 1. Module Header & Subtitle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Training Center</h1>
          <p className="text-muted-foreground mt-2 text-lg">Plan, organise, monitor and evaluate all athlete training activities.</p>
        </div>
        
        {/* Context-Aware Actions for Overview */}
        <div className="flex gap-3">
           <Button variant="outline" className="shadow-sm" asChild>
             <Link to="/dashboard/training/calendar">
               <CalendarDays className="mr-2 h-4 w-4" /> View Calendar
             </Link>
           </Button>
           <Button className="shadow-sm" asChild>
             <Link to="/dashboard/training-plans/new">
               Create Plan
             </Link>
           </Button>
        </div>
      </div>

      {/* 2. Premium Segmented Navigation */}
      <TrainingNav />

      {/* 3. Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* 4. Context-Aware Statistics (Overview) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <ChartSkeleton className="h-32" /><ChartSkeleton className="h-32" /><ChartSkeleton className="h-32" /><ChartSkeleton className="h-32" />
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-premium border-border/50 group overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <ArrowUpRight className="h-16 w-16 text-primary" />
              </div>
              <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0 z-10 group-hover:scale-110 transition-transform">
                <Activity size={24} />
              </div>
              <div className="z-10">
                <p className="text-muted-foreground text-sm font-medium">Active Plans</p>
                <p className="text-3xl font-bold mt-1 tracking-tight">{stats.active_plans || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-premium border-border/50 group overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Calendar className="h-16 w-16 text-blue-500" />
              </div>
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 shrink-0 z-10 group-hover:scale-110 transition-transform">
                <Calendar size={24} />
              </div>
              <div className="z-10">
                <p className="text-muted-foreground text-sm font-medium">Today's Sessions</p>
                <p className="text-3xl font-bold mt-1 tracking-tight">{stats.upcoming_sessions || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium border-border/50 group overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <CheckCircle className="h-16 w-16 text-emerald-500" />
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 z-10 group-hover:scale-110 transition-transform">
                <CheckCircle size={24} />
              </div>
              <div className="z-10">
                <p className="text-muted-foreground text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold mt-1 tracking-tight">{stats.completed_sessions || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium border-border/50 group overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Users className="h-16 w-16 text-purple-500" />
              </div>
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 shrink-0 z-10 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <div className="z-10">
                <p className="text-muted-foreground text-sm font-medium">Attendance Rate</p>
                <p className="text-3xl font-bold mt-1 tracking-tight">{stats.avg_attendance_rate || 0}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


