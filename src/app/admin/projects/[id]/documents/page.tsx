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
  FileText,
  ExternalLink,
  Upload,
} from "lucide-react";

const inputCls =
  "flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-[#555] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent/40";

const selectCls =
  "flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent/40 appearance-none cursor-pointer";

const fileTypeOptions = [
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "Documento" },
  { value: "image", label: "Imagem" },
  { value: "spreadsheet", label: "Planilha" },
  { value: "presentation", label: "Apresentacao" },
  { value: "video", label: "Video" },
  { value: "other", label: "Outro" },
];

interface Document {
  id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_at: string;
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ManageDocumentsPage() {
  const { id } = useParams<{ id: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    file_url: "",
    file_type: "pdf",
    file_size: "",
  });

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}/documents`);
      if (!res.ok) throw new Error("Erro ao carregar documentos");
      const { documents: data } = await res.json();
      setDocuments(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.file_url.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          file_url: form.file_url,
          file_type: form.file_type,
          file_size: form.file_size ? parseInt(form.file_size, 10) : null,
        }),
      });
      if (!res.ok) throw new Error("Erro ao adicionar documento");
      await fetchDocuments();
      setForm({ title: "", file_url: "", file_type: "pdf", file_size: "" });
      setShowForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar");
    } finally {
      setSaving(false);
    }
  }

  async function deleteDocument(documentId: string) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        `/api/projects/${id}/documents?document_id=${documentId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Erro ao excluir documento");
      await fetchDocuments();
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
              Documentos
            </h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <Plus size={16} />
            Novo Documento
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-6">
          {error}
        </div>
      )}

      <div className="max-w-3xl space-y-6">
        {/* Add Document Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white/[0.02] ring-1 ring-accent/20 p-6 space-y-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <Upload size={14} className="text-accent" />
              </div>
              <h2 className="text-sm font-semibold text-white">
                Adicionar Documento
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
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
                  placeholder="Nome do documento"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#999]">
                  Tipo de Arquivo
                </label>
                <select
                  value={form.file_type}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, file_type: e.target.value }))
                  }
                  className={selectCls}
                >
                  {fileTypeOptions.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#999]">
                URL do Arquivo *
              </label>
              <input
                type="url"
                value={form.file_url}
                onChange={(e) =>
                  setForm((p) => ({ ...p, file_url: e.target.value }))
                }
                required
                placeholder="https://..."
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#999]">
                Tamanho do Arquivo (bytes, opcional)
              </label>
              <input
                type="number"
                value={form.file_size}
                onChange={(e) =>
                  setForm((p) => ({ ...p, file_size: e.target.value }))
                }
                placeholder="Ex: 1048576 (1 MB)"
                className={inputCls}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm({
                    title: "",
                    file_url: "",
                    file_type: "pdf",
                    file_size: "",
                  });
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-[#999] hover:text-white hover:border-white/[0.15] transition-all"
              >
                <X size={14} />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
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

        {/* Documents List */}
        {documents.length === 0 && !showForm ? (
          <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] p-10 text-center">
            <FileText className="w-10 h-10 text-[#333] mx-auto mb-3" />
            <p className="text-sm text-[#666]">
              Nenhum documento adicionado a este projeto.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <Plus size={16} />
              Adicionar Primeiro Documento
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                    <FileText size={18} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {doc.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {doc.file_type && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#666]">
                          {doc.file_type}
                        </span>
                      )}
                      {doc.file_size && (
                        <span className="text-[10px] text-[#555]">
                          {formatFileSize(doc.file_size)}
                        </span>
                      )}
                      <span className="text-[10px] text-[#555]">
                        {new Date(doc.uploaded_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555] hover:text-accent hover:bg-accent/10 transition-all"
                    >
                      <ExternalLink size={14} />
                    </a>
                    {deleteConfirm === doc.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteDocument(doc.id)}
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
                        onClick={() => setDeleteConfirm(doc.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
