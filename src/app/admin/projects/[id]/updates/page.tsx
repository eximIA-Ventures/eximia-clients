"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Send,
  Info,
  Flag,
  Package,
  AlertTriangle,
} from "lucide-react";

const inputCls =
  "flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-[#555] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent/40";

const selectCls =
  "flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent/40 appearance-none cursor-pointer";

const typeOptions = [
  { value: "info", label: "Informacao", color: "bg-[#2a6ab0]/10 text-[#4a8ad0] ring-[#2a6ab0]/20", icon: Info },
  { value: "milestone", label: "Milestone", color: "bg-accent/10 text-accent ring-accent/20", icon: Flag },
  { value: "deliverable", label: "Entregavel", color: "bg-[#4b9560]/10 text-[#4b9560] ring-[#4b9560]/20", icon: Package },
  { value: "alert", label: "Alerta", color: "bg-red-500/10 text-red-400 ring-red-500/20", icon: AlertTriangle },
];

interface Update {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string;
}

export default function ManageUpdatesPage() {
  const { id } = useParams<{ id: string }>();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "info",
  });

  const fetchUpdates = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}/updates`);
      if (!res.ok) throw new Error("Erro ao carregar atualizacoes");
      const { updates: data } = await res.json();
      setUpdates(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${id}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro ao criar atualizacao");
      await fetchUpdates();
      setForm({ title: "", content: "", type: "info" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setSending(false);
    }
  }

  function getTypeConfig(type: string) {
    return typeOptions.find((t) => t.value === type) || typeOptions[0];
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <section className="relative -mx-8 -mt-8 overflow-hidden mb-10">
        <div className="absolute inset-0">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/[0.06] blur-3xl" />
          <div className="absolute -left-8 bottom-0 h-40 w-40 rounded-full bg-[#2a6ab0]/[0.04] blur-2xl" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

        <div className="relative z-10 px-8 pt-16 pb-10 flex items-center gap-5">
          <Link
            href={`/admin/projects/${id}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-[#888] hover:bg-white/[0.1] hover:text-white transition-all"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
              Gerenciar
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white font-serif">
              Atualizacoes
            </h1>
          </div>
        </div>
      </section>

      <div className="max-w-3xl space-y-8">
        {/* Create Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] p-6 space-y-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Plus size={14} className="text-accent" />
            </div>
            <h2 className="text-sm font-semibold text-white">
              Nova Atualizacao
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-[#999]">
                Titulo *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                required
                placeholder="Titulo da atualizacao"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#999]">
                Tipo
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((p) => ({ ...p, type: e.target.value }))
                }
                className={selectCls}
              >
                {typeOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#999]">
              Conteudo *
            </label>
            <textarea
              value={form.content}
              onChange={(e) =>
                setForm((p) => ({ ...p, content: e.target.value }))
              }
              required
              rows={4}
              placeholder="Descreva a atualizacao..."
              className={`${inputCls} h-auto py-3 resize-none`}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 hover:shadow-[0_0_30px_rgba(196,168,130,0.2)] active:scale-[0.98] disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Publicar
            </button>
          </div>
        </form>

        {/* Updates List */}
        <div>
          <h2 className="text-sm font-semibold text-[#999] uppercase tracking-wider mb-4">
            Historico ({updates.length})
          </h2>

          {updates.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] p-10 text-center">
              <Info className="w-10 h-10 text-[#333] mx-auto mb-3" />
              <p className="text-sm text-[#666]">
                Nenhuma atualizacao publicada.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {updates.map((u) => {
                const typeConf = getTypeConfig(u.type);
                const Icon = typeConf.icon;
                return (
                  <div
                    key={u.id}
                    className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${typeConf.color}`}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-medium text-white">
                            {u.title}
                          </p>
                          <span
                            className={`shrink-0 inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-semibold ring-1 ${typeConf.color}`}
                          >
                            {typeConf.label}
                          </span>
                        </div>
                        <p className="text-xs text-[#888] mt-2 whitespace-pre-wrap leading-relaxed">
                          {u.content}
                        </p>
                        <p className="text-[11px] text-[#555] mt-3">
                          {new Date(u.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
