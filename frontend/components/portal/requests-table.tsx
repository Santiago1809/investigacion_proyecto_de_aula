"use client";

import { createColumnHelper, rowPaginationFeature, tableFeatures, useTable } from "@tanstack/react-table";
import Link from "next/link";
import { useState } from "react";
import {
  apiErrorMessage,
  useConfirmSolution,
  useReopenRequest,
  useUserRequests,
  type UserRequest,
} from "@/hooks/use-user-requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    cell: (info) => (
      <Link
        className="font-medium text-slate-900 underline-offset-2 hover:text-emerald-700 hover:underline"
        href={`/portal/requests/${info.row.original.id}`}
      >
        {info.getValue()}
      </Link>
    ),
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
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [reopenId, setReopenId] = useState<string | null>(null);
  const [reopenReason, setReopenReason] = useState("");
  const [actionError, setActionError] = useState<{
    id: string;
    message: string;
  } | null>(null);
  const { data, error, isError, isFetching, isPending, refetch } =
    useUserRequests(page, PAGE_SIZE, q);
  const confirmSolution = useConfirmSolution();
  const reopenRequest = useReopenRequest();
  const requests = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSearch = () => {
    setQ(searchInput.trim());
    setPage(1);
  };

  const handleConfirm = (requestId: string) => {
    setActionError(null);
    confirmSolution.mutate(requestId, {
      onError: (mutationError) => {
        setActionError({
          id: requestId,
          message: apiErrorMessage(
            mutationError,
            "No se pudo confirmar la solución.",
          ),
        });
      },
    });
  };

  const handleConfirmReopen = (requestId: string) => {
    setActionError(null);
    reopenRequest.mutate(
      { requestId, reason: reopenReason.trim() },
      {
        onError: (mutationError) => {
          setActionError({
            id: requestId,
            message: apiErrorMessage(
              mutationError,
              "No se pudo reabrir la solicitud.",
            ),
          });
        },
      },
    );
  };

  const columns = [
    ...requestColumns,
    requestColumnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: (info) => {
        const request = info.row.original;

        if (request.status !== "RESUELTO") {
          return <span className="text-slate-300">—</span>;
        }

        const requestId = String(request.id);

        return (
          <div className="flex flex-col gap-1.5">
            {reopenId === requestId ? (
              <>
                <textarea
                  aria-label="Motivo de reapertura"
                  className="w-56 rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600/20"
                  placeholder="¿Por qué reabres esta solicitud?"
                  rows={2}
                  value={reopenReason}
                  onChange={(event) => setReopenReason(event.target.value)}
                />
                <div className="flex gap-1.5">
                  <Button
                    disabled={!reopenReason.trim() || reopenRequest.isPending}
                    onClick={() => handleConfirmReopen(requestId)}
                    size="xs"
                    type="button"
                  >
                    Confirmar reapertura
                  </Button>
                  <Button
                    onClick={() => setReopenId(null)}
                    size="xs"
                    type="button"
                    variant="ghost"
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex gap-1.5">
                <Button
                  disabled={confirmSolution.isPending || reopenRequest.isPending}
                  onClick={() => handleConfirm(requestId)}
                  size="xs"
                  type="button"
                >
                  Confirmar solución
                </Button>
                <Button
                  disabled={confirmSolution.isPending || reopenRequest.isPending}
                  onClick={() => {
                    setReopenId(requestId);
                    setReopenReason("");
                  }}
                  size="xs"
                  type="button"
                  variant="outline"
                >
                  Reabrir
                </Button>
              </div>
            )}
            {actionError?.id === requestId && (
              <p className="max-w-56 text-xs text-red-600" role="alert">
                {actionError.message}
              </p>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useTable({
    features: requestTableFeatures,
    data: requests,
    columns,
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
      <form
        aria-label="Buscar solicitudes"
        className="flex flex-wrap items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          handleSearch();
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
        {q && (
          <Button
            onClick={() => {
              setSearchInput("");
              setQ("");
              setPage(1);
            }}
            size="sm"
            type="button"
            variant="ghost"
          >
            Limpiar
          </Button>
        )}
      </form>

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
                <TableCell className="h-32 text-center text-slate-500" colSpan={columns.length}>
                  {q
                    ? "No hay solicitudes que coincidan con la busqueda."
                    : "No hay solicitudes para mostrar."}
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
