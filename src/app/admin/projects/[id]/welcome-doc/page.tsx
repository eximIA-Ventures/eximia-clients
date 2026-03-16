"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, Trash2, Eye, Download } from "lucide-react";
import Link from "next/link";
import type { WelcomeStep, CommunicationChannel, TeamMember } from "@/src/lib/types";

export default function WelcomeDocPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [existingId, setExistingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    hero_title: "Bem-vindo ao seu projeto",
    hero_subtitle: "Estamos prontos para transformar sua visão em realidade.",
    overview: "",
  });

  const [steps, setSteps] = useState<WelcomeStep[]>([
    { order: 1, title: "Kickoff Meeting", description: "Reunião inicial para alinhar expectativas e definir escopo detalhado." },
    { order: 2, title: "Planejamento", description: "Definição de cronograma, milestones e entregáveis." },
    { order: 3, title: "Execução", description: "Desenvolvimento iterativo com atualizações regulares no portal." },
    { order: 4, title: "Entrega & Revisão", description: "Entrega final com ciclo de revisão e aprovação." },
  ]);

  const [channels, setChannels] = useState<CommunicationChannel[]>([
    { type: "Portal", value: "", label: "Acompanhe tudo pelo Client Portal" },
    { type: "Email", value: "", label: "Para comunicações formais" },
    { type: "WhatsApp", value: "", label: "Para comunicações rápidas" },
  ]);

  const [team, setTeam] = useState<TeamMember[]>([
    { name: "Hugo Capitelli", role: "Project Lead" },
  ]);

  const [portalAccess, setPortalAccess] = useState({ url: "", email: "", password: "" });

  useEffect(() => {
    fetch(`/api/projects/${projectId}/welcome-doc`)
      .then((r) => r.json())
      .then((data) => {
        if (data.welcome_doc) {
          const wd = data.welcome_doc;
          setExistingId(wd.id);
          setForm({
            hero_title: wd.hero_title,
            hero_subtitle: wd.hero_subtitle,
            overview: wd.overview,
          });
          if (wd.what_happens_next?.length) setSteps(wd.what_happens_next);
          if (wd.communication?.length) setChannels(wd.communication);
          if (wd.team_members?.length) setTeam(wd.team_members);
          if (wd.portal_access) setPortalAccess(wd.portal_access);
        }
      })
      .catch(() => {});
  }, [projectId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = {
      ...form,
      what_happens_next: steps,
      communication: channels,
      team_members: team,
      portal_access: portalAccess.url ? portalAccess : undefined,
    };

    try {
      const method = existingId ? "PUT" : "POST";
      const res = await fetch(`/api/projects/${projectId}/welcome-doc`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar");
      }

      const data = await res.json();
      setExistingId(data.welcome_doc.id);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/admin/projects/${projectId}`}
          className="p-2 rounded-lg text-dim hover:text-cream hover:bg-elevated transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold text-cream">
            Welcome Document
          </h1>
          <p className="text-sm text-dim mt-1">
            {existingId ? "Editando documento existente" : "Criar novo documento de boas-vindas"}
          </p>
        </div>
        {existingId && (
          <div className="flex items-center gap-2">
            <a
              href={`/api/welcome-doc/${existingId}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-white/[0.1] hover:border-accent/40 hover:bg-accent/10 text-white text-sm font-medium rounded-xl transition-all"
            >
              <Eye className="w-4 h-4" />
              Visualizar PDF
            </a>
            <a
              href={`/api/welcome-doc/${existingId}/pdf`}
              download={`welcome-doc-${existingId}.pdf`}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-[#0a0a0a] text-sm font-semibold rounded-xl transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              Baixar PDF
            </a>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="max-w-3xl space-y-4">
        {/* Hero Section */}
        <div className="rounded-xl border border-edge bg-surface p-6 space-y-4">
          <h2 className="text-sm font-semibold text-cream-dim uppercase tracking-wider">
            Hero
          </h2>
          <div>
            <label className="block text-sm font-medium text-cream/80 mb-1.5">
              Título Principal
            </label>
            <input
              type="text"
              value={form.hero_title}
              onChange={(e) => setForm((p) => ({ ...p, hero_title: e.target.value }))}
              className="w-full px-3 py-2.5 bg-elevated border border-edge rounded-lg text-cream text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cream/80 mb-1.5">
              Subtítulo
            </label>
            <input
              type="text"
              value={form.hero_subtitle}
              onChange={(e) => setForm((p) => ({ ...p, hero_subtitle: e.target.value }))}
              className="w-full px-3 py-2.5 bg-elevated border border-edge rounded-lg text-cream text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
            />
          </div>
        </div>

        {/* Overview */}
        <div className="rounded-xl border border-edge bg-surface p-6 space-y-4">
          <h2 className="text-sm font-semibold text-cream-dim uppercase tracking-wider">
            Visão Geral do Projeto
          </h2>
          <textarea
            value={form.overview}
            onChange={(e) => setForm((p) => ({ ...p, overview: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2.5 bg-elevated border border-edge rounded-lg text-cream text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors resize-none"
            placeholder="Descreva o projeto, seus objetivos e o valor que será entregue..."
          />
        </div>

        {/* What Happens Next */}
        <div className="rounded-xl border border-edge bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-cream-dim uppercase tracking-wider">
              What Happens Next
            </h2>
            <button
              type="button"
              onClick={() =>
                setSteps((p) => [...p, { order: p.length + 1, title: "", description: "" }])
              }
              className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="mt-3 w-6 h-6 rounded-full bg-accent/10 text-accent text-xs flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => {
                    const updated = [...steps];
                    updated[i] = { ...step, title: e.target.value };
                    setSteps(updated);
                  }}
                  placeholder="Título do passo"
                  className="w-full px-3 py-2 bg-elevated border border-edge rounded-lg text-cream text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
                />
                <input
                  type="text"
                  value={step.description}
                  onChange={(e) => {
                    const updated = [...steps];
                    updated[i] = { ...step, description: e.target.value };
                    setSteps(updated);
                  }}
                  placeholder="Descrição"
                  className="w-full px-3 py-2 bg-elevated border border-edge rounded-lg text-cream text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
                />
              </div>
              {steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSteps((p) => p.filter((_, idx) => idx !== i))}
                  className="mt-2 p-1 text-dim hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Communication */}
        <div className="rounded-xl border border-edge bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-cream-dim uppercase tracking-wider">
              Canais de Comunicação
            </h2>
            <button
              type="button"
              onClick={() => setChannels((p) => [...p, { type: "", value: "", label: "" }])}
              className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>
          {channels.map((ch, i) => (
            <div key={i} className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={ch.type}
                onChange={(e) => {
                  const updated = [...channels];
                  updated[i] = { ...ch, type: e.target.value };
                  setChannels(updated);
                }}
                placeholder="Tipo (ex: Email)"
                className="px-3 py-2 bg-elevated border border-edge rounded-lg text-cream text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
              />
              <input
                type="text"
                value={ch.value}
                onChange={(e) => {
                  const updated = [...channels];
                  updated[i] = { ...ch, value: e.target.value };
                  setChannels(updated);
                }}
                placeholder="Contato"
                className="px-3 py-2 bg-elevated border border-edge rounded-lg text-cream text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
              />
              <input
                type="text"
                value={ch.label}
                onChange={(e) => {
                  const updated = [...channels];
                  updated[i] = { ...ch, label: e.target.value };
                  setChannels(updated);
                }}
                placeholder="Descrição"
                className="px-3 py-2 bg-elevated border border-edge rounded-lg text-cream text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
              />
            </div>
          ))}
        </div>

        {/* Team */}
        <div className="rounded-xl border border-edge bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-cream-dim uppercase tracking-wider">
              Equipe
            </h2>
            <button
              type="button"
              onClick={() => setTeam((p) => [...p, { name: "", role: "" }])}
              className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>
          {team.map((member, i) => (
            <div key={i} className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={member.name}
                onChange={(e) => {
                  const updated = [...team];
                  updated[i] = { ...member, name: e.target.value };
                  setTeam(updated);
                }}
                placeholder="Nome"
                className="px-3 py-2 bg-elevated border border-edge rounded-lg text-cream text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
              />
              <input
                type="text"
                value={member.role}
                onChange={(e) => {
                  const updated = [...team];
                  updated[i] = { ...member, role: e.target.value };
                  setTeam(updated);
                }}
                placeholder="Papel"
                className="px-3 py-2 bg-elevated border border-edge rounded-lg text-cream text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
              />
            </div>
          ))}
        </div>

        {/* Portal Access */}
        <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-6 space-y-4">
          <h2 className="text-sm font-semibold text-accent uppercase tracking-wider">
            Acesso ao Portal
          </h2>
          <p className="text-[11px] text-[#666]">
            Essas credenciais aparecerão no Welcome Document e no PDF
          </p>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#999]">URL do Portal</label>
            <input type="text" value={portalAccess.url}
              onChange={(e) => setPortalAccess(p => ({ ...p, url: e.target.value }))}
              placeholder="https://clients.eximiaventures.com.br"
              className="px-3 py-2 w-full bg-elevated border border-edge rounded-lg text-cream text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#999]">Login (Email)</label>
              <input type="text" value={portalAccess.email}
                onChange={(e) => setPortalAccess(p => ({ ...p, email: e.target.value }))}
                placeholder="cliente@empresa.com"
                className="px-3 py-2 w-full bg-elevated border border-edge rounded-lg text-cream text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#999]">Senha</label>
              <input type="text" value={portalAccess.password}
                onChange={(e) => setPortalAccess(p => ({ ...p, password: e.target.value }))}
                placeholder="senha-do-cliente"
                className="px-3 py-2 w-full bg-elevated border border-edge rounded-lg text-cream text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors" />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-surface text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {existingId ? "Salvar Alterações" : "Criar Welcome Doc"}
          </button>
        </div>
      </form>
    </div>
  );
}
