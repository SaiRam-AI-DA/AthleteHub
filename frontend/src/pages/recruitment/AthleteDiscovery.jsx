import React, { useState } from "react";
import { PageLayout } from "../../components/ui/PageLayout";
import api from "../../api/axios";
import { Search, Plus, Filter, Activity, MapPin, Trophy, ShieldCheck } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { toast } from "sonner";

export default function AthleteDiscovery() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    minAge: "",
    maxAge: "",
    minRating: ""
  });
  const navigate = useNavigate();

  const { data: athletes = [], isLoading: loading, error } = useQuery({
    queryKey: ["discoverAthletes", filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters.minAge) queryParams.append('minAge', filters.minAge);
      if (filters.maxAge) queryParams.append('maxAge', filters.maxAge);
      if (filters.minRating) queryParams.append('minRating', filters.minRating);
      
      const res = await api.get(`/recruitment/discover?${queryParams.toString()}`);
      return res.data.data || [];
    }
  });

  const addToPipeline = async (athlete) => {
    try {
      const res = await api.post(`/recruitment/prospects?athleteId=${athlete.id}&organizationId=${athlete.organizationId || 1}`);
      toast.success("Added to pipeline");
      navigate(`/dashboard/recruitment/prospects/${res.data.data.id}`);
    } catch (err) {
      console.error("Failed to add to pipeline", err);
      toast.error("Error adding to pipeline. May already exist.");
    }
  };

  const filtered = athletes.filter(a => {
    const name = a.fullName || (a.firstName ? `${a.firstName} ${a.lastName}` : "");
    return name.toLowerCase().includes(search.toLowerCase()) ||
           a.athleteCode?.toLowerCase().includes(search.toLowerCase());
  });

  if (error) {
    return (
      <PageLayout title="Scout Engine">
        <ErrorState message="Failed to load athletes" />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Scout Engine">
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Athlete Discovery</h1>
            <p className="text-muted-foreground mt-1">Search, filter, and recruit top verified talent from around the world.</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50 shadow-sm backdrop-blur-sm">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or code..." 
              className="w-full rounded-xl border border-border/50 bg-background py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-12"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <div className="relative">
              <input 
                type="number" 
                placeholder="Min Age" 
                className="w-full rounded-xl border border-border/50 bg-background py-3 px-4 text-foreground focus:border-primary focus:outline-none h-12"
                value={filters.minAge}
                onChange={(e) => setFilters({...filters, minAge: e.target.value})}
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <input 
                type="number" 
                placeholder="Min Rating (0-100)" 
                className="w-full rounded-xl border border-border/50 bg-background py-3 px-4 text-foreground focus:border-primary focus:outline-none h-12"
                value={filters.minRating}
                onChange={(e) => setFilters({...filters, minRating: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState 
            icon={Filter} 
            title="No athletes found" 
            description="Try adjusting your search criteria" 
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(a => (
              <div key={a.id} className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card hover:shadow-xl hover:border-primary/50 transition-all duration-300">
                <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/5"></div>
                
                <div className="px-6 pb-6 relative">
                  <div className="flex justify-between items-start">
                    <div className="relative -mt-10 mb-3">
                      <div className="h-20 w-20 rounded-2xl border-4 border-card bg-muted flex items-center justify-center overflow-hidden shadow-sm">
                        {a.profilePhotoUrl ? (
                          <img src={a.profilePhotoUrl} alt="profile" className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-2xl font-bold text-muted-foreground">{a.firstName?.charAt(0)}{a.lastName?.charAt(0)}</span>
                        )}
                      </div>
                      {a.performanceRating > 80 && (
                        <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white rounded-full p-1 border-2 border-card shadow-sm" title="Highly Rated">
                          <ShieldCheck size={14} />
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <Badge variant="outline" className="font-mono text-[10px] uppercase bg-background">{a.athleteCode}</Badge>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold line-clamp-1">{a.fullName || `${a.firstName} ${a.lastName}`}</h3>
                  
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <MapPin size={14} />
                    <span>{a.city || 'Unknown'}, {a.country || 'Unknown'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-muted/30 p-3 rounded-xl border border-border/50 text-center">
                      <p className="text-xs uppercase font-bold text-muted-foreground mb-1">Sport</p>
                      <p className="font-semibold text-sm truncate">{a.sport?.name || 'N/A'}</p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-xl border border-border/50 text-center">
                      <p className="text-xs uppercase font-bold text-muted-foreground mb-1">Rating</p>
                      <p className="font-semibold text-sm text-primary flex items-center justify-center gap-1">
                        <Trophy size={14} />
                        {a.performanceRating || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button 
                      onClick={() => addToPipeline(a)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-xl shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Pipeline
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
