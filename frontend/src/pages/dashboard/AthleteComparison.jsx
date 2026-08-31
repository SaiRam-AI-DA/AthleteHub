import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { athleteApi } from '@/api/athleteApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search, X, Users, Activity, Heart, Trophy, User } from 'lucide-react';

export default function AthleteComparison() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAthleteIds, setSelectedAthleteIds] = useState([]);

  // Fetch search results
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['athletes-search', searchQuery],
    queryFn: () => athleteApi.getAthletes({ search: searchQuery, pageSize: 5 }),
    enabled: searchQuery.length >= 2,
  });

  // Fetch full details for selected athletes
  const { data: athletesData, isLoading: isLoadingAthletes } = useQuery({
    queryKey: ['athletes-comparison', selectedAthleteIds],
    queryFn: async () => {
      const promises = selectedAthleteIds.map(id => athleteApi.getAthleteById(id));
      return Promise.all(promises);
    },
    enabled: selectedAthleteIds.length > 0,
  });

  const handleAddAthlete = (athlete) => {
    if (selectedAthleteIds.length >= 4) {
      alert('You can compare a maximum of 4 athletes.');
      return;
    }
    if (!selectedAthleteIds.includes(athlete.id)) {
      setSelectedAthleteIds([...selectedAthleteIds, athlete.id]);
    }
    setSearchQuery('');
  };

  const handleRemoveAthlete = (id) => {
    setSelectedAthleteIds(selectedAthleteIds.filter(aId => aId !== id));
  };

  const compareFields = [
    { label: 'Basic Info', isHeader: true },
    { label: 'Sport', key: (a) => a.sport?.name || 'N/A' },
    { label: 'Organization', key: (a) => a.organizationName || 'N/A' },
    { label: 'Assigned Coach', key: (a) => a.assignedCoachName || 'N/A' },
    
    { label: 'Physical Stats', isHeader: true },
    { label: 'Age / Gender', key: (a) => `${a.age || 'N/A'} yrs / ${a.gender || 'N/A'}` },
    { label: 'Height', key: (a) => a.height ? `${a.height} cm` : 'N/A' },
    { label: 'Weight', key: (a) => a.weight ? `${a.weight} kg` : 'N/A' },
    { label: 'Blood Group', key: (a) => a.bloodGroup || 'N/A' },

    { label: 'Performance & Medical', isHeader: true },
    { label: 'Medical Status', key: (a) => (
      <Badge variant="outline" className={
        a.medicalStatus === 'Fit' ? 'bg-green-100 text-green-800' : 
        a.medicalStatus === 'Injured' || a.medicalStatus === 'Restricted' ? 'bg-red-100 text-red-800' : ''
      }>
        {a.medicalStatus || 'N/A'}
      </Badge>
    ) },
    { label: 'Performance Rating', key: (a) => (
      <div className="flex items-center gap-2 font-bold">
        {a.performanceRating || 'N/A'}
        {a.performanceRating && <span className="text-muted-foreground font-normal text-sm">/ 100</span>}
      </div>
    ) },
    { label: 'Status', key: (a) => (
      <Badge variant="outline" className={a.status === 'Active' ? 'bg-green-100 text-green-800' : ''}>
        {a.status || 'N/A'}
      </Badge>
    ) }
  ];

  return (
    <div className="space-y-8 page-enter">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up stagger-1">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3 text-gradient-primary">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Users className="h-8 w-8 text-primary" />
            </div>
            Athlete Comparison Engine
          </h1>
          <p className="text-muted-foreground mt-3 text-lg font-medium">Select up to 4 athletes to compare their physical stats, performance, and medical status side-by-side.</p>
        </div>
      </div>

      <Card className="card-premium overflow-visible">
        <CardContent className="p-6">
          <div className="relative z-50">
            <div className="relative flex items-center w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search athletes by name to add to comparison..." 
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8" 
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {searchQuery.length >= 2 && (
              <div className="absolute top-14 left-0 w-full md:w-1/2 bg-popover border shadow-lg rounded-xl overflow-hidden z-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                ) : searchResults?.data?.length > 0 ? (
                  <div className="py-2">
                    {searchResults.data.map((athlete) => (
                      <div 
                        key={athlete.id} 
                        className={`px-4 py-3 hover:bg-muted cursor-pointer flex items-center justify-between ${selectedAthleteIds.includes(athlete.id) ? 'opacity-50 pointer-events-none' : ''}`}
                        onClick={() => handleAddAthlete(athlete)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{(athlete.fullName || athlete.firstName || '?').substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{athlete.fullName || `${athlete.firstName} ${athlete.lastName}`}</p>
                            <p className="text-xs text-muted-foreground">{athlete.sport?.name} · {athlete.organizationName}</p>
                          </div>
                        </div>
                        {selectedAthleteIds.includes(athlete.id) ? (
                          <Badge variant="outline" className="text-xs">Added</Badge>
                        ) : (
                          <Button size="sm" variant="ghost" className="h-7 px-2">Add</Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">No athletes found matching "{searchQuery}"</div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedAthleteIds.length > 0 ? (
        <div className="overflow-x-auto pb-4">
          <table className="w-full border-collapse rounded-xl overflow-hidden bg-card border shadow-sm text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="p-4 text-left font-semibold text-muted-foreground w-48 shrink-0">Attributes</th>
                {athletesData?.map((athlete) => (
                  <th key={athlete.id} className="p-6 text-left border-l min-w-[250px] relative align-top">
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveAthlete(athlete.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="flex flex-col items-center text-center space-y-4">
                      <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                        <AvatarImage src={athlete.profilePhotoUrl} />
                        <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                          {(athlete.fullName || athlete.firstName || '?').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-lg">{athlete.fullName || `${athlete.firstName} ${athlete.lastName}`}</p>
                        <p className="text-xs text-muted-foreground">{athlete.athleteCode || `ATH-${athlete.id}`}</p>
                      </div>
                    </div>
                  </th>
                ))}
                {/* Empty slots for visual balance if < 4 */}
                {Array.from({ length: 4 - (athletesData?.length || 0) }).map((_, i) => (
                  <th key={`empty-${i}`} className="p-6 border-l min-w-[250px] bg-muted/20">
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-3">
                      <div className="h-16 w-16 rounded-full border-2 border-dashed flex items-center justify-center">
                        <User className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-medium">Add Athlete</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareFields.map((field, index) => (
                field.isHeader ? (
                  <tr key={index} className="bg-muted/30 border-b">
                    <td colSpan={5} className="p-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                      {field.label}
                    </td>
                  </tr>
                ) : (
                  <tr key={index} className="border-b hover:bg-muted/10 transition-colors">
                    <td className="p-4 font-medium text-muted-foreground shrink-0">{field.label}</td>
                    {athletesData?.map((athlete) => (
                      <td key={`${athlete.id}-${index}`} className="p-4 border-l">
                        {field.key(athlete)}
                      </td>
                    ))}
                    {Array.from({ length: 4 - (athletesData?.length || 0) }).map((_, i) => (
                      <td key={`empty-td-${i}`} className="p-4 border-l bg-muted/10"></td>
                    ))}
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Card className="card-premium border-dashed">
          <CardContent className="p-16 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Athletes Selected</h3>
            <p className="text-muted-foreground max-w-md">
              Use the search bar above to find and select up to 4 athletes to compare their profiles side-by-side.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
