"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Search,
  Edit3,
  Archive,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Shield,
  X,
  Loader2,
  Save,
} from "lucide-react";

interface Clause {
  id: string;
  clause_id: string;
  title: string;
  category: string;
  body: string;
  risk_level: string;
  applicable_to: string[];
  is_required: boolean;
  version: string;
  status: string;
}

const RISK_COLORS: Record<string, string> = {
  low: "bg-[#4b9560]/10 text-[#4b9560] ring-[#4b9560]/20",
  medium: "bg-accent/10 text-accent ring-accent/20",
  high: "bg-orange-500/10 text-orange-400 ring-orange-500/20",
  critical: "bg-red-500/10 text-red-400 ring-red-500/20",
};

const CATEGORY_LABELS: Record<string, string> = {
  escopo: "Escopo",
  prazo: "Prazo",
  pagamento: "Pagamento",
  confidencialidade: "Confidencialidade",
  pi: "Prop. Intelectual",
  lgpd: "LGPD",
  sla: "SLA",
  responsabilidade: "Responsabilidade",
  rescisao: "Rescisão",
  foro: "Foro",
  anticorrupcao: "Anticorrupção",
  forcamaior: "Força Maior",
};

const CATEGORIES = Object.keys(CATEGORY_LABELS);
const RISK_LEVELS = ["low", "medium", "high", "critical"];
const CONTRACT_TYPES = [
  "consultoria",
  "desenvolvimento",
  "saas",
  "suporte",
  "nda",
  "dpa",
];

export default function ClausesPage() {
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Clause>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newClause, setNewClause] = useState({
    clause_id: "",
    title: "",
    category: "escopo",
    body: "",
    risk_level: "medium",
    applicable_to: [] as string[],
    is_required: false,
  });

  useEffect(() => {
    fetchClauses();
  }, []);

  async function fetchClauses() {
    setLoading(true);
    try {
      const res = await fetch("/api/contracts/clauses");
      const data = await res.json();
      setClauses(data.clauses || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newClause.clause_id || !newClause.title || !newClause.body) return;
    setSaving(true);
    try {
      await fetch("/api/contracts/clauses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClause),
      });
      setShowCreateForm(false);
      setNewClause({
        clause_id: "",
        title: "",
        category: "escopo",
        body: "",
        risk_level: "medium",
        applicable_to: [],
        is_required: false,
      });
      fetchClauses();
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string) {
    setSaving(true);
    try {
      await fetch(`/api/contracts/clauses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      setEditingId(null);
      fetchClauses();
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(id: string) {
    if (!confirm("Arquivar esta cláusula?")) return;
    await fetch(`/api/contracts/clauses/${id}`, { method: "DELETE" });
    fetchClauses();
  }

  const filtered = clauses.filter((c) => {
    if (c.status === "archived") return false;
    if (filterCategory && c.category !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.clause_id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/contracts"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-[#666] transition-all hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
              Gestão Contratual
            </p>
            <h1 className="text-2xl font-bold text-white font-serif flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-accent" />
              Biblioteca de Cláusulas
            </h1>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98]"
        >
          {showCreateForm ? (
            <X className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {showCreateForm ? "Cancelar" : "Nova Cláusula"}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="rounded-2xl bg-accent/[0.04] ring-1 ring-accent/20 p-6 mb-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Nova Cláusula</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] text-[#777] mb-1">
                ID da Cláusula
              </label>
              <input
                value={newClause.clause_id}
                onChange={(e) =>
                  setNewClause((p) => ({ ...p, clause_id: e.target.value }))
                }
                placeholder="CL-EXEMPLO-001"
                className="w-full rounded-lg bg-[#1a1a1a] ring-1 ring-white/[0.08] px-3 py-2 text-xs text-white focus:ring-accent/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#777] mb-1">
                Título
              </label>
              <input
                value={newClause.title}
                onChange={(e) =>
                  setNewClause((p) => ({ ...p, title: e.target.value }))
                }
                className="w-full rounded-lg bg-[#1a1a1a] ring-1 ring-white/[0.08] px-3 py-2 text-xs text-white focus:ring-accent/40 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-[#777] mb-1">
                  Categoria
                </label>
                <select
                  value={newClause.category}
                  onChange={(e) =>
                    setNewClause((p) => ({ ...p, category: e.target.value }))
                  }
                  className="w-full rounded-lg bg-[#1a1a1a] ring-1 ring-white/[0.08] px-3 py-2 text-xs text-white focus:ring-accent/40 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-[#777] mb-1">
                  Risco
                </label>
                <select
                  value={newClause.risk_level}
                  onChange={(e) =>
                    setNewClause((p) => ({ ...p, risk_level: e.target.value }))
                  }
                  className="w-full rounded-lg bg-[#1a1a1a] ring-1 ring-white/[0.08] px-3 py-2 text-xs text-white focus:ring-accent/40 focus:outline-none"
                >
                  {RISK_LEVELS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#777] mb-1">
              Tipos Aplicáveis
            </label>
            <div className="flex flex-wrap gap-2">
              {CONTRACT_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    setNewClause((p) => ({
                      ...p,
                      applicable_to: p.applicable_to.includes(t)
                        ? p.applicable_to.filter((x) => x !== t)
                        : [...p.applicable_to, t],
                    }))
                  }
                  className={`px-3 py-1 rounded-lg text-[10px] font-medium ring-1 transition-all ${
                    newClause.applicable_to.includes(t)
                      ? "bg-accent/15 text-accent ring-accent/20"
                      : "bg-white/[0.04] text-[#666] ring-white/[0.06] hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#777] mb-1">
              Texto da Cláusula
            </label>
            <textarea
              value={newClause.body}
              onChange={(e) =>
                setNewClause((p) => ({ ...p, body: e.target.value }))
              }
              rows={6}
              placeholder="CLÁUSULA — ..."
              className="w-full rounded-lg bg-[#1a1a1a] ring-1 ring-white/[0.08] px-3 py-2 text-xs text-white focus:ring-accent/40 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-[#999]">
              <input
                type="checkbox"
                checked={newClause.is_required}
                onChange={(e) =>
                  setNewClause((p) => ({
                    ...p,
                    is_required: e.target.checked,
                  }))
                }
                className="accent-accent"
              />
              Cláusula obrigatória
            </label>
            <button
              onClick={handleCreate}
              disabled={
                saving ||
                !newClause.clause_id ||
                !newClause.title ||
                !newClause.body
              }
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Criar Cláusula
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ID, título ou categoria..."
            className="w-full rounded-xl bg-[#1a1a1a] ring-1 ring-white/[0.08] pl-10 pr-4 py-2.5 text-sm text-white focus:ring-accent/40 focus:outline-none transition-all"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-xl bg-[#1a1a1a] ring-1 ring-white/[0.08] px-4 py-2.5 text-sm text-white focus:ring-accent/40 focus:outline-none"
        >
          <option value="">Todas categorias</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-accent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] py-16">
          <BookOpen size={28} className="text-[#333] mb-3" />
          <p className="text-sm text-[#666]">Nenhuma cláusula encontrada</p>
          {clauses.length === 0 && (
            <p className="text-xs text-[#444] mt-1">
              Use POST /api/contracts/seed para popular a biblioteca
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] overflow-hidden">
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((clause) => {
              const isExpanded = expandedId === clause.id;
              const isEditing = editingId === clause.id;
              return (
                <div key={clause.id}>
                  <div className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-accent">
                          {clause.clause_id}
                        </span>
                        <span
                          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold ring-1 ${
                            RISK_COLORS[clause.risk_level]
                          }`}
                        >
                          {clause.risk_level === "critical" && (
                            <AlertTriangle size={8} className="mr-0.5" />
                          )}
                          {clause.risk_level === "high" && (
                            <Shield size={8} className="mr-0.5" />
                          )}
                          {clause.risk_level}
                        </span>
                        <span className="inline-flex items-center rounded bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-[#888] ring-1 ring-white/[0.06]">
                          {CATEGORY_LABELS[clause.category] || clause.category}
                        </span>
                        {clause.is_required && (
                          <span className="text-[9px] text-accent font-semibold">
                            Obrigatória
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-white truncate">
                        {clause.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {clause.applicable_to.map((t) => (
                          <span
                            key={t}
                            className="text-[9px] text-[#555] bg-white/[0.03] px-1.5 py-0.5 rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (isEditing) {
                            setEditingId(null);
                          } else {
                            setEditingId(clause.id);
                            setEditForm({
                              title: clause.title,
                              body: clause.body,
                              risk_level: clause.risk_level,
                              category: clause.category,
                            });
                          }
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-[#666] hover:text-white transition-colors"
                        title="Editar"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleArchive(clause.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-[#666] hover:text-red-400 transition-colors"
                        title="Arquivar"
                      >
                        <Archive size={13} />
                      </button>
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : clause.id)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-[#666] hover:text-white transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp size={13} />
                        ) : (
                          <ChevronDown size={13} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Edit form */}
                  {isEditing && (
                    <div className="px-4 pb-4 space-y-3 bg-accent/[0.02]">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] text-[#666] mb-1">
                            Título
                          </label>
                          <input
                            value={editForm.title || ""}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                title: e.target.value,
                              }))
                            }
                            className="w-full rounded-lg bg-[#1a1a1a] ring-1 ring-white/[0.08] px-3 py-2 text-xs text-white focus:ring-accent/40 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[#666] mb-1">
                            Categoria
                          </label>
                          <select
                            value={editForm.category || ""}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                category: e.target.value,
                              }))
                            }
                            className="w-full rounded-lg bg-[#1a1a1a] ring-1 ring-white/[0.08] px-3 py-2 text-xs text-white focus:ring-accent/40 focus:outline-none"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {CATEGORY_LABELS[c]}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-[#666] mb-1">
                            Risco
                          </label>
                          <select
                            value={editForm.risk_level || ""}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                risk_level: e.target.value,
                              }))
                            }
                            className="w-full rounded-lg bg-[#1a1a1a] ring-1 ring-white/[0.08] px-3 py-2 text-xs text-white focus:ring-accent/40 focus:outline-none"
                          >
                            {RISK_LEVELS.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#666] mb-1">
                          Texto
                        </label>
                        <textarea
                          value={editForm.body || ""}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              body: e.target.value,
                            }))
                          }
                          rows={6}
                          className="w-full rounded-lg bg-[#1a1a1a] ring-1 ring-white/[0.08] px-3 py-2 text-xs text-white focus:ring-accent/40 focus:outline-none resize-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 rounded-lg text-xs text-[#999] hover:text-white transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleUpdate(clause.id)}
                          disabled={saving}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-[#0a0a0a] transition-all hover:brightness-110 disabled:opacity-50"
                        >
                          {saving ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Save className="w-3 h-3" />
                          )}
                          Salvar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expanded body */}
                  {isExpanded && !isEditing && (
                    <div className="px-4 pb-4">
                      <div className="rounded-lg bg-[#111] p-4 text-[11px] text-[#999] leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                        {clause.body}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
