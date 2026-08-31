import React, { useState } from "react";
import { PageLayout } from "../../components/ui/PageLayout";
import api from "../../api/axios";
import { List, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorState from "@/components/ui/ErrorState";
import { toast } from "sonner";

const STAGES = [
  { id: "NEW_PROSPECT", label: "New Prospect", color: "border-blue-500 text-blue-500" },
  { id: "UNDER_REVIEW", label: "Under Review", color: "border-purple-500 text-purple-500" },
  { id: "SHORTLISTED", label: "Shortlisted", color: "border-indigo-500 text-indigo-500" },
  { id: "CONTACTED", label: "Contacted", color: "border-amber-500 text-amber-500" },
  { id: "TRIAL_INVITED", label: "Trial Invited", color: "border-orange-500 text-orange-500" },
  { id: "TRIAL_COMPLETED", label: "Trial Completed", color: "border-teal-500 text-teal-500" },
  { id: "SELECTED", label: "Selected", color: "border-green-500 text-green-500" },
  { id: "REJECTED", label: "Rejected", color: "border-red-500 text-red-500" }
];

export default function RecruitmentPipeline() {
  const [view, setView] = useState("kanban"); // kanban or table
  const queryClient = useQueryClient();

  const { data: prospects = [], isLoading: loading, error } = useQuery({
    queryKey: ["prospects"],
    queryFn: async () => {
      const res = await api.get("/recruitment/prospects");
      return res.data.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async ({ prospectId, newStage }) => {
      await api.put(`/recruitment/prospects/${prospectId}/stage?stage=${newStage}`);
    },
    onSuccess: () => {
      toast.success("Stage updated successfully");
      queryClient.invalidateQueries(["prospects"]);
    },
    onError: () => {
      toast.error("Failed to update stage");
    }
  });

  const updateStage = (prospectId, newStage) => {
    mutation.mutate({ prospectId, newStage });
  };

  if (loading) {
    return (
      <PageLayout title="Pipeline">
        <LoadingSpinner />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Pipeline">
        <ErrorState message="Failed to load prospects" />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Recruitment Pipeline">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Active Pipeline</h2>
          <div className="flex gap-2 rounded-xl bg-muted p-1 border border-border">
            <button onClick={() => setView("kanban")} className={`rounded-lg p-2 ${view === "kanban" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><LayoutDashboard size={18} /></button>
            <button onClick={() => setView("table")} className={`rounded-lg p-2 ${view === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><List size={18} /></button>
          </div>
        </div>

        {view === "kanban" ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map(stage => {
              const stageProspects = prospects.filter(p => p.stage === stage.id);
              return (
                <div key={stage.id} className="min-w-[300px] shrink-0 glass-panel rounded-2xl border border-border bg-muted/30 p-4">
                  <div className={`mb-4 border-b-2 pb-2 font-bold ${stage.color}`}>
                    {stage.label} ({stageProspects.length})
                  </div>
                  <div className="flex flex-col gap-3">
                    {stageProspects.map(p => (
                      <div key={p.id} className="glass-panel cursor-pointer rounded-xl border border-border bg-muted p-3 transition-colors hover:border-primary/50">
                        <Link to={`/dashboard/recruitment/prospects/${p.id}`} className="font-semibold text-foreground hover:text-primary">
                          {p.athlete.fullName || (p.athlete.firstName ? `${p.athlete.firstName} ${p.athlete.lastName}` : "Unknown Athlete")}
                        </Link>
                        <div className="mt-1 text-xs text-muted-foreground">{p.athlete.sport?.name}</div>
                        <div className="mt-2 text-xs text-muted-foreground">Rating: {p.rating}/10</div>
                        
                        <div className="mt-3 flex gap-2">
                          <select 
                            className="w-full rounded bg-accent px-2 py-1 text-xs text-foreground border border-border"
                            value={p.stage}
                            onChange={(e) => updateStage(p.id, e.target.value)}
                          >
                            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel overflow-hidden rounded-2xl border border-border bg-muted/50">
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-muted text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Athlete</th>
                  <th className="px-6 py-3">Sport</th>
                  <th className="px-6 py-3">Rating</th>
                  <th className="px-6 py-3">Stage</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prospects.map(p => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium text-foreground">{p.athlete.fullName || (p.athlete.firstName ? `${p.athlete.firstName} ${p.athlete.lastName}` : "Unknown Athlete")}</td>
                    <td className="px-6 py-4">{p.athlete.sport?.name}</td>
                    <td className="px-6 py-4">{p.rating}/10</td>
                    <td className="px-6 py-4">
                      <select 
                        className="rounded bg-muted px-2 py-1 text-xs text-foreground border border-border"
                        value={p.stage}
                        onChange={(e) => updateStage(p.id, e.target.value)}
                      >
                        {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/dashboard/recruitment/prospects/${p.id}`} className="text-primary hover:underline">View Profile</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  );
}




