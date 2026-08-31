import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationApi } from '../../api/organizationApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  organization_type_id: z.coerce.number().min(1, 'Organization type is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Invalid phone number').max(20),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  description: z.string().optional(),
  address_line: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
});

export default function OrganizationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const { data: orgData, isLoading } = useQuery({
    queryKey: ['organization', id],
    queryFn: () => organizationApi.getOrganizationById(id),
    enabled: isEdit,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      organization_type_id: '',
      email: '',
      phone: '',
      website: '',
      description: '',
      address_line: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
    },
  });

  useEffect(() => {
    if (orgData?.data) {
      const org = orgData.data;
      form.reset({
        name: org.name || '',
        organization_type_id: org.organization_type?.id || '',
        email: org.email || '',
        phone: org.phone || '',
        website: org.website || '',
        description: org.description || '',
        address_line: org.address?.line || '',
        city: org.address?.city || '',
        state: org.address?.state || '',
        country: org.address?.country || '',
        postal_code: org.address?.postal_code || '',
      });
    }
  }, [orgData, form]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? organizationApi.updateOrganization(id, data) : organizationApi.createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ['organization', id] });
      }
      navigate('/dashboard/organizations');
    },
    onError: (error) => {
      console.error('Failed to save organization', error);
      // Optional: add toast notification here
    },
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      website: data.website || undefined,
      description: data.description || undefined,
    };
    mutation.mutate(payload);
  };

  if (isEdit && isLoading) {
    return <div className="p-8 text-center">Loading organization...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-5">
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => navigate('/dashboard/organizations')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEdit ? 'Edit Organization' : 'Create Organization'}</h1>
          <p className="text-muted-foreground mt-1">Fill out the details below to {isEdit ? 'update' : 'create'} an organization.</p>
        </div>
      </div>

      <Card className="card-premium">
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input id="name" {...form.register('name')} />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization_type_id">Organization Type</Label>
                <Select
                  value={String(form.watch('organization_type_id'))}
                  onValueChange={(val) => form.setValue('organization_type_id', val)}
                >
                  <SelectTrigger id="organization_type_id">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Club</SelectItem>
                    <SelectItem value="2">Academy</SelectItem>
                    <SelectItem value="3">Association</SelectItem>
                    <SelectItem value="4">University</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.organization_type_id && (
                  <p className="text-sm text-red-500">{form.formState.errors.organization_type_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register('email')} />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...form.register('phone')} />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" {...form.register('website')} placeholder="https://example.com" />
                {form.formState.errors.website && (
                  <p className="text-sm text-red-500">{form.formState.errors.website.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register('description')} rows={4} />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address_line">Address Line</Label>
                  <Input id="address_line" {...form.register('address_line')} />
                  {form.formState.errors.address_line && (
                    <p className="text-sm text-red-500">{form.formState.errors.address_line.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...form.register('city')} />
                  {form.formState.errors.city && (
                    <p className="text-sm text-red-500">{form.formState.errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" {...form.register('state')} />
                  {form.formState.errors.state && (
                    <p className="text-sm text-red-500">{form.formState.errors.state.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" {...form.register('country')} />
                  {form.formState.errors.country && (
                    <p className="text-sm text-red-500">{form.formState.errors.country.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input id="postal_code" {...form.register('postal_code')} />
                  {form.formState.errors.postal_code && (
                    <p className="text-sm text-red-500">{form.formState.errors.postal_code.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard/organizations')}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save Organization'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
