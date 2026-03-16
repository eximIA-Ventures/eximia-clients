"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";

interface ProjectOption {
  id: string;
  title: string;
}

export function ProjectSelector({
  projects,
  currentProjectId,
}: {
  projects: ProjectOption[];
  currentProjectId: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (projects.length <= 1) return null;

  const current = projects.find((p) => p.id === currentProjectId);

  function selectProject(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("project", id);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative mx-4 mt-2 mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 rounded-lg bg-white/[0.04] px-3 py-2 text-[11px] text-[#999] hover:bg-white/[0.06] hover:text-[#ccc] transition-all ring-1 ring-white/[0.06]"
      >
        <span className="truncate">{current?.title || "Selecionar projeto"}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg bg-[#1a1a1c] ring-1 ring-white/[0.08] shadow-xl overflow-hidden">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => selectProject(p.id)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-[11px] transition-colors ${
                p.id === currentProjectId
                  ? "bg-accent/10 text-accent"
                  : "text-[#999] hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <span className="truncate flex-1 text-left">{p.title}</span>
              {p.id === currentProjectId && <Check className="w-3 h-3 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
