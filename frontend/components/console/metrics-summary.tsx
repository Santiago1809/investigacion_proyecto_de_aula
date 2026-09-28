"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  EMPTY_METRICS_FILTERS,
  useMetricsSummary,
  type MetricsFilters,
} from "@/hooks/use-metrics-summary";
import { REQUEST_PRIORITIES } from "@/hooks/use-all-requests";
import { REQUEST_STATUSES, STATUS_LABELS } from "@/hooks/use-request-status";
import { useCategories } from "@/hooks/use-categories";
import { apiErrorMessage } from "@/hooks/use-user-requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const SELECT_CLASS =
  "h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-700 focus-visible:border-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-100 disabled:opacity-60";

function formatHours(hours: number) {
  return hours.toLocaleString("es-CO", { maximumFractionDigits: 1 });
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label
        className="text-xs font-semibold uppercase tracking-wide text-slate-500"
        htmlFor={id}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Card({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function SkeletonCards() {
  return (
    <div aria-busy="true" aria-live="polite" className="grid gap-4 lg:grid-cols-3">
      <span className="sr-only">Cargando indicadores...</span>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-4 h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export function MetricsSummary() {
  const [draftQuery, setDraftQuery] = useState("");
  const [filters, setFilters] = useState<MetricsFilters>(EMPTY_METRICS_FILTERS);
  const { data, error, isError, isFetching, isPending, refetch } = useMetricsSummary(filters);
  const { data: categories } = useCategories();

  function setFilter<K extends keyof MetricsFilters>(key: K, value: MetricsFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function applyQuery() {
    const next = draftQuery.trim();
    if (next !== filters.q) setFilter("q", next);
  }

  function clearFilters() {
    setDraftQuery("");
    setFilters(EMPTY_METRICS_FILTERS);
  }

  // volumen_por_estado siempre trae los 5 estados; el mapa evita renderizar undefined
  const volumes = new Map(
    (data?.volumen_por_estado ?? []).map((item) => [item.status, item.total]),
  );

  const applied = data?.applied_filters;
  const appliedChips: string[] = [];
  if (applied) {
    if (applied.q) appliedChips.push(`Texto: “${applied.q}”`);
    if (applied.status) appliedChips.push(`Estado: ${STATUS_LABELS[applied.status]}`);
    if (applied.priority) appliedChips.push(`Prioridad: ${applied.priority}`);
    if (applied.category_id !== undefined) {
      const name = categories?.find((category) => category.id === applied.category_id)?.name;
      appliedChips.push(`Categoria: ${name ?? applied.category_id}`);
    }
  }

  const filtersBar = (
    <div
      aria-label="Filtros de indicadores"
      className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      role="group"
    >
      <Field id="metrics-q" label="Texto">
        <Input
          className="max-w-xs"
          id="metrics-q"
          onBlur={applyQuery}
          onChange={(event) => setDraftQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") applyQuery();
          }}
          placeholder="Buscar por titulo o descripcion"
          type="search"
          value={draftQuery}
        />
      </Field>

      <Field id="metrics-status" label="Estado">
        <select
          className={SELECT_CLASS}
          id="metrics-status"
          onChange={(event) => setFilter("status", event.target.value)}
          value={filters.status}
        >
          <option value="">Todos</option>
          {REQUEST_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </Field>

      <Field id="metrics-priority" label="Prioridad">
        <select
          className={SELECT_CLASS}
          id="metrics-priority"
          onChange={(event) => setFilter("priority", event.target.value)}
          value={filters.priority}
        >
          <option value="">Todas</option>
          {REQUEST_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </Field>

      <Field id="metrics-category" label="Categoria">
        <select
          className={SELECT_CLASS}
          id="metrics-category"
          onChange={(event) => setFilter("category_id", event.target.value)}
          value={filters.category_id}
        >
          <option value="">Todas</option>
          {categories?.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>

      <Button disabled={isFetching} onClick={clearFilters} size="sm" type="button" variant="ghost">
        <RotateCcw data-icon="inline-start" />
        Limpiar
      </Button>
    </div>
  );

  if (isPending) {
    return (
      <div className="space-y-4">
        {filtersBar}
        <SkeletonCards />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        {filtersBar}
        <div
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center"
          role="alert"
        >
          <p className="font-semibold text-red-900">No pudimos cargar los indicadores</p>
          <p className="mt-1 text-sm text-red-700">
            {apiErrorMessage(error, "Intenta nuevamente en unos segundos.")}
          </p>
          <Button
            className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={isFetching}
            onClick={() => void refetch()}
            type="button"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const { ciclo } = data;

  return (
    <div className="space-y-4">
      {filtersBar}

      <p className="text-sm text-slate-500">
        {appliedChips.length > 0 ? (
          <>
            <span className="font-medium text-slate-700">Filtros aplicados:</span>{" "}
            {appliedChips.join(" · ")}
          </>
        ) : (
          "Sin filtros aplicados: se muestran todos los registros."
        )}
      </p>

      <div className={`grid gap-4 lg:grid-cols-3 ${isFetching ? "opacity-70" : ""}`}>
        <Card label="Solicitudes filtradas">
          <p className="text-3xl font-semibold tracking-tight tabular-nums text-slate-950">
            {data.total_filtradas}
          </p>
          <p className="mt-1 text-sm text-slate-500">en el filtro actual</p>
        </Card>

        <Card label="Volumen por estado">
          <ul className="space-y-2">
            {REQUEST_STATUSES.map((status) => (
              <li key={status} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-600">{STATUS_LABELS[status]}</span>
                <span className="font-semibold tabular-nums text-slate-900">
                  {volumes.get(status) ?? 0}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card label="Tiempo mediano de ciclo">
          {ciclo.mediana_horas === null ? (
            <div>
              <p className="text-sm font-semibold text-slate-700">Sin datos suficientes</p>
              <p className="mt-1 text-sm text-slate-500">
                Ningun solicitud del filtro actual tiene tiempo de ciclo medido.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-3xl font-semibold tracking-tight tabular-nums text-slate-950">
                {formatHours(ciclo.mediana_horas)}
                <span className="text-lg font-medium text-slate-500"> h</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">
                mediana · muestra {ciclo.muestra}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
