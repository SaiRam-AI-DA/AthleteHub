import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Calendar, ArrowLeft, Edit } from 'lucide-react';

const statusColors = {
  Active: 'bg-green-100 text-green-800 border-green-200',
  Injured: 'bg-red-100 text-red-800 border-red-200',
  Inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  Suspended: 'bg-orange-100 text-orange-800 border-orange-200',
};

const medicalColors = {
  Fit: 'bg-green-100 text-green-800 border-green-200',
  'Under Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Restricted: 'bg-red-100 text-red-800 border-red-200',
  Recovering: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function HeroSection({ athlete }) {
  const navigate = useNavigate();
  
  if (!athlete) return null;

  return (
    <div className="space-y-6">
      {/* Back + Title */}
      <div className="flex items-center gap-5">
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => navigate('/dashboard/athletes')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{athlete.name}</h1>
          <p className="text-muted-foreground mt-1">{athlete.athleteCode || `ATH-${athlete.id}`} · {athlete.sport}</p>
        </div>
        <Button onClick={() => navigate(`/dashboard/athletes/${athlete.id}/edit`)} className="gap-2 h-11 px-6 rounded-xl">
          <Edit className="h-4 w-4" />
          Edit Athlete
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="card-premium relative overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b" />
        <CardContent className="p-8 pt-0 -mt-8 flex flex-col md:flex-row items-start gap-8 relative z-10">
          <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
            <AvatarImage src={athlete.profilePhotoUrl} />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {athlete.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4 mt-8 md:mt-10">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold">{athlete.name}</h2>
              <Badge variant="outline" className={statusColors[athlete.status] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                {athlete.status}
              </Badge>
              <Badge variant="outline" className={medicalColors[athlete.medicalStatus] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                {athlete.medicalStatus}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground shrink-0" /> <span className="truncate">{athlete.email}</span></div>
              <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground shrink-0" /> <span className="truncate">{athlete.phone}</span></div>
              <div className="flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground shrink-0" /> {athlete.gender}, {athlete.age} yrs</div>
              <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground shrink-0" /> Joined {athlete.joinDate}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
