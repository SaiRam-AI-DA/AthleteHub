import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { coachApi } from '../../api/coachApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, UserX, Clock, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function CoachDashboard() {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['coachDashboardStats'],
    queryFn: () => coachApi.getDashboardStats(),
  });

  if (isLoading) return <LoadingSpinner text="Loading stats..." />;

  if (error || !data) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl mb-6">
        {error?.message || 'Failed to fetch dashboard stats'}
      </div>
    );
  }

  const stats = data.data;

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Coach Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Overview of coach statistics.</p>
        </div>
        <Button
          variant="outline"
          className="h-9 bg-transparent border-white/10 hover:bg-white/5"
          onClick={() => navigate('/dashboard/coaches')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-premium border border-white/10 bg-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium uppercase tracking-wider text-white/50">Total Coaches</div>
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="text-4xl font-bold text-white/90">{stats.totalCoaches}</div>
          </CardContent>
        </Card>

        <Card className="card-premium border border-white/10 bg-transparent border-t-2 border-t-green-500/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium uppercase tracking-wider text-white/50">Active Coaches</div>
              <UserCheck className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-4xl font-bold text-white/90">{stats.activeCoaches}</div>
          </CardContent>
        </Card>

        <Card className="card-premium border border-white/10 bg-transparent border-t-2 border-t-red-500/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium uppercase tracking-wider text-white/50">Inactive Coaches</div>
              <UserX className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-4xl font-bold text-white/90">{stats.inactiveCoaches}</div>
          </CardContent>
        </Card>

        <Card className="card-premium border border-white/10 bg-transparent border-t-2 border-t-purple-500/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium uppercase tracking-wider text-white/50">Avg Experience</div>
              <Clock className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-4xl font-bold text-white/90">
              {stats.averageExperience ? stats.averageExperience.toFixed(1) : 0} <span className="text-lg text-white/50 font-normal">yrs</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-premium border border-white/10 bg-transparent">
          <CardHeader>
            <CardTitle className="text-lg text-white/90">Coaches by Specialization</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.coachesBySpecialization && stats.coachesBySpecialization.length > 0 ? (
              <div className="space-y-4">
                {stats.coachesBySpecialization.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-white/10 pb-3 last:border-0 last:pb-0">
                    <span className="text-sm text-white/70">{item.specialization || 'Unspecified'}</span>
                    <span className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-full text-xs">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-white/50 text-sm py-4 text-center">No specialization data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="card-premium border border-white/10 bg-transparent">
          <CardHeader>
            <CardTitle className="text-lg text-white/90">Recently Added</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentlyAdded && stats.recentlyAdded.length > 0 ? (
              <div className="space-y-3">
                {stats.recentlyAdded.map(coach => (
                  <div
                    key={coach.id}
                    className="flex justify-between items-center bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/10"
                    onClick={() => navigate(`/dashboard/coaches/${coach.id}`)}
                  >
                    <div>
                      <div className="font-medium text-white/90">{coach.firstName} {coach.lastName}</div>
                      <div className="text-xs text-white/50 mt-1 font-mono">{coach.coachCode}</div>
                    </div>
                    <div className="text-xs text-white/40">
                      {new Date(coach.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-white/50 text-sm py-4 text-center">No recent coaches</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
