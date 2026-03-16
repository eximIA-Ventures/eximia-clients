import { createAdminClient } from "@/src/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
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
    backgroundColor: "#0A0A0A",
    padding: 50,
    fontFamily: "Helvetica",
    color: "#E8E0D5",
  },
  header: {
    marginBottom: 40,
    textAlign: "center",
  },
  brand: {
    fontSize: 10,
    color: "#C4A882",
    letterSpacing: 3,
    marginBottom: 20,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#E8E0D5",
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#B8B0A5",
    lineHeight: 1.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#2A2A2A",
    marginVertical: 30,
  },
  accentDivider: {
    height: 2,
    backgroundColor: "#C4A882",
    width: 60,
    marginHorizontal: "auto",
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#E8E0D5",
    marginBottom: 16,
  },
  overview: {
    fontSize: 11,
    color: "#B8B0A5",
    lineHeight: 1.6,
    marginBottom: 30,
  },
  stepContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(196, 168, 130, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#C4A882",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#E8E0D5",
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 10,
    color: "#B8B0A5",
    lineHeight: 1.5,
  },
  channelRow: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    alignItems: "center",
  },
  channelType: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#C4A882",
    width: 70,
  },
  channelLabel: {
    fontSize: 10,
    color: "#B8B0A5",
    flex: 1,
  },
  teamGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  teamMember: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 12,
    width: "48%",
  },
  teamName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#E8E0D5",
    marginBottom: 2,
  },
  teamRole: {
    fontSize: 9,
    color: "#666666",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#666666",
  },
  portalSection: {
    backgroundColor: "#141414",
    borderRadius: 12,
    padding: 24,
    border: "1px solid rgba(196, 168, 130, 0.2)",
  },
  portalTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#E8E0D5",
    marginBottom: 8,
  },
  portalDesc: {
    fontSize: 10,
    color: "#888888",
    marginBottom: 20,
  },
  credentialBox: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  credentialLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#666666",
    letterSpacing: 1.5,
    marginBottom: 4,
    textTransform: "uppercase" as const,
  },
  credentialValue: {
    fontSize: 12,
    fontFamily: "Courier",
    color: "#E8E0D5",
  },
  credentialGrid: {
    flexDirection: "row" as const,
    gap: 8,
  },
  credentialHalf: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 12,
  },
});

interface WelcomeDocData {
  hero_title: string;
  hero_subtitle: string;
  overview: string;
  what_happens_next: Array<{ title: string; description: string }>;
  communication: Array<{ type: string; value: string; label: string }>;
  team_members: Array<{ name: string; role: string }>;
  portal_access?: { url: string; email: string; password: string } | null;
}

function WelcomeDocPDF({ data }: { data: WelcomeDocData }) {
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
        React.createElement(View, { style: styles.accentDivider }),
        React.createElement(Text, { style: styles.heroTitle }, data.hero_title),
        React.createElement(Text, { style: styles.heroSubtitle }, data.hero_subtitle)
      ),
      // Overview
      data.overview
        ? React.createElement(
            View,
            null,
            React.createElement(View, { style: styles.divider }),
            React.createElement(Text, { style: styles.sectionTitle }, "Visão Geral"),
            React.createElement(Text, { style: styles.overview }, data.overview)
          )
        : null,
      // What Happens Next
      data.what_happens_next?.length > 0
        ? React.createElement(
            View,
            null,
            React.createElement(View, { style: styles.divider }),
            React.createElement(Text, { style: styles.sectionTitle }, "What Happens Next"),
            ...data.what_happens_next.map((step, i) =>
              React.createElement(
                View,
                { key: i, style: styles.stepContainer },
                React.createElement(
                  View,
                  { style: styles.stepNumber },
                  React.createElement(Text, { style: styles.stepNumberText }, `${i + 1}`)
                ),
                React.createElement(
                  View,
                  { style: styles.stepContent },
                  React.createElement(Text, { style: styles.stepTitle }, step.title),
                  React.createElement(Text, { style: styles.stepDesc }, step.description)
                )
              )
            )
          )
        : null,
      // Communication
      data.communication?.length > 0
        ? React.createElement(
            View,
            null,
            React.createElement(View, { style: styles.divider }),
            React.createElement(Text, { style: styles.sectionTitle }, "Comunicação"),
            ...data.communication.map((ch, i) =>
              React.createElement(
                View,
                { key: i, style: styles.channelRow },
                React.createElement(Text, { style: styles.channelType }, ch.type),
                React.createElement(Text, { style: styles.channelLabel }, ch.label || ch.value)
              )
            )
          )
        : null,
      // Team
      data.team_members?.length > 0
        ? React.createElement(
            View,
            null,
            React.createElement(View, { style: styles.divider }),
            React.createElement(Text, { style: styles.sectionTitle }, "Sua Equipe"),
            React.createElement(
              View,
              { style: styles.teamGrid },
              ...data.team_members.map((member, i) =>
                React.createElement(
                  View,
                  { key: i, style: styles.teamMember },
                  React.createElement(Text, { style: styles.teamName }, member.name),
                  React.createElement(Text, { style: styles.teamRole }, member.role)
                )
              )
            )
          )
        : null,
      // Portal Access
      data.portal_access
        ? React.createElement(
            View,
            null,
            React.createElement(View, { style: styles.divider }),
            React.createElement(
              View,
              { style: styles.portalSection },
              React.createElement(Text, { style: styles.portalTitle }, "Acesso ao Portal do Cliente"),
              React.createElement(Text, { style: styles.portalDesc }, "Use as credenciais abaixo para acompanhar seu projeto em tempo real."),
              // URL
              React.createElement(
                View,
                { style: styles.credentialBox },
                React.createElement(Text, { style: styles.credentialLabel }, "LINK DO PORTAL"),
                React.createElement(Text, { style: styles.credentialValue }, data.portal_access.url)
              ),
              // Email + Password grid
              React.createElement(
                View,
                { style: styles.credentialGrid },
                React.createElement(
                  View,
                  { style: styles.credentialHalf },
                  React.createElement(Text, { style: styles.credentialLabel }, "LOGIN (EMAIL)"),
                  React.createElement(Text, { style: styles.credentialValue }, data.portal_access.email)
                ),
                React.createElement(
                  View,
                  { style: styles.credentialHalf },
                  React.createElement(Text, { style: styles.credentialLabel }, "SENHA"),
                  React.createElement(Text, { style: styles.credentialValue }, data.portal_access.password)
                )
              )
            )
          )
        : null,
      // Footer
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(
          Text,
          { style: styles.footerText },
          "Powered by eximIA Ventures · eximiaventures.com.br"
        )
      )
    )
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: welcomeDoc, error } = await admin
    .from("welcome_docs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !welcomeDoc) {
    return NextResponse.json({ error: "Welcome doc not found" }, { status: 404 });
  }

  try {
    const stream = await ReactPDF.renderToStream(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      React.createElement(WelcomeDocPDF, { data: welcomeDoc }) as any
    );

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
      // Node.js readable stream fallback
      for await (const chunk of stream as unknown as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }
    }

    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="welcome-doc-${id}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
