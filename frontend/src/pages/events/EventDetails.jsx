import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi } from '../../api/eventApi';
import { Button } from '@/components/ui/button';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventApi.getEventById(id).then((res) => res.data?.data || res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: () => eventApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/dashboard/events');
    },
  });

  if (isLoading) return <div className="p-6">Loading Event Details...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error.message}</div>;
  if (!event) return <div className="p-6">Event not found.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-slide-up">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{event.name || 'N/A'}</h1>
        <div className="space-x-2 flex items-center">
          <Link to={`/dashboard/events/${event.id}/edit`}>
            <Button variant="outline">Edit Event</Button>
          </Link>
          <Button variant="destructive" onClick={() => {
            if (window.confirm('Are you sure you want to delete this event?')) {
              deleteMutation.mutate();
            }
          }} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Event'}
          </Button>
          <Link to="/dashboard/events">
            <Button variant="secondary">Back to List</Button>
          </Link>
        </div>
      </div>

      <div className="bg-card shadow-sm border rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Event Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><p className="text-muted-foreground text-sm">Event Code</p><p className="font-medium">{event.eventCode || 'N/A'}</p></div>
          <div><p className="text-muted-foreground text-sm">Type</p><p className="font-medium">{event.eventType || 'N/A'}</p></div>
          <div><p className="text-muted-foreground text-sm">Status</p><p className="font-medium">{event.status || 'N/A'}</p></div>
          <div><p className="text-muted-foreground text-sm">Organization</p><p className="font-medium">{event.organizationName || 'N/A'}</p></div>
          <div><p className="text-muted-foreground text-sm">Registration Start</p><p className="font-medium">{event.registrationStartDate || 'N/A'}</p></div>
          <div><p className="text-muted-foreground text-sm">Registration End</p><p className="font-medium">{event.registrationEndDate || 'N/A'}</p></div>
          <div><p className="text-muted-foreground text-sm">Event Start</p><p className="font-medium">{event.eventStartDate || 'N/A'}</p></div>
          <div><p className="text-muted-foreground text-sm">Event End</p><p className="font-medium">{event.eventEndDate || 'N/A'}</p></div>
          <div className="md:col-span-3"><p className="text-muted-foreground text-sm">Venue</p><p className="font-medium">{[event.venue, event.city, event.state, event.country].filter(Boolean).join(', ') || 'N/A'}</p></div>
        </div>
        <div className="mt-6 pt-6 border-t">
          <p className="text-muted-foreground text-sm mb-2">Description</p>
          <p className="text-foreground whitespace-pre-wrap">{event.description || 'N/A'}</p>
        </div>
      </div>

      <div className="bg-card shadow-sm border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Tournaments</h2>
        <p className="text-muted-foreground mb-4">Manage tournaments for this event here.</p>
        <Link to={`/dashboard/tournaments?eventId=${event.id}`} className="text-primary hover:underline">
          View all tournaments for this event &rarr;
        </Link>
      </div>
    </div>
  );
}
