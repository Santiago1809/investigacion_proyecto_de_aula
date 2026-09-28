"use client";

import { useState } from "react";
import { REQUEST_PRIORITIES } from "@/hooks/use-all-requests";
import { useCategories } from "@/hooks/use-categories";
import {
  REQUEST_STATUSES,
  STATUS_LABELS,
  type RequestStatus,
} from "@/hooks/use-request-status";
import type { RequestFilters, RequestPriority } from "@/hooks/use-user-requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const selectClassName =
  "h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 focus-visible:border-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-100 disabled:opacity-60";

export interface RequestsFilterToolbarProps {
  /** Filtros activos (controlados por el padre, que también resetea la página). */
  filters: RequestFilters;
  /** Aplica un cambio parcial; un valor `undefined` quita el filtro. */
  onChange: (patch: Partial<RequestFilters>) => void;
  /** Quita todos los filtros. */
  onClear: () => void;
  /** Aplica la búsqueda de texto pendiente (ya sin espacios sobrantes). */
  onSearch: (text: string) => void;
  /** Filtros que el backend confirmó en la última respuesta. */
  appliedFilters?: RequestFilters;
}

export function RequestsFilterToolbar({
  filters,
  onChange,
  onClear,
  onSearch,
  appliedFilters = {},
}: RequestsFilterToolbarProps) {
  // El texto se aplica al enviar el formulario (como en HU08); los selects se
  // aplican al elegirlos porque cada cambio ya es una acción explícita.
  const [searchInput, setSearchInput] = useState("");
  const { data: categories } = useCategories();

  const categoryName = categories?.find(
    (category) => category.id === appliedFilters.category_id,
  )?.name;

  const summary = [
    appliedFilters.q && `texto: "${appliedFilters.q}"`,
    appliedFilters.status && `estado: ${STATUS_LABELS[appliedFilters.status]}`,
    appliedFilters.priority && `prioridad: ${appliedFilters.priority}`,
    appliedFilters.category_id &&
      `categoría: ${categoryName ?? appliedFilters.category_id}`,
  ].filter(Boolean) as string[];

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <form
      aria-label="Buscar y filtrar solicitudes"
      className="flex flex-wrap items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(searchInput.trim());
      }}
    >
      <Input
        aria-label="Buscar solicitudes"
        className="max-w-xs"
        placeholder="Buscar por titulo o descripcion"
        type="search"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
      />
      <Button type="submit" variant="outline">
        Buscar
      </Button>
      <select
        aria-label="Filtrar por estado"
        className={selectClassName}
        value={filters.status ?? ""}
        onChange={(event) =>
          onChange({ status: (event.target.value || undefined) as RequestStatus | undefined })
        }
      >
        <option value="">Todos los estados</option>
        {REQUEST_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
      <select
        aria-label="Filtrar por prioridad"
        className={selectClassName}
        value={filters.priority ?? ""}
        onChange={(event) =>
          onChange({
            priority: (event.target.value || undefined) as RequestPriority | undefined,
          })
        }
      >
        <option value="">Todas las prioridades</option>
        {REQUEST_PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </select>
      <select
        aria-label="Filtrar por categoría"
        className={selectClassName}
        disabled={!categories}
        value={filters.category_id ?? ""}
        onChange={(event) =>
          onChange({ category_id: Number(event.target.value) || undefined })
        }
      >
        <option value="">Todas las categorías</option>
        {categories?.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      {hasFilters && (
        <Button
          onClick={() => {
            setSearchInput("");
            onClear();
          }}
          size="sm"
          type="button"
          variant="ghost"
        >
          Limpiar
        </Button>
      )}
      {summary.length > 0 && (
        <p className="w-full text-xs text-slate-500">Filtros: {summary.join(" · ")}</p>
      )}
    </form>
  );
}
