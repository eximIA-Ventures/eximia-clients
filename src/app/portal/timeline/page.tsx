import { getServerUser } from "@/src/lib/server-auth";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { redirect } from "next/navigation";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { formatDate, getStatusLabel, getStatusColor } from "@/src/lib/utils";
import { getClientProject } from "@/src/lib/get-client-project";

export default async function TimelinePage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const project = await getClientProject(user.id, user.role, sp.project);
  if (!project) redirect("/portal");

  const supabase = createAdminClient();
  const { data: milestones } = await supabase
    .from("milestones")
    .select("*, deliverables:deliverables(*)")
    .eq("project_id", project.id)
    .order("sort_order");

  const all = milestones || [];
  const completed = all.filter((m) => m.status === "completed").length;
  const progress = all.length > 0 ? Math.round((completed / all.length) * 100) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-cream">Timeline</h1>
        <p className="text-sm text-dim mt-1">Acompanhe o progresso do seu projeto</p>
      </div>

      <div className="rounded-xl border border-edge bg-surface p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-cream-dim">Progresso geral</p>
            <p className="text-3xl font-bold text-cream mt-1">{progress}%</p>
          </div>
          <div className="text-right text-xs text-dim">
            {project.start_date && <p>Início: {formatDate(project.start_date)}</p>}
            {project.end_date && <p>Prazo: {formatDate(project.end_date)}</p>}
          </div>
        </div>
        <div className="w-full h-2 bg-elevated rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="space-y-1">
        {all.length === 0 ? (
          <div className="rounded-xl border border-edge bg-surface p-12 text-center">
            <Clock className="w-12 h-12 text-dim mx-auto mb-4" />
            <p className="text-cream mb-2">Timeline em construção</p>
          </div>
        ) : (
          all.map((ms, index) => {
            const isCompleted = ms.status === "completed";
            const isInProgress = ms.status === "in_progress";
            const deliverables = (ms.deliverables || []) as Array<Record<string, unknown>>;
            return (
              <div key={ms.id} className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  {isCompleted ? (
                    <CheckCircle2 className="w-7 h-7 text-sage flex-shrink-0" />
                  ) : isInProgress ? (
                    <div className="w-7 h-7 rounded-full border-2 border-accent bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    </div>
                  ) : (
                    <Circle className="w-7 h-7 text-edge-light flex-shrink-0" />
                  )}
                  {index < all.length - 1 && <div className={`w-px flex-1 min-h-[24px] ${isCompleted ? "bg-sage/30" : "bg-edge"}`} />}
                </div>
                <div className={`flex-1 pb-6 rounded-xl border p-5 mb-2 ${isInProgress ? "border-accent/20 bg-accent-subtle" : "border-edge bg-surface"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm font-semibold ${isCompleted ? "text-cream-dim line-through" : "text-cream"}`}>{ms.title}</h3>
                    <div className="flex items-center gap-2">
                      {ms.due_date && <span className="text-xs text-dim">{formatDate(ms.due_date)}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(ms.status)}`}>{getStatusLabel(ms.status)}</span>
                    </div>
                  </div>
                  {ms.description && <p className="text-xs text-cream-dim mt-1">{ms.description}</p>}
                  {deliverables.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-dim font-medium uppercase tracking-wider">Entregáveis</p>
                      {deliverables.map((d) => (
                        <div key={d.id as string} className="flex items-center justify-between p-2 rounded-lg bg-elevated">
                          <span className="text-xs text-cream">{d.title as string}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(d.status as string)}`}>{getStatusLabel(d.status as string)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
