import { createAdminClient } from "@/src/lib/supabase/admin";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ContractTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  template_url: string | null;
  variables: string[];
  clauses: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ContractClause {
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
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  project_id: string | null;
  client_id: string;
  template_id: string | null;
  title: string;
  status: string;
  variables: Record<string, string>;
  included_clauses: string[];
  generated_pdf_url: string | null;
  generated_docx_url: string | null;
  signature_provider: string | null;
  signature_id: string | null;
  signature_status: string | null;
  signed_pdf_url: string | null;
  signed_at: string | null;
  notes: string | null;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  client?: { name: string; company: string; email: string };
  project?: { title: string } | null;
  template?: { name: string; type: string } | null;
}

export interface ContractAudit {
  id: string;
  contract_id: string;
  action: string;
  actor: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

// ─── Templates ───────────────────────────────────────────────────────────────

export async function getTemplates() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contract_templates")
    .select("*")
    .eq("status", "active")
    .order("name");
  if (error) throw error;
  return data as ContractTemplate[];
}

export async function getTemplate(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contract_templates")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as ContractTemplate;
}

// ─── Clauses ─────────────────────────────────────────────────────────────────

export async function getClauses(filters?: { category?: string; type?: string; status?: string }) {
  const supabase = createAdminClient();
  let query = supabase.from("contract_clauses").select("*").order("clause_id");

  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.type) query = query.contains("applicable_to", [filters.type]);

  const { data, error } = await query;
  if (error) throw error;
  return data as ContractClause[];
}

export async function getClause(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contract_clauses")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as ContractClause;
}

// ─── Generate contract text ──────────────────────────────────────────────────

export function substituteVariables(text: string, variables: Record<string, string>): string {
  return text.replace(/\{([^}]+)\}/g, (match, key) => {
    return variables[key.trim()] || match;
  });
}

export async function generateContractHTML(
  templateId: string,
  variables: Record<string, string>,
  clauseIds: string[]
): Promise<string> {
  const supabase = createAdminClient();

  // Fetch template
  const { data: template } = await supabase
    .from("contract_templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (!template) throw new Error("Template not found");

  // Fetch selected clauses in order
  const { data: clauses } = await supabase
    .from("contract_clauses")
    .select("*")
    .in("clause_id", clauseIds)
    .order("clause_id");

  if (!clauses || clauses.length === 0) throw new Error("No clauses found");

  // Sort clauses by the order in clauseIds
  const orderedClauses = clauseIds
    .map((cid) => clauses.find((c) => c.clause_id === cid))
    .filter(Boolean) as ContractClause[];

  const contractorName = variables["contratante.razaoSocial"] || "CONTRATANTE";
  const contracteeName = variables["contratada.razaoSocial"] || "eximIA Ventures Ltda.";
  const contractDate = variables["contrato.dataAssinatura"] || new Date().toLocaleDateString("pt-BR");

  // Build HTML
  let html = `
<div style="font-family: 'Georgia', serif; color: #222; max-width: 800px; margin: 0 auto; padding: 40px;">
  <div style="text-align: center; margin-bottom: 48px;">
    <p style="font-size: 11px; letter-spacing: 3px; color: #C4A882; text-transform: uppercase; margin-bottom: 16px;">eximIA Ventures</p>
    <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">${template.name}</h1>
    <p style="font-size: 13px; color: #666;">Contrato de Prestação de Serviços</p>
  </div>

  <div style="border-top: 2px solid #C4A882; width: 60px; margin: 0 auto 32px;"></div>

  <div style="margin-bottom: 32px;">
    <p style="font-size: 13px; line-height: 1.8; color: #444;">
      Pelo presente instrumento particular, de um lado <strong>${contractorName}</strong>, doravante denominada CONTRATANTE, e de outro lado <strong>${contracteeName}</strong>, doravante denominada CONTRATADA, celebram o presente contrato de prestação de serviços, que se regerá pelas seguintes cláusulas e condições:
    </p>
  </div>
`;

  // Add each clause
  for (const clause of orderedClauses) {
    const substitutedBody = substituteVariables(clause.body, variables);
    html += `
  <div style="margin-bottom: 28px; page-break-inside: avoid;">
    <div style="font-size: 13px; line-height: 1.8; color: #333; white-space: pre-wrap;">${substitutedBody}</div>
  </div>
`;
  }

  // Signature block (from the Foro clause or standalone)
  if (!clauseIds.includes("CL-FORO-001")) {
    html += `
  <div style="margin-top: 48px; padding-top: 32px; border-top: 1px solid #ddd;">
    <p style="font-size: 13px; color: #444; text-align: center; margin-bottom: 32px;">
      ${variables["contrato.foro"] || "_______________"}, ${contractDate}.
    </p>
    <div style="display: flex; justify-content: space-between; gap: 48px; margin-top: 48px;">
      <div style="flex: 1; text-align: center;">
        <div style="border-top: 1px solid #333; padding-top: 8px;">
          <p style="font-size: 12px; font-weight: bold;">${contractorName}</p>
          <p style="font-size: 11px; color: #666;">${variables["contratante.representante"] || "Representante Legal"}</p>
        </div>
      </div>
      <div style="flex: 1; text-align: center;">
        <div style="border-top: 1px solid #333; padding-top: 8px;">
          <p style="font-size: 12px; font-weight: bold;">${contracteeName}</p>
          <p style="font-size: 11px; color: #666;">${variables["contratada.representante"] || "Representante Legal"}</p>
        </div>
      </div>
    </div>
  </div>
`;
  }

  html += `
  <div style="margin-top: 48px; text-align: center; padding-top: 24px; border-top: 1px solid #eee;">
    <p style="font-size: 9px; color: #999;">Documento gerado por eximIA Ventures · eximiaventures.com.br</p>
  </div>
</div>`;

  return html;
}

// ─── CRUD Contracts ──────────────────────────────────────────────────────────

export async function createContract(data: {
  client_id: string;
  project_id?: string | null;
  template_id?: string | null;
  title: string;
  variables?: Record<string, string>;
  included_clauses?: string[];
  notes?: string;
  created_by?: string;
}) {
  const supabase = createAdminClient();

  const { data: contract, error } = await supabase
    .from("contracts")
    .insert({
      client_id: data.client_id,
      project_id: data.project_id || null,
      template_id: data.template_id || null,
      title: data.title,
      variables: data.variables || {},
      included_clauses: data.included_clauses || [],
      notes: data.notes || null,
      created_by: data.created_by || null,
      status: "draft",
    })
    .select()
    .single();

  if (error) throw error;

  // Audit trail
  await supabase.from("contract_audit").insert({
    contract_id: contract.id,
    action: "created",
    actor: data.created_by || null,
    details: { template_id: data.template_id, clauses_count: data.included_clauses?.length || 0 },
  });

  return contract as Contract;
}

export async function updateContractStatus(
  id: string,
  status: string,
  actor?: string,
  details?: Record<string, unknown>
) {
  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === "approved") {
    updateData.approved_by = actor || null;
    updateData.approved_at = new Date().toISOString();
  }

  const { data: contract, error } = await supabase
    .from("contracts")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  // Audit trail
  await supabase.from("contract_audit").insert({
    contract_id: id,
    action: status === "approved" ? "approved" : `status_changed_to_${status}`,
    actor: actor || null,
    details: details || { new_status: status },
  });

  return contract as Contract;
}

export async function getContracts(filters?: {
  client_id?: string;
  project_id?: string;
  status?: string;
}) {
  const supabase = createAdminClient();
  let query = supabase
    .from("contracts")
    .select("*, client:clients(name, company, email), project:projects(title), template:contract_templates(name, type)")
    .order("created_at", { ascending: false });

  if (filters?.client_id) query = query.eq("client_id", filters.client_id);
  if (filters?.project_id) query = query.eq("project_id", filters.project_id);
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return data as Contract[];
}

export async function getContract(id: string) {
  const supabase = createAdminClient();

  const { data: contract, error } = await supabase
    .from("contracts")
    .select("*, client:clients(name, company, email), project:projects(title), template:contract_templates(name, type)")
    .eq("id", id)
    .single();

  if (error) throw error;

  const { data: audit } = await supabase
    .from("contract_audit")
    .select("*")
    .eq("contract_id", id)
    .order("created_at", { ascending: false });

  return { contract: contract as Contract, audit: (audit || []) as ContractAudit[] };
}

export async function deleteContract(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("contracts").delete().eq("id", id);
  if (error) throw error;
}

// ─── Status helpers ──────────────────────────────────────────────────────────

export function getContractStatusColor(status: string) {
  const colors: Record<string, string> = {
    draft: "bg-white/[0.06] text-[#a0a0a0] ring-white/[0.08]",
    review: "bg-accent/10 text-accent ring-accent/20",
    approved: "bg-[#2a6ab0]/10 text-[#4a8ad0] ring-[#2a6ab0]/20",
    sent: "bg-[#7c5cbf]/10 text-[#9a7cd8] ring-[#7c5cbf]/20",
    signed: "bg-[#4b9560]/10 text-[#4b9560] ring-[#4b9560]/20",
    cancelled: "bg-red-500/10 text-red-400 ring-red-500/20",
  };
  return colors[status] || "bg-white/[0.06] text-[#a0a0a0] ring-white/[0.08]";
}

export function getContractStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: "Rascunho",
    review: "Em Revisão",
    approved: "Aprovado",
    sent: "Enviado p/ Assinatura",
    signed: "Assinado",
    cancelled: "Cancelado",
  };
  return labels[status] || status;
}

export function getRiskColor(level: string) {
  const colors: Record<string, string> = {
    low: "bg-[#4b9560]/10 text-[#4b9560] ring-[#4b9560]/20",
    medium: "bg-accent/10 text-accent ring-accent/20",
    high: "bg-orange-500/10 text-orange-400 ring-orange-500/20",
    critical: "bg-red-500/10 text-red-400 ring-red-500/20",
  };
  return colors[level] || "bg-white/[0.06] text-[#a0a0a0] ring-white/[0.08]";
}

export function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    escopo: "Escopo",
    prazo: "Prazo",
    pagamento: "Pagamento",
    confidencialidade: "Confidencialidade",
    pi: "Propriedade Intelectual",
    lgpd: "LGPD",
    sla: "SLA",
    responsabilidade: "Responsabilidade",
    rescisao: "Rescisão",
    foro: "Foro",
    anticorrupcao: "Anticorrupção",
    forcamaior: "Força Maior",
  };
  return labels[category] || category;
}
