import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { matchApi } from '../../api/matchApi';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  ArrowLeft,
  Trophy,
  MapPin,
  CalendarDays,
  Activity,
  Clock,
  Loader2
} from 'lucide-react';

const statusColors = {
  LIVE: 'bg-red-100 text-red-800 border-red-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
};

const eventIconColors = {
  Score: 'bg-green-100 text-green-600 border-green-200',
  Foul: 'bg-red-100 text-red-600 border-red-200',
  Timeout: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  Substitution: 'bg-blue-100 text-blue-600 border-blue-200',
  Penalty: 'bg-orange-100 text-orange-600 border-orange-200',
  Start: 'bg-gray-100 text-gray-600 border-gray-200',
  End: 'bg-gray-100 text-gray-600 border-gray-200',
  Default: 'bg-gray-100 text-gray-600 border-gray-200'
};

const MatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: matchData, isLoading: matchLoading, error: matchError } = useQuery({
    queryKey: ['match', id],
    queryFn: async () => {
      const response = await matchApi.getMatchById(id);
      return response.data?.data || response.data;
    },
    enabled: !!id
  });

  const { data: resultsData, isLoading: resultsLoading } = useQuery({
    queryKey: ['matchResults', id],
    queryFn: async () => {
      const response = await matchApi.getMatchResults(id);
      return response.data?.data || response.data || [];
    },
    enabled: !!id
  });

  if (matchLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (matchError || !matchData) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-red-500">
        <p>Error loading match details.</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  const match = matchData;
  const status = match.status?.toUpperCase() || 'SCHEDULED';
  const isLive = status === 'LIVE';
  const isCompleted = status === 'COMPLETED';
  const results = resultsData || [];

  return (
    <div className="p-6 space-y-10 max-w-7xl mx-auto">
      {/* Back button + Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" className="h-11 rounded-xl px-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Match Details</h1>
          <p className="text-muted-foreground">{match.tournamentName || 'N/A'} — {match.sportName || 'N/A'}</p>
        </div>
      </div>

      {/* Match Score Card */}
      <Card className={`card-premium rounded-xl ${isLive ? 'border-red-200 bg-red-50/50' : ''}`}>
        <CardContent className="p-10">
          <div className="flex items-center justify-center mb-6">
            <Badge variant="outline" className={`text-sm ${statusColors[status] || statusColors['SCHEDULED']}`}>
              {isLive && <Activity className="h-3.5 w-3.5 mr-1 animate-pulse" />}
              {status}
            </Badge>
          </div>
          <div className="text-center space-y-6">
            <div className="grid grid-cols-3 items-center gap-8">
              <div className="text-right space-y-2">
                <p className="font-bold text-2xl">{match.participantOneName || 'TBD'}</p>
                {match.winnerId === match.participantOneId && isCompleted && (
                  <Badge className="bg-green-600 text-white border-green-700">Winner</Badge>
                )}
              </div>
              <div className="flex items-center justify-center gap-6">
                <span className="text-5xl font-bold">N/A</span>
                <span className="text-muted-foreground text-2xl">—</span>
                <span className="text-5xl font-bold">N/A</span>
              </div>
              <div className="text-left space-y-2">
                <p className="font-bold text-2xl">{match.participantTwoName || 'TBD'}</p>
                {match.winnerId === match.participantTwoId && isCompleted && (
                  <Badge className="bg-green-600 text-white border-green-700">Winner</Badge>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-8 mt-6">
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {match.venue || 'TBA'}</span>
              <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {match.matchDate ? `${match.matchDate} ${match.startTime || ''}` : 'TBA'}</span>
              <span className="flex items-center gap-2"><Trophy className="h-4 w-4" /> {match.tournamentName || 'N/A'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results / Timeline */}
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Clock className="h-4 w-4 inline mr-1" />
          Match Results & Details
        </p>
        {resultsLoading ? (
          <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result, i) => (
              <div key={i} className="flex items-start gap-5 p-5 bg-muted/40 rounded-xl">
                <div className="flex items-center justify-center mt-1">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${eventIconColors['Score']}`}>
                     <Trophy className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground">Result {i+1}</span>
                    <Badge variant="outline" className={`text-sm ${eventIconColors['Score']}`}>{result.resultCode || 'Record'}</Badge>
                    {result.medal && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{result.medal}</Badge>
                    )}
                  </div>
                  <p className="font-semibold">{result.athleteName} - Score: {result.score || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">Rank: {result.rank || 'N/A'} | Remarks: {result.remarks || 'None'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="card-premium rounded-xl">
            <CardContent className="p-10 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No results or timeline pending</p>
              <p className="text-sm">Events will appear when the match is updated.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Venue Info */}
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <MapPin className="h-4 w-4 inline mr-1" />
          Venue Information
        </p>
        <Card className="card-premium rounded-xl">
          <CardContent className="p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Venue</p>
                <p className="text-lg font-bold mt-2">{match.venue || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</p>
                <p className="text-lg font-bold mt-2">{match.matchDate || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tournament</p>
                <p className="text-lg font-bold mt-2">{match.tournamentName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sport</p>
                <p className="text-lg font-bold mt-2">{match.sportName || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MatchDetails;
