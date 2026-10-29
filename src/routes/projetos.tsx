import { createFileRoute } from "@tanstack/react-router";
import { Plus, MapPin } from "lucide-react";
import { Card, PageTitle, Badge, DemoNote } from "@/components/AppShell";
import { projetos } from "@/lib/demo-data";

export const Route = createFileRoute("/projetos")({
  head: () => ({
    meta: [
      { title: "Projetos de preservação — PROTIND" },
      { name: "description", content: "Gestão de projetos de preservação ambiental em Angola." },
      { property: "og:title", content: "Projetos de preservação — PROTIND" },
      { property: "og:description", content: "Projetos de preservação ambiental em Angola." },
    ],
  }),
  component: Projetos,
});

function Projetos() {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageTitle title="Projetos de preservação ambiental" subtitle="Acompanhe progresso, orçamento e localização." />
        <button className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" />Novo projeto</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projetos.map((p) => (
          <Card key={p.nome}>
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold leading-snug">{p.nome}</h2>
              <Badge tone={p.estado === "Concluído" ? "ok" : p.estado === "Planeado" ? "baixa" : "info"}>{p.estado}</Badge>
            </div>
            <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{p.provincia}</p>
            <div className="mt-4 flex justify-between text-sm"><span>Progresso</span><span className="font-semibold">{p.progresso}%</span></div>
            <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-hero" style={{ width: `${p.progresso}%` }} /></div>
            <p className="mt-4 text-sm text-muted-foreground">Orçamento: <span className="font-semibold text-foreground">{p.orcamento}</span></p>
          </Card>
        ))}
      </div>
      <DemoNote />
    </>
  );
}
