import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAthletePerformance } from '@/api/performanceApi';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PerformanceTab({ athleteId }) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['performance', athleteId, page],
    queryFn: () => getAthletePerformance(athleteId, page - 1, pageSize),
    enabled: !!athleteId
  });

  const columns = [
    {
      header: 'Date',
      accessorKey: 'recordDate',
      cell: (row) => new Date(row.recordDate).toLocaleDateString()
    },
    {
      header: 'Metric',
      accessorKey: 'metricName',
    },
    {
      header: 'Value',
      cell: (row) => <span className="font-semibold">{row.metricValue} {row.unit}</span>
    },
    {
      header: 'Evaluator',
      accessorKey: 'evaluatorName',
      cell: (row) => row.evaluatorName || 'System'
    },
    {
      header: 'Notes',
      accessorKey: 'notes',
      cell: (row) => <span className="text-muted-foreground truncate max-w-[200px] block">{row.notes || '-'}</span>
    }
  ];

  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <Card className="card-premium">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Performance History</h3>
          </div>
          <DataTable 
            columns={columns}
            data={data?.content || []}
            isLoading={isLoading}
            pageCount={totalPages}
            pageIndex={page}
            pageSize={pageSize}
            onPageChange={setPage}
            emptyMessage="No performance records found for this athlete."
          />
        </CardContent>
      </Card>
    </div>
  );
}
