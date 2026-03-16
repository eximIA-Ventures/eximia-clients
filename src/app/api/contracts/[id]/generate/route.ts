import { authorize } from "@/src/lib/auth";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { generateContractHTML } from "@/src/lib/contracts/contract-service";
import ReactPDF from "@react-pdf/renderer";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    padding: 50,
    fontFamily: "Helvetica",
    color: "#222222",
  },
  header: {
    marginBottom: 32,
    textAlign: "center",
  },
  brand: {
    fontSize: 9,
    color: "#C4A882",
    letterSpacing: 3,
    marginBottom: 16,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: "#666666",
  },
  accentBar: {
    height: 2,
    backgroundColor: "#C4A882",
    width: 50,
    marginHorizontal: "auto",
    marginBottom: 24,
  },
  preamble: {
    fontSize: 10,
    lineHeight: 1.7,
    color: "#444444",
    marginBottom: 24,
  },
  clauseBlock: {
    marginBottom: 20,
  },
  clauseBody: {
    fontSize: 10,
    lineHeight: 1.7,
    color: "#333333",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 16,
  },
  signatureArea: {
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#DDDDDD",
  },
  signatureDate: {
    fontSize: 10,
    color: "#444444",
    textAlign: "center",
    marginBottom: 48,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 40,
  },
  signatureCol: {
    flex: 1,
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#333333",
    paddingTop: 6,
  },
  signatureName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#222222",
    textAlign: "center",
  },
  signatureRole: {
    fontSize: 8,
    color: "#666666",
    textAlign: "center",
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 50,
    right: 50,
    textAlign: "center",
  },
  footerText: {
    fontSize: 7,
    color: "#999999",
  },
  pageNumber: {
    position: "absolute",
    bottom: 25,
    right: 50,
    fontSize: 7,
    color: "#AAAAAA",
  },
});

interface ContractPDFProps {
  title: string;
  templateName: string;
  contractorName: string;
  contracteeName: string;
  contractorRep: string;
  contracteeRep: string;
  clauseTexts: string[];
  foro: string;
  date: string;
}

function ContractPDF({ title, templateName, contractorName, contracteeName, contractorRep, contracteeRep, clauseTexts, foro, date }: ContractPDFProps) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.brand }, "eximIA Ventures"),
        React.createElement(View, { style: styles.accentBar }),
        React.createElement(Text, { style: styles.title }, title || templateName),
        React.createElement(Text, { style: styles.subtitle }, "Contrato de Prestação de Serviços")
      ),
      // Preamble
      React.createElement(
        Text,
        { style: styles.preamble },
        `Pelo presente instrumento particular, de um lado ${contractorName}, doravante denominada CONTRATANTE, e de outro lado ${contracteeName}, doravante denominada CONTRATADA, celebram o presente contrato de prestação de serviços, que se regerá pelas seguintes cláusulas e condições:`
      ),
      // Clauses
      ...clauseTexts.map((text, i) =>
        React.createElement(
          View,
          { key: i, style: styles.clauseBlock },
          i > 0 ? React.createElement(View, { style: styles.divider }) : null,
          React.createElement(Text, { style: styles.clauseBody }, text)
        )
      ),
      // Signature area
      React.createElement(
        View,
        { style: styles.signatureArea },
        React.createElement(
          Text,
          { style: styles.signatureDate },
          `${foro || "_______________"}, ${date}.`
        ),
        React.createElement(
          View,
          { style: styles.signatureRow },
          React.createElement(
            View,
            { style: styles.signatureCol },
            React.createElement(
              View,
              { style: styles.signatureLine },
              React.createElement(Text, { style: styles.signatureName }, contractorName),
              React.createElement(Text, { style: styles.signatureRole }, contractorRep || "Representante Legal")
            )
          ),
          React.createElement(
            View,
            { style: styles.signatureCol },
            React.createElement(
              View,
              { style: styles.signatureLine },
              React.createElement(Text, { style: styles.signatureName }, contracteeName),
              React.createElement(Text, { style: styles.signatureRole }, contracteeRep || "Representante Legal")
            )
          )
        )
      ),
      // Footer
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(
          Text,
          { style: styles.footerText },
          "Documento gerado por eximIA Ventures · eximiaventures.com.br"
        )
      ),
      React.createElement(
        Text,
        { style: styles.pageNumber, render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `${pageNumber}/${totalPages}` },
        null
      )
    )
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request, true);
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const admin = createAdminClient();

  // Get contract
  const { data: contract, error: contractError } = await admin
    .from("contracts")
    .select("*, template:contract_templates(name, type)")
    .eq("id", id)
    .single();

  if (contractError || !contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  const variables = (contract.variables || {}) as Record<string, string>;
  const clauseIds = (contract.included_clauses || []) as string[];

  // Fetch clauses
  const { data: clauses } = await admin
    .from("contract_clauses")
    .select("*")
    .in("clause_id", clauseIds.length > 0 ? clauseIds : ["__none__"]);

  const orderedClauses = clauseIds
    .map((cid: string) => clauses?.find((c: { clause_id: string }) => c.clause_id === cid))
    .filter(Boolean);

  // Substitute variables in clause bodies
  const clauseTexts = orderedClauses.map((c: { body: string }) => {
    let text = c.body;
    for (const [key, value] of Object.entries(variables)) {
      text = text.replace(new RegExp(`\\{${key.replace(/\./g, "\\.")}\\}`, "g"), value);
    }
    return text;
  });

  const template = contract.template as { name: string; type: string } | null;

  try {
    // Generate HTML for storage
    const html = contract.template_id
      ? await generateContractHTML(contract.template_id, variables, clauseIds)
      : "";

    // Generate PDF
    const pdfElement = React.createElement(ContractPDF, {
      title: contract.title,
      templateName: template?.name || "Contrato",
      contractorName: variables["contratante.razaoSocial"] || "CONTRATANTE",
      contracteeName: variables["contratada.razaoSocial"] || "eximIA Ventures Ltda.",
      contractorRep: variables["contratante.representante"] || "",
      contracteeRep: variables["contratada.representante"] || "",
      clauseTexts,
      foro: variables["contrato.foro"] || "",
      date: variables["contrato.dataAssinatura"] || new Date().toLocaleDateString("pt-BR"),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = await ReactPDF.renderToStream(pdfElement as any);

    const chunks: Uint8Array[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reader = (stream as any).getReader?.();

    if (reader) {
      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (result.value) chunks.push(result.value);
      }
    } else {
      for await (const chunk of stream as unknown as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }
    }

    const buffer = Buffer.concat(chunks);

    // Check for format=pdf query param to return raw PDF
    const { searchParams } = new URL(request.url);
    if (searchParams.get("format") === "pdf") {
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="contrato-${id}.pdf"`,
        },
      });
    }

    // Otherwise return HTML + confirm generation
    await admin.from("contracts").update({ updated_at: new Date().toISOString() }).eq("id", id);

    await admin.from("contract_audit").insert({
      contract_id: id,
      action: "pdf_generated",
      actor: auth.userId,
      details: { clauses_count: clauseIds.length },
    });

    return NextResponse.json({
      html,
      pdf_size: buffer.length,
      message: "Contract generated successfully",
    });
  } catch (err) {
    console.error("Contract PDF generation error:", err);
    return NextResponse.json({ error: "Failed to generate contract PDF" }, { status: 500 });
  }
}
