"use client";

import { Download } from "lucide-react";
import { useExportRequestsCsv } from "@/hooks/use-all-requests";
import type { RequestFilters } from "@/hooks/use-user-requests";
import { Button } from "@/components/ui/button";

export interface ExportRequestsButtonProps {
  /** Filtros activos de la vista: el reporte sale con exactamente los mismos. */
  filters: RequestFilters;
  /** Filas del conjunto filtrado segun la ultima respuesta del listado. */
  totalItems?: number;
}

export function ExportRequestsButton({ filters, totalItems }: ExportRequestsButtonProps) {
  const { mutate, isPending, isSuccess, isError, error } = useExportRequestsCsv();

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          disabled={isPending}
          onClick={() => mutate(filters)}
          size="sm"
          type="button"
          variant="outline"
        >
          <Download data-icon="inline-start" />
          {isPending ? "Generando…" : "Exportar CSV"}
        </Button>
        {isSuccess && (
          <p className="text-xs text-emerald-700" role="status">
            Reporte generado y registrado
            {totalItems === undefined ? "." : ` con ${totalItems} solicitudes.`}
          </p>
        )}
        {isError && (
          <p className="text-xs text-red-600" role="alert">
            {error?.message}
          </p>
        )}
      </div>
      {/* El backend devuelve el conjunto filtrado completo: el archivo no se
          pagina, asi que se aclara junto al boton y no en un modal. */}
      <p className="text-xs text-slate-500">
        El archivo incluye todas las solicitudes que cumplen los filtros, no solo las de la pagina
        visible.
      </p>
    </div>
  );
}
