import React from "react";
import { PageLayout } from "../../components/ui/PageLayout";
import api from "../../api/axios";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import { List } from "lucide-react";

export default function ShortlistsManagement() {
  const { data: shortlists = [], isLoading: loading, error } = useQuery({
    queryKey: ["shortlists"],
    queryFn: async () => {
      const res = await api.get("/recruitment/shortlists");
      return res.data.data;
    }
  });

  if (loading) {
    return (
      <PageLayout title="Shortlists Management">
        <LoadingSpinner />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Shortlists Management">
        <ErrorState message="Failed to load shortlists" />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Shortlists Management">
      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {shortlists.length === 0 ? (
            <div className="col-span-full">
              <EmptyState icon={List} title="No shortlists" description="You have not created any shortlists yet." />
            </div>
          ) : (
            shortlists.map(s => (
              <div key={s.id} className="glass-panel rounded-2xl border border-border bg-muted/50 p-6">
                <h3 className="mb-4 text-xl font-bold text-foreground">{s.name}</h3>
                <div className="flex flex-col gap-2">
                  {s.athletes?.map(a => (
                    <div key={a.id} className="rounded border border-border bg-muted p-2 text-foreground">
                      {a.fullName || (a.firstName ? `${a.firstName} ${a.lastName}` : "Unknown Athlete")} - {a.sport?.name}
                    </div>
                  ))}
                  {(!s.athletes || s.athletes.length === 0) && (
                    <div className="text-sm text-muted-foreground">No athletes in this shortlist yet.</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
}




