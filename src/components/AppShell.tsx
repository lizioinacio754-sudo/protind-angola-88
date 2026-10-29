import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, Map, Landmark, AlertTriangle, Sprout, BrainCircuit, Menu, X, ShieldCheck } from "lucide-react";

const nav = [
  { to: "/", label: "Painel principal", icon: LayoutDashboard },
  { to: "/mapa", label: "Mapa de Angola", icon: Map },
  { to: "/provincias", label: "Províncias e municípios", icon: Landmark },
  { to: "/ocorrencias", label: "Ocorrências ambientais", icon: AlertTriangle },
  { to: "/projetos", label: "Projetos de preservação", icon: Sprout },
  { to: "/ia", label: "Análises por IA", icon: BrainCircuit },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen w-full">
      {open && <div className="fixed inset-0 z-30 bg-foreground/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-hero"><ShieldCheck className="h-5 w-5 text-primary-foreground" /></div>
          <div>
            <div className="font-display text-lg font-bold tracking-wide">PROTIND</div>
            <div className="text-[11px] leading-tight text-sidebar-muted">Proteção Inteligente do Território</div>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((n) => {
            const active = path === n.to;
            return (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"}`}>
                <n.icon className="h-4 w-4" />{n.label}
              </Link>
            );
          })}
        </nav>
        <div className="m-3 rounded-lg border border-sidebar-border p-3 text-xs text-sidebar-muted">
          🇦🇴 República de Angola<br />Versão de demonstração
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu className="h-5 w-5" /></button>
          <span className="font-display font-semibold">{nav.find((n) => n.to === path)?.label ?? "PROTIND"}</span>
          <span className="ml-auto rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-foreground">Dados demonstrativos</span>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border bg-card p-5 shadow-sm ${className}`}>{children}</div>;
}

export function Badge({ tone, children }: { tone: "alta" | "media" | "baixa" | "ok" | "info"; children: ReactNode }) {
  const m = {
    alta: "bg-destructive/10 text-destructive",
    media: "bg-warning/20 text-foreground",
    baixa: "bg-secondary text-secondary-foreground",
    ok: "bg-primary/10 text-primary",
    info: "bg-accent text-accent-foreground",
  };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${m[tone]}`}>{children}</span>;
}

export const toneFor = (g: string) => (g === "Alta" ? "alta" : g === "Média" ? "media" : "baixa") as "alta" | "media" | "baixa";

export function DemoNote() {
  return <p className="mt-6 text-xs text-muted-foreground">⚠ Todos os valores apresentados são dados demonstrativos fictícios.</p>;
}
