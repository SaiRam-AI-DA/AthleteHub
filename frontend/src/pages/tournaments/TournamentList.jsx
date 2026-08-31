import React from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tournamentApi } from '../../api/tournamentApi';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Trophy, CalendarDays, MapPin, Activity, Plus, Flag } from 'lucide-react';
import { CardSkeleton } from '../../components/ui/skeleton-loaders';
import EmptyState from '../../components/ui/EmptyState';

const tournamentStatusColors = {
  'Registration Open': 'bg-blue-100 text-blue-800 border-blue-200',
  Active: 'bg-green-100 text-green-800 border-green-200',
  Completed: 'bg-gray-100 text-gray-800 border-gray-200',
  UPCOMING: 'bg-blue-100 text-blue-800 border-blue-200',
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
};

const TournamentList = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventId = searchParams.get('eventId');

  const { data, isLoading, error } = useQuery({
    queryKey: ['tournaments', eventId],
    queryFn: async () => {
      const params = eventId ? { eventId } : {};
      const response = await tournamentApi.getTournaments(params);
      return response.data?.data?.items || response.data?.items || [];
    }
  });

  if (error) return <div className="p-10 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-6 md:p-10 space-y-10 page-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tournaments</h1>
          <p className="text-muted-foreground mt-2">Manage and view all your active brackets and events.</p>
        </div>
        <Link to="/dashboard/tournaments/new">
          <Button className="rounded-xl px-6 h-11 shadow-md">
            <Plus className="mr-2 h-4 w-4" /> Create Tournament
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </>
        ) : data.length === 0 ? (
          <div className="col-span-full">
            <EmptyState 
              icon={Flag}
              title="No tournaments found" 
              description="Get started by creating a new tournament."
              actionLabel="Create Tournament"
              onAction={() => navigate('/dashboard/tournaments/new')}
            />
          </div>
        ) : (
          data.map((tournament) => (
            <Card key={tournament.id} className="card-premium rounded-xl hover:shadow-lg transition-all overflow-hidden border-border/50 group">
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 group-hover:scale-110 transition-transform">
                      <Trophy className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="outline" className={`text-xs font-semibold ${tournamentStatusColors[tournament.status] || ''}`}>
                      {tournament.status}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold truncate" title={tournament.name}>{tournament.name}</h3>
                    <p className="text-sm font-medium text-muted-foreground mt-1">Code: {tournament.tournamentCode}</p>
                  </div>

                  <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-3 text-sm">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span>{tournament.startDate} — {tournament.endDate}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Sport ID: {tournament.sportId}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 p-4 border-t border-border/50 flex justify-between items-center gap-3">
                   <Link to={`/dashboard/tournaments/${tournament.id}`} className="w-full">
                      <Button variant="default" size="sm" className="w-full rounded-lg">
                         View Details
                      </Button>
                   </Link>
                   <Link to={`/dashboard/tournaments/${tournament.id}/edit`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full rounded-lg">
                         Edit
                      </Button>
                   </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TournamentList;
