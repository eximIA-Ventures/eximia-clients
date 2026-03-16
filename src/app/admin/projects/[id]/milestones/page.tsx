"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Check,
  X,
  Pencil,
  Milestone as MilestoneIcon,
} from "lucide-react";

const inputCls =
  "flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-[#555] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent/40";

const selectCls =
  "flex h-9 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent/40 appearance-none cursor-pointer";

const statusOptions = [
  { value: "pending", label: "Pendente" },
  { value: "in_progress", label: "Em Progresso" },
  { value: "completed", label: "Concluido" },
];

const statusColors: Record<string, string> = {
  pending: "bg-white/[0.06] text-[#a0a0a0]",
  in_progress: "bg-[#2a6ab0]/10 text-[#4a8ad0]",
  completed: "bg-[#4b9560]/10 text-[#4b9560]",
};

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  sort_order: number;
}

export default function ManageMilestonesPage() {
  const { id } = useParams<{ id: string }>();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    due_date: "",
    status: "pending",
  });
  const [showNewForm, setShowNewForm] = useState(false);
  const [newForm, setNewForm] = useState({
    title: "",
    description: "",
    due_date: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchMilestones = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}/milestones`);
      if (!res.ok) throw new Error("Erro ao carregar milestones");
      const { milestones: data } = await res.json();
      setMilestones(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  function startEdit(ms: Milestone) {
    setEditingId(ms.id);
    setEditForm({
      title: ms.title,
      description: ms.description || "",
      due_date: ms.due_date || "",
      status: ms.status,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ title: "", description: "", due_date: "", status: "pending" });
  }

  async function saveEdit(milestoneId: string) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${id}/milestones`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestone_id: milestoneId,
          title: editForm.title,
          description: editForm.description || null,
          due_date: editForm.due_date || null,
          status: editForm.status,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      await fetchMilestones();
      cancelEdit();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(milestoneId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/projects/${id}/milestones`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestone_id: milestoneId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar status");
      await fetchMilestones();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar");
    }
  }

  async function addMilestone(e: React.FormEvent) {
    e.preventDefault();
    if (!newForm.title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${id}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newForm.title,
          description: newForm.description || null,
          due_date: newForm.due_date || null,
        }),
      });
      if (!res.ok) throw new Error("Erro ao criar milestone");
      await fetchMilestones();
      setNewForm({ title: "", description: "", due_date: "" });
      setShowNewForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setSaving(false);
    }
  }

  async function deleteMilestone(milestoneId: string) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        `/api/projects/${id}/milestones?milestone_id=${milestoneId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Erro ao excluir milestone");
      await fetchMilestones();
      setDeleteConfirm(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao excluir");
    } finally {
      setSaving(false);
    }
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
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
              Gerenciar
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white font-serif">
              Milestones
            </h1>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <Plus size={16} />
            Novo Milestone
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-6">
          {error}
        </div>
      )}

      <div className="max-w-3xl space-y-3">
        {milestones.length === 0 && !showNewForm && (
          <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] p-10 text-center">
            <MilestoneIcon className="w-10 h-10 text-[#333] mx-auto mb-3" />
            <p className="text-sm text-[#666]">
              Nenhum milestone definido para este projeto.
            </p>
            <button
              onClick={() => setShowNewForm(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <Plus size={16} />
              Criar Primeiro Milestone
            </button>
          </div>
        )}

        {milestones.map((ms, index) => (
          <div
            key={ms.id}
            className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] p-5"
          >
            {editingId === ms.id ? (
              /* Edit Mode */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#999]">
                      Titulo *
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, title: e.target.value }))
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#999]">
                      Data Limite
                    </label>
                    <input
                      type="date"
                      value={editForm.due_date}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, due_date: e.target.value }))
                      }
                      className={`${inputCls} [color-scheme:dark]`}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#999]">
                    Descricao
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    rows={2}
                    className={`${inputCls} h-auto py-3 resize-none`}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#999]">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, status: e.target.value }))
                    }
                    className={selectCls}
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelEdit}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-[#999] hover:text-white hover:border-white/[0.15] transition-all"
                  >
                    <X size={14} />
                    Cancelar
                  </button>
                  <button
                    onClick={() => saveEdit(ms.id)}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="flex items-start gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-xs font-semibold text-[#666]">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-white truncate">
                      {ms.title}
                    </p>
                    {ms.due_date && (
                      <span className="shrink-0 text-xs text-[#666]">
                        {new Date(ms.due_date).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                  {ms.description && (
                    <p className="text-xs text-[#666] mt-1 line-clamp-2">
                      {ms.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={ms.status}
                    onChange={(e) => handleStatusChange(ms.id, e.target.value)}
                    className={`${selectCls} text-xs h-8 px-2.5 ${statusColors[ms.status] || ""}`}
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => startEdit(ms)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-white/[0.06] transition-all"
                  >
                    <Pencil size={14} />
                  </button>
                  {deleteConfirm === ms.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => deleteMilestone(ms.id)}
                        disabled={saving}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-white/[0.06] transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(ms.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* New Milestone Form */}
        {showNewForm && (
          <form
            onSubmit={addMilestone}
            className="rounded-2xl bg-white/[0.02] ring-1 ring-accent/20 p-5 space-y-4"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                <Plus size={14} className="text-accent" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                Novo Milestone
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#999]">
                  Titulo *
                </label>
                <input
                  type="text"
                  value={newForm.title}
                  onChange={(e) =>
                    setNewForm((p) => ({ ...p, title: e.target.value }))
                  }
                  required
                  placeholder="Ex: Entrega da fase 1"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#999]">
                  Data Limite
                </label>
                <input
                  type="date"
                  value={newForm.due_date}
                  onChange={(e) =>
                    setNewForm((p) => ({ ...p, due_date: e.target.value }))
                  }
                  className={`${inputCls} [color-scheme:dark]`}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#999]">
                Descricao
              </label>
              <textarea
                value={newForm.description}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={2}
                placeholder="Descricao do milestone..."
                className={`${inputCls} h-auto py-3 resize-none`}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowNewForm(false);
                  setNewForm({ title: "", description: "", due_date: "" });
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-[#999] hover:text-white hover:border-white/[0.15] transition-all"
              >
                <X size={14} />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                Adicionar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
