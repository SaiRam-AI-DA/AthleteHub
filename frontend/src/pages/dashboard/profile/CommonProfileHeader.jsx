import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Camera } from 'lucide-react';

export function CommonProfileHeader({ user, role }) {
  return (
    <div className="relative rounded-xl overflow-hidden mb-8 border bg-card text-card-foreground shadow-sm">
      <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 sm:-mt-16 mb-4">
          <div className="relative">
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background shadow-md">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="text-3xl bg-muted text-muted-foreground">
                {user?.name?.substring(0, 2).toUpperCase() || 'AH'}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-1.5 bg-background border shadow-sm rounded-full hover:bg-muted transition-colors text-muted-foreground">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 space-y-1 sm:pb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">{user?.name || 'User'}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
              <Badge variant="secondary" className="capitalize">{role?.replace('_', ' ') || 'User'}</Badge>
              <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {user?.address || 'Location not set'}</div>
              <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {new Date(user?.memberSince || Date.now()).toLocaleDateString()}</div>
            </div>
          </div>
          <div className="flex gap-3 sm:pb-2 w-full sm:w-auto">
            <Button className="flex-1 sm:flex-none">Edit Profile</Button>
          </div>
        </div>
        {user?.biography && <p className="text-sm mt-2 max-w-3xl">{user.biography}</p>}
      </div>
    </div>
  );
}
