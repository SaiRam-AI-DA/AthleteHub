import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { coachAssignmentApi } from '../../api/coachAssignmentApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function CoachAssignmentDashboard() {
  const navigate = useNavigate();

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['coachAssignmentStats'],
    queryFn: coachAssignmentApi.getDashboardStats
  });

  if (isLoading) return <LoadingSpinner text="Loading stats..." />;
  if (error) return <div className="text-destructive p-4">{error.response?.data?.message || error.message || 'Failed to fetch dashboard stats'}</div>;
  
  const stats = response?.data;
  if (!stats) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-h2">Assignments Dashboard</h1>
        <button onClick={() => navigate('/dashboard/coach-assignments')} className="btn btn-outline">
          Back to List
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card text-center p-6 border-t-2 border-t-blue-500">
          <div className="text-4xl font-bold text-foreground mb-2">{stats.totalAssignments || 0}</div>
          <div className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Total Assignments</div>
        </div>
        <div className="card text-center p-6 border-t-2 border-t-green-500">
          <div className="text-4xl font-bold text-primary mb-2">{stats.activeAssignments || 0}</div>
          <div className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Active</div>
        </div>
        <div className="card text-center p-6 border-t-2 border-t-purple-500">
          <div className="text-4xl font-bold text-foreground mb-2">{stats.completedAssignments || 0}</div>
          <div className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Completed</div>
        </div>
        <div className="card text-center p-6 border-t-2 border-t-red-500">
          <div className="text-4xl font-bold text-foreground mb-2">{stats.cancelledAssignments || 0}</div>
          <div className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Cancelled</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center p-6 bg-primary/5">
          <div className="text-3xl font-bold text-foreground mb-2">{stats.unassignedAthletes || 0}</div>
          <div className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Unassigned Athletes</div>
        </div>
        <div className="card text-center p-6 bg-red-500/5">
          <div className="text-3xl font-bold text-foreground mb-2">{stats.coachesWithoutAthletes || 0}</div>
          <div className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Coaches w/o Athletes</div>
        </div>
        <div className="card text-center p-6">
          <div className="text-3xl font-bold text-foreground mb-2">{stats.averageAthletesPerCoach ? stats.averageAthletesPerCoach.toFixed(1) : 0}</div>
          <div className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Avg Athletes/Coach</div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold mb-4">Recently Created Assignments</h2>
        {stats.recentAssignments && stats.recentAssignments.length > 0 ? (
          <div className="flex flex-col gap-3">
            {stats.recentAssignments.map(assignment => (
              <div key={assignment.id} className="flex justify-between items-center bg-card/5 p-4 rounded-lg hover:bg-card/10 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/coach-assignments/${assignment.id}`)}>
                <div>
                  <div className="font-medium text-foreground mb-1">
                    {assignment.coachName || 'N/A'} <span className="text-gray-500 text-sm mx-2">→</span> {assignment.athleteName || 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground flex gap-4">
                    <span>Code: {assignment.assignmentCode || 'N/A'}</span>
                    <span>Org: {assignment.organizationName || 'N/A'}</span>
                  </div>
                </div>
                <div className="text-xs font-bold px-2 py-1 rounded bg-primary/10 text-primary">
                   {assignment.status || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">No recent assignments found</div>
        )}
      </div>
    </div>
  );
}
