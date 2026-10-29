import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, PageTitle, Badge, toneFor, DemoNote } from "@/components/AppShell";
import { ocorrencias, provincias } from "@/lib/demo-data";

export const Route = createFileRoute("/ocorrencias")({
  head: () => ({
    meta: [
      { title: "Ocorrências ambientais — PROTIND" },
      { name: "description", content: "Registo e acompanhamento de ocorrências ambientais em Angola." },
      { property: "og:title", content: "Ocorrências ambientais — PROTIND" },
      { property: "og:description", content: "Registo de ocorrências ambientais em Angola." },
    ],
  }),
  component: Ocorrencias,
});

const field = "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary";

function Ocorrencias() {
  const [msg, setMsg] = useState("");
  return (
    <>
      <PageTitle title="Registo de ocorrências ambientais" subtitle="Comunique e acompanhe incidentes ambientais no território." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="mb-4 font-semibold">Nova ocorrência</h2>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setMsg("Demonstração: a ocorrência não foi guardada (sem ligação à base de dados)."); }}>
            <select className={field}><option>Desflorestação</option><option>Queimada</option><option>Poluição hídrica</option><option>Caça furtiva</option><option>Mineração ilegal</option><option>Erosão</option></select>
            <select className={field}>{provincias.map((p) => <option key={p.nome}>{p.nome}</option>)}</select>
            <select className={field}><option>Gravidade alta</option><option>Gravidade média</option><option>Gravidade baixa</option></select>
            <textarea rows={3} placeholder="Descrição da ocorrência..." className={`${field} h-auto py-2`} />
            <button className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground">Registar ocorrência</button>
            {msg && <p className="text-xs text-ocean">{msg}</p>}
          </form>
        </Card>
        <Card className="overflow-x-auto p-0 lg:col-span-2">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Código</th><th className="p-3">Tipo</th><th className="p-3">Província</th><th className="p-3">Data</th><th className="p-3">Gravidade</th><th className="p-3">Estado</th></tr>
            </thead>
            <tbody className="divide-y">
              {ocorrencias.map((o) => (
                <tr key={o.id}>
                  <td className="p-3 font-mono text-xs">{o.id}</td><td className="p-3 font-medium">{o.tipo}</td><td className="p-3">{o.provincia}</td><td className="p-3">{o.data}</td>
                  <td className="p-3"><Badge tone={toneFor(o.gravidade)}>{o.gravidade}</Badge></td>
                  <td className="p-3"><Badge tone={o.estado === "Resolvida" ? "ok" : "info"}>{o.estado}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
      <DemoNote />
    </>
  );
}
