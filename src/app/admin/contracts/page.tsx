import { createAdminClient } from "@/src/lib/supabase/admin";
import Link from "next/link";
import {
  Plus,
  FileSignature,
  ArrowRight,
  BookOpen,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  PenLine,
} from "lucide-react";
import { formatDate } from "@/src/lib/utils";
import {
  getContractStatusColor,
  getContractStatusLabel,
} from "@/src/lib/contracts/contract-service";

export default async function ContractsPage() {
  const supabase = createAdminClient();

  const { data: contracts } = await supabase
    .from("contracts")
    .select(
      "*, client:clients(name, company), template:contract_templates(name, type)"
    )
    .order("created_at", { ascending: false });

  const allContracts = contracts || [];
  const drafts = allContracts.filter((c) => c.status === "draft").length;
  const signed = allContracts.filter((c) => c.status === "signed").length;
  const approved = allContracts.filter((c) => c.status === "approved").length;
  const sent = allContracts.filter((c) => c.status === "sent").length;

  return (
    <div>
      {/* Hero */}
      <section className="relative -mx-8 -mt-8 overflow-hidden mb-10">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 blur-[2px]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=80')",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.85) 35%, rgba(10,10,10,0.3) 65%, transparent 100%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

        <div className="relative z-10 px-8 pt-20 pb-10 min-h-[240px] flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
              Gestão Contratual
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white font-serif">
              Contratos
            </h1>
            <p className="mt-3 text-[#888] text-sm max-w-md">
              {allContracts.length} contratos &middot; {drafts} rascunhos &middot;{" "}
              {signed} assinados
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/contracts/clauses"
              className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-[#ccc] ring-1 ring-white/[0.08] transition-all hover:bg-white/[0.1] hover:text-white"
            >
              <BookOpen className="w-4 h-4" />
              Biblioteca de Cláusulas
            </Link>
            <Link
              href="/admin/contracts/new"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 hover:shadow-[0_0_30px_rgba(196,168,130,0.2)] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Novo Contrato
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Rascunhos",
            value: drafts,
            icon: PenLine,
            color: "#a0a0a0",
          },
          {
            label: "Aprovados",
            value: approved,
            icon: CheckCircle2,
            color: "#4a8ad0",
          },
          { label: "Enviados", value: sent, icon: Send, color: "#9a7cd8" },
          {
            label: "Assinados",
            value: signed,
            icon: FileSignature,
            color: "#4b9560",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon
                  className="w-5 h-5"
                  style={{ color: stat.color }}
                />
              </div>
              <p className="text-2xl font-bold text-white tabular-nums">
                {stat.value}
              </p>
            </div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#666]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Contract List */}
      {allContracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 animate-float">
            <FileSignature size={28} className="text-accent/50" />
          </div>
          <p className="mt-5 text-sm font-medium text-[#999]">
            Nenhum contrato ainda
          </p>
          <p className="mt-1 text-xs text-[#555]">
            Crie seu primeiro contrato a partir de um template
          </p>
          <Link
            href="/admin/contracts/new"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Criar Contrato
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {allContracts.map((contract) => {
            const client = contract.client as {
              name: string;
              company: string;
            } | null;
            const template = contract.template as {
              name: string;
              type: string;
            } | null;

            const statusIconMap: Record<string, typeof Clock> = {
              draft: Clock,
              review: FileText,
              approved: CheckCircle2,
              sent: Send,
              signed: FileSignature,
              cancelled: XCircle,
            };
            const StatusIcon = statusIconMap[contract.status as string] || Clock;

            return (
              <Link
                key={contract.id}
                href={`/admin/contracts/${contract.id}`}
              >
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.03] via-[#1e1e1e] to-[#1e1e1e] ring-1 ring-white/[0.06] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:ring-accent/25 hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
                  {/* Accent top bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
                    style={{
                      background:
                        "linear-gradient(90deg, #C4A882, transparent)",
                    }}
                  />

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-semibold ring-1 ${getContractStatusColor(
                            contract.status
                          )}`}
                        >
                          <StatusIcon size={10} />
                          {getContractStatusLabel(contract.status)}
                        </span>
                        {template && (
                          <span className="inline-flex items-center rounded-lg bg-white/[0.04] px-2 py-0.5 text-[9px] font-medium text-[#888] ring-1 ring-white/[0.06]">
                            {template.type}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-accent transition-colors truncate">
                        {contract.title}
                      </h3>
                      <p className="text-[11px] text-[#666] mt-1">
                        {client?.company || "---"} &middot;{" "}
                        {formatDate(contract.created_at)}
                      </p>
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-[#333] group-hover:text-accent transition-colors mt-1 shrink-0"
                    />
                  </div>

                  {contract.notes && (
                    <p className="text-[11px] text-[#555] line-clamp-2 mb-3">
                      {contract.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-[#999] ring-1 ring-white/[0.06]">
                      <FileText size={10} />
                      {(contract.included_clauses as string[])?.length || 0}{" "}
                      cláusulas
                    </span>
                    {template && (
                      <span className="inline-flex items-center rounded-lg bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-[#999] ring-1 ring-white/[0.06]">
                        {template.name}
                      </span>
                    )}
                  </div>

                  {/* Hover glow */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
