"use client";

import Link from "next/link";
import { useState } from "react";
import { useAssignedRequests } from "@/hooks/use-assigned-requests";
import type { RequestStatus } from "@/hooks/use-request-status";
import { apiErrorMessage, type RequestFilters } from "@/hooks/use-user-requests";
import { RequestStatusCell } from "@/components/console/request-status-cell";
import { RequestsFilterToolbar } from "@/components/requests/filter-toolbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 10;
// Sin columnas ordenables: el listado del agente es siempre created_at desc, asi
// que las cabeceras son estaticas y las filas se pintan con un map.
const COLUMNS = [
  "Titulo",
  "Categoria",
  "Solicitante",
  "Prioridad",
  "Estado",
  "Fecha",
  "Acciones",
] as const;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AssignedRequestsTable() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<RequestFilters>({});
  const { data, error, isError, isFetching, isPending, refetch } =
    useAssignedRequests(page, PAGE_SIZE, filters);
  const requests = data?.data ?? [];
  const pagination = data?.pagination;
  // El backend devuelve solo los filtros que aplico: la UI no los adivina.
  const appliedFilters = data?.applied_filters ?? {};
  const hasAppliedFilters = Object.values(appliedFilters).some(Boolean);

  function applyFilters(patch: Partial<RequestFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }

  if (isPending) {
    return (
      <div
        aria-busy="true"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <Table aria-label="Solicitudes asignadas">
          <TableHeader>
            <TableRow>
              {COLUMNS.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }, (_, rowIndex) => (
              <TableRow key={`loading-${rowIndex}`}>
                {COLUMNS.map((column) => (
                  <TableCell key={column}>
                    <Skeleton className="h-4 w-full max-w-32" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center"
        role="alert"
      >
        <p className="font-semibold text-red-900">
          No pudimos cargar tus solicitudes asignadas
        </p>
        <p className="mt-1 text-sm text-red-700">
          {apiErrorMessage(
            error,
            "Intenta nuevamente en unos segundos.",
          )}
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
    );
  }

  return (
    <section aria-label="Solicitudes asignadas" className="space-y-4">
      <RequestsFilterToolbar
        appliedFilters={appliedFilters}
        filters={filters}
        onChange={applyFilters}
        onClear={() => {
          setFilters({});
          setPage(1);
        }}
        onSearch={(text) => applyFilters({ q: text || undefined })}
      />

      <div
        className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${isFetching ? "opacity-70" : ""}`}
      >
        <Table aria-label="Solicitudes asignadas">
          <TableHeader>
            <TableRow>
              {COLUMNS.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell
                  className="h-32 text-center text-slate-500"
                  colSpan={COLUMNS.length}
                >
                  {hasAppliedFilters
                    ? "Ninguna solicitud coincide con los filtros aplicados."
                    : "No tienes solicitudes asignadas."}
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <Link
                      className="font-medium text-slate-900 underline-offset-2 hover:text-emerald-700 hover:underline"
                      href={`/work/requests/${request.id}`}
                    >
                      {request.title}
                    </Link>
                  </TableCell>
                  <TableCell>{request.category}</TableCell>
                  <TableCell>{request.requester}</TableCell>
                  <TableCell className="font-medium text-slate-700">
                    {request.priority}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {request.status}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-slate-500">
                    {formatDate(request.created_at)}
                  </TableCell>
                  <TableCell>
                    <RequestStatusCell
                      requestId={String(request.id)}
                      status={request.status as RequestStatus}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalItems > 0 && (
        <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Pagina {pagination.page} de {pagination.totalPages} ·{" "}
            {pagination.totalItems} solicitudes
          </p>
          <div className="flex items-center gap-2">
            <Button
              aria-label="Ir a la pagina anterior"
              disabled={!pagination.hasPrev || isFetching}
              onClick={() => setPage((currentPage) => currentPage - 1)}
              size="sm"
              type="button"
              variant="outline"
            >
              Anterior
            </Button>
            <Button
              aria-label="Ir a la pagina siguiente"
              disabled={!pagination.hasNext || isFetching}
              onClick={() => setPage((currentPage) => currentPage + 1)}
              size="sm"
              type="button"
              variant="outline"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
