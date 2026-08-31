import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { coachApi } from '../../api/coachApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  GraduationCap,
  ArrowLeft,
  Mail,
  Phone,
  Award,
  Users,
  ShieldCheck,
  Star,
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const statusStyles = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  INACTIVE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  DELETED: 'bg-red-100 text-red-800 border-red-200',
  SUSPENDED: 'bg-orange-100 text-orange-800 border-orange-200',
};

export default function CoachProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['coach', id],
    queryFn: () => coachApi.getCoachById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return <LoadingSpinner text="Loading coach details..." />;
  }

  if (error || !data) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl mb-6">
        {error?.message || 'Failed to load coach details'}
      </div>
    );
  }

  const coach = data.data;

  // Split comma separated strings into arrays for UI
  const specializations = coach.specialization ? coach.specialization.split(',').map(s => s.trim()) : [];
  const certifications = coach.certifications ? coach.certifications.split(',').map(c => c.trim()) : [];

  return (
    <div className="space-y-10 page-enter">
      {/* Page Header */}
      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          className="h-11 rounded-xl px-6 bg-transparent border-white/10 hover:bg-white/5"
          onClick={() => navigate('/dashboard/coaches')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{coach.firstName} {coach.lastName}</h1>
          <p className="text-muted-foreground">
            {coach.specialization || 'General'} Coach — {coach.organizationName || 'Independent'}
          </p>
        </div>
        <Button
          variant="default"
          className="h-11 rounded-xl px-6"
          onClick={() => navigate(`/dashboard/coaches/${coach.id}/edit`)}
        >
          Edit Profile
        </Button>
      </div>

      {/* Header Card */}
      <Card className="card-premium border border-white/10 bg-transparent">
        <CardContent className="p-10">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <Avatar className="h-16 w-16 bg-white/10">
              <AvatarFallback className="text-lg font-medium text-white/70">
                {coach.firstName?.[0]}{coach.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-white/90">{coach.firstName} {coach.lastName}</h2>
                <Badge
                  variant="outline"
                  className={`rounded-lg ${statusStyles[coach.status] || 'bg-gray-100/10 text-gray-300 border-gray-600'}`}
                >
                  {coach.status || 'N/A'}
                </Badge>
              </div>

              <Separator className="bg-white/10" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-white/50" />
                  <span className="text-sm text-white/80">{coach.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-white/50" />
                  <span className="text-sm text-white/80">{coach.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-white/50" />
                  <span className="text-sm font-medium text-white/80">{coach.experienceYears || 0} years experience</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-white/50" />
                  <span className="text-sm font-medium text-white/80">0 athletes</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="specializations" className="space-y-8">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="specializations" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Specializations</TabsTrigger>
          <TabsTrigger value="certifications" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Certifications</TabsTrigger>
          <TabsTrigger value="athletes" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Assigned Athletes</TabsTrigger>
        </TabsList>

        {/* Specializations Tab */}
        <TabsContent value="specializations" className="space-y-8">
          <Card className="card-premium border border-white/10 bg-transparent">
            <CardContent className="p-10">
              <div className="flex items-center gap-3 mb-8">
                <Award className="h-5 w-5 text-white/50" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Coaching Specializations
                </span>
              </div>
              <div className="space-y-4">
                {specializations.length > 0 ? specializations.map((spec, i) => (
                  <div
                    key={i}
                    className="p-6 bg-white/5 rounded-xl flex items-center gap-4"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary text-sm"
                    >
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-white/80">{spec}</span>
                  </div>
                )) : (
                  <p className="text-white/50">No specializations listed.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-8">
          <Card className="card-premium border border-white/10 bg-transparent">
            <CardContent className="p-10">
              <div className="flex items-center gap-3 mb-8">
                <ShieldCheck className="h-5 w-5 text-white/50" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Professional Certifications
                </span>
              </div>
              <div className="space-y-4">
                {certifications.length > 0 ? certifications.map((cert, i) => (
                  <div
                    key={i}
                    className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <Star className="h-4 w-4 text-green-500" />
                      <p className="font-medium text-green-400">{cert}</p>
                    </div>
                    <p className="text-sm text-green-500/70">Verified and active</p>
                  </div>
                )) : (
                  <p className="text-white/50">No certifications listed.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assigned Athletes Tab */}
        <TabsContent value="athletes" className="space-y-8">
          <Card className="card-premium border border-white/10 bg-transparent">
            <CardContent className="p-10">
              <div className="flex items-center gap-3 mb-8">
                <Users className="h-5 w-5 text-white/50" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Assigned Athletes
                </span>
                <Badge variant="secondary" className="rounded-xl bg-white/10 text-white">
                  0
                </Badge>
              </div>

              <div className="text-center py-16">
                <Users className="h-12 w-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50 text-sm">
                  No athletes currently assigned.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
