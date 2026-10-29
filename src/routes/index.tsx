import { createFileRoute, Link } from "@tanstack/react-router";
import { Trees, Flame, Droplets, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, PageTitle, Badge, toneFor, DemoNote } from "@/components/AppShell";
import { ocorrencias, projetos, provincias } from "@/lib/demo-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel principal — PROTIND" },
      { name: "description", content: "Indicadores ambientais do território de Angola na plataforma PROTIND." },
      { property: "og:title", content: "Painel principal — PROTIND" },
      { property: "og:description", content: "Indicadores ambientais do território de Angola." },
    ],
  }),
  component: Index,
});

const kpis = [
  { label: "Cobertura florestal", valor: "46,2%", delta: "-0,4% este ano", icon: Trees, cor: "text-primary bg-primary/10" },
  { label: "Focos de incêndio (30d)", valor: "1.284", delta: "+12% vs. mês anterior", icon: Flame, cor: "text-destructive bg-destructive/10" },
  { label: "Qualidade da água", valor: "72/100", delta: "Estável", icon: Droplets, cor: "text-ocean bg-accent" },
  { label: "Ocorrências abertas", valor: "57", delta: "8 de gravidade alta", icon: AlertTriangle, cor: "text-foreground bg-warning/20" },
];

const meses = [38, 44, 41, 52, 61, 58, 70, 66, 74, 69, 80, 77];

function Index() {
  return (
    <>
      <div className="mb-6 overflow-hidden rounded-2xl bg-hero p-6 text-primary-foreground md:p-8">
        <p className="text-sm opacity-80">Plataforma de Proteção Inteligente do Território</p>
        <h1 className="mt-1 text-2xl font-bold md:text-4xl">Bem-vindo ao PROTIND</h1>
        <p className="mt-2 max-w-xl text-sm opacity-90">Organizar o território de Angola e preservar o ambiente com apoio de inteligência artificial.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <div className={`mb-3 grid h-10 w-10 place-items-center rounded-lg ${k.cor}`}><k.icon className="h-5 w-5" /></div>
            <div className="text-sm text-muted-foreground">{k.label}</div>
            <div className="font-display text-2xl font-bold">{k.valor}</div>
            <div className="text-xs text-muted-foreground">{k.delta}</div>
          </Card>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="font-semibold">Área reflorestada acumulada (mil ha)</h2>
          <div className="mt-4 flex h-44 items-end gap-2">
            {meses.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t-md bg-hero" style={{ height: `${v * 2}px` }} />
                <span className="text-[10px] text-muted-foreground">{"JFMAMJJASOND"[i]}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold">Províncias com menor cobertura</h2>
          <ul className="mt-3 space-y-3">
            {[...provincias].sort((a, b) => a.cobertura - b.cobertura).slice(0, 5).map((p) => (
              <li key={p.nome}>
                <div className="flex justify-between text-sm"><span>{p.nome}</span><span className="text-muted-foreground">{p.cobertura}%</span></div>
                <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${p.cobertura}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between"><h2 className="font-semibold">Ocorrências recentes</h2><Link to="/ocorrencias" className="flex items-center gap-1 text-sm text-ocean">Ver todas <ArrowRight className="h-4 w-4" /></Link></div>
          <ul className="mt-3 divide-y">
            {ocorrencias.slice(0, 4).map((o) => (
              <li key={o.id} className="flex items-center justify-between py-2 text-sm">
                <div><div className="font-medium">{o.tipo}</div><div className="text-xs text-muted-foreground">{o.provincia} · {o.data}</div></div>
                <Badge tone={toneFor(o.gravidade)}>{o.gravidade}</Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="flex items-center justify-between"><h2 className="font-semibold">Projetos em destaque</h2><Link to="/projetos" className="flex items-center gap-1 text-sm text-ocean">Ver todos <ArrowRight className="h-4 w-4" /></Link></div>
          <ul className="mt-3 space-y-3">
            {projetos.slice(0, 3).map((p) => (
              <li key={p.nome}>
                <div className="flex justify-between text-sm"><span className="font-medium">{p.nome}</span><span>{p.progresso}%</span></div>
                <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-ocean" style={{ width: `${p.progresso}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <DemoNote />
    </>
  );
}

