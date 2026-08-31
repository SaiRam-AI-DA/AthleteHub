import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CommonProfileHeader } from './CommonProfileHeader';
import { PersonalInformationCard } from './PersonalInformationCard';
import { ProfileCompletionCard } from './ProfileCompletionCard';
import { ActivityTimeline } from './ActivityTimeline';
import { RoleSpecificSection } from './RoleSpecificSection';
import { ContactInformationCard } from './ContactInformationCard';
import { SecurityStatusCard } from './SecurityStatusCard';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function ProfilePage() {
  const { currentUser, currentRole } = useAuth();

  // Show a loading state or empty state if user is not yet available
  if (!currentUser) {
    return <div className="p-8 flex justify-center"><div className="animate-pulse h-8 w-32 bg-muted rounded"></div></div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto space-y-6 pb-12">
      <ErrorBoundary>
        <CommonProfileHeader user={currentUser} role={currentRole} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <PersonalInformationCard user={currentUser} />
            
            <RoleSpecificSection user={currentUser} role={currentRole} />
            
            <ContactInformationCard user={currentUser} />
            
            <SecurityStatusCard user={currentUser} />
          </div>
          
          {/* Right Column - Status & Activity */}
          <div className="space-y-6">
            <ProfileCompletionCard user={currentUser} />
            <ActivityTimeline />
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}
