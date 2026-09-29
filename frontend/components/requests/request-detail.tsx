"use client";

import { CommentsSection } from "@/components/requests/comments-section";
import { RequestStatusCell } from "@/components/console/request-status-cell";
import { useRequestDetail } from "@/hooks/use-request-detail";
import { STATUS_LABELS } from "@/hooks/use-request-status";
import { apiErrorMessage } from "@/hooks/use-user-requests";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="text-sm text-slate-700">{value ?? "—"}</dd>
    </div>
  );
}

/**
 * Datos de una solicitud mas sus comentarios y el cambio de estado. Los roles
 * 2 y 3 (agente asignado y coordinador) pueden hacer ambas cosas; el backend es
 * quien decide si la peticion es valida para el usuario.
 */
export function RequestDetail({ requestId }: { requestId: string }) {
  const { data: request, error, isError, isPending, refetch } =
    useRequestDetail(requestId);

  if (isError) {
    return (
      <div
        className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center"
        role="alert"
      >
        <p className="font-semibold text-red-900">
          No pudimos cargar la solicitud
        </p>
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
    );
  }

  if (isPending) {
    return (
      <div aria-busy="true" className="space-y-6">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <CommentsSection requestId={requestId} />
      </div>
    );
  }

  if (!request) return null;

  return (
    <div className="space-y-6">
      <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-950">
            {request.title}
          </h2>
          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            {STATUS_LABELS[request.status]}
          </span>
        </div>

        <p className="whitespace-pre-wrap text-sm text-slate-700">
          {request.description}
        </p>

        <dl className="grid gap-x-6 gap-y-2 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <Field label="Categoria" value={request.category} />
          <Field label="Prioridad" value={request.priority} />
          <Field label="Solicitante" value={request.requester} />
          <Field label="Agente" value={request.agent} />
          <Field
            label="Creada"
            value={formatDateTime(request.created_at)}
          />
          <Field
            label="Asignada"
            value={request.assigned_at ? formatDateTime(request.assigned_at) : null}
          />
        </dl>

        <div className="border-t border-slate-100 pt-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">
            Cambiar estado
          </h3>
          <RequestStatusCell
            requestId={requestId}
            status={request.status}
          />
        </div>
      </article>

      <CommentsSection requestId={requestId} />
    </div>
  );
}
