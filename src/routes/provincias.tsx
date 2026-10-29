import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Card, PageTitle, DemoNote } from "@/components/AppShell";
import { provincias } from "@/lib/demo-data";

export const Route = createFileRoute("/provincias")({
  head: () => ({
    meta: [
      { title: "Províncias e municípios — PROTIND" },
      { name: "description", content: "Gestão das províncias e municípios de Angola." },
      { property: "og:title", content: "Províncias e municípios — PROTIND" },
      { property: "og:description", content: "Gestão territorial das províncias e municípios de Angola." },
    ],
  }),
  component: Provincias,
});

function Provincias() {
  const [q, setQ] = useState("");
  const list = provincias.filter((p) => p.nome.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageTitle title="Gestão de províncias e municípios" subtitle="18 províncias · 326 municípios (dados demonstrativos)" />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="flex flex-1 items-center gap-2 rounded-lg border bg-card px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar província..." className="h-10 flex-1 bg-transparent text-sm outline-none" />
        </label>
        <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" />Novo município</button>
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Província</th><th className="p-3">Capital</th><th className="p-3">Municípios</th><th className="p-3">Área (km²)</th><th className="p-3">Cobertura</th></tr>
          </thead>
          <tbody className="divide-y">
            {list.map((p) => (
              <tr key={p.nome} className="hover:bg-muted/50">
                <td className="p-3 font-medium">{p.nome}</td><td className="p-3">{p.capital}</td><td className="p-3">{p.municipios}</td>
                <td className="p-3">{p.area.toLocaleString("pt-PT")}</td>
                <td className="p-3"><div className="flex items-center gap-2"><div className="h-2 w-20 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${p.cobertura}%` }} /></div>{p.cobertura}%</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <DemoNote />
    </>
  );
}
