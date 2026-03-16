"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Settings2 } from "lucide-react";
import Link from "next/link";

const inputCls =
  "flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-[#555] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent/40";

const selectCls =
  "flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent/40 appearance-none cursor-pointer";

const statuses = [
  { value: "planning", label: "Planejamento" },
  { value: "in_progress", label: "Em Progresso" },
  { value: "review", label: "Em Revisao" },
  { value: "completed", label: "Concluido" },
  { value: "on_hold", label: "Pausado" },
];

export default function EditProjectPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "planning",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error("Projeto nao encontrado");
        const { project } = await res.json();
        setForm({
          title: project.title || "",
          description: project.description || "",
          status: project.status || "planning",
          start_date: project.start_date || "",
          end_date: project.end_date || "",
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao carregar");
      } finally {
        setFetching(false);
      }
    }
    load();
  }, [id]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          status: form.status,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao atualizar projeto");
      }
      router.push(`/admin/projects/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setLoading(false);
    }
  }

  if (fetching) {
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
              Editar
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white font-serif">
              Editar Projeto
            </h1>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Project Info */}
        <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Settings2 size={14} className="text-accent" />
            </div>
            <h2 className="text-sm font-semibold text-white">
              Informacoes do Projeto
            </h2>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#999]">
              Titulo *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
              placeholder="Nome do projeto"
              className={inputCls}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#999]">
              Descricao
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Descreva o projeto..."
              rows={4}
              className={`${inputCls} h-auto py-3 resize-none`}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#999]">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              className={selectCls}
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#999]">
                Data de Inicio
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => update("start_date", e.target.value)}
                className={`${inputCls} [color-scheme:dark]`}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#999]">
                Data de Termino
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => update("end_date", e.target.value)}
                className={`${inputCls} [color-scheme:dark]`}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 hover:shadow-[0_0_30px_rgba(196,168,130,0.2)] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar Alteracoes
          </button>
        </div>
      </form>
    </div>
  );
}
