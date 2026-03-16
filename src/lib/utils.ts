import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    planning: "bg-white/[0.06] text-[#a0a0a0] ring-white/[0.08]",
    in_progress: "bg-[#2a6ab0]/10 text-[#4a8ad0] ring-[#2a6ab0]/20",
    review: "bg-accent/10 text-accent ring-accent/20",
    completed: "bg-[#4b9560]/10 text-[#4b9560] ring-[#4b9560]/20",
    on_hold: "bg-white/[0.04] text-[#737373] ring-white/[0.06]",
    pending: "bg-white/[0.06] text-[#a0a0a0] ring-white/[0.08]",
    delivered: "bg-accent/10 text-accent ring-accent/20",
    approved: "bg-[#4b9560]/10 text-[#4b9560] ring-[#4b9560]/20",
  };
  return colors[status] || "bg-white/[0.06] text-[#a0a0a0] ring-white/[0.08]";
}

export function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    planning: "Planejamento",
    in_progress: "Em Progresso",
    review: "Em Revisão",
    completed: "Concluído",
    on_hold: "Pausado",
    pending: "Pendente",
    delivered: "Entregue",
    approved: "Aprovado",
    info: "Informação",
    milestone: "Milestone",
    deliverable: "Entregável",
    alert: "Alerta",
  };
  return labels[status] || status;
}
