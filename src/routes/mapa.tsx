import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, PageTitle, DemoNote } from "@/components/AppShell";
import { provincias } from "@/lib/demo-data";

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa de Angola — PROTIND" },
      { name: "description", content: "Mapa interativo das províncias de Angola com cobertura florestal." },
      { property: "og:title", content: "Mapa de Angola — PROTIND" },
      { property: "og:description", content: "Mapa interativo das províncias de Angola." },
    ],
  }),
  component: Mapa,
});

const contorno = "M85,25 L115,20 L110,60 L80,62 Z M110,75 L165,72 L215,85 L250,110 L300,105 L330,100 L345,125 L375,170 L380,240 L400,245 L410,320 L355,330 L345,440 L240,445 L200,455 L140,450 L90,445 L95,400 L115,340 L105,300 L130,250 L135,210 L115,185 L120,140 Z";

function Mapa() {
  const [sel, setSel] = useState(provincias[0]);
  return (
    <>
      <PageTitle title="Mapa de Angola" subtitle="Representação esquemática das 18 províncias — toque num ponto para ver detalhes." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <svg viewBox="60 0 370 470" className="mx-auto h-auto w-full max-w-lg">
            <path d={contorno} className="fill-secondary stroke-primary" strokeWidth={2} />
            {provincias.map((p) => (
              <g key={p.nome} onClick={() => setSel(p)} className="cursor-pointer">
                <circle cx={p.x} cy={p.y} r={sel.nome === p.nome ? 11 : 8}
                  className={p.cobertura > 50 ? "fill-primary" : p.cobertura > 30 ? "fill-ocean" : "fill-warning"} opacity={0.85} />
                <text x={p.x} y={p.y - 13} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">{p.nome}</text>
              </g>
            ))}
          </svg>
          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1"><i className="h-3 w-3 rounded-full bg-primary" />Cobertura &gt; 50%</span>
            <span className="flex items-center gap-1"><i className="h-3 w-3 rounded-full bg-ocean" />30–50%</span>
            <span className="flex items-center gap-1"><i className="h-3 w-3 rounded-full bg-warning" />&lt; 30%</span>
          </div>
        </Card>
        <Card>
          <div className="text-xs uppercase text-muted-foreground">Província selecionada</div>
          <h2 className="mt-1 text-xl font-bold">{sel.nome}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Capital</dt><dd>{sel.capital}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Municípios</dt><dd>{sel.municipios}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Área</dt><dd>{sel.area.toLocaleString("pt-PT")} km²</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Cobertura florestal</dt><dd>{sel.cobertura}%</dd></div>
          </dl>
        </Card>
      </div>
      <DemoNote />
    </>
  );
}
