import { getServerUser } from "@/src/lib/server-auth";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { redirect } from "next/navigation";
import { FileText, Download, FolderOpen, File, FileImage, FileSpreadsheet } from "lucide-react";
import { formatDate } from "@/src/lib/utils";
import { getClientProject } from "@/src/lib/get-client-project";

function getFileIcon(fileType: string | null) {
  if (!fileType) return File;
  if (fileType.includes("image")) return FileImage;
  if (fileType.includes("spreadsheet") || fileType.includes("excel")) return FileSpreadsheet;
  if (fileType.includes("pdf")) return FileText;
  return File;
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const project = await getClientProject(user.id, user.role, sp.project);
  if (!project) redirect("/portal");

  const supabase = createAdminClient();
  const { data: documents } = await supabase.from("documents").select("*").eq("project_id", project.id).order("uploaded_at", { ascending: false });
  const allDocs = documents || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-cream">Documentos</h1>
        <p className="text-sm text-dim mt-1">{allDocs.length} documentos disponíveis</p>
      </div>

      {allDocs.length === 0 ? (
        <div className="rounded-xl border border-edge bg-surface p-12 text-center">
          <FolderOpen className="w-12 h-12 text-dim mx-auto mb-4" />
          <p className="text-cream mb-2">Nenhum documento ainda</p>
          <p className="text-sm text-dim">Documentos do seu projeto aparecerão aqui.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {allDocs.map((doc) => {
            const Icon = getFileIcon(doc.file_type);
            return (
              <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border border-edge bg-surface hover:border-edge-hover transition-colors">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-cream truncate">{doc.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {doc.file_size && <span className="text-xs text-dim">{formatFileSize(doc.file_size)}</span>}
                    <span className="text-xs text-dim">{formatDate(doc.uploaded_at)}</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-dim" />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
