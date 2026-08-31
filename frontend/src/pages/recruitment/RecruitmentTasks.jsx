import React from "react";
import { PageLayout } from "../../components/ui/PageLayout";
import api from "../../api/axios";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorState from "@/components/ui/ErrorState";

export default function RecruitmentTasks() {
  const { data: tasks = [], isLoading: loading, error } = useQuery({
    queryKey: ["recruitmentTasks"],
    queryFn: async () => {
      const res = await api.get("/recruitment/tasks");
      return res.data.data;
    }
  });

  if (loading) {
    return (
      <PageLayout title="Recruitment Tasks">
        <LoadingSpinner />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Recruitment Tasks">
        <ErrorState message="Failed to load tasks" />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Recruitment Tasks">
      <div className="p-6">
        <div className="glass-panel overflow-hidden rounded-2xl border border-border bg-muted/50">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Prospect</th>
                <th className="px-6 py-3">Due Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Priority</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-muted-foreground">No tasks found.</td></tr>
              ) : (
                tasks.map(t => (
                  <tr key={t.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium text-foreground">{t.title}</td>
                    <td className="px-6 py-4">{t.description}</td>
                    <td className="px-6 py-4">{t.prospectName || "N/A"}</td>
                    <td className="px-6 py-4">{t.dueDate}</td>
                    <td className="px-6 py-4">{t.status}</td>
                    <td className="px-6 py-4">{t.priority}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}




