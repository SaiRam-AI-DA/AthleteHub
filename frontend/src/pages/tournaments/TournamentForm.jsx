import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tournamentApi } from '../../api/tournamentApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Activity, ArrowLeft, Save } from 'lucide-react';

const formSchema = z.object({
  eventId: z.coerce.number().min(1, "Event ID is required"),
  sportId: z.coerce.number().min(1, "Sport ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  genderCategory: z.string().min(1, "Required"),
  ageCategory: z.string().optional(),
  maxParticipants: z.coerce.number().optional().nullable(),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
  status: z.string().optional()
});

const TournamentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventId: '',
      sportId: '',
      name: '',
      genderCategory: 'ANY',
      ageCategory: '',
      maxParticipants: null,
      startDate: '',
      endDate: '',
      status: 'UPCOMING'
    }
  });

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament', id],
    queryFn: async () => {
      const response = await tournamentApi.getTournamentById(id);
      return response.data?.data || response.data;
    },
    enabled: isEditMode
  });

  useEffect(() => {
    if (tournament) {
      Object.keys(tournament).forEach(key => {
        if (key in formSchema.shape) {
          setValue(key, tournament[key]);
        }
      });
    }
  }, [tournament, setValue]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEditMode) {
        return await tournamentApi.updateTournament(id, data);
      }
      return await tournamentApi.createTournament(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      navigate('/dashboard/tournaments');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isEditMode && isLoading) {
    return <div className="p-10 flex justify-center"><Activity className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/tournaments')} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{isEditMode ? 'Edit Tournament' : 'Create Tournament'}</h1>
          <p className="text-muted-foreground mt-1">Fill out the details below to setup a tournament.</p>
        </div>
      </div>

      <Card className="card-premium rounded-xl border-border/50 shadow-md">
        <CardHeader className="bg-muted/20 border-b border-border/50 pb-6">
          <CardTitle>Tournament Details</CardTitle>
          <CardDescription>Basic information and configuration for the tournament.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <Label htmlFor="name">Tournament Name</Label>
                <Input id="name" {...register('name')} className="rounded-lg h-11" placeholder="e.g. Summer Cup 2026" />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventId">Event ID</Label>
                  <Input type="number" id="eventId" {...register('eventId')} className="rounded-lg h-11" />
                  {errors.eventId && <p className="text-sm text-red-500">{errors.eventId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sportId">Sport ID</Label>
                  <Input type="number" id="sportId" {...register('sportId')} className="rounded-lg h-11" />
                  {errors.sportId && <p className="text-sm text-red-500">{errors.sportId.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="genderCategory">Gender Category</Label>
                <select
                  {...register('genderCategory')}
                  className="flex h-11 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="MEN">Men</option>
                  <option value="WOMEN">Women</option>
                  <option value="MIXED">Mixed</option>
                  <option value="ANY">Any</option>
                </select>
                {errors.genderCategory && <p className="text-sm text-red-500">{errors.genderCategory.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageCategory">Age Category (Optional)</Label>
                <Input id="ageCategory" {...register('ageCategory')} className="rounded-lg h-11" placeholder="e.g. U19, O40, Any" />
                {errors.ageCategory && <p className="text-sm text-red-500">{errors.ageCategory.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input type="number" id="maxParticipants" {...register('maxParticipants')} className="rounded-lg h-11" placeholder="Unlimited if empty" />
                {errors.maxParticipants && <p className="text-sm text-red-500">{errors.maxParticipants.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input type="date" id="startDate" {...register('startDate')} className="rounded-lg h-11" />
                  {errors.startDate && <p className="text-sm text-red-500">{errors.startDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input type="date" id="endDate" {...register('endDate')} className="rounded-lg h-11" />
                  {errors.endDate && <p className="text-sm text-red-500">{errors.endDate.message}</p>}
                </div>
              </div>

              {isEditMode && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    {...register('status')}
                    className="flex h-11 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              )}
            </div>

            {mutation.isError && (
              <div className="bg-destructive/15 text-destructive p-4 rounded-lg font-medium text-sm mt-6">
                Error: {mutation.error.message}
              </div>
            )}

            <div className="flex justify-end gap-4 pt-8 border-t border-border/50 mt-8">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard/tournaments')} className="rounded-lg h-11 px-8">
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="rounded-lg h-11 px-8 shadow-md">
                {mutation.isPending ? <Activity className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                {isEditMode ? 'Save Changes' : 'Create Tournament'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentForm;
