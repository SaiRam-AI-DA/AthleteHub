import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventApi } from '../../api/eventApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarDays, MapPin, Search, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';

const statusColors = {
  UPCOMING: 'bg-blue-100 text-blue-800 border-blue-200',
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  ARCHIVED: 'bg-orange-100 text-orange-800 border-orange-200',
};

const typeColors = {
  Competition: 'bg-red-100 text-red-800 border-red-200',
  Seminar: 'bg-purple-100 text-purple-800 border-purple-200',
  Workshop: 'bg-blue-100 text-blue-800 border-blue-200',
  Exhibition: 'bg-amber-100 text-amber-800 border-amber-200',
  Trial: 'bg-green-100 text-green-800 border-green-200',
};

export default function EventList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sportFilter, setSportFilter] = useState('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventApi.getEvents({}).then(res => res.data?.data?.items || res.data?.items || []),
  });

  const events = data || [];

  const sports = ['all', ...new Set(events.map((e) => e.eventType).filter(Boolean))];
  const statuses = ['all', ...new Set(events.map((e) => e.status).filter(Boolean))];

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.venue?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesSport = sportFilter === 'all' || event.eventType === sportFilter;
    return matchesSearch && matchesStatus && matchesSport;
  });

  if (isLoading) return <LoadingSpinner text="Loading events..." />;
  if (error) return <ErrorState title="Failed to load events" message={error.message} />;

  return (
    <div className="space-y-6 page-enter">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">Browse all upcoming and ongoing sports events.</p>
        </div>
        <Button onClick={() => navigate('/dashboard/events/new')} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Create Event
        </Button>
      </div>

      {/* Filter Toolbar — Sticky */}
      <Card className="rounded-xl sticky top-[62px] z-10 shadow-sm border card-premium">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 rounded-xl pl-11"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 rounded-xl w-full sm:w-52">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="h-11 rounded-xl w-full sm:w-52">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {sports.map((s) => (
                  <SelectItem key={s} value={s}>{s === 'all' ? 'All Types' : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Section Label */}
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {filteredEvents.length} events found
      </p>

      {/* Event Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <Card
            key={event.id}
            className="rounded-xl cursor-pointer hover:shadow-md transition-shadow card-premium"
            onClick={() => navigate(`/dashboard/events/${event.id}`)}
          >
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className={`text-sm ${statusColors[event.status] || 'bg-gray-100 text-gray-800'}`}>
                  {event.status || 'N/A'}
                </Badge>
                <Badge variant="outline" className={`text-sm ${typeColors[event.eventType] || 'bg-gray-100 text-gray-800'}`}>
                  {event.eventType || 'N/A'}
                </Badge>
              </div>
              <CardTitle className="text-lg">{event.name || 'N/A'}</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-5">
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {event.description || 'N/A'}
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <span>{event.eventStartDate ? `${event.eventStartDate} to ${event.eventEndDate}` : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>{[event.venue, event.city].filter(Boolean).join(', ') || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>N/A participants</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground pt-2">
                Organized by {event.organizationName || 'N/A'}
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredEvents.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              icon={CalendarDays}
              title="No events found"
              description="Try adjusting your filters, or create a new event."
              actionLabel="Create Event"
              onAction={() => navigate('/dashboard/events/new')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
