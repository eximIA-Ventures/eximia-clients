"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Package,
  Loader2,
  Trash2,
  Save,
  X,
  ChevronDown,
  ExternalLink,
  Pencil,
} from "lucide-react";
import { getStatusLabel, getStatusColor } from "@/src/lib/utils";

interface Milestone {
  id: string;
  title: string;
}

interface Deliverable {
  id: string;
  milestone_id: string;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "delivered" | "approved";
  file_url: string | null;
  created_at: string;
  milestone?: { id: string; title: string };
}

const inputCls =
  "flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-[#555] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent/40";
const selectCls =
  "flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent/40 appearance-none cursor-pointer";

const STATUSES = [
  { value: "pending", label: "Pendente" },
  { value: "in_progress", label: "Em Progresso" },
  { value: "delivered", label: "Entregue" },
  { value: "approved", label: "Aprovado" },
];

export default function DeliverablesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    milestone_id: "",
    title: "",
    description: "",
    status: "pending",
    file_url: "",
  });

  async function loadData() {
    try {
      const [delRes, msRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/deliverables`),
        fetch(`/api/projects/${projectId}/milestones`),
      ]);
      if (delRes.ok) {
        const { deliverables: data } = await delRes.json();
        setDeliverables(data || []);
      }
      if (msRes.ok) {
        const { milestones: data } = await msRes.json();
        setMilestones(data || []);
      }
    } catch {
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [projectId]);

  function resetForm() {
    setForm({ milestone_id: "", title: "", description: "", status: "pending", file_url: "" });
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function startEdit(d: Deliverable) {
    setForm({
      milestone_id: d.milestone_id,
      title: d.title,
      description: d.description || "",
      status: d.status,
      file_url: d.file_url || "",
    });
    setEditingId(d.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingId) {
        // Update
        const res = await fetch(`/api/projects/${projectId}/deliverables`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deliverable_id: editingId,
            title: form.title,
            description: form.description || null,
            status: form.status,
            file_url: form.file_url || null,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Erro ao atualizar");
        }
      } else {
        // Create
        const res = await fetch(`/api/projects/${projectId}/deliverables`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Erro ao criar");
        }
      }
      resetForm();
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este entregável?")) return;
    try {
      const res = await fetch(
        `/api/projects/${projectId}/deliverables?deliverable_id=${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao excluir");
      }
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    }
  }

  async function quickStatusChange(id: string, status: string) {
    try {
      const res = await fetch(`/api/projects/${projectId}/deliverables`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliverable_id: id, status }),
      });
      if (res.ok) await loadData();
    } catch {
      // silent fail for quick action
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  // Group deliverables by milestone
  const grouped = milestones.map((ms) => ({
    milestone: ms,
    items: deliverables.filter((d) => d.milestone_id === ms.id),
  }));

  return (
    <div>
      {/* Header */}
      <section className="relative -mx-8 -mt-8 overflow-hidden mb-10">
        <div className="absolute inset-0">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/[0.06] blur-3xl" />
          <div className="absolute -left-8 bottom-0 h-40 w-40 rounded-full bg-[#2a6ab0]/[0.04] blur-2xl" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

        <div className="relative z-10 px-8 pt-16 pb-10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link
              href={`/admin/projects/${projectId}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-[#888] hover:bg-white/[0.1] hover:text-white transition-all"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                Gerenciamento
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white font-serif">
                Entregáveis
              </h1>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 hover:shadow-[0_0_30px_rgba(196,168,130,0.2)] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Novo Entregável
          </button>
        </div>
      </section>

      {/* Form */}
      {showForm && (
        <div className="mb-8 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Package size={14} className="text-accent" />
              {editingId ? "Editar Entregável" : "Novo Entregável"}
            </h2>
            <button
              onClick={resetForm}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-[#888] hover:bg-white/[0.1] hover:text-white transition-all"
            >
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#999]">
                  Milestone *
                </label>
                <div className="relative">
                  <select
                    value={form.milestone_id}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, milestone_id: e.target.value }))
                    }
                    required
                    className={selectCls}
                  >
                    <option value="">Selecionar milestone</option>
                    {milestones.map((ms) => (
                      <option key={ms.id} value={ms.id}>
                        {ms.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#999]">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className={selectCls}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555] pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#999]">
                Título *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                required
                placeholder="Nome do entregável"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#999]">
                Descrição
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Descrição do entregável"
                rows={3}
                className="flex w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-[#555] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent/40 resize-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#999]">
                URL do Arquivo
              </label>
              <input
                type="url"
                value={form.file_url}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, file_url: e.target.value }))
                }
                placeholder="https://..."
                className={inputCls}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] px-4 py-2 text-sm font-medium text-[#999] transition-all hover:border-white/[0.2] hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingId ? "Salvar" : "Criar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Deliverables list grouped by milestone */}
      {milestones.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
            <Package size={24} className="text-accent/50" />
          </div>
          <p className="mt-4 text-sm text-[#888]">
            Crie milestones primeiro para adicionar entregáveis
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ milestone, items }) => (
            <div
              key={milestone.id}
              className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Package size={14} className="text-accent" />
                  {milestone.title}
                </h3>
                <span className="text-[11px] text-[#666]">
                  {items.length} entregáve{items.length === 1 ? "l" : "is"}
                </span>
              </div>

              {items.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-xs text-[#555]">
                    Nenhum entregável neste milestone
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {items.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white truncate">
                            {d.title}
                          </p>
                          {d.file_url && (
                            <a
                              href={d.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:text-accent-hover transition-colors"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                        {d.description && (
                          <p className="text-[11px] text-[#666] mt-0.5 line-clamp-1">
                            {d.description}
                          </p>
                        )}
                      </div>

                      {/* Status dropdown */}
                      <div className="relative">
                        <select
                          value={d.status}
                          onChange={(e) =>
                            quickStatusChange(d.id, e.target.value)
                          }
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ring-1 appearance-none cursor-pointer pr-6 bg-transparent ${getStatusColor(
                            d.status
                          )}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(d)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#666] hover:bg-white/[0.06] hover:text-white transition-all"
                          title="Editar"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#666] hover:bg-red-500/10 hover:text-red-400 transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
