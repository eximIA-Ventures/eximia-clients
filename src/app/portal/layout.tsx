import { getServerUser } from "@/src/lib/server-auth";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { redirect } from "next/navigation";
import { LogOut, Bell } from "lucide-react";
import Image from "next/image";
import { SidebarNav, type NavItem } from "@/src/components/sidebar-nav";
import { ProjectSelector } from "@/src/components/project-selector";
import { getClientProjects } from "@/src/lib/get-client-project";

const NAV_ITEMS: NavItem[] = [
  { href: "/portal", label: "Overview", icon: "LayoutDashboard" },
  { href: "/portal/welcome", label: "Welcome", icon: "Sparkles" },
  { href: "/portal/timeline", label: "Timeline", icon: "Clock" },
  { href: "/portal/documents", label: "Documentos", icon: "FolderOpen" },
  { href: "/portal/contracts", label: "Contratos", icon: "FileSignature" },
  { href: "/portal/updates", label: "Atualizações", icon: "Bell" },
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  if (!user) redirect("/login");

  let companyName = "";
  let projectTitle = "";
  let projects: Array<{ id: string; title: string }> = [];
  let currentProjectId = "";

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("client_id").eq("user_id", user.id).single();
    if (profile?.client_id) {
      const { data: client } = await admin.from("clients").select("company").eq("id", profile.client_id).single();
      companyName = client?.company || "";

      // Get all projects for this client
      projects = await getClientProjects(user.id, user.role);

      if (projects.length > 0) {
        // Default to latest project
        currentProjectId = projects[0].id;
        projectTitle = projects[0].title;
      }
    } else if (user.role === "admin") {
      projects = await getClientProjects(user.id, user.role);
      if (projects.length > 0) {
        currentProjectId = projects[0].id;
        projectTitle = projects[0].title;
      }
    }
  }

  return (
    <div className="flex h-screen bg-[#0f0f0f] font-sans text-white">
      <aside className="fixed left-0 top-0 h-screen w-[230px] bg-[#141416] border-r border-white/[0.06] flex flex-col z-30">
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-accent/10 blur-lg" />
              <Image src="/simbolo.svg" alt="" width={32} height={32} className="relative invert-[80%] sepia-[15%] saturate-[800%] hue-rotate-[355deg] brightness-[85%] contrast-[80%]" priority />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold leading-none tracking-tight text-white">eximIA</span>
              <span className="mt-1 text-[10px] font-black leading-none tracking-[0.25em] uppercase text-accent">Clients</span>
            </div>
          </div>
          {projectTitle && (
            <p className="mt-5 text-[11px] text-[#555] leading-tight truncate">{projectTitle}</p>
          )}
        </div>

        {/* Multi-project selector */}
        {projects.length > 1 && (
          <ProjectSelector projects={projects} currentProjectId={currentProjectId} />
        )}

        <div className="mx-4 h-px bg-white/[0.06]" />

        {/* Nav */}
        <div className="pt-4">
          <SidebarNav items={NAV_ITEMS} />
        </div>

        <div className="p-4 border-t border-white/[0.06] mt-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/10 bg-[#242424] text-sm font-semibold text-[#a0a0a0]">
              {user.name?.[0]?.toUpperCase() || "C"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate">{user.name || "Cliente"}</p>
              <p className="text-[11px] text-[#555] truncate">{companyName || user.email}</p>
            </div>
            <form action="/auth/signout" method="POST">
              <button type="submit" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#242424] text-[#555] transition-colors hover:bg-white/[0.08] hover:text-white" title="Sair">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col ml-[230px]">
        <header className="flex items-center justify-end gap-3 px-8 py-3 border-b border-white/[0.04]">
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e1e1e] text-[#777] transition-colors hover:bg-[#242424] hover:text-white">
            <Bell className="w-4 h-4" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/10 bg-[#1e1e1e] text-sm font-semibold text-[#a0a0a0]">
            {user.name?.[0]?.toUpperCase() || "C"}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-5xl mx-auto animate-fade-in-up">{children}</div>
        </main>
      </div>
    </div>
  );
}
