"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Fingerprint, RotateCcw } from "lucide-react";
import {
  ACTION_LABELS,
  AUDIT_ACTIONS,
  EMPTY_AUDIT_FILTERS,
  useAuditEvent,
  useAuditEvents,
  type AuditEvent,
  type AuditFilters,
} from "@/hooks/use-audit-events";
import { apiErrorMessage } from "@/hooks/use-user-requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 10;
const COLUMN_COUNT = 5;

const SELECT_CLASS =
  "h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-700 focus-visible:border-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-100 disabled:opacity-60";

const HEADERS = ["Fecha", "Actor", "Acción", "Campo", "Valor anterior → Nuevo"];

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
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

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Placeholder explícito: el trail deja columnas en null en muchas acciones. */
function Value({ value }: { value: string | null }) {
  if (value === null || value === "") {
    return <span className="italic text-slate-400">Sin valor</span>;
  }
  return <span className="text-slate-700">{value}</span>;
}

function ValueChange({
  oldValue,
  newValue,
}: {
  oldValue: string | null;
  newValue: string | null;
}) {
  const isEmpty = (value: string | null) => value === null || value === "";

  if (isEmpty(oldValue) && isEmpty(newValue)) {
    return <span className="italic text-slate-400">Sin valores</span>;
  }

  return (
    <span className="flex items-center gap-1.5">
      <Value value={oldValue} />
      <span aria-hidden="true" className="text-slate-400">
        →
      </span>
      <Value value={newValue} />
    </span>
  );
}

function ActorCell({ event }: { event: AuditEvent }) {
  return (
    <span className="flex flex-col gap-0.5">
      <span className="font-medium text-slate-900">
        {event.actor_name ?? "Usuario no registrado"}
      </span>
      {/* El actor que exige el requisito es el id codificado, no el nombre. */}
      <span className="font-mono text-[11px] text-slate-500">{event.actor_id}</span>
    </span>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-2 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="text-sm text-slate-800">{children}</dd>
    </div>
  );
}

function AuditEventDetail({ id, onClose }: { id: number; onClose: () => void }) {
  const { data, error, isError, isPending, refetch } = useAuditEvent(id);

  return (
    <Sheet onOpenChange={(open) => !open && onClose()} open>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Detalle del evento de auditoría</SheetTitle>
          <SheetDescription>
            Registro de solo lectura: no se puede editar ni eliminar.
          </SheetDescription>
        </SheetHeader>

        <div className="overflow-y-auto px-6 pb-6">
          {isPending && (
            <div aria-busy="true" className="space-y-3">
              <span className="sr-only">Cargando detalle del evento...</span>
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          )}

          {isError && (
            <div
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center"
              role="alert"
            >
              <p className="font-semibold text-red-900">No pudimos cargar el evento</p>
              <p className="mt-1 text-sm text-red-700">
                {apiErrorMessage(error, "Intenta nuevamente en unos segundos.")}
              </p>
              <Button
                className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => void refetch()}
                type="button"
              >
                Reintentar
              </Button>
            </div>
          )}

          {data && (
            <dl>
              <DetailRow label="Id del evento">{data.id}</DetailRow>
              <DetailRow label="Fecha">{formatDateTime(data.created_at)}</DetailRow>
              <DetailRow label="Acción">{ACTION_LABELS[data.action]}</DetailRow>
              <DetailRow label="Solicitud">
                <span className="font-mono text-xs">{data.request_id}</span>
              </DetailRow>
              <DetailRow label="Actor">
                {data.actor_name ?? "Usuario no registrado"}
                <span className="mt-1 block font-mono text-xs text-slate-500">
                  {data.actor_id}
                </span>
              </DetailRow>
              <DetailRow label="Campo">
                <Value value={data.field_name} />
              </DetailRow>
              <DetailRow label="Valor anterior">
                <Value value={data.old_value} />
              </DetailRow>
              <DetailRow label="Valor nuevo">
                <Value value={data.new_value} />
              </DetailRow>
            </dl>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function LoadingRows() {
  return Array.from({ length: 5 }, (_, rowIndex) => (
    <TableRow key={`loading-${rowIndex}`}>
      {Array.from({ length: COLUMN_COUNT }, (_, cellIndex) => (
        <TableCell key={cellIndex}>
          <Skeleton className="h-4 w-full max-w-32" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export function AuditEventsTable() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AuditFilters>(EMPTY_AUDIT_FILTERS);
  // Los ids son texto largo: se escriben y se aplican al enviar el formulario,
  // no en cada tecla.
  const [draft, setDraft] = useState({ request_id: "", actor_id: "" });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, error, isError, isFetching, isPending, refetch } = useAuditEvents(
    page,
    PAGE_SIZE,
    filters,
  );

  const events = data?.data ?? [];
  const pagination = data?.pagination;
  // El backend devuelve solo los filtros que aplicó: la UI no los adivina.
  const applied = data?.applied_filters ?? {};
  const hasAppliedFilters = Object.keys(applied).length > 0;

  function applyFilters(patch: Partial<AuditFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }

  function clearFilters() {
    setDraft({ request_id: "", actor_id: "" });
    setFilters(EMPTY_AUDIT_FILTERS);
    setPage(1);
  }

  const appliedChips: string[] = [];
  if (applied.action) appliedChips.push(`Acción: ${ACTION_LABELS[applied.action]}`);
  if (applied.request_id) appliedChips.push(`Solicitud: ${applied.request_id}`);
  if (applied.actor_id) appliedChips.push(`Actor: ${applied.actor_id}`);
  if (applied.from) appliedChips.push(`Desde: ${formatDate(applied.from)}`);
  if (applied.to) appliedChips.push(`Hasta: ${formatDate(applied.to)}`);

  const filtersBar = (
    <form
      aria-label="Filtrar eventos de auditoría"
      className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        applyFilters({
          request_id: draft.request_id.trim(),
          actor_id: draft.actor_id.trim(),
        });
      }}
    >
      <Field id="audit-action" label="Acción">
        <select
          className={SELECT_CLASS}
          id="audit-action"
          onChange={(event) => applyFilters({ action: event.target.value })}
          value={filters.action}
        >
          <option value="">Todas</option>
          {AUDIT_ACTIONS.map((action) => (
            <option key={action} value={action}>
              {ACTION_LABELS[action]}
            </option>
          ))}
        </select>
      </Field>

      <Field id="audit-request" label="Id de solicitud">
        <Input
          className="max-w-56 font-mono text-xs"
          id="audit-request"
          onChange={(event) =>
            setDraft((current) => ({ ...current, request_id: event.target.value }))
          }
          placeholder="00000000-0000-0000-0000-000000000000"
          value={draft.request_id}
        />
      </Field>

      <Field id="audit-actor" label="Id de actor">
        <Input
          className="max-w-56 font-mono text-xs"
          id="audit-actor"
          onChange={(event) =>
            setDraft((current) => ({ ...current, actor_id: event.target.value }))
          }
          placeholder="00000000-0000-0000-0000-000000000000"
          value={draft.actor_id}
        />
      </Field>

      <Field id="audit-from" label="Desde">
        <Input
          id="audit-from"
          onChange={(event) => applyFilters({ from: event.target.value })}
          type="date"
          value={filters.from}
        />
      </Field>

      <Field id="audit-to" label="Hasta">
        <Input
          id="audit-to"
          onChange={(event) => applyFilters({ to: event.target.value })}
          type="date"
          value={filters.to}
        />
      </Field>

      <Button disabled={isFetching} size="sm" type="submit" variant="outline">
        Aplicar
      </Button>
      <Button disabled={isFetching} onClick={clearFilters} size="sm" type="button" variant="ghost">
        <RotateCcw data-icon="inline-start" />
        Limpiar
      </Button>
    </form>
  );

  return (
    <section aria-label="Historial de auditoría" className="space-y-4">
      <p className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
        <Fingerprint aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-400" />
        <span>
          Registro{" "}
          <strong className="font-semibold text-slate-800">inmutable y de solo lectura</strong>:
          cada evento lo escribe la base de datos al ocurrir la acción y no puede modificarse ni
          eliminarse desde la aplicación.
        </span>
      </p>

      {filtersBar}

      {isError ? (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center"
          role="alert"
        >
          <p className="font-semibold text-red-900">No pudimos cargar los eventos de auditoría</p>
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
      ) : (
        <>
          <p className="text-sm text-slate-500">
            {appliedChips.length > 0 ? (
              <>
                <span className="font-medium text-slate-700">Filtros aplicados:</span>{" "}
                {appliedChips.join(" · ")}
              </>
            ) : (
              "Sin filtros aplicados: se muestran todos los eventos."
            )}
          </p>

          <div
            className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${isFetching && !isPending ? "opacity-70" : ""}`}
          >
            <Table aria-label="Eventos de auditoría">
              <TableHeader>
                <TableRow>
                  {HEADERS.map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  <LoadingRows />
                ) : events.length === 0 ? (
                  <TableRow>
                    <TableCell className="h-32 text-center text-slate-500" colSpan={COLUMN_COUNT}>
                      {hasAppliedFilters
                        ? "Ningún evento coincide con los filtros"
                        : "Sin eventos de auditoría"}
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => (
                    <TableRow
                      aria-expanded={selectedId === event.id}
                      aria-label={`Ver detalle del evento ${event.id}`}
                      className="cursor-pointer"
                      key={event.id}
                      onClick={() => setSelectedId(event.id)}
                      onKeyDown={(clickEvent) => {
                        if (clickEvent.key === "Enter" || clickEvent.key === " ") {
                          clickEvent.preventDefault();
                          setSelectedId(event.id);
                        }
                      }}
                      tabIndex={0}
                    >
                      <TableCell>
                        <time
                          className="whitespace-nowrap text-slate-500"
                          dateTime={event.created_at}
                        >
                          {formatDateTime(event.created_at)}
                        </time>
                      </TableCell>
                      <TableCell>
                        <ActorCell event={event} />
                      </TableCell>
                      <TableCell>
                        <span className="whitespace-nowrap font-medium text-slate-900">
                          {ACTION_LABELS[event.action]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Value value={event.field_name} />
                      </TableCell>
                      <TableCell>
                        <ValueChange newValue={event.new_value} oldValue={event.old_value} />
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
                Página {pagination.page} de {pagination.totalPages} · {pagination.totalItems} eventos
              </p>
              <div className="flex items-center gap-2">
                <Button
                  aria-label="Ir a la página anterior"
                  disabled={!pagination.hasPrev || isFetching}
                  onClick={() => setPage((currentPage) => currentPage - 1)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Anterior
                </Button>
                <Button
                  aria-label="Ir a la página siguiente"
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
        </>
      )}

      {selectedId !== null && (
        <AuditEventDetail id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </section>
  );
}
