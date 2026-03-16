import { createAdminClient } from "@/src/lib/supabase/admin";
import Link from "next/link";
import { Plus, Building2, Mail, Phone, FolderKanban, ArrowRight, Users } from "lucide-react";
import { formatDate } from "@/src/lib/utils";

export default async function ClientsPage() {
  const supabase = createAdminClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*, projects:projects(id, status)")
    .order("created_at", { ascending: false });

  const totalActive = clients?.reduce((acc, c) => {
    const projects = c.projects as Array<{ status: string }>;
    return acc + projects.filter(p => p.status === "in_progress").length;
  }, 0) || 0;

  return (
    <div>
      {/* Hero */}
      <section className="relative -mx-8 -mt-8 overflow-hidden mb-10">
        <div className="absolute inset-0 bg-cover bg-center scale-105 blur-[2px]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80')" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.85) 35%, rgba(10,10,10,0.3) 65%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

        <div className="relative z-10 px-8 pt-20 pb-10 min-h-[240px] flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Gerenciamento</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white font-serif">Clientes</h1>
            <p className="mt-3 text-[#888] text-sm max-w-md">
              {clients?.length || 0} clientes cadastrados · {totalActive} projetos ativos
            </p>
          </div>
          <Link href="/admin/clients/new"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 hover:shadow-[0_0_30px_rgba(196,168,130,0.2)] active:scale-[0.98]">
            <Plus className="w-4 h-4" />Novo Cliente
          </Link>
        </div>
      </section>

      {!clients || clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 animate-float">
            <Users size={28} className="text-accent/50" />
          </div>
          <p className="mt-5 text-sm font-medium text-[#999]">Nenhum cliente cadastrado</p>
          <p className="mt-1 text-xs text-[#555]">Cadastre seu primeiro cliente para começar</p>
          <Link href="/admin/clients/new"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98]">
            <Plus className="w-4 h-4" />Cadastrar Cliente
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {clients.map((client) => {
            const projects = client.projects as Array<{ id: string; status: string }>;
            const activeCount = projects.filter(p => p.status === "in_progress").length;
            const completedCount = projects.filter(p => p.status === "completed").length;

            return (
              <Link key={client.id} href={`/admin/clients/${client.id}`}>
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/[0.04] via-[#1e1e1e] to-[#1e1e1e] ring-1 ring-white/[0.06] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:ring-accent/25 hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {client.logo_url ? (
                        <img src={client.logo_url} alt="" className="w-11 h-11 rounded-xl object-contain bg-white/[0.04] p-1" />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent text-lg font-bold">
                          {client.company[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white group-hover:text-accent transition-colors truncate">
                          {client.company}
                        </h3>
                        <p className="text-[11px] text-[#666] mt-0.5">{client.name}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="shrink-0 text-[#333] group-hover:text-accent transition-colors mt-1" />
                  </div>

                  {/* Contact info */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-[#666]">
                      <Mail size={11} />{client.email}
                    </span>
                    {client.phone && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-[#666]">
                        <Phone size={11} />{client.phone}
                      </span>
                    )}
                  </div>

                  {/* Meta pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-[#999] ring-1 ring-white/[0.06]">
                      <FolderKanban size={10} />
                      {projects.length} projetos
                    </span>
                    {activeCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-[#2a6ab0]/10 px-2.5 py-1 text-[10px] font-medium text-[#4a8ad0] ring-1 ring-[#2a6ab0]/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#4a8ad0]" />
                        {activeCount} ativo{activeCount > 1 ? "s" : ""}
                      </span>
                    )}
                    {completedCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-[#4b9560]/10 px-2.5 py-1 text-[10px] font-medium text-[#4b9560] ring-1 ring-[#4b9560]/20">
                        {completedCount} concluído{completedCount > 1 ? "s" : ""}
                      </span>
                    )}
                    {client.brand_color && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full ring-1 ring-white/10" style={{ backgroundColor: client.brand_color }} />
                      </div>
                    )}
                  </div>

                  {/* Hover glow */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
