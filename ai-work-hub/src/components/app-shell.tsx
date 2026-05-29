import Link from "next/link";
import { Bot, Boxes, Database, FileText, FolderGit2, GitBranch, Home, Library, Settings } from "lucide-react";
import { cn } from "@/lib/ui";

const nav = [
  { href: "/", label: "工作台", icon: Home },
  { href: "/context", label: "项目上下文", icon: FolderGit2 },
  { href: "/workflows", label: "Workflow", icon: GitBranch },
  { href: "/knowledge", label: "知识库", icon: Database },
  { href: "/agents", label: "Agent", icon: Bot },
  { href: "/runs", label: "Runs", icon: Boxes },
  { href: "/outputs", label: "Outputs", icon: Library },
  { href: "/settings", label: "规则", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-white">
            <FileText size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold">AI Work Hub</div>
            <div className="text-xs text-slate-500">智能工作台</div>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              )}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
