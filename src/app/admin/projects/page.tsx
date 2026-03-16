import { createAdminClient } from "@/src/lib/supabase/admin";
import Link from "next/link";
import { Plus, FolderKanban, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { formatDate, getStatusLabel, getStatusColor } from "@/src/lib/utils";
import { ProgressRing } from "@/src/components/progress-ring";

export default async function ProjectsPage() {
  const supabase = createAdminClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*, client:clients(name, company, brand_color), milestones:milestones(id, status)")
    .order("updated_at", { ascending: false });

  const totalActive = projects?.filter(p => p.status === "in_progress").length || 0;

  return (
    <div>
      {/* Hero */}
      <section className="relative -mx-8 -mt-8 overflow-hidden mb-10">
        <div className="absolute inset-0 bg-cover bg-center blur-[2px] scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&q=80')" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.85) 35%, rgba(10,10,10,0.3) 65%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

        <div className="relative z-10 px-8 pt-20 pb-10 min-h-[240px] flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Gerenciamento</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white font-serif">Projetos</h1>
            <p className="mt-3 text-[#888] text-sm">
              {projects?.length || 0} projetos · {totalActive} em progresso
            </p>
          </div>
          <Link href="/admin/projects/new"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 hover:shadow-[0_0_30px_rgba(196,168,130,0.2)] active:scale-[0.98]">
            <Plus className="w-4 h-4" />Novo Projeto
          </Link>
        </div>
      </section>

      {!projects || projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 animate-float">
            <FolderKanban size={28} className="text-accent/50" />
          </div>
          <p className="mt-5 text-sm font-medium text-[#999]">Nenhum projeto ainda</p>
          <Link href="/admin/projects/new"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98]">
            <Plus className="w-4 h-4" />Criar Projeto
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => {
            const client = project.client as Record<string, string> | null;
            const milestones = project.milestones as Array<{ id: string; status: string }>;
            const completed = milestones.filter(m => m.status === "completed").length;
            const progress = milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;
            const brandColor = client?.brand_color || "#C4A882";

            return (
              <Link key={project.id} href={`/admin/projects/${project.id}`}>
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.03] via-[#1e1e1e] to-[#1e1e1e] ring-1 ring-white/[0.06] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:ring-white/[0.12] hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
                  {/* Accent top bar */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] opacity-60" style={{ background: `linear-gradient(90deg, ${brandColor}, transparent)` }} />

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-semibold ring-1 ${getStatusColor(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-accent transition-colors truncate">
                        {project.title}
                      </h3>
                      <p className="text-[11px] text-[#666] mt-1">{client?.company || "—"}</p>
                    </div>
                    <ProgressRing progress={progress} size={52} strokeWidth={3} />
                  </div>

                  {project.description && (
                    <p className="text-[11px] text-[#555] line-clamp-2 mb-3">{project.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-[#999] ring-1 ring-white/[0.06]">
                        <CheckCircle2 size={10} />{completed}/{milestones.length}
                      </span>
                      {project.end_date && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-[#999] ring-1 ring-white/[0.06]">
                          <Clock size={10} />{formatDate(project.end_date)}
                        </span>
                      )}
                    </div>
                    <ArrowRight size={14} className="text-[#333] group-hover:text-accent transition-colors" />
                  </div>

                  <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl" style={{ background: brandColor, opacity: 0 }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
