import { createAdminClient } from "@/src/lib/supabase/admin";
import { getServerUser } from "@/src/lib/server-auth";
import Link from "next/link";
import { Users, FolderKanban, Plus, ArrowRight, FileText, Sparkles, UserPlus, BarChart3 } from "lucide-react";
import { getStatusLabel, getStatusColor, formatDate } from "@/src/lib/utils";
import { ProgressRing } from "@/src/components/progress-ring";

export default async function AdminDashboard() {
  const user = await getServerUser();
  const supabase = createAdminClient();

  const [clientsRes, projectsRes, recentProjectsRes] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact" }),
    supabase.from("projects").select("id, status", { count: "exact" }),
    supabase.from("projects").select("id, title, status, client:clients(name, company), updated_at").order("updated_at", { ascending: false }).limit(5),
  ]);

  const totalClients = clientsRes.count || 0;
  const totalProjects = projectsRes.count || 0;
  const activeProjects = projectsRes.data?.filter((p) => p.status === "in_progress").length || 0;
  const completedProjects = projectsRes.data?.filter((p) => p.status === "completed").length || 0;
  const recentProjects = recentProjectsRes.data || [];
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  return (
    <div className="relative">
      {/* Ambient mesh */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-accent/[0.03] rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-[#2a6ab0]/[0.02] rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: "url(/noise.svg)", backgroundRepeat: "repeat" }} />
      </div>

      {/* Hero */}
      <section className="relative -mx-8 -mt-8 overflow-hidden mb-10">
        <div className="absolute inset-0 bg-cover bg-center scale-105 blur-[2px]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80')" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.85) 35%, rgba(10,10,10,0.3) 65%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

        <div className="relative z-10 px-8 pt-20 pb-12 flex items-end justify-between min-h-[280px]">
          <div className="max-w-lg">
            <p className="text-accent text-sm font-medium tracking-wide">Olá, {user?.name?.split(" ")[0]}</p>
            <h1 className="mt-3 text-5xl font-bold text-white tracking-tight leading-[1.05] font-serif">
              Seus projetos,{" "}
              <span className="text-gradient-gold">seu controle.</span>
            </h1>
            <p className="mt-4 text-[#888] text-[15px] leading-relaxed">
              Gerencie clientes, acompanhe entregas e mantenha visibilidade total.
            </p>
          </div>

          <div className="flex items-center gap-10">
            <ProgressRing progress={completionRate} size={90} strokeWidth={5} />
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-2xl font-bold text-white tabular-nums">{totalClients}</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#666]">Clientes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white tabular-nums">{activeProjects}</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#666]">Ativos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions — Gradient Cards */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {[
          { href: "/admin/clients/new", label: "Novo Cliente", desc: "Cadastrar e criar acesso", icon: UserPlus, from: "#C4A882", to: "#8B7355" },
          { href: "/admin/projects/new", label: "Novo Projeto", desc: "Criar projeto e milestones", icon: FolderKanban, from: "#4b9560", to: "#2a5a35" },
          { href: "/admin/clients", label: "Clientes", desc: `${totalClients} cadastrados`, icon: Users, from: "#2a6ab0", to: "#1a4a8a" },
          { href: "/admin/projects", label: "Projetos", desc: `${totalProjects} total`, icon: BarChart3, from: "#7c5cbf", to: "#5a3a9f" },
        ].map((card, i) => (
          <Link key={card.href} href={card.href}
            className={`group relative rounded-2xl overflow-hidden ring-1 ring-white/[0.06] transition-all duration-300 hover:-translate-y-1.5 hover:ring-white/[0.15] hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] animate-fade-in-up stagger-${i + 1}`}>
            <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${card.from}, ${card.to})` }} />
            <div className="absolute inset-0 bg-[#0f0f0f]/60" />
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" style={{ background: card.from }} />

            <div className="relative p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06] mb-4 transition-all duration-300 group-hover:bg-white/[0.1] group-hover:scale-105">
                <card.icon className="w-6 h-6 text-white/70 transition-colors group-hover:text-white" />
              </div>
              <h3 className="text-base font-semibold text-white">{card.label}</h3>
              <p className="text-[11px] text-[#777] mt-1">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* API hint */}
      <div className="glass rounded-2xl p-5 mb-8 flex items-center gap-4 animate-fade-in-up">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2a6ab0]/15">
          <Sparkles className="w-5 h-5 text-[#4a8ad0]" />
        </div>
        <p className="text-sm text-[#888] flex-1">
          Onboarde clientes via J.A.R.V.I.S. <code className="text-[11px] bg-white/[0.06] px-2 py-0.5 rounded-md text-[#4a8ad0] font-mono">POST /api/onboard</code>
        </p>
        <ArrowRight className="w-4 h-4 text-[#444]" />
      </div>

      {/* Projects table */}
      <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] animate-fade-in-up">
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <h2 className="text-base font-semibold text-white font-serif">Projetos Recentes</h2>
          <Link href="/admin/projects" className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover transition-colors">
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {recentProjects.length === 0 ? (
            <div className="p-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] mx-auto mb-4">
                <FolderKanban className="w-8 h-8 text-[#333]" />
              </div>
              <p className="text-sm text-[#666] mb-4">Nenhum projeto ainda</p>
              <Link href="/admin/projects/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-[#0a0a0a] text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.98]">
                <Plus className="w-4 h-4" />Criar primeiro projeto
              </Link>
            </div>
          ) : (
            recentProjects.map((project: Record<string, unknown>) => {
              const client = project.client as Record<string, string> | null;
              return (
                <Link key={project.id as string} href={`/admin/projects/${project.id}`}
                  className="flex items-center justify-between p-4 transition-all hover:bg-white/[0.02] group">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent text-sm font-bold transition-all group-hover:bg-accent/15 group-hover:shadow-[0_0_15px_rgba(196,168,130,0.1)]">
                      {(project.title as string)?.[0]}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-white group-hover:text-accent transition-colors">{project.title as string}</p>
                      <p className="text-[11px] text-[#555] mt-0.5">{client?.company || "—"} · {formatDate(project.updated_at as string)}</p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold px-3 py-1 rounded-lg ring-1 ${getStatusColor(project.status as string)}`}>
                    {getStatusLabel(project.status as string)}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
