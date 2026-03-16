import { createAdminClient } from "@/src/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  FileText,
  Plus,
  CheckCircle2,
  Circle,
  Milestone as MilestoneIcon,
  ExternalLink,
  Pencil,
  Bell,
  FolderOpen,
  Package,
} from "lucide-react";
import { formatDate, getStatusLabel, getStatusColor } from "@/src/lib/utils";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*, client:clients(*)")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const [milestonesRes, updatesRes, documentsRes, welcomeDocRes] =
    await Promise.all([
      supabase
        .from("milestones")
        .select("*, deliverables:deliverables(*)")
        .eq("project_id", id)
        .order("sort_order"),
      supabase
        .from("updates")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("documents")
        .select("*")
        .eq("project_id", id)
        .order("uploaded_at", { ascending: false }),
      supabase
        .from("welcome_docs")
        .select("id")
        .eq("project_id", id)
        .maybeSingle(),
    ]);

  const milestones = milestonesRes.data || [];
  const updates = updatesRes.data || [];
  const documents = documentsRes.data || [];
  const hasWelcomeDoc = !!welcomeDocRes.data;
  const client = project.client as Record<string, string>;

  const completedMilestones = milestones.filter(
    (m: Record<string, unknown>) => m.status === "completed"
  ).length;
  const progress =
    milestones.length > 0
      ? Math.round((completedMilestones / milestones.length) * 100)
      : 0;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/projects"
          className="p-2 rounded-lg text-dim hover:text-cream hover:bg-elevated transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold text-cream">
            {project.title}
          </h1>
          <p className="text-sm text-dim mt-1">
            {client?.company} · {getStatusLabel(project.status)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/projects/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-edge hover:border-edge-hover text-cream text-sm font-medium rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </Link>
          <Link
            href={`/admin/projects/${id}/milestones`}
            className="flex items-center gap-2 px-4 py-2 border border-edge hover:border-edge-hover text-cream text-sm font-medium rounded-lg transition-colors"
          >
            <MilestoneIcon className="w-4 h-4" />
            Milestones
          </Link>
          <Link
            href={`/admin/projects/${id}/updates`}
            className="flex items-center gap-2 px-4 py-2 border border-edge hover:border-edge-hover text-cream text-sm font-medium rounded-lg transition-colors"
          >
            <Bell className="w-4 h-4" />
            Updates
          </Link>
          <Link
            href={`/admin/projects/${id}/deliverables`}
            className="flex items-center gap-2 px-4 py-2 border border-edge hover:border-edge-hover text-cream text-sm font-medium rounded-lg transition-colors"
          >
            <Package className="w-4 h-4" />
            Entregáveis
          </Link>
          <Link
            href={`/admin/projects/${id}/documents`}
            className="flex items-center gap-2 px-4 py-2 border border-edge hover:border-edge-hover text-cream text-sm font-medium rounded-lg transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            Documentos
          </Link>
          {!hasWelcomeDoc && (
            <Link
              href={`/admin/projects/${id}/welcome-doc`}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-surface text-sm font-medium rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              Criar Welcome Doc
            </Link>
          )}
          {hasWelcomeDoc && (
            <Link
              href={`/admin/projects/${id}/welcome-doc`}
              className="flex items-center gap-2 px-4 py-2 border border-edge hover:border-edge-hover text-cream text-sm font-medium rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              Editar Welcome Doc
            </Link>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-xl border border-edge bg-surface p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-cream-dim">Progresso Geral</span>
          <span className="text-sm font-medium text-cream">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-dim">
          <span>
            {completedMilestones} de {milestones.length} milestones
          </span>
          <span>
            {project.start_date && `Início: ${formatDate(project.start_date)}`}
            {project.end_date && ` · Prazo: ${formatDate(project.end_date)}`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Milestones */}
        <div className="col-span-2 rounded-xl border border-edge bg-surface">
          <div className="p-5 border-b border-edge flex items-center justify-between">
            <h2 className="text-lg font-semibold text-cream flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Timeline
            </h2>
          </div>
          <div className="p-5 space-y-4">
            {milestones.length === 0 ? (
              <p className="text-sm text-dim text-center py-4">
                Nenhum milestone definido
              </p>
            ) : (
              milestones.map(
                (ms: Record<string, unknown>, index: number) => {
                  const deliverables = (ms.deliverables as Record<string, unknown>[]) || [];
                  const isCompleted = ms.status === "completed";
                  return (
                    <div key={ms.id as string} className="relative">
                      {index < milestones.length - 1 && (
                        <div className="absolute left-[11px] top-8 bottom-0 w-px bg-edge" />
                      )}
                      <div className="flex gap-3">
                        <div className="mt-1 flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6 text-sage" />
                          ) : (
                            <Circle className="w-6 h-6 text-edge-light" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-sm font-medium ${
                                isCompleted
                                  ? "text-cream-dim line-through"
                                  : "text-cream"
                              }`}
                            >
                              {ms.title as string}
                            </p>
                            {ms.due_date ? (
                              <span className="text-xs text-dim">
                                {formatDate(ms.due_date as string)}
                              </span>
                            ) : null}
                          </div>
                          {ms.description ? (
                            <p className="text-xs text-dim mt-1">
                              {ms.description as string}
                            </p>
                          ) : null}
                          {deliverables.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {deliverables.map(
                                (d: Record<string, unknown>) => (
                                  <div
                                    key={d.id as string}
                                    className="flex items-center gap-2 text-xs"
                                  >
                                    <span
                                      className={`px-1.5 py-0.5 rounded ${getStatusColor(
                                        d.status as string
                                      )}`}
                                    >
                                      {getStatusLabel(d.status as string)}
                                    </span>
                                    <span className="text-cream-dim">
                                      {d.title as string}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </div>

        {/* Sidebar: Updates + Documents */}
        <div className="space-y-6">
          {/* Recent Updates */}
          <div className="rounded-xl border border-edge bg-surface">
            <div className="p-4 border-b border-edge">
              <h3 className="text-sm font-semibold text-cream">
                Atualizações Recentes
              </h3>
            </div>
            <div className="divide-y divide-edge">
              {updates.length === 0 ? (
                <p className="p-4 text-xs text-dim">Nenhuma atualização</p>
              ) : (
                updates.map((u: Record<string, unknown>) => (
                  <div key={u.id as string} className="p-4">
                    <p className="text-xs font-medium text-cream">
                      {u.title as string}
                    </p>
                    <p className="text-xs text-dim mt-1 line-clamp-2">
                      {u.content as string}
                    </p>
                    <p className="text-xs text-dim/60 mt-1">
                      {formatDate(u.created_at as string)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="rounded-xl border border-edge bg-surface">
            <div className="p-4 border-b border-edge">
              <h3 className="text-sm font-semibold text-cream">Documentos</h3>
            </div>
            <div className="divide-y divide-edge">
              {documents.length === 0 ? (
                <p className="p-4 text-xs text-dim">Nenhum documento</p>
              ) : (
                documents.map((d: Record<string, unknown>) => (
                  <a
                    key={d.id as string}
                    href={d.file_url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-4 hover:bg-elevated transition-colors"
                  >
                    <FileText className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-xs text-cream truncate flex-1">
                      {d.title as string}
                    </span>
                    <ExternalLink className="w-3 h-3 text-dim" />
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
