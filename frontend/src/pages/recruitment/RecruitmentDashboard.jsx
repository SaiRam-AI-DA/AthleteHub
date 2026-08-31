import React from "react";
import { PageLayout } from "../../components/ui/PageLayout";
import api from "../../api/axios";
import { Users, TrendingUp, CheckCircle, Clock, Map, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorState from "@/components/ui/ErrorState";

export default function RecruitmentDashboard() {
  const { data: metrics, isLoading: loading, error } = useQuery({
    queryKey: ["recruitmentDashboard"],
    queryFn: async () => {
      const response = await api.get("/recruitment/dashboard");
      return response.data.data;
    }
  });

  if (loading) {
    return (
      <PageLayout title="Recruitment Dashboard">
        <LoadingSpinner />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Recruitment Dashboard">
        <ErrorState message="Failed to load dashboard metrics" />
      </PageLayout>
    );
  }

  const kpis = [
    { label: "Total Prospects", value: metrics?.totalProspects || 0, icon: Users, color: "text-blue-500" },
    { label: "Active Pipeline", value: metrics?.activePipeline || 0, icon: TrendingUp, color: "text-amber-500" },
    { label: "Shortlisted", value: metrics?.shortlistedAthletes || 0, icon: Target, color: "text-indigo-500" },
    { label: "Selected", value: metrics?.selectedAthletes || 0, icon: CheckCircle, color: "text-green-500" },
    { label: "Upcoming Trials", value: metrics?.upcomingTrials || 0, icon: Map, color: "text-purple-500" },
    { label: "Overdue Tasks", value: metrics?.overdueTasks || 0, icon: Clock, color: "text-red-500" }
  ];

  return (
    <PageLayout title="Recruitment Dashboard">
      <div className="p-6">
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div key={index} className="glass-panel overflow-hidden rounded-2xl border border-border bg-muted/50 p-6 shadow-sm transition-all hover:bg-muted">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                    <h3 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{kpi.value}</h3>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${kpi.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-panel rounded-2xl border border-border bg-muted/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Pipeline Distribution</h3>
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              (Chart Component will be rendered here based on prospects data)
            </div>
          </div>
          <div className="glass-panel rounded-2xl border border-border bg-muted/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Activity</h3>
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              (Timeline Component will be rendered here)
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

