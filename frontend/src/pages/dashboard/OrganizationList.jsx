import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { organizationApi } from '../../api/organizationApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Users, Building, Plus, Eye, Search, Building2 } from 'lucide-react';
import { CardSkeleton } from '@/components/ui/skeleton-loaders';
import EmptyState from '@/components/ui/EmptyState';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

const typeColors = {
  Club: 'bg-blue-50 text-blue-700 border-blue-200',
  Academy: 'bg-purple-50 text-purple-700 border-purple-200',
  Association: 'bg-green-50 text-green-700 border-green-200',
  University: 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function OrganizationList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data: orgResponse, isLoading } = useQuery({
    queryKey: ['organizations', searchTerm, typeFilter, page],
    queryFn: () => organizationApi.getOrganizations({
      search: searchTerm || undefined,
      organization_type_id: typeFilter !== 'all' ? typeFilter : undefined,
      page,
      page_size: 10,
    }),
  });

  const organizations = orgResponse?.data || [];
  const pagination = orgResponse?.pagination || { total_records: 0 };
  const totalPages = Math.ceil((pagination.total_records || 0) / 10);

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: '1', label: 'Club' },
    { value: '2', label: 'Academy' },
    { value: '3', label: 'Association' },
    { value: '4', label: 'University' },
  ];

  return (
    <div className="space-y-6 page-enter">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/50 mb-1">Organizations</p>
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold tracking-tight">Sports Clubs & Academies</h1>
          <Button onClick={() => navigate('/dashboard/organizations/new')}>Add Organization</Button>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">Browse all organizations registered on the platform.</p>
      </div>

      <Card className="card-premium">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 text-muted-foreground -translate-y-1/2" />
              <Input
                placeholder="Search by name, sport, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 rounded-lg text-sm"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-9 rounded-lg text-sm">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : organizations.length === 0 ? (
        <EmptyState 
          icon={Building2}
          title="No organizations found" 
          description="Try adjusting your search or filters, or register a new organization."
          actionLabel="Register Organization"
          onAction={() => navigate('/dashboard/organizations/new')}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => {
            const orgTypeName = org.organizationTypeName || 'N/A';
            return (
              <Card key={org.id} className="card-premium">
                <CardHeader className="p-6 pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-xs font-semibold bg-muted">
                        {org.name ? org.name.substring(0, 2).toUpperCase() : 'NA'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{org.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{org.sportName || 'N/A'}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${typeColors[orgTypeName] || typeColors['Club']}`}>
                      {orgTypeName}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{[org.city, org.state].filter(Boolean).join(', ') || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{org.athleteCount || 0} members</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {org.description || 'N/A'}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="ghost"
                      className="h-8 px-3 rounded-md text-xs"
                      onClick={() => navigate(`/dashboard/organizations/${org.id}`)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Full Details
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-8 px-3 rounded-md text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 ml-auto"
                      onClick={() => navigate(`/dashboard/organizations/${org.id}/edit`)}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
            </PaginationItem>
            <PaginationItem>
              <span className="text-sm text-muted-foreground px-4">
                Page {page} of {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
