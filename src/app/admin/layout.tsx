import { getServerUser } from "@/src/lib/server-auth";
import { redirect } from "next/navigation";
import { LogOut, Bell } from "lucide-react";
import Image from "next/image";
import { SidebarNav, type NavItem } from "@/src/components/sidebar-nav";

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/clients", label: "Clientes", icon: "Users" },
  { href: "/admin/projects", label: "Projetos", icon: "FolderKanban" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/portal");

  return (
    <div className="flex h-screen bg-[#0f0f0f] font-sans text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-[230px] bg-[#141416] border-r border-white/[0.06] flex flex-col z-30">
        {/* Logo */}
        <div className="px-5 pt-6 pb-6">
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
        </div>

        {/* Nav */}
        <SidebarNav items={NAV_ITEMS} />

        {/* User */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/10 bg-[#242424] text-sm font-semibold text-[#a0a0a0] transition-colors hover:border-accent/50">
              {user.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate">{user.name || "Admin"}</p>
              <p className="text-[11px] text-[#555] truncate">{user.email}</p>
            </div>
            <form action="/auth/signout" method="POST">
              <button type="submit" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#242424] text-[#555] transition-colors hover:bg-white/[0.08] hover:text-white" title="Sair">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col ml-[230px]">
        {/* Top bar */}
        <header className="flex items-center justify-end gap-3 px-8 py-3 border-b border-white/[0.04]">
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e1e1e] text-[#777] transition-colors hover:bg-[#242424] hover:text-white">
            <Bell className="w-4 h-4" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/10 bg-[#1e1e1e] text-sm font-semibold text-[#a0a0a0]">
            {user.name?.[0]?.toUpperCase() || "A"}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto animate-fade-in-up">{children}</div>
        </main>
      </div>
    </div>
  );
}
