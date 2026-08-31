import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { matchApi } from '../../api/matchApi';
import { Card, CardContent } from '../../components/ui/card';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const MatchCalendarView = () => {
  const [searchParams] = useSearchParams();
  const tournamentId = searchParams.get('tournamentId');

  const { data, isLoading, error } = useQuery({
    queryKey: ['matches', { tournamentId }],
    queryFn: async () => {
      const params = tournamentId ? { tournamentId } : {};
      const response = await matchApi.getMatches(params);
      return response.data?.data?.items || response.data?.items || [];
    }
  });

  const matches = data || [];

  // Transform matches for the calendar
  const events = matches
    .filter(match => match.matchDate) // Prevent invalid date crashes
    .map(match => {
    const startDate = new Date(`${match.matchDate}T${match.startTime || '00:00:00'}`);
    const endDate = new Date(`${match.matchDate}T${match.endTime || '01:00:00'}`);
    
    return {
      id: match.id,
      title: `${match.matchCode} - ${match.venue || 'TBA'}`,
      start: startDate,
      end: endDate,
      resource: match
    };
  });

  return (
    <div className="p-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Match Calendar View</h1>
        <p className="text-muted-foreground">
          {tournamentId ? `Viewing matches for Tournament ID: ${tournamentId}` : 'View all scheduled matches'}
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-red-500">
          Error loading matches.
        </div>
      ) : (
        <Card className="flex-1 border-0 shadow-md overflow-hidden bg-white rounded-xl">
          <CardContent className="p-4 h-full">
            {events.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 bg-gray-50/50 rounded-lg">
                <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Matches Scheduled</h3>
                <p className="text-sm text-center max-w-sm">
                  There are no upcoming matches to display on the calendar at this time.
                </p>
              </div>
            ) : (
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectEvent={event => alert(`Match Details:\nCode: ${event.resource.matchCode}\nVenue: ${event.resource.venue || 'N/A'}\nRound: ${event.resource.round || 'N/A'}`)}
                views={['month', 'week', 'day']}
                className="font-sans"
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MatchCalendarView;
