"use client";

import { useState } from "react";
import { CoordinatorRequestsTable } from "@/components/console/coordinator-requests-table";
import { MetricsSummary } from "@/components/console/metrics-summary";

const TABS = [
  { id: "solicitudes", label: "Solicitudes" },
  { id: "indicadores", label: "Indicadores" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const TAB_HEADINGS: Record<TabId, { title: string; description: string }> = {
  solicitudes: {
    title: "Priorizar solicitudes",
    description: "Ordena las solicitudes por prioridad, estado o fecha y ajusta su prioridad.",
  },
  indicadores: {
    title: "Indicadores de gestion",
    description: "Volumen por estado y tiempo de ciclo de las solicitudes.",
  },
};

export default function Console() {
  const [tab, setTab] = useState<TabId>("solicitudes");
  const heading = TAB_HEADINGS[tab];

  return (
    <section className="space-y-6 px-4 py-6 sm:px-6 lg:px-9">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Consola coordinador
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          {heading.title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{heading.description}</p>
      </div>

      <div
        aria-label="Secciones de la consola"
        className="flex gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm sm:w-fit"
        role="tablist"
      >
        {TABS.map((item) => (
          <button
            aria-controls={`panel-${item.id}`}
            aria-selected={tab === item.id}
            className={
              tab === item.id
                ? "rounded-xl bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                : "rounded-xl px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
            }
            id={`tab-${item.id}`}
            key={item.id}
            onClick={() => setTab(item.id)}
            role="tab"
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div aria-labelledby={`tab-${tab}`} id={`panel-${tab}`} role="tabpanel">
        {tab === "solicitudes" ? <CoordinatorRequestsTable /> : <MetricsSummary />}
      </div>
    </section>
  );
}
