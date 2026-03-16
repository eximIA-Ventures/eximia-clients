import { createAdminClient } from "@/src/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileSignature,
  FileText,
  CheckCircle2,
  Send,
  Clock,
  XCircle,
  Download,
  Trash2,
  Building2,
  Calendar,
  User,
  History,
} from "lucide-react";
import { formatDate } from "@/src/lib/utils";
import {
  getContractStatusColor,
  getContractStatusLabel,
} from "@/src/lib/contracts/contract-service";
import { ContractActions } from "./contract-actions";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: contract, error } = await supabase
    .from("contracts")
    .select(
      "*, client:clients(name, company, email), project:projects(title), template:contract_templates(name, type)"
    )
    .eq("id", id)
    .single();

  if (error || !contract) notFound();

  const { data: audit } = await supabase
    .from("contract_audit")
    .select("*")
    .eq("contract_id", id)
    .order("created_at", { ascending: false });

  const { data: clauses } = await supabase
    .from("contract_clauses")
    .select("clause_id, title, category, body, risk_level")
    .in(
      "clause_id",
      (contract.included_clauses as string[])?.length > 0
        ? (contract.included_clauses as string[])
        : ["__none__"]
    );

  const client = contract.client as {
    name: string;
    company: string;
    email: string;
  } | null;
  const project = contract.project as { title: string } | null;
  const template = contract.template as { name: string; type: string } | null;
  const variables = (contract.variables || {}) as Record<string, string>;
  const orderedClauses = ((contract.included_clauses as string[]) || [])
    .map((cid) => clauses?.find((c) => c.clause_id === cid))
    .filter((c): c is NonNullable<typeof c> => c != null);

  const statusIconMap: Record<string, typeof Clock> = {
    draft: Clock,
    review: FileText,
    approved: CheckCircle2,
    sent: Send,
    signed: FileSignature,
    cancelled: XCircle,
  };
  const StatusIcon = statusIconMap[contract.status as string] || Clock;

  function substituteVars(text: string) {
    return text.replace(/\{([^}]+)\}/g, (match: string, key: string) => {
      return variables[key.trim()] || match;
    });
  }

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
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-semibold ring-1 ${getContractStatusColor(
                  contract.status
                )}`}
              >
                <StatusIcon size={12} />
                {getContractStatusLabel(contract.status)}
              </span>
              {template && (
                <span className="inline-flex items-center rounded-lg bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-[#888] ring-1 ring-white/[0.06]">
                  {template.type}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white font-serif">
              {contract.title}
            </h1>
          </div>
        </div>

        <ContractActions contractId={id} status={contract.status} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main — Contract Preview */}
        <div className="col-span-2 space-y-6">
          {/* Contract Body */}
          <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] overflow-hidden">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white font-serif">
                Texto do Contrato
              </h2>
              <span className="text-[10px] text-[#555]">
                {orderedClauses.length} cláusulas
              </span>
            </div>
            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
              {orderedClauses.map(
                (clause, i) => (
                  <div key={clause.clause_id}>
                    {i > 0 && (
                      <div className="h-px bg-white/[0.04] my-4" />
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono text-accent">
                        {clause.clause_id}
                      </span>
                      <span className="text-[10px] text-[#666]">
                        {clause.title}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#ccc] leading-relaxed whitespace-pre-wrap">
                      {substituteVars(clause.body)}
                    </p>
                  </div>
                )
              )}

              {orderedClauses.length === 0 && (
                <p className="text-sm text-[#555] text-center py-8">
                  Nenhuma cláusula incluída neste contrato.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] p-5 space-y-4">
            <h3 className="text-xs font-semibold text-[#999] uppercase tracking-wider">
              Detalhes
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Building2 size={14} className="text-[#555] mt-0.5" />
                <div>
                  <p className="text-[11px] text-[#666]">Cliente</p>
                  <p className="text-sm text-white font-medium">
                    {client?.company || "---"}
                  </p>
                  <p className="text-[11px] text-[#555]">
                    {client?.name}
                  </p>
                </div>
              </div>

              {project && (
                <div className="flex items-start gap-3">
                  <FileText size={14} className="text-[#555] mt-0.5" />
                  <div>
                    <p className="text-[11px] text-[#666]">Projeto</p>
                    <p className="text-sm text-white font-medium">
                      {project.title}
                    </p>
                  </div>
                </div>
              )}

              {template && (
                <div className="flex items-start gap-3">
                  <FileSignature size={14} className="text-[#555] mt-0.5" />
                  <div>
                    <p className="text-[11px] text-[#666]">Template</p>
                    <p className="text-sm text-white font-medium">
                      {template.name}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar size={14} className="text-[#555] mt-0.5" />
                <div>
                  <p className="text-[11px] text-[#666]">Criado em</p>
                  <p className="text-sm text-white">
                    {formatDate(contract.created_at)}
                  </p>
                </div>
              </div>

              {contract.approved_at && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={14} className="text-[#4b9560] mt-0.5" />
                  <div>
                    <p className="text-[11px] text-[#666]">Aprovado em</p>
                    <p className="text-sm text-white">
                      {formatDate(contract.approved_at as string)}
                    </p>
                  </div>
                </div>
              )}

              {contract.signed_at && (
                <div className="flex items-start gap-3">
                  <FileSignature
                    size={14}
                    className="text-[#4b9560] mt-0.5"
                  />
                  <div>
                    <p className="text-[11px] text-[#666]">Assinado em</p>
                    <p className="text-sm text-white">
                      {formatDate(contract.signed_at as string)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {contract.notes && (
              <div className="pt-3 border-t border-white/[0.06]">
                <p className="text-[11px] text-[#666] mb-1">Notas</p>
                <p className="text-[12px] text-[#999]">{contract.notes}</p>
              </div>
            )}
          </div>

          {/* Audit Trail */}
          <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] p-5">
            <h3 className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-4 flex items-center gap-2">
              <History size={12} />
              Histórico
            </h3>
            <div className="space-y-3">
              {(audit || []).map(
                (entry: {
                  id: string;
                  action: string;
                  actor: string | null;
                  created_at: string;
                }) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-accent/40 mt-1" />
                      <div className="w-px flex-1 bg-white/[0.06]" />
                    </div>
                    <div className="pb-3">
                      <p className="text-[11px] text-[#ccc] font-medium">
                        {entry.action
                          .replace(/_/g, " ")
                          .replace(/^\w/, (c: string) => c.toUpperCase())}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {entry.actor && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#555]">
                            <User size={9} />
                            {entry.actor === "api" ? "Sistema" : entry.actor}
                          </span>
                        )}
                        <span className="text-[10px] text-[#444]">
                          {formatDate(entry.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              )}
              {(!audit || audit.length === 0) && (
                <p className="text-xs text-[#555]">
                  Nenhum registro ainda.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
