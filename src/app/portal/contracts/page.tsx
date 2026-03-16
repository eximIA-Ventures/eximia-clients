import { getServerUser } from "@/src/lib/server-auth";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { redirect } from "next/navigation";
import {
  FileSignature,
  Download,
  CheckCircle2,
  Clock,
  Send,
  FileText,
} from "lucide-react";
import { formatDate } from "@/src/lib/utils";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: typeof Clock }
> = {
  approved: {
    label: "Aprovado",
    color: "bg-[#2a6ab0]/10 text-[#4a8ad0] ring-[#2a6ab0]/20",
    icon: CheckCircle2,
  },
  sent: {
    label: "Aguardando Assinatura",
    color: "bg-[#7c5cbf]/10 text-[#9a7cd8] ring-[#7c5cbf]/20",
    icon: Send,
  },
  signed: {
    label: "Assinado",
    color: "bg-[#4b9560]/10 text-[#4b9560] ring-[#4b9560]/20",
    icon: FileSignature,
  },
};

export default async function PortalContractsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  // Get client_id from profile
  let clientId: string | null = null;
  if (user.role === "client") {
    const { data: profile } = await admin
      .from("profiles")
      .select("client_id")
      .eq("user_id", user.id)
      .single();
    clientId = profile?.client_id || null;
  }

  // Fetch contracts visible to portal (approved, sent, signed)
  let query = admin
    .from("contracts")
    .select(
      "id, title, status, created_at, signed_at, template:contract_templates(name, type), included_clauses"
    )
    .in("status", ["approved", "sent", "signed"])
    .order("created_at", { ascending: false });

  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  const { data: contracts } = await query;
  const allContracts = contracts || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-cream">Contratos</h1>
        <p className="text-sm text-dim mt-1">
          {allContracts.length} contrato{allContracts.length !== 1 ? "s" : ""}{" "}
          disponíve{allContracts.length !== 1 ? "is" : "l"}
        </p>
      </div>

      {allContracts.length === 0 ? (
        <div className="rounded-xl border border-edge bg-surface p-12 text-center">
          <FileSignature className="w-12 h-12 text-dim mx-auto mb-4" />
          <p className="text-cream mb-2">Nenhum contrato disponível</p>
          <p className="text-sm text-dim">
            Contratos aprovados e assinados aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {allContracts.map((contract) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rawTemplate = contract.template as any;
            const template = Array.isArray(rawTemplate) ? rawTemplate[0] as { name: string; type: string } | undefined : rawTemplate as { name: string; type: string } | null;
            const config = STATUS_CONFIG[contract.status] || {
              label: contract.status,
              color: "bg-white/[0.06] text-[#a0a0a0] ring-white/[0.08]",
              icon: FileText,
            };
            const StatusIcon = config.icon;

            return (
              <div
                key={contract.id}
                className="rounded-xl border border-edge bg-surface p-5 transition-colors hover:border-edge-hover"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <FileSignature className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-cream truncate">
                        {contract.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold ring-1 ${config.color}`}
                        >
                          <StatusIcon size={10} />
                          {config.label}
                        </span>
                        {template && (
                          <span className="text-[10px] text-dim">
                            {template.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-dim">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={10} />
                          {formatDate(contract.created_at)}
                        </span>
                        {contract.signed_at && (
                          <span className="inline-flex items-center gap-1 text-[#4b9560]">
                            <CheckCircle2 size={10} />
                            Assinado {formatDate(contract.signed_at)}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <FileText size={10} />
                          {(contract.included_clauses as string[])?.length || 0}{" "}
                          cláusulas
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`/api/contracts/${contract.id}/generate?format=pdf`}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/20 shrink-0"
                  >
                    <Download size={14} />
                    PDF
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
