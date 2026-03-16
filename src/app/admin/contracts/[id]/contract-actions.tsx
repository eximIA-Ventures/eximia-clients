"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Download,
  Trash2,
  Send,
  ArrowLeftCircle,
  Loader2,
} from "lucide-react";

interface ContractActionsProps {
  contractId: string;
  status: string;
}

export function ContractActions({ contractId, status }: ContractActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(action: string) {
    setLoading(action);
    try {
      if (action === "approve") {
        await fetch(`/api/contracts/${contractId}/approve`, { method: "POST" });
        router.refresh();
      } else if (action === "reject") {
        await fetch(`/api/contracts/${contractId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "draft" }),
        });
        router.refresh();
      } else if (action === "send") {
        await fetch(`/api/contracts/${contractId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "sent" }),
        });
        router.refresh();
      } else if (action === "cancel") {
        await fetch(`/api/contracts/${contractId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "cancelled" }),
        });
        router.refresh();
      } else if (action === "download") {
        const res = await fetch(
          `/api/contracts/${contractId}/generate?format=pdf`,
          { method: "POST" }
        );
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `contrato-${contractId}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else if (action === "delete") {
        if (confirm("Tem certeza que deseja excluir este contrato?")) {
          await fetch(`/api/contracts/${contractId}`, { method: "DELETE" });
          router.push("/admin/contracts");
        }
      }
    } finally {
      setLoading(null);
    }
  }

  function ButtonIcon({
    action,
    icon: Icon,
  }: {
    action: string;
    icon: typeof CheckCircle2;
  }) {
    if (loading === action) return <Loader2 className="w-4 h-4 animate-spin" />;
    return <Icon className="w-4 h-4" />;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Download PDF — always available */}
      <button
        onClick={() => handleAction("download")}
        disabled={loading !== null}
        className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-[#ccc] ring-1 ring-white/[0.08] transition-all hover:bg-white/[0.1] hover:text-white disabled:opacity-50"
      >
        <ButtonIcon action="download" icon={Download} />
        PDF
      </button>

      {/* Draft actions */}
      {status === "draft" && (
        <>
          <button
            onClick={() => handleAction("approve")}
            disabled={loading !== null}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4b9560]/15 px-4 py-2.5 text-sm font-medium text-[#4b9560] ring-1 ring-[#4b9560]/20 transition-all hover:bg-[#4b9560]/25 disabled:opacity-50"
          >
            <ButtonIcon action="approve" icon={CheckCircle2} />
            Aprovar
          </button>
          <button
            onClick={() => handleAction("delete")}
            disabled={loading !== null}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 ring-1 ring-red-500/20 transition-all hover:bg-red-500/20 disabled:opacity-50"
          >
            <ButtonIcon action="delete" icon={Trash2} />
            Excluir
          </button>
        </>
      )}

      {/* Review actions */}
      {status === "review" && (
        <>
          <button
            onClick={() => handleAction("approve")}
            disabled={loading !== null}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4b9560]/15 px-4 py-2.5 text-sm font-medium text-[#4b9560] ring-1 ring-[#4b9560]/20 transition-all hover:bg-[#4b9560]/25 disabled:opacity-50"
          >
            <ButtonIcon action="approve" icon={CheckCircle2} />
            Aprovar
          </button>
          <button
            onClick={() => handleAction("reject")}
            disabled={loading !== null}
            className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-[#ccc] ring-1 ring-white/[0.08] transition-all hover:bg-white/[0.1] disabled:opacity-50"
          >
            <ButtonIcon action="reject" icon={ArrowLeftCircle} />
            Rejeitar
          </button>
        </>
      )}

      {/* Approved actions */}
      {status === "approved" && (
        <button
          onClick={() => handleAction("send")}
          disabled={loading !== null}
          className="inline-flex items-center gap-2 rounded-xl bg-[#7c5cbf]/15 px-4 py-2.5 text-sm font-medium text-[#9a7cd8] ring-1 ring-[#7c5cbf]/20 transition-all hover:bg-[#7c5cbf]/25 disabled:opacity-50"
        >
          <ButtonIcon action="send" icon={Send} />
          Enviar p/ Assinatura
        </button>
      )}

      {/* Cancel — available for draft, review, approved, sent */}
      {["draft", "review", "approved", "sent"].includes(status) &&
        status !== "draft" && (
          <button
            onClick={() => handleAction("cancel")}
            disabled={loading !== null}
            className="inline-flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-[#666] transition-all hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
            title="Cancelar contrato"
          >
            <ButtonIcon action="cancel" icon={Trash2} />
          </button>
        )}
    </div>
  );
}
