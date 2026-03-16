import { getServerUser } from "@/src/lib/server-auth";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { redirect } from "next/navigation";
import { Clock, CheckCircle2, FileText, Bell, ArrowRight, Target, Zap, FolderOpen, Sparkles, MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatDate, getStatusLabel, getStatusColor } from "@/src/lib/utils";
import { ProgressRing } from "@/src/components/progress-ring";
import { getClientProject } from "@/src/lib/get-client-project";

export default async function PortalDashboard({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const project = await getClientProject(user.id, user.role, sp.project) as Record<string, unknown> | null;
  const supabase = createAdminClient();

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in-up">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10 mx-auto mb-6 animate-float">
            <Target className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Nenhum projeto ativo</h1>
          <p className="text-sm text-[#666] max-w-sm">Seu projeto aparecerá aqui assim que for criado.</p>
        </div>
      </div>
    );
  }

  const [milestonesRes, updatesRes, documentsRes, welcomeDocRes] = await Promise.all([
    supabase.from("milestones").select("*").eq("project_id", project.id).order("sort_order"),
    supabase.from("updates").select("*").eq("project_id", project.id).order("created_at", { ascending: false }).limit(3),
    supabase.from("documents").select("*").eq("project_id", project.id).order("uploaded_at", { ascending: false }).limit(3),
    supabase.from("welcome_docs").select("id").eq("project_id", project.id).maybeSingle(),
  ]);

  const milestones = milestonesRes.data || [];
  const updates = updatesRes.data || [];
  const documents = documentsRes.data || [];
  const hasWelcomeDoc = !!welcomeDocRes.data;
  const completedMilestones = milestones.filter((m) => m.status === "completed").length;
  const progress = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;
  const nextMilestone = milestones.find((m) => m.status !== "completed");

  return (
    <div className="relative">
      {/* Ambient mesh background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-accent/[0.03] rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-[#7C9E8F]/[0.02] rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: "url(/noise.svg)", backgroundRepeat: "repeat" }} />
      </div>

      {/* Hero Banner */}
      <section className="relative -mx-8 -mt-8 overflow-hidden mb-8">
        <div className="absolute inset-0 bg-cover bg-center scale-105 blur-[2px]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&q=80')" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.85) 35%, rgba(10,10,10,0.3) 65%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

        <div className="relative z-10 px-8 pt-20 pb-12 flex items-end justify-between min-h-[280px]">
          <div className="max-w-lg">
            <p className="text-accent text-sm font-medium tracking-wide">Olá, {user.name?.split(" ")[0]}</p>
            <h1 className="mt-3 text-5xl font-bold text-white tracking-tight leading-[1.05] font-serif">
              {project.title as string}
            </h1>
            {project.description ? (
              <p className="mt-4 text-[#999] text-[15px] leading-relaxed max-w-md">{(project.description as string).slice(0, 120)}...</p>
            ) : null}
          </div>

          <div className="flex items-center gap-10">
            <ProgressRing progress={progress} size={90} strokeWidth={5} />
            <div className="flex flex-col gap-4">
              {[
                { value: milestones.length, label: "Milestones" },
                { value: documents.length, label: "Documentos" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-white tabular-nums">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#666]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Next milestone — glassmorphic banner */}
      {nextMilestone && (
        <div className="glass rounded-2xl p-5 mb-8 flex items-center gap-4 animate-fade-in-up">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 animate-glow-pulse">
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-[#666] uppercase tracking-wider">Próximo milestone</p>
            <p className="text-sm font-semibold text-white mt-0.5">{nextMilestone.title}</p>
          </div>
          {nextMilestone.due_date && (
            <span className="text-xs text-[#555] bg-white/[0.04] px-3 py-1.5 rounded-full">{formatDate(nextMilestone.due_date)}</span>
          )}
        </div>
      )}

      {/* Quick Access — Gradient Cards with hover glow */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {[
          { href: "/portal/welcome", label: "Welcome", desc: "Documento de boas-vindas", icon: Sparkles, from: "#C4A882", to: "#8B7355", show: hasWelcomeDoc },
          { href: "/portal/timeline", label: "Timeline", desc: `${milestones.length} milestones`, icon: Clock, from: "#4b9560", to: "#2a5a35", show: true },
          { href: "/portal/documents", label: "Documentos", desc: `${documents.length} disponíveis`, icon: FolderOpen, from: "#2a6ab0", to: "#1a4a8a", show: true },
          { href: "/portal/updates", label: "Atualizações", desc: `${updates.length} recentes`, icon: MessageSquare, from: "#7c5cbf", to: "#5a3a9f", show: true },
        ].filter(c => c.show).map((card, i) => (
          <Link key={card.href} href={card.href}
            className={`group relative rounded-2xl overflow-hidden ring-1 ring-white/[0.06] transition-all duration-300 hover:-translate-y-1.5 hover:ring-white/[0.15] hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] animate-fade-in-up stagger-${i + 1}`}>
            {/* Gradient background */}
            <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${card.from}, ${card.to})` }} />
            <div className="absolute inset-0 bg-[#0f0f0f]/60" />
            {/* Glow orb on hover */}
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

      <div className="grid grid-cols-3 gap-6">
        {/* Timeline — with better visual hierarchy */}
        <div className="col-span-2 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] animate-fade-in-up">
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <h2 className="text-base font-semibold text-white font-serif">Timeline</h2>
            <Link href="/portal/timeline" className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover transition-colors">
              Ver completa <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-5 space-y-4">
            {milestones.slice(0, 5).map((ms, i) => (
              <div key={ms.id} className="flex items-center gap-4 group">
                {ms.status === "completed" ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4b9560]/15">
                    <CheckCircle2 className="w-[18px] h-[18px] text-[#4b9560]" />
                  </div>
                ) : ms.status === "in_progress" ? (
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-accent/15">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                    <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" style={{ animationDuration: "2s" }} />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.04]">
                    <div className="w-2 h-2 rounded-full bg-[#333]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium ${ms.status === "completed" ? "text-[#555] line-through" : "text-white"}`}>
                    {ms.title}
                  </span>
                </div>
                {ms.due_date && (
                  <span className="text-[11px] text-[#444] tabular-nums">{formatDate(ms.due_date)}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar — Updates + Docs */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] animate-fade-in-up stagger-2">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2a6ab0]/15">
                  <Bell className="w-3.5 h-3.5 text-[#4a8ad0]" />
                </div>
                Atualizações
              </h3>
              <Link href="/portal/updates" className="text-[11px] font-medium text-accent hover:text-accent-hover transition-colors">Ver todas</Link>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {updates.length === 0 ? (
                <p className="p-5 text-xs text-[#444] text-center">Nenhuma atualização</p>
              ) : updates.map((u) => (
                <div key={u.id} className="p-4 transition-colors hover:bg-white/[0.02]">
                  <p className="text-[13px] font-medium text-white">{u.title}</p>
                  <p className="text-[11px] text-[#666] mt-1.5 line-clamp-2 leading-relaxed">{u.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] animate-fade-in-up stagger-3">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/15">
                  <FileText className="w-3.5 h-3.5 text-accent" />
                </div>
                Documentos
              </h3>
              <Link href="/portal/documents" className="text-[11px] font-medium text-accent hover:text-accent-hover transition-colors">Ver todos</Link>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {documents.length === 0 ? (
                <p className="p-5 text-xs text-[#444] text-center">Nenhum documento</p>
              ) : documents.map((d) => (
                <a key={d.id} href={d.file_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 transition-all hover:bg-white/[0.02] group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 transition-all group-hover:bg-accent/20 group-hover:shadow-[0_0_15px_rgba(196,168,130,0.15)]">
                    <FileText className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-[13px] font-medium text-white truncate group-hover:text-accent transition-colors">{d.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
