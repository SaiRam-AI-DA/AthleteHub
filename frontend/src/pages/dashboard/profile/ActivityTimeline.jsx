import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, Shield, UserCircle, Target, ArrowRight, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const iconMap = {
  system: Shield,
  profile: UserCircle,
  security: Shield,
  training: Target,
  default: Activity
};

export function ActivityTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5" /> Recent Activity
        </CardTitle>
        <CardDescription>Your latest actions and system events.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed rounded-lg bg-gray-50/50">
          <History className="w-10 h-10 mb-3 opacity-20" />
          <h3 className="text-sm font-semibold text-foreground mb-1">Activity Log Coming Soon</h3>
          <p className="text-xs max-w-[200px]">System events and activity logs will be tracked here in a future update.</p>
        </div>
      </CardContent>
    </Card>
  );
}
