"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Building2, Mail, Phone, Palette, Link2 } from "lucide-react";
import Link from "next/link";

const inputCls = "flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-[#555] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent/40";

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    brand_color: "#C4A882",
    logo_url: "",
  });

  useEffect(() => {
    async function loadClient() {
      try {
        const res = await fetch(`/api/clients/${id}`);
        if (!res.ok) throw new Error("Cliente não encontrado");
        const { client } = await res.json();
        setForm({
          name: client.name || "",
          company: client.company || "",
          email: client.email || "",
          phone: client.phone || "",
          brand_color: client.brand_color || "#C4A882",
          logo_url: client.logo_url || "",
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao carregar cliente");
      } finally {
        setFetching(false);
      }
    }
    loadClient();
  }, [id]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao atualizar cliente");
      }
      router.push(`/admin/clients/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
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
          <Link href={`/admin/clients/${id}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-[#888] hover:bg-white/[0.1] hover:text-white transition-all">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Editar</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white font-serif">Editar Cliente</h1>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Client info */}
        <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Building2 size={14} className="text-accent" />
            </div>
            <h2 className="text-sm font-semibold text-white">Informações do Cliente</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#999]">Nome do Contato *</label>
              <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} required placeholder="João Silva" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#999]">Empresa *</label>
              <input type="text" value={form.company} onChange={(e) => update("company", e.target.value)} required placeholder="Empresa Ltda" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#999]">Email *</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required placeholder="contato@empresa.com" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#999]">Telefone</label>
              <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="(11) 99999-9999" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#999]">Cor da Marca</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.brand_color} onChange={(e) => update("brand_color", e.target.value)}
                className="w-11 h-11 rounded-xl cursor-pointer border-0 bg-transparent p-0.5" />
              <input type="text" value={form.brand_color} onChange={(e) => update("brand_color", e.target.value)}
                className="w-28 h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-sm font-mono text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#999]">URL do Logo</label>
            <input type="url" value={form.logo_url} onChange={(e) => update("logo_url", e.target.value)} placeholder="https://example.com/logo.png" className={inputCls} />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        <div className="flex justify-end gap-3">
          <Link href={`/admin/clients/${id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] px-5 py-2.5 text-sm font-medium text-[#999] transition-all hover:border-white/[0.2] hover:text-white">
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 hover:shadow-[0_0_30px_rgba(196,168,130,0.2)] active:scale-[0.98] disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}
