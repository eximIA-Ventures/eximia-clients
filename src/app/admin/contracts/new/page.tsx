"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Users,
  FileText,
  Settings,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Shield,
  Briefcase,
  Code,
  Cloud,
  Loader2,
  Save,
  Download,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  cnpj?: string;
}

interface Project {
  id: string;
  title: string;
  client_id: string;
}

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  variables: string[];
  clauses: string[];
}

interface Clause {
  id: string;
  clause_id: string;
  title: string;
  category: string;
  body: string;
  risk_level: string;
  applicable_to: string[];
  is_required: boolean;
}

const STEPS = [
  { label: "Cliente & Template", icon: Users },
  { label: "Variáveis", icon: Settings },
  { label: "Cláusulas", icon: FileText },
  { label: "Preview & Gerar", icon: Eye },
];

const TYPE_ICONS: Record<string, typeof Briefcase> = {
  consultoria: Briefcase,
  desenvolvimento: Code,
  saas: Cloud,
};

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

export default function NewContractPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Step 1 state
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Step 2 state
  const [variables, setVariables] = useState<Record<string, string>>({});

  // Step 3 state
  const [allClauses, setAllClauses] = useState<Clause[]>([]);
  const [selectedClauseIds, setSelectedClauseIds] = useState<string[]>([]);
  const [expandedClause, setExpandedClause] = useState<string | null>(null);

  // Step 4 state
  const [previewHtml, setPreviewHtml] = useState("");
  const [contractTitle, setContractTitle] = useState("");

  // Load clients and templates on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/contracts/templates").then((r) => r.json()),
    ]).then(([clientsRes, templatesRes]) => {
      setClients(clientsRes.clients || []);
      setTemplates(templatesRes.templates || []);
    });
  }, []);

  // Load projects when client changes
  useEffect(() => {
    if (!selectedClient) {
      setProjects([]);
      return;
    }
    fetch(`/api/projects?client_id=${selectedClient}`)
      .then((r) => r.json())
      .then((res) => setProjects(res.projects || []));
  }, [selectedClient]);

  // Load clauses when template changes
  useEffect(() => {
    if (!selectedTemplate) return;
    fetch(`/api/contracts/clauses?type=${selectedTemplate.type}`)
      .then((r) => r.json())
      .then((res) => {
        const clauses = res.clauses || [];
        setAllClauses(clauses);
        // Pre-select required + template default clauses
        const preSelected = clauses
          .filter(
            (c: Clause) =>
              c.is_required || selectedTemplate.clauses.includes(c.clause_id)
          )
          .map((c: Clause) => c.clause_id);
        setSelectedClauseIds(preSelected);
      });

    // Initialize variables
    const initialVars: Record<string, string> = {};
    for (const v of selectedTemplate.variables) {
      initialVars[v] = "";
    }
    // Auto-fill contratada info
    initialVars["contratada.razaoSocial"] = "eximIA Ventures Ltda.";
    initialVars["contratada.cnpj"] = "";
    initialVars["contratada.endereco"] = "";

    setVariables(initialVars);
    setContractTitle(`${selectedTemplate.name} — `);
  }, [selectedTemplate]);

  // Auto-fill client variables
  useEffect(() => {
    if (!selectedClient || !clients.length) return;
    const client = clients.find((c) => c.id === selectedClient);
    if (!client) return;

    setVariables((prev) => ({
      ...prev,
      "contratante.razaoSocial": client.company || "",
      "contratante.cnpj": client.cnpj || "",
    }));

    if (contractTitle && selectedTemplate) {
      setContractTitle(`${selectedTemplate.name} — ${client.company}`);
    }
  }, [selectedClient, clients]); // eslint-disable-line react-hooks/exhaustive-deps

  const substituteVars = useCallback(
    (text: string) => {
      return text.replace(/\{([^}]+)\}/g, (match, key) => {
        return variables[key.trim()] || match;
      });
    },
    [variables]
  );

  // Generate preview
  useEffect(() => {
    if (step !== 3) return;
    const selectedClauses = selectedClauseIds
      .map((id) => allClauses.find((c) => c.clause_id === id))
      .filter(Boolean) as Clause[];

    let html = `<div style="font-family: Georgia, serif; color: #222; max-width: 720px; margin: 0 auto;">`;
    html += `<div style="text-align:center; margin-bottom:32px;">`;
    html += `<p style="font-size:10px; letter-spacing:3px; color:#C4A882; text-transform:uppercase; margin-bottom:12px;">eximIA Ventures</p>`;
    html += `<h2 style="font-size:20px; margin-bottom:6px;">${contractTitle || "Contrato"}</h2>`;
    html += `<p style="font-size:12px; color:#666;">Contrato de Prestação de Serviços</p>`;
    html += `</div>`;
    html += `<hr style="border:none; border-top:2px solid #C4A882; width:50px; margin:0 auto 24px;" />`;

    const contractorName = variables["contratante.razaoSocial"] || "CONTRATANTE";
    const contracteeName = variables["contratada.razaoSocial"] || "eximIA Ventures Ltda.";
    html += `<p style="font-size:12px; line-height:1.8; color:#444; margin-bottom:24px;">Pelo presente instrumento particular, de um lado <strong>${contractorName}</strong>, doravante denominada CONTRATANTE, e de outro lado <strong>${contracteeName}</strong>, doravante denominada CONTRATADA, celebram o presente contrato de prestação de serviços, que se regerá pelas seguintes cláusulas e condições:</p>`;

    for (const clause of selectedClauses) {
      const substituted = substituteVars(clause.body);
      html += `<div style="margin-bottom:20px;">`;
      html += `<div style="font-size:12px; line-height:1.8; color:#333; white-space:pre-wrap;">${substituted}</div>`;
      html += `</div>`;
    }

    html += `</div>`;
    setPreviewHtml(html);
  }, [step, selectedClauseIds, allClauses, variables, contractTitle, substituteVars]);

  async function handleSaveDraft() {
    if (!selectedClient || !selectedTemplate) return;
    setSaving(true);
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: selectedClient,
          project_id: selectedProject || null,
          template_id: selectedTemplate.id,
          title: contractTitle || `${selectedTemplate.name}`,
          variables,
          included_clauses: selectedClauseIds,
        }),
      });
      const data = await res.json();
      if (data.contract?.id) {
        router.push(`/admin/contracts/${data.contract.id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleGeneratePDF() {
    if (!selectedClient || !selectedTemplate) return;
    setLoading(true);
    try {
      // First save
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: selectedClient,
          project_id: selectedProject || null,
          template_id: selectedTemplate.id,
          title: contractTitle || `${selectedTemplate.name}`,
          variables,
          included_clauses: selectedClauseIds,
        }),
      });
      const data = await res.json();
      if (data.contract?.id) {
        // Generate PDF
        const pdfRes = await fetch(
          `/api/contracts/${data.contract.id}/generate?format=pdf`,
          { method: "POST" }
        );
        if (pdfRes.ok) {
          const blob = await pdfRes.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `contrato-${data.contract.id}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        }
        router.push(`/admin/contracts/${data.contract.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  function canProceed() {
    if (step === 0) return !!selectedClient && !!selectedTemplate;
    if (step === 1) return true;
    if (step === 2) return selectedClauseIds.length > 0;
    return true;
  }

  function getVariableLabel(key: string) {
    const labels: Record<string, string> = {
      "contratante.razaoSocial": "Razão Social (Contratante)",
      "contratante.cnpj": "CNPJ (Contratante)",
      "contratante.endereco": "Endereço (Contratante)",
      "contratante.representante": "Representante Legal (Contratante)",
      "contratante.representanteCpf": "CPF do Representante (Contratante)",
      "contratada.razaoSocial": "Razão Social (Contratada)",
      "contratada.cnpj": "CNPJ (Contratada)",
      "contratada.endereco": "Endereço (Contratada)",
      "contratada.representante": "Representante Legal (Contratada)",
      "contratada.representanteCpf": "CPF do Representante (Contratada)",
      "servico.descricao": "Descrição do Serviço",
      "servico.prazoExecucao": "Prazo de Execução",
      "contrato.dataInicio": "Data de Início",
      "contrato.dataFim": "Data de Término",
      "contrato.vigenciaMeses": "Vigência (meses)",
      "contrato.vigenciaMesesExtenso": "Vigência (extenso)",
      "contrato.valorTotal": "Valor Total (R$)",
      "contrato.valorTotalExtenso": "Valor Total (extenso)",
      "contrato.valorMensal": "Valor Mensal (R$)",
      "contrato.valorMensalExtenso": "Valor Mensal (extenso)",
      "contrato.valorSinal": "Sinal (R$)",
      "contrato.valorSinalExtenso": "Sinal (extenso)",
      "contrato.dataPagamentoSinal": "Data do Pagamento do Sinal",
      "contrato.diaVencimento": "Dia do Vencimento",
      "contrato.foro": "Foro (Cidade)",
      "contrato.estado": "Estado (UF)",
      "contrato.dataAssinatura": "Data de Assinatura",
      "contrato.prazoConfidencialidadeAnos": "Prazo Confidencialidade (anos)",
      "contrato.prazoConfidencialidadeAnosExtenso": "Prazo Confidencialidade (extenso)",
      "contrato.multaConfidencialidade": "Multa Confidencialidade (R$)",
      "contrato.periodoLimitacaoMeses": "Período Limitação (meses)",
      "contrato.periodoLimitacaoMesesExtenso": "Período Limitação (extenso)",
      "contrato.prazoNotificacaoRescisao": "Prazo Notificação Rescisão (dias)",
      "contrato.prazoNotificacaoRescisaoExtenso": "Prazo Notificação (extenso)",
      "contrato.multaRescisoria": "Multa Rescisória (%)",
      "contrato.prazoTransicao": "Prazo Transição (dias)",
      "contrato.prazoTransicaoExtenso": "Prazo Transição (extenso)",
      "sla.disponibilidade": "Disponibilidade SLA (%)",
      "sla.disponibilidadeExtenso": "Disponibilidade (extenso)",
      "sla.tempoRespostaCritico": "Tempo Resposta Crítico",
      "sla.tempoRespostaGrave": "Tempo Resposta Grave",
      "sla.tempoRespostaModerado": "Tempo Resposta Moderado",
      "sla.janelasManutencao": "Janelas de Manutenção",
      "sla.faixa1Min": "Faixa 1 Min",
      "sla.faixa1Max": "Faixa 1 Max",
      "sla.credito1": "Crédito Faixa 1",
      "sla.faixa2Min": "Faixa 2 Min",
      "sla.credito2": "Crédito Faixa 2",
    };
    return labels[key] || key;
  }

  // Group variables by prefix
  function groupVariables(vars: string[]) {
    const groups: Record<string, string[]> = {};
    for (const v of vars) {
      const prefix = v.split(".")[0];
      if (!groups[prefix]) groups[prefix] = [];
      groups[prefix].push(v);
    }
    return groups;
  }

  const GROUP_LABELS: Record<string, string> = {
    contratante: "Contratante",
    contratada: "Contratada (eximIA)",
    servico: "Serviço",
    contrato: "Contrato",
    sla: "SLA",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/contracts"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-[#666] transition-all hover:bg-white/[0.08] hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            Novo Contrato
          </p>
          <h1 className="text-2xl font-bold text-white font-serif">
            Contract Writer
          </h1>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all w-full ${
                i === step
                  ? "bg-accent/15 text-accent ring-1 ring-accent/20"
                  : i < step
                  ? "bg-[#4b9560]/10 text-[#4b9560] ring-1 ring-[#4b9560]/20 cursor-pointer hover:bg-[#4b9560]/15"
                  : "bg-white/[0.02] text-[#555] ring-1 ring-white/[0.06]"
              }`}
            >
              {i < step ? (
                <Check className="w-4 h-4" />
              ) : (
                <s.icon className="w-4 h-4" />
              )}
              {s.label}
            </button>
            {i < STEPS.length - 1 && (
              <div className="w-8 h-px bg-white/[0.08]" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] p-6">
        {/* STEP 0: Client & Template */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-2">
                Cliente
              </label>
              <select
                value={selectedClient}
                onChange={(e) => {
                  setSelectedClient(e.target.value);
                  setSelectedProject("");
                }}
                className="w-full rounded-xl bg-[#1a1a1a] ring-1 ring-white/[0.08] px-4 py-3 text-sm text-white focus:ring-accent/40 focus:outline-none transition-all"
              >
                <option value="">Selecione um cliente...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedClient && projects.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-2">
                  Projeto (opcional)
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full rounded-xl bg-[#1a1a1a] ring-1 ring-white/[0.08] px-4 py-3 text-sm text-white focus:ring-accent/40 focus:outline-none transition-all"
                >
                  <option value="">Nenhum projeto vinculado</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">
                Template
              </label>
              <div className="grid grid-cols-3 gap-4">
                {templates.map((t) => {
                  const TypeIcon = TYPE_ICONS[t.type] || FileText;
                  const isSelected = selectedTemplate?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t)}
                      className={`group relative rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                        isSelected
                          ? "bg-accent/10 ring-2 ring-accent/40 shadow-[0_0_30px_rgba(196,168,130,0.1)]"
                          : "bg-[#1a1a1a] ring-1 ring-white/[0.06] hover:ring-white/[0.12]"
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl mb-4 transition-all ${
                          isSelected
                            ? "bg-accent/20"
                            : "bg-white/[0.04] group-hover:bg-white/[0.08]"
                        }`}
                      >
                        <TypeIcon
                          className={`w-6 h-6 ${
                            isSelected
                              ? "text-accent"
                              : "text-[#666] group-hover:text-white"
                          }`}
                        />
                      </div>
                      <h3
                        className={`text-sm font-semibold mb-1 ${
                          isSelected ? "text-accent" : "text-white"
                        }`}
                      >
                        {t.name}
                      </h3>
                      <p className="text-[11px] text-[#666] line-clamp-2">
                        {t.description}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-[10px] text-[#555] bg-white/[0.04] px-2 py-0.5 rounded-md">
                          {t.clauses.length} cláusulas
                        </span>
                        <span className="text-[10px] text-[#555] bg-white/[0.04] px-2 py-0.5 rounded-md">
                          {t.type}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent">
                            <Check className="w-3.5 h-3.5 text-[#0a0a0a]" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Variables */}
        {step === 1 && selectedTemplate && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-2">
                Título do Contrato
              </label>
              <input
                type="text"
                value={contractTitle}
                onChange={(e) => setContractTitle(e.target.value)}
                className="w-full rounded-xl bg-[#1a1a1a] ring-1 ring-white/[0.08] px-4 py-3 text-sm text-white focus:ring-accent/40 focus:outline-none transition-all"
                placeholder="Ex: Consultoria Tech — Empresa ABC"
              />
            </div>

            {Object.entries(groupVariables(selectedTemplate.variables)).map(
              ([prefix, vars]) => (
                <div key={prefix}>
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {GROUP_LABELS[prefix] || prefix}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {vars.map((v) => (
                      <div key={v}>
                        <label className="block text-[11px] text-[#777] mb-1.5">
                          {getVariableLabel(v)}
                        </label>
                        {v.includes("descricao") || v.includes("endereco") ? (
                          <textarea
                            value={variables[v] || ""}
                            onChange={(e) =>
                              setVariables((prev) => ({
                                ...prev,
                                [v]: e.target.value,
                              }))
                            }
                            rows={2}
                            className="w-full rounded-lg bg-[#1a1a1a] ring-1 ring-white/[0.08] px-3 py-2 text-xs text-white focus:ring-accent/40 focus:outline-none transition-all resize-none"
                          />
                        ) : (
                          <input
                            type={
                              v.includes("data") || v.includes("Data")
                                ? "date"
                                : "text"
                            }
                            value={variables[v] || ""}
                            onChange={(e) =>
                              setVariables((prev) => ({
                                ...prev,
                                [v]: e.target.value,
                              }))
                            }
                            className="w-full rounded-lg bg-[#1a1a1a] ring-1 ring-white/[0.08] px-3 py-2 text-xs text-white focus:ring-accent/40 focus:outline-none transition-all"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* STEP 2: Clauses */}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-xs text-[#888] mb-4">
              Cláusulas obrigatórias estão pré-selecionadas. Clique para
              expandir o texto de cada cláusula.
            </p>
            {allClauses.map((clause) => {
              const isSelected = selectedClauseIds.includes(clause.clause_id);
              const isExpanded = expandedClause === clause.clause_id;
              return (
                <div
                  key={clause.id}
                  className={`rounded-xl ring-1 transition-all ${
                    isSelected
                      ? "bg-accent/[0.04] ring-accent/20"
                      : "bg-[#1a1a1a] ring-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3 p-4">
                    <label className="flex items-center gap-3 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={clause.is_required}
                        onChange={() => {
                          if (clause.is_required) return;
                          setSelectedClauseIds((prev) =>
                            prev.includes(clause.clause_id)
                              ? prev.filter((id) => id !== clause.clause_id)
                              : [...prev, clause.clause_id]
                          );
                        }}
                        className="w-4 h-4 rounded border-white/20 bg-transparent accent-accent"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[#555]">
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
                            {CATEGORY_LABELS[clause.category] ||
                              clause.category}
                          </span>
                          {clause.is_required && (
                            <span className="text-[9px] text-accent font-semibold">
                              Obrigatória
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-white mt-1">
                          {clause.title}
                        </p>
                      </div>
                    </label>
                    <button
                      onClick={() =>
                        setExpandedClause(
                          isExpanded ? null : clause.clause_id
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-[#666] hover:text-white transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0">
                      <div className="rounded-lg bg-[#111] p-4 text-[11px] text-[#999] leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                        {clause.body}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* STEP 3: Preview & Generate */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-8 max-h-[600px] overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-[#ccc] ring-1 ring-white/[0.08] transition-all hover:bg-white/[0.1] hover:text-white disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Rascunho
              </button>
              <button
                onClick={handleGeneratePDF}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 hover:shadow-[0_0_30px_rgba(196,168,130,0.2)] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Gerar PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {step < 3 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-[#999] transition-all hover:bg-white/[0.08] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <button
            onClick={() => setStep(Math.min(3, step + 1))}
            disabled={!canProceed()}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Próximo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
