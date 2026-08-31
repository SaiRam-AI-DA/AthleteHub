import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { matchApi } from '@/api/matchApi';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

export default function RecentMatchResultsWidget({ athleteId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['recent-match-results', athleteId],
    queryFn: () => matchApi.getMatchResultsByAthlete(athleteId),
    enabled: !!athleteId
  });

  const getMedalBadge = (medal) => {
    switch(medal) {
      case 'GOLD': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Gold</Badge>;
      case 'SILVER': return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Silver</Badge>;
      case 'BRONZE': return <Badge className="bg-orange-100 text-orange-900 border-orange-300">Bronze</Badge>;
      default: return '-';
    }
  };

  const columns = [
    {
      header: 'Match',
      cell: (row) => <span className="font-semibold">{row.match?.name || row.match?.category || 'General'}</span>
    },
    {
      header: 'Rank',
      cell: (row) => row.rank ? <span className="font-bold">#{row.rank}</span> : '-'
    },
    {
      header: 'Score',
      cell: (row) => row.score || '-'
    },
    {
      header: 'Medal',
      cell: (row) => getMedalBadge(row.medal)
    },
  ];

  // Limit to 5
  const displayData = data?.slice(0, 5) || [];

  return (
    <Card className="card-premium h-full">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
            <Trophy className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold">Recent Match Results</h3>
        </div>
        
        {athleteId ? (
          <DataTable 
            columns={columns}
            data={displayData}
            isLoading={isLoading}
            pageCount={1}
            pageIndex={1}
            pageSize={5}
            onPageChange={() => {}}
            emptyMessage="No match results found."
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            Athlete profile not fully linked. Cannot fetch recent results.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
