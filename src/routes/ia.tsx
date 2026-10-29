import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit, Sparkles } from "lucide-react";
import { Card, PageTitle, Badge, toneFor, DemoNote } from "@/components/AppShell";
import { recomendacoes } from "@/lib/demo-data";

export const Route = createFileRoute("/ia")({
  head: () => ({
    meta: [
      { title: "Análises por IA — PROTIND" },
      { name: "description", content: "Análises e recomendações ambientais geradas por inteligência artificial." },
      { property: "og:title", content: "Análises por IA — PROTIND" },
      { property: "og:description", content: "Recomendações ambientais por inteligência artificial." },
    ],
  }),
  component: IA,
});

function IA() {
  return (
    <>
      <PageTitle title="Análises e recomendações por IA" subtitle="Exemplos ilustrativos — a IA ainda não está ligada a dados reais." />
      <Card className="mb-4 bg-hero text-primary-foreground">
        <div className="flex items-center gap-3"><Sparkles className="h-6 w-6" /><div>
          <div className="font-semibold">Resumo da semana</div>
          <p className="text-sm opacity-90">4 recomendações ativas · 2 de prioridade alta · índice de risco ambiental nacional: 6,3/10</p>
        </div></div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {recomendacoes.map((r) => (
          <Card key={r.titulo}>
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-ocean"><BrainCircuit className="h-5 w-5" /></div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{r.titulo}</h2><Badge tone={toneFor(r.prioridade)}>{r.prioridade}</Badge></div>
                <p className="mt-2 text-sm text-muted-foreground">{r.texto}</p>
                <div className="mt-3 text-xs text-muted-foreground">Confiança do modelo: <span className="font-semibold text-foreground">{r.confianca}%</span></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <DemoNote />
    </>
  );
}
