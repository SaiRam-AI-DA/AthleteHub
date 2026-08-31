import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../api/axios';
import { coachAssignmentApi } from '../../api/coachAssignmentApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const assignmentSchema = z.object({
  organizationId: z.coerce.number().min(1, 'Organization is required'),
  coachId: z.coerce.number().min(1, 'Coach is required'),
  athleteId: z.coerce.number().min(1, 'Athlete is required'),
  startDate: z.string().min(1, 'Start Date is required'),
  endDate: z.string().optional().nullable().transform(val => val === '' ? null : val),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']).default('ACTIVE'),
  remarks: z.string().optional().nullable()
});

export default function CoachAssignmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const { data: assignmentRes, isLoading: initialLoading } = useQuery({
    queryKey: ['coachAssignment', id],
    queryFn: () => coachAssignmentApi.getAssignmentById(id),
    enabled: isEdit
  });

  const assignment = assignmentRes?.data;
  const originalStatus = assignment?.status;
  const isReadOnly = originalStatus === 'COMPLETED' || originalStatus === 'CANCELLED';

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      organizationId: '',
      coachId: '',
      athleteId: '',
      startDate: '',
      endDate: '',
      status: 'ACTIVE',
      remarks: ''
    }
  });

  useEffect(() => {
    if (assignment) {
      reset({
        organizationId: assignment.organizationId || '',
        coachId: assignment.coachId || '',
        athleteId: assignment.athleteId || '',
        startDate: assignment.startDate || '',
        endDate: assignment.endDate || '',
        status: assignment.status || 'ACTIVE',
        remarks: assignment.remarks || ''
      });
    }
  }, [assignment, reset]);

  const { data: coachesRes } = useQuery({
    queryKey: ['coachesLookup'],
    queryFn: () => api.get('/coaches', { params: { page_size: 200, status: 'ACTIVE' } }).then(res => res.data)
  });
  
  const { data: athletesRes } = useQuery({
    queryKey: ['athletesLookup'],
    queryFn: () => api.get('/athletes', { params: { page_size: 200, status: 'Active' } }).then(res => res.data)
  });
  
  const { data: orgsRes } = useQuery({
    queryKey: ['organizationsLookup'],
    queryFn: () => api.get('/organizations', { params: { page_size: 100, status: 'Active' } }).then(res => res.data)
  });

  const coaches = coachesRes?.data || [];
  const athletes = athletesRes?.data || [];
  const organizations = orgsRes?.data || [];

  const createMutation = useMutation({
    mutationFn: coachAssignmentApi.createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coachAssignments'] });
      navigate('/dashboard/coach-assignments');
    }
  });

  const updateMutation = useMutation({
    mutationFn: coachAssignmentApi.updateAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coachAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['coachAssignment', id] });
      navigate('/dashboard/coach-assignments');
    }
  });

  const onSubmit = (data) => {
    if (isEdit) {
      updateMutation.mutate({ id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const selectedOrgId = watch('organizationId');

  if (isEdit && initialLoading) return <LoadingSpinner text="Loading assignment..." />;

  const mutationError = createMutation.error || updateMutation.error;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-h2">{isEdit ? 'Edit Assignment' : 'New Assignment'}</h1>
        <button onClick={() => navigate('/dashboard/coach-assignments')} className="text-muted-foreground hover:text-foreground transition-colors">
          Cancel
        </button>
      </div>

      {mutationError && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-xl mb-6">
          {mutationError.response?.data?.message || mutationError.message || 'Operation failed'}
        </div>
      )}
      
      {isReadOnly && (
         <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 p-4 rounded-xl mb-6">
          This assignment is {originalStatus}. Only remarks can be updated.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="card flex flex-col gap-4">
        
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Organization *</label>
          <select {...register('organizationId')} disabled={isEdit} className="input">
            <option value="">-- Select Organization --</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
          {errors.organizationId && <span className="text-xs text-destructive">{errors.organizationId.message}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Coach *</label>
            <select {...register('coachId')} disabled={isEdit} className="input">
              <option value="">-- Select Coach --</option>
              {coaches.filter(c => !selectedOrgId || c.organizationId === parseInt(selectedOrgId)).map(coach => (
                <option key={coach.id} value={coach.id}>{coach.firstName} {coach.lastName} ({coach.coachCode})</option>
              ))}
            </select>
            {errors.coachId && <span className="text-xs text-destructive">{errors.coachId.message}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Athlete *</label>
            <select {...register('athleteId')} disabled={isEdit} className="input">
              <option value="">-- Select Athlete --</option>
              {athletes.filter(a => !selectedOrgId || a.organizationId === parseInt(selectedOrgId)).map(athlete => (
                <option key={athlete.id} value={athlete.id}>{athlete.firstName} {athlete.lastName} ({athlete.athleteCode})</option>
              ))}
            </select>
            {errors.athleteId && <span className="text-xs text-destructive">{errors.athleteId.message}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Start Date *</label>
            <input type="date" {...register('startDate')} disabled={isReadOnly} className="input" />
            {errors.startDate && <span className="text-xs text-destructive">{errors.startDate.message}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">End Date</label>
            <input type="date" {...register('endDate')} disabled={isReadOnly} className="input" />
            {errors.endDate && <span className="text-xs text-destructive">{errors.endDate.message}</span>}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Status *</label>
          <select {...register('status')} disabled={isReadOnly} className="input">
            <option value="ACTIVE">ACTIVE</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          {errors.status && <span className="text-xs text-destructive">{errors.status.message}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Remarks</label>
          <textarea {...register('remarks')} className="input min-h-[100px]" placeholder="Add any notes about this assignment..."></textarea>
          {errors.remarks && <span className="text-xs text-destructive">{errors.remarks.message}</span>}
        </div>

        <div className="mt-4 flex justify-end">
          <button type="submit" disabled={isSaving} className="btn btn-primary min-w-[150px]">
            {isSaving ? 'Saving...' : 'Save Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
}
