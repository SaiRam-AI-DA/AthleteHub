import React, { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '@/lib/navigation-store';
import { athleteApi } from '@/api/athleteApi';
import { referenceApi } from '@/api/referenceApi';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Search, Plus, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/ui/EmptyState';

const statusColors = {
  Active: 'bg-green-50 text-green-700 border-green-200',
  Injured: 'bg-red-50 text-red-700 border-red-200',
  Inactive: 'bg-gray-50 text-gray-700 border-gray-200',
  Suspended: 'bg-orange-50 text-orange-700 border-orange-200',
};

const statuses = ['Active', 'Inactive', 'Injured', 'Suspended'];

export default function AthleteList() {
  const navigate = useNavigate();
  const { openContextPanel } = useNavigation();
  
  // Filtering & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Advanced Filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [genderFilter, setGenderFilter] = useState('all');
  const [medicalStatusFilter, setMedicalStatusFilter] = useState('all');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [minHeight, setMinHeight] = useState('');
  const [maxHeight, setMaxHeight] = useState('');
  const [minWeight, setMinWeight] = useState('');
  const [maxWeight, setMaxWeight] = useState('');

  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Debounce search input to prevent API spam
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [sportFilter, statusFilter]);

  // Fetch Reference Data
  const { data: sports = [] } = useQuery({
    queryKey: ['sports'],
    queryFn: referenceApi.getSports,
    staleTime: 5 * 60 * 1000, // 5 mins
  });

  // Fetch Athletes (Server-side sorting, filtering, pagination)
  const { data: responseData, isLoading, isError, error } = useQuery({
    queryKey: ['athletes', { 
      page, pageSize, search: debouncedSearch, sportId: sportFilter, status: statusFilter,
      gender: genderFilter, medicalStatus: medicalStatusFilter, minAge, maxAge, minHeight, maxHeight, minWeight, maxWeight
    }],
    queryFn: () => athleteApi.getAthletes({ 
      page, 
      pageSize, 
      search: debouncedSearch, 
      sportId: sportFilter, 
      status: statusFilter,
      gender: genderFilter,
      medicalStatus: medicalStatusFilter,
      minAge, maxAge, minHeight, maxHeight, minWeight, maxWeight
    }),
    placeholderData: keepPreviousData,
  });

  const athletes = responseData?.data || [];
  const pagination = responseData?.pagination || { page: 1, total_pages: 1, total_records: 0 };
  const totalPages = pagination.total_pages || 1;

  return (
    <div className="space-y-6 page-enter">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Athletes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and track all athletes on the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/dashboard/athletes/compare')} className="gap-2 h-9 px-4 rounded-lg text-sm bg-background">
            <Users className="h-3.5 w-3.5" />
            Compare
          </Button>
          <Button onClick={() => navigate('/dashboard/athletes/new')} className="gap-2 h-9 px-4 rounded-lg text-sm">
            <Plus className="h-3.5 w-3.5" />
            Register Athlete
          </Button>
        </div>
      </div>

      {/* Sticky Filter Toolbar */}
      <Card className="sticky top-[62px] z-10 card-premium">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by name, sport, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 rounded-lg text-sm"
              />
            </div>
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-9 rounded-lg text-sm">
                <SelectValue placeholder="Filter by sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                {sports.map((sport) => (
                  <SelectItem key={sport.id} value={String(sport.id)}>
                    {sport.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-9 rounded-lg text-sm">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant={showAdvanced ? "secondary" : "outline"} 
              className="h-9 px-4 rounded-lg text-sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              Advanced Filters {showAdvanced ? '▲' : '▼'}
            </Button>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border animate-in slide-in-from-top-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Gender</label>
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger className="h-9 rounded-lg text-sm">
                    <SelectValue placeholder="All Genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Medical Status</label>
                <Select value={medicalStatusFilter} onValueChange={setMedicalStatusFilter}>
                  <SelectTrigger className="h-9 rounded-lg text-sm">
                    <SelectValue placeholder="All Medical" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Medical Statuses</SelectItem>
                    <SelectItem value="Fit">Fit</SelectItem>
                    <SelectItem value="Restricted">Restricted</SelectItem>
                    <SelectItem value="Recovering">Recovering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Age Range (Years)</label>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="Min" value={minAge} onChange={(e) => {setMinAge(e.target.value); setPage(1);}} className="h-9 rounded-lg text-sm w-full" />
                  <span className="text-muted-foreground">-</span>
                  <Input type="number" placeholder="Max" value={maxAge} onChange={(e) => {setMaxAge(e.target.value); setPage(1);}} className="h-9 rounded-lg text-sm w-full" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Height (cm)</label>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="Min" value={minHeight} onChange={(e) => {setMinHeight(e.target.value); setPage(1);}} className="h-9 rounded-lg text-sm w-full" />
                  <span className="text-muted-foreground">-</span>
                  <Input type="number" placeholder="Max" value={maxHeight} onChange={(e) => {setMaxHeight(e.target.value); setPage(1);}} className="h-9 rounded-lg text-sm w-full" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Athletes Table */}
      <Card className="card-premium">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="table-spacious">
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead>Name</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-red-500">
                      Failed to load athletes. {error?.message || 'Unknown error.'}
                    </TableCell>
                  </TableRow>
                ) : athletes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <EmptyState 
                        icon={Users}
                        title="No athletes found" 
                        description="Try adjusting your search or filters, or register a new athlete."
                        actionLabel="Register Athlete"
                        onAction={() => navigate('/dashboard/athletes/new')}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  athletes.map((athlete) => {
                    const initials = (athlete.firstName?.[0] || '') + (athlete.lastName?.[0] || '');
                    const fallbackInitials = initials || athlete.fullName?.substring(0, 2).toUpperCase() || 'NA';

                    return (
                      <TableRow
                        key={athlete.id}
                        className="cursor-pointer group"
                        onClick={() => navigate(`/dashboard/athletes/${athlete.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="text-xs font-medium">
                                {fallbackInitials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{athlete.fullName || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">{athlete.athleteCode || `ATH-${athlete.id}`}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-sm text-muted-foreground">
                          {athlete.sport?.name || 'Not Assigned'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {athlete.organizationName || 'Not Assigned'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${statusColors[athlete.status] || 'bg-gray-50 text-gray-700'}`}>
                            {athlete.status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">{athlete.performanceRating ?? 'N/A'}</span>
                          {athlete.performanceRating !== null && <span className="text-xs text-muted-foreground ml-0.5">/100</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2.5 rounded-md text-xs"
                              onClick={(e) => { e.stopPropagation(); openContextPanel('athlete', athlete.id); }}
                            >
                              Quick View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2.5 rounded-md text-xs"
                              onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/athletes/${athlete.id}`); }}
                            >
                              Profile
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination & Summary */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2">
          <p className="text-xs text-muted-foreground">
            Showing {athletes.length} of {pagination.total_records} athletes
          </p>
          <Pagination className="w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {/* Show simplified page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        isActive={page === p}
                        onClick={() => setPage(p)}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  </React.Fragment>
                ))}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      
      {totalPages <= 1 && athletes.length > 0 && (
        <p className="text-xs text-muted-foreground text-center pb-2 mt-4">
          Showing all {athletes.length} athletes
        </p>
      )}
    </div>
  );
}
