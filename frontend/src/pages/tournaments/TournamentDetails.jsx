import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tournamentApi } from '../../api/tournamentApi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Trophy, Activity, CalendarDays, MapPin, ArrowLeft, Edit, Shuffle } from 'lucide-react';
import { BracketViewer } from '../../components/BracketViewer';

const tournamentStatusColors = {
  'UPCOMING': 'bg-blue-100 text-blue-800 border-blue-200',
  'ACTIVE': 'bg-green-100 text-green-800 border-green-200',
  'COMPLETED': 'bg-gray-100 text-gray-800 border-gray-200',
  'Registration Open': 'bg-blue-100 text-blue-800 border-blue-200',
  'Active': 'bg-green-100 text-green-800 border-green-200',
  'Completed': 'bg-gray-100 text-gray-800 border-gray-200',
};

const matchStatusColors = {
  Scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  Live: 'bg-red-100 text-red-800 border-red-200',
  Completed: 'bg-green-100 text-green-800 border-green-200',
};

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bracketMatches, setBracketMatches] = React.useState([]);
  const [generating, setGenerating] = React.useState(false);

  const { data: tournament, isLoading, error } = useQuery({
    queryKey: ['tournament', id],
    queryFn: async () => {
      const response = await tournamentApi.getTournamentById(id);
      return response.data?.data || response.data;
    }
  });

  React.useEffect(() => {
    if (tournament) {
      tournamentApi.getBracket(id)
        .then(res => setBracketMatches(res.data?.data || res.data))
        .catch(err => console.error("Error fetching bracket:", err));
    }
  }, [tournament, id]);

  if (isLoading) return <div className="p-10 flex justify-center"><Activity className="animate-spin text-primary" /></div>;
  if (error) return <div className="p-10 text-red-500">Error: {error.message}</div>;
  if (!tournament) return <div className="p-10 text-center">Tournament not found.</div>;

  const handleGenerateBracket = async () => {
    if (window.confirm("Are you sure you want to generate the bracket? This cannot be undone.")) {
      setGenerating(true);
      try {
        const res = await tournamentApi.generateBracket(id);
        setBracketMatches(res.data);
      } catch (err) {
        alert(err.response?.data?.message || err.message);
      } finally {
        setGenerating(false);
      }
    }
  };

  const rounds = tournament.rounds || [];
  const leaderboard = tournament.leaderboard || [];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/tournaments')} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Tournament Hub</h1>
            <p className="text-muted-foreground">Manage details, matches, and view leaderboards.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to={`/dashboard/tournaments/${tournament.id}/edit`}>
            <Button variant="outline" className="h-11 rounded-xl px-6">
              <Edit className="mr-2 h-4 w-4" /> Edit Tournament
            </Button>
          </Link>
        </div>
      </div>

      {/* Tournament Header Card */}
      <Card className="card-premium rounded-xl shadow-md border-border/50">
        <CardContent className="p-10">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 shadow-inner">
              <Trophy className="h-7 w-7 text-amber-600" />
            </div>
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold tracking-tight">{tournament.name}</h2>
                <Badge variant="outline" className={`text-sm ${tournamentStatusColors[tournament.status] || ''}`}>
                  {tournament.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-border/50">
                <div className="flex items-start gap-3">
                  <Trophy className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sport ID</p>
                    <p className="font-semibold text-lg">{tournament.sportId}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dates</p>
                    <p className="font-semibold text-sm mt-1">{tournament.startDate} <br/><span className="text-muted-foreground">—</span><br/> {tournament.endDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categories</p>
                    <p className="font-semibold mt-1">{tournament.genderCategory}</p>
                    <p className="text-sm text-muted-foreground">{tournament.ageCategory || 'ANY Age'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Max Participants</p>
                  <p className="font-semibold text-lg">{tournament.maxParticipants || 'Unlimited'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2 h-12 rounded-xl mb-8 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="rounded-lg text-base">Overview</TabsTrigger>
          <TabsTrigger value="brackets" className="rounded-lg text-base">Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="card-premium rounded-xl shadow-sm border-border/50">
             <CardHeader>
                <CardTitle>Management Actions</CardTitle>
             </CardHeader>
             <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to={`/dashboard/matches/calendar?tournamentId=${tournament.id}`}>
                   <Button variant="outline" className="w-full h-14 justify-start text-left bg-muted/20 hover:bg-muted/50 border-border/50">
                      <CalendarDays className="mr-4 h-5 w-5 text-primary" />
                      <div>
                         <div className="font-semibold text-base">Match Calendar</div>
                         <div className="text-xs text-muted-foreground font-normal">View schedule in calendar format</div>
                      </div>
                   </Button>
                </Link>
                <Link to={`/dashboard/matches/timeline?tournamentId=${tournament.id}`}>
                   <Button variant="outline" className="w-full h-14 justify-start text-left bg-muted/20 hover:bg-muted/50 border-border/50">
                      <Activity className="mr-4 h-5 w-5 text-primary" />
                      <div>
                         <div className="font-semibold text-base">Match Timeline</div>
                         <div className="text-xs text-muted-foreground font-normal">View chronological match flow</div>
                      </div>
                   </Button>
                </Link>
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brackets" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Tournament Bracket</h2>
            {bracketMatches.length === 0 && (
              <Button onClick={handleGenerateBracket} disabled={generating} className="bg-primary hover:bg-primary/90">
                <Shuffle className="mr-2 h-4 w-4" />
                {generating ? 'Generating...' : 'Generate Bracket'}
              </Button>
            )}
          </div>
          <Card className="card-premium rounded-xl shadow-sm border-border/50">
             <CardContent className="p-0">
                {bracketMatches.length > 0 ? (
                  <BracketViewer matches={bracketMatches} />
                ) : (
                  <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center">
                    <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                       <Trophy className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <p className="text-xl font-bold text-foreground">No bracket generated yet</p>
                    <p className="text-sm mt-2 max-w-md">Once registrations are complete, generate the bracket to automatically build the tournament tree.</p>
                  </div>
                )}
             </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default TournamentDetails;
