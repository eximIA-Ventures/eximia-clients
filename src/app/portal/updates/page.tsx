import { getServerUser } from "@/src/lib/server-auth";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { redirect } from "next/navigation";
import { Bell, Info, Target, Package, AlertTriangle } from "lucide-react";
import { formatDate } from "@/src/lib/utils";
import { getClientProject } from "@/src/lib/get-client-project";

function getUpdateIcon(type: string) {
  switch (type) { case "milestone": return Target; case "deliverable": return Package; case "alert": return AlertTriangle; default: return Info; }
}

function getUpdateColor(type: string) {
  switch (type) { case "milestone": return "text-sage bg-sage-subtle"; case "deliverable": return "text-accent bg-accent-subtle"; case "alert": return "text-red-400 bg-red-400/10"; default: return "text-cream-dim bg-elevated"; }
}

export default async function UpdatesPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const project = await getClientProject(user.id, user.role, sp.project);
  if (!project) redirect("/portal");

  const supabase = createAdminClient();
  const { data: updates } = await supabase.from("updates").select("*").eq("project_id", project.id).order("created_at", { ascending: false });
  const allUpdates = updates || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-cream">Atualizações</h1>
        <p className="text-sm text-dim mt-1">Histórico de atualizações do projeto</p>
      </div>

      {allUpdates.length === 0 ? (
        <div className="rounded-xl border border-edge bg-surface p-12 text-center">
          <Bell className="w-12 h-12 text-dim mx-auto mb-4" />
          <p className="text-cream mb-2">Nenhuma atualização ainda</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allUpdates.map((update) => {
            const Icon = getUpdateIcon(update.type);
            const colorClass = getUpdateColor(update.type);
            return (
              <div key={update.id} className="rounded-xl border border-edge bg-surface p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-cream">{update.title}</h3>
                      <span className="text-xs text-dim">{formatDate(update.created_at)}</span>
                    </div>
                    <p className="text-sm text-cream-dim leading-relaxed whitespace-pre-line">{update.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
