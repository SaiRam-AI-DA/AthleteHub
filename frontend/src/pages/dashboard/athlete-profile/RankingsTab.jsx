import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAthleteRankings } from '@/api/performanceApi';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function RankingsTab({ athleteId }) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['rankings', athleteId, page],
    queryFn: () => getAthleteRankings(athleteId, page - 1, pageSize),
    enabled: !!athleteId
  });

  const getRankTrend = (previous, current) => {
    if (!previous || previous === current) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (current < previous) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    return <ArrowDownRight className="h-4 w-4 text-red-500" />;
  };

  const columns = [
    {
      header: 'Date',
      accessorKey: 'rankingDate',
      cell: (row) => new Date(row.rankingDate).toLocaleDateString()
    },
    {
      header: 'Category',
      accessorKey: 'categoryName',
      cell: (row) => <Badge variant="outline">{row.categoryName}</Badge>
    },
    {
      header: 'Rank',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">#{row.rankPosition}</span>
          {getRankTrend(row.previousRank, row.rankPosition)}
        </div>
      )
    },
    {
      header: 'Points/Score',
      cell: (row) => row.points ? <span className="font-semibold">{row.points}</span> : '-'
    },
    {
      header: 'Tournament / Event',
      accessorKey: 'tournamentName',
      cell: (row) => row.tournamentName || 'General Update'
    }
  ];

  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <Card className="card-premium">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Ranking History</h3>
          </div>
          <DataTable 
            columns={columns}
            data={data?.content || []}
            isLoading={isLoading}
            pageCount={totalPages}
            pageIndex={page}
            pageSize={pageSize}
            onPageChange={setPage}
            emptyMessage="No ranking history found for this athlete."
          />
        </CardContent>
      </Card>
    </div>
  );
}
