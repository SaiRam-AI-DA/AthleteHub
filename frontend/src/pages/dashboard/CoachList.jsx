import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { coachApi } from '../../api/coachApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GraduationCap, Search, Eye, Layers, Plus, UserSquare } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import EmptyState from '@/components/ui/EmptyState';

const statusStyles = {
  ACTIVE: 'bg-green-50 text-green-700 border-green-200',
  INACTIVE: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  DELETED: 'bg-red-50 text-red-700 border-red-200',
  SUSPENDED: 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function CoachList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['coaches', { page, pageSize, search: searchTerm, specialization: sportFilter === 'all' ? undefined : sportFilter, status: statusFilter === 'all' ? undefined : statusFilter }],
    queryFn: () => coachApi.getCoaches({ 
      page, 
      page_size: pageSize, 
      search: searchTerm,
      specialization: sportFilter === 'all' ? undefined : sportFilter,
      status: statusFilter === 'all' ? undefined : statusFilter
    }),
    keepPreviousData: true,
  });

  const coaches = data?.data || [];
  const pagination = data?.pagination || { total_pages: 1, page: 1 };

  return (
    <div className="space-y-6 page-enter">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Coaches</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Directory of all coaches on the platform.</p>
        </div>
        <Button onClick={() => navigate('/dashboard/coaches/new')} className="h-9">
          Add Coach
        </Button>
      </div>

      {/* Sticky Filter Toolbar */}
      <div className="sticky top-[62px] z-10">
        <Card className="card-premium border border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search coaches by name, sport, or organization..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="pl-9 h-9 rounded-lg text-sm bg-transparent border-white/10"
                />
              </div>
              <Select value={sportFilter} onValueChange={(val) => { setSportFilter(val); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[180px] h-9 rounded-lg text-sm bg-transparent border-white/10">
                  <SelectValue placeholder="Filter by sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="Basketball">Basketball</SelectItem>
                  <SelectItem value="Tennis">Tennis</SelectItem>
                  <SelectItem value="Swimming">Swimming</SelectItem>
                  {/* Dynamic based on real data would be better */}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[160px] h-9 rounded-lg text-sm bg-transparent border-white/10">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coach Directory Table */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl mb-6">
          Failed to load coaches.
        </div>
      )}

      {isLoading ? (
        <TableSkeleton columns={6} rows={5} />
      ) : coaches.length === 0 ? (
        <EmptyState 
          icon={UserSquare}
          title="No coaches found" 
          description="Try adjusting your search or filters, or register a new coach."
          actionLabel="Register Coach"
          onAction={() => navigate('/dashboard/coaches/new')}
        />
      ) : (
        <Card className="card-premium border border-white/10">
          <CardContent className="p-0">
            <Table className="table-spacious">
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-white/70">Name</TableHead>
                  <TableHead className="text-white/70">Specialization</TableHead>
                  <TableHead className="text-white/70">Organization</TableHead>
                  <TableHead className="text-white/70">Experience</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-right text-white/70">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coaches.map((coach) => (
                  <TableRow
                    key={coach.id}
                    className="cursor-pointer border-white/10 hover:bg-white/5 transition-colors"
                    onClick={() => navigate(`/dashboard/coaches/${coach.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 bg-white/10">
                          <AvatarFallback className="text-xs font-medium text-white/70">
                            {coach.firstName?.[0]}{coach.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm text-white/90">{coach.firstName} {coach.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-sm text-white/80">{coach.specialization || 'N/A'}</span>
                    </TableCell>
                    <TableCell className="text-sm text-white/80">{coach.organizationName || 'N/A'}</TableCell>
                    <TableCell>
                      <span className="font-medium text-sm text-white/80">{coach.experienceYears ? `${coach.experienceYears} yrs` : 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs rounded-md ${statusStyles[coach.status] || 'bg-gray-50/10 text-gray-300 border-gray-600'}`}
                      >
                        {coach.status || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          className="h-7 rounded-md px-3 text-xs text-white/70 hover:text-white hover:bg-white/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/coaches/${coach.id}`);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {coaches.length > 0 && pagination.total_pages > 1 && (
              <div className="p-4 border-t border-white/10">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="text-sm text-muted-foreground mx-4">
                        Page {page} of {pagination.total_pages}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                        disabled={page === pagination.total_pages}
                        className={page === pagination.total_pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
