"use client";

import { createColumnHelper, rowPaginationFeature, tableFeatures, useTable } from "@tanstack/react-table";
import { useState } from "react";
import { useUserRequests, type UserRequest } from "@/hooks/use-user-requests";
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
const requestTableFeatures = tableFeatures({ rowPaginationFeature });
const requestColumnHelper = createColumnHelper<typeof requestTableFeatures, UserRequest>();

const requestColumns = requestColumnHelper.columns([
  requestColumnHelper.accessor("id", {
    header: "ID",
    cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span>,
  }),
  requestColumnHelper.accessor("title", {
    header: "Titulo",
    cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
  }),
  requestColumnHelper.accessor("category", {
    header: "Categoria",
  }),
  requestColumnHelper.accessor("priority", {
    header: "Prioridad",
    cell: (info) => (
      <span className="font-medium text-slate-700">{info.getValue()}</span>
    ),
  }),
  requestColumnHelper.accessor("status", {
    header: "Estado",
    cell: (info) => (
      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        {info.getValue()}
      </span>
    ),
  }),
  requestColumnHelper.accessor("description", {
    header: "Descripcion",
    cell: (info) => (
      <span
        className="block max-w-[20rem] truncate text-slate-500"
        title={info.getValue()}
      >
        {info.getValue()}
      </span>
    ),
  }),
]);

function LoadingRows() {
  return Array.from({ length: 5 }, (_, index) => (
    <TableRow key={`loading-${index}`}>
      {Array.from({ length: requestColumns.length }, (_, cellIndex) => (
        <TableCell key={cellIndex}>
          <Skeleton className="h-4 w-full max-w-32" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export function RequestsTable() {
  const [page, setPage] = useState(1);
  const { data, error, isError, isFetching, isPending, refetch } =
    useUserRequests(page, PAGE_SIZE);
  const requests = data?.data ?? [];
  const pagination = data?.pagination;
  const table = useTable({
    features: requestTableFeatures,
    data: requests,
    columns: requestColumns,
    manualPagination: true,
    pageCount: pagination?.totalPages ?? -1,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: PAGE_SIZE,
      },
    },
  });

  if (isPending) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table aria-label="Solicitudes">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : table.FlexRender({ header })}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            <LoadingRows />
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
        <p className="font-semibold text-red-900">No pudimos cargar tus solicitudes</p>
        <p className="mt-1 text-sm text-red-700">
          {error instanceof Error ? error.message : "Intenta nuevamente en unos segundos."}
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
    <section aria-label="Solicitudes" className="space-y-4">
      <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${isFetching ? "opacity-70" : ""}`}>
        <Table aria-label="Solicitudes">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : table.FlexRender({ header })}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell className="h-32 text-center text-slate-500" colSpan={requestColumns.length}>
                  No hay solicitudes para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {table.FlexRender({ cell })}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalItems > 0 && (
        <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Pagina {pagination.page} de {pagination.totalPages} · {pagination.totalItems} solicitudes
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
