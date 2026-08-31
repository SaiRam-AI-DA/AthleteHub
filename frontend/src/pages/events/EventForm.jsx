import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventApi } from '../../api/eventApi';

const eventSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  eventType: z.string().optional().nullable(),
  organizationId: z.coerce.number().min(1, 'Organization ID is required'),
  venue: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  registrationStartDate: z.string().min(1, 'Required'),
  registrationEndDate: z.string().min(1, 'Required'),
  eventStartDate: z.string().min(1, 'Required'),
  eventEndDate: z.string().min(1, 'Required'),
  status: z.string().optional().nullable(),
});

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const queryClient = useQueryClient();

  const { data: eventData, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventApi.getEventById(id).then((res) => res.data?.data || res.data),
    enabled: isEditMode,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      description: '',
      eventType: '',
      organizationId: '',
      venue: '',
      city: '',
      state: '',
      country: '',
      registrationStartDate: '',
      registrationEndDate: '',
      eventStartDate: '',
      eventEndDate: '',
      status: 'UPCOMING'
    }
  });

  useEffect(() => {
    if (eventData) {
      reset(eventData);
    }
  }, [eventData, reset]);

  const mutation = useMutation({
    mutationFn: (data) => isEditMode ? eventApi.updateEvent(id, data) : eventApi.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/dashboard/events');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isEditMode && isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto animate-slide-up">
      <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Event' : 'Create Event'}</h1>
      
      {mutation.isError && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">
          {mutation.error?.response?.data?.message || mutation.error.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-card shadow-sm border rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Event Name *</label>
            <input type="text" {...register('name')} className="w-full rounded-md border p-2 bg-background" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Organization ID *</label>
            <input type="number" {...register('organizationId')} className="w-full rounded-md border p-2 bg-background" />
            {errors.organizationId && <p className="text-red-500 text-xs mt-1">{errors.organizationId.message}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea {...register('description')} rows="3" className="w-full rounded-md border p-2 bg-background"></textarea>
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Event Type</label>
            <input type="text" {...register('eventType')} className="w-full rounded-md border p-2 bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Venue</label>
            <input type="text" {...register('venue')} className="w-full rounded-md border p-2 bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input type="text" {...register('city')} className="w-full rounded-md border p-2 bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input type="text" {...register('country')} className="w-full rounded-md border p-2 bg-background" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Registration Start *</label>
            <input type="date" {...register('registrationStartDate')} className="w-full rounded-md border p-2 bg-background" />
            {errors.registrationStartDate && <p className="text-red-500 text-xs mt-1">{errors.registrationStartDate.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Registration End *</label>
            <input type="date" {...register('registrationEndDate')} className="w-full rounded-md border p-2 bg-background" />
            {errors.registrationEndDate && <p className="text-red-500 text-xs mt-1">{errors.registrationEndDate.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Event Start Date *</label>
            <input type="date" {...register('eventStartDate')} className="w-full rounded-md border p-2 bg-background" />
            {errors.eventStartDate && <p className="text-red-500 text-xs mt-1">{errors.eventStartDate.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Event End Date *</label>
            <input type="date" {...register('eventEndDate')} className="w-full rounded-md border p-2 bg-background" />
            {errors.eventEndDate && <p className="text-red-500 text-xs mt-1">{errors.eventEndDate.message}</p>}
          </div>
          
          {isEditMode && (
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select {...register('status')} className="w-full rounded-md border p-2 bg-background">
                <option value="UPCOMING">Upcoming</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate('/dashboard/events')} className="px-4 py-2 border rounded-md hover:bg-gray-50 text-foreground">
            Cancel
          </button>
          <button type="submit" disabled={mutation.isPending} className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {mutation.isPending ? 'Saving...' : (isEditMode ? 'Update Event' : 'Create Event')}
          </button>
        </div>
      </form>
    </div>
  );
}
