import { getServerUser } from "@/src/lib/server-auth";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { redirect } from "next/navigation";
import { Sparkles, ArrowRight, MessageSquare, Users, Download, Monitor, Copy, ExternalLink } from "lucide-react";
import { getClientProject } from "@/src/lib/get-client-project";

export default async function WelcomePage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const project = await getClientProject(user.id, user.role, sp.project);
  if (!project) redirect("/portal");

  const supabase = createAdminClient();
  const { data: welcomeDoc } = await supabase.from("welcome_docs").select("*").eq("project_id", project.id).maybeSingle();

  if (!welcomeDoc) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-dim mx-auto mb-4" />
          <h1 className="text-xl font-serif text-cream mb-2">Welcome Document em preparação</h1>
          <p className="text-sm text-dim">O documento de boas-vindas será disponibilizado em breve.</p>
        </div>
      </div>
    );
  }

  const steps = (welcomeDoc.what_happens_next || []) as Array<{ title: string; description: string }>;
  const channels = (welcomeDoc.communication || []) as Array<{ type: string; value: string; label: string }>;
  const team = (welcomeDoc.team_members || []) as Array<{ name: string; role: string }>;
  const portalAccess = welcomeDoc.portal_access as { url: string; email: string; password: string } | null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12 pt-8">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-cream mb-4">{welcomeDoc.hero_title}</h1>
        <p className="text-lg text-cream-dim">{welcomeDoc.hero_subtitle}</p>

        <a
          href={`/api/welcome-doc/${welcomeDoc.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-accent text-[#0a0a0a] text-sm font-semibold transition-all hover:brightness-110 hover:shadow-[0_0_30px_rgba(196,168,130,0.2)] active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          Baixar PDF
        </a>
      </div>

      {welcomeDoc.overview && (
        <div className="rounded-xl border border-edge bg-surface p-8 mb-8">
          <h2 className="text-lg font-serif font-semibold text-cream mb-4">Visão Geral</h2>
          <p className="text-sm text-cream-dim leading-relaxed whitespace-pre-line">{welcomeDoc.overview}</p>
        </div>
      )}

      {steps.length > 0 && (
        <div className="rounded-xl border border-edge bg-surface p-8 mb-8">
          <h2 className="text-lg font-serif font-semibold text-cream mb-6 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-accent" />What Happens Next
          </h2>
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent text-sm font-semibold flex items-center justify-center flex-shrink-0">{i + 1}</div>
                <div>
                  <h3 className="text-sm font-semibold text-cream">{step.title}</h3>
                  <p className="text-sm text-cream-dim mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {channels.length > 0 && (
        <div className="rounded-xl border border-edge bg-surface p-8 mb-8">
          <h2 className="text-lg font-serif font-semibold text-cream mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-accent" />Comunicação
          </h2>
          <div className="grid gap-4">
            {channels.map((ch, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-elevated">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-accent">{ch.type.slice(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-cream">{ch.type}</p>
                  <p className="text-xs text-dim">{ch.label}</p>
                  {ch.value && <p className="text-xs text-cream-dim mt-0.5">{ch.value}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portal Access */}
      {portalAccess && (
        <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/[0.06] via-[#1e1e1e] to-[#1e1e1e] p-8 mb-8 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative">
            <h2 className="text-lg font-serif font-semibold text-cream mb-2 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-accent" />
              Acesso ao Portal do Cliente
            </h2>
            <p className="text-sm text-[#888] mb-6">Use as credenciais abaixo para acessar o portal e acompanhar seu projeto em tempo real.</p>

            <div className="space-y-4">
              {/* URL */}
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] mb-2">Link do Portal</p>
                <div className="flex items-center gap-3">
                  <a href={portalAccess.url} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium text-accent hover:text-accent-hover transition-colors flex items-center gap-1.5">
                    {portalAccess.url}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Email */}
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] mb-2">Login (Email)</p>
                  <p className="text-sm font-mono font-medium text-white">{portalAccess.email}</p>
                </div>

                {/* Password */}
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] mb-2">Senha</p>
                  <p className="text-sm font-mono font-medium text-white">{portalAccess.password}</p>
                </div>
              </div>
            </div>

            <a href={portalAccess.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-accent text-[#0a0a0a] text-sm font-semibold transition-all hover:brightness-110 hover:shadow-[0_0_30px_rgba(196,168,130,0.2)] active:scale-[0.98]">
              <ExternalLink className="w-4 h-4" />
              Acessar Portal
            </a>
          </div>
        </div>
      )}

      {team.length > 0 && (
        <div className="rounded-xl border border-edge bg-surface p-8 mb-8">
          <h2 className="text-lg font-serif font-semibold text-cream mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />Sua Equipe
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {team.map((member, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-elevated">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-accent">{member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-cream">{member.name}</p>
                  <p className="text-xs text-dim">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center py-8 border-t border-edge">
        <p className="text-sm text-dim">Powered by <span className="text-cream-dim font-medium">eximIA Ventures</span></p>
      </div>
    </div>
  );
}
