import { createAdminClient } from "@/src/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, FolderKanban, Plus, Mail, Phone, Globe, Calendar, ArrowRight, CheckCircle2, Clock, Pencil } from "lucide-react";
import { formatDate, getStatusLabel, getStatusColor } from "@/src/lib/utils";
import { ProgressRing } from "@/src/components/progress-ring";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single();
  if (!client) notFound();

  const { data: projects } = await supabase
    .from("projects")
    .select("*, milestones:milestones(id, status)")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  return (
    <div>
      {/* Hero */}
      <section className="relative -mx-8 -mt-8 overflow-hidden mb-10">
        <div className="absolute inset-0 bg-cover bg-center scale-105 blur-[2px]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80')" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.85) 35%, rgba(10,10,10,0.3) 65%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

        <div className="relative z-10 px-8 pt-16 pb-10 min-h-[240px] flex items-end justify-between">
          <div className="flex items-center gap-5">
            <Link href="/admin/clients" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-[#888] hover:bg-white/[0.1] hover:text-white transition-all">
              <ArrowLeft size={16} />
            </Link>
            <div className="flex items-center gap-4">
              {client.logo_url ? (
                <img src={client.logo_url} alt="" className="w-14 h-14 rounded-2xl object-contain bg-white/[0.06] p-2" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent text-2xl font-bold">
                  {client.company[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white font-serif">{client.company}</h1>
                <p className="text-sm text-[#888] mt-1">{client.name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/admin/clients/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm font-medium text-white transition-all hover:border-accent/40 hover:bg-accent/10">
              <Pencil className="w-4 h-4" />Editar
            </Link>
            <Link href={`/admin/projects/new?client_id=${id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98]">
              <Plus className="w-4 h-4" />Novo Projeto
            </Link>
          </div>
        </div>
      </section>

      {/* Contact info card */}
      <div className="glass rounded-2xl p-5 mb-8 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-[#999]"><Mail size={14} className="text-accent" />{client.email}</div>
        {client.phone && <div className="flex items-center gap-2 text-sm text-[#999]"><Phone size={14} className="text-accent" />{client.phone}</div>}
        {client.brand_color && (
          <div className="flex items-center gap-2 text-sm text-[#999]">
            <div className="w-4 h-4 rounded-full ring-1 ring-white/10" style={{ backgroundColor: client.brand_color }} />
            <span className="font-mono text-xs">{client.brand_color}</span>
          </div>
        )}
        <div className="ml-auto flex items-center gap-2 text-xs text-[#666]">
          <Calendar size={12} />Cliente desde {formatDate(client.created_at)}
        </div>
      </div>

      {/* Projects grid */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-white font-serif flex items-center gap-2">
          <FolderKanban size={18} className="text-accent" />Projetos
        </h2>
        <span className="text-xs text-[#666]">{projects?.length || 0} projetos</span>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
            <FolderKanban size={24} className="text-accent/50" />
          </div>
          <p className="mt-4 text-sm text-[#888]">Nenhum projeto para este cliente</p>
          <Link href={`/admin/projects/new?client_id=${id}`}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/[0.1] px-4 py-2 text-sm font-medium text-white transition-all hover:border-accent/40 hover:bg-accent/10">
            <Plus size={14} />Criar Projeto
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => {
            const milestones = project.milestones as Array<{ id: string; status: string }>;
            const completed = milestones.filter(m => m.status === "completed").length;
            const progress = milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;

            return (
              <Link key={project.id} href={`/admin/projects/${project.id}`}>
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a6ab0]/[0.04] via-[#1e1e1e] to-[#1e1e1e] ring-1 ring-white/[0.06] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:ring-[#2a6ab0]/25 hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-semibold ring-1 ${getStatusColor(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-[#4a8ad0] transition-colors truncate">
                        {project.title}
                      </h3>
                    </div>
                    <ProgressRing progress={progress} size={48} strokeWidth={3} />
                  </div>

                  {project.description && (
                    <p className="text-[11px] text-[#666] line-clamp-2 mb-3">{project.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-[#999] ring-1 ring-white/[0.06]">
                      <CheckCircle2 size={10} />{completed}/{milestones.length} milestones
                    </span>
                    {project.start_date && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-[#999] ring-1 ring-white/[0.06]">
                        <Clock size={10} />{formatDate(project.start_date)}
                      </span>
                    )}
                  </div>

                  <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#2a6ab0]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
