"use client";

import { createColumnHelper, rowPaginationFeature, tableFeatures, useTable } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import {
  REQUEST_PRIORITIES,
  useAllRequests,
  useUpdateRequestPriority,
  type CoordinatorRequest,
  type RequestPriority,
  type RequestSortBy,
  type SortOrder,
} from "@/hooks/use-all-requests";
import { AssignAgentCell } from "@/components/console/assign-agent-cell";
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
const SORTABLE_COLUMNS: RequestSortBy[] = ["priority", "status", "created_at"];
const requestTableFeatures = tableFeatures({ rowPaginationFeature });
const requestColumnHelper = createColumnHelper<typeof requestTableFeatures, CoordinatorRequest>();

function PrioritySelect({ request }: { request: CoordinatorRequest }) {
  const { mutate, isPending, isError } = useUpdateRequestPriority();

  return (
    <div className="flex flex-col gap-1">
      <select
        aria-label={`Prioridad de ${request.title}`}
        className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-700 focus-visible:border-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-100 disabled:opacity-60"
        disabled={isPending}
        onChange={(event) =>
          mutate({ id: request.id, priority: event.target.value as RequestPriority })
        }
        value={request.priority}
      >
        {REQUEST_PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </select>
      {isError && (
        <span className="text-xs text-red-600" role="alert">
          No se pudo actualizar
        </span>
      )}
    </div>
  );
}

const requestColumns = requestColumnHelper.columns([
  requestColumnHelper.accessor("title", {
    header: "Titulo",
    cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
  }),
  requestColumnHelper.accessor("requester", {
    header: "Solicitante",
  }),
  requestColumnHelper.accessor("category", {
    header: "Categoria",
  }),
  requestColumnHelper.accessor("priority", {
    header: "Prioridad",
    cell: (info) => <PrioritySelect request={info.row.original} />,
  }),
  requestColumnHelper.accessor("status", {
    header: "Estado",
    cell: (info) => (
      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        {info.getValue()}
      </span>
    ),
  }),
  requestColumnHelper.display({
    id: "assign",
    header: "Asignar",
    cell: (info) => <AssignAgentCell request={info.row.original} />,
  }),
  requestColumnHelper.accessor("created_at", {
    header: "Fecha",
    cell: (info) => (
      <span className="whitespace-nowrap text-slate-500">
        {new Date(info.getValue()).toLocaleDateString("es-CO", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </span>
    ),
  }),
]);

function SortIcon({ active, order }: { active: boolean; order: SortOrder }) {
  if (!active) return <ArrowUpDown className="size-3.5 text-slate-400" />;
  return order === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />;
}

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

export function CoordinatorRequestsTable() {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<RequestSortBy>("created_at");
  const [order, setOrder] = useState<SortOrder>("desc");
  const { data, error, isError, isFetching, isPending, refetch } =
    useAllRequests(page, PAGE_SIZE, sortBy, order);
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

  function handleSort(column: RequestSortBy) {
    if (column === sortBy) {
      setOrder((currentOrder) => (currentOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setOrder("desc");
    }
    setPage(1);
  }

  const tableHeader = (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const columnId = header.column.id as RequestSortBy;
            const isSortable = SORTABLE_COLUMNS.includes(columnId);
            const isActive = sortBy === columnId;

            return (
              <TableHead
                key={header.id}
                aria-sort={isActive ? (order === "asc" ? "ascending" : "descending") : undefined}
              >
                {header.isPlaceholder ? null : isSortable ? (
                  <button
                    className={`inline-flex items-center gap-1.5 rounded-md hover:text-emerald-700 ${isActive ? "text-slate-900" : ""}`}
                    disabled={isFetching}
                    onClick={() => handleSort(columnId)}
                    type="button"
                  >
                    {table.FlexRender({ header })}
                    <SortIcon active={isActive} order={order} />
                  </button>
                ) : (
                  table.FlexRender({ header })
                )}
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  );

  if (isPending) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table aria-label="Solicitudes">
          {tableHeader}
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
        <p className="font-semibold text-red-900">No pudimos cargar las solicitudes</p>
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
          {tableHeader}
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
