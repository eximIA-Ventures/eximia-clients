"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Client } from "@/src/lib/types";

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("client_id") || "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<Client[]>([]);

  const [form, setForm] = useState({
    client_id: preselectedClientId,
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  const [milestones, setMilestones] = useState([
    { title: "", description: "", due_date: "" },
  ]);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => setClients(data.clients || []));
  }, []);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateMilestone(index: number, field: string, value: string) {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  }

  function addMilestone() {
    setMilestones((prev) => [
      ...prev,
      { title: "", description: "", due_date: "" },
    ]);
  }

  function removeMilestone(index: number) {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          milestones: milestones.filter((m) => m.title),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar projeto");
      }

      const { project } = await res.json();
      router.push(`/admin/projects/${project.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/projects"
          className="p-2 rounded-lg text-dim hover:text-cream hover:bg-elevated transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold text-cream">
            Novo Projeto
          </h1>
          <p className="text-sm text-dim mt-1">
            Crie um novo projeto para um cliente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div className="rounded-xl border border-edge bg-surface p-6 space-y-6">
          <h2 className="text-sm font-semibold text-cream-dim uppercase tracking-wider">
            Detalhes do Projeto
          </h2>

          <div>
            <label className="block text-sm font-medium text-cream/80 mb-1.5">
              Cliente *
            </label>
            <select
              value={form.client_id}
              onChange={(e) => update("client_id", e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-elevated border border-edge rounded-lg text-cream text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
            >
              <option value="">Selecione um cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company} — {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-cream/80 mb-1.5">
              Título do Projeto *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-elevated border border-edge rounded-lg text-cream text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
              placeholder="Ex: Redesign do E-commerce"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cream/80 mb-1.5">
              Descrição
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 bg-elevated border border-edge rounded-lg text-cream text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors resize-none"
              placeholder="Descreva o projeto brevemente..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cream/80 mb-1.5">
                Data de Início
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => update("start_date", e.target.value)}
                className="w-full px-3 py-2.5 bg-elevated border border-edge rounded-lg text-cream text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cream/80 mb-1.5">
                Previsão de Entrega
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => update("end_date", e.target.value)}
                className="w-full px-3 py-2.5 bg-elevated border border-edge rounded-lg text-cream text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="rounded-xl border border-edge bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-cream-dim uppercase tracking-wider">
              Milestones
            </h2>
            <button
              type="button"
              onClick={addMilestone}
              className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>

          {milestones.map((ms, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="mt-3 text-xs text-dim w-5 text-center flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={ms.title}
                  onChange={(e) => updateMilestone(i, "title", e.target.value)}
                  placeholder="Título do milestone"
                  className="col-span-2 px-3 py-2 bg-elevated border border-edge rounded-lg text-cream text-sm placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
                />
                <input
                  type="date"
                  value={ms.due_date}
                  onChange={(e) =>
                    updateMilestone(i, "due_date", e.target.value)
                  }
                  className="px-3 py-2 bg-elevated border border-edge rounded-lg text-cream text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
                />
              </div>
              {milestones.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMilestone(i)}
                  className="mt-2 p-1 text-dim hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-surface text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Criar Projeto
          </button>
        </div>
      </form>
    </div>
  );
}
