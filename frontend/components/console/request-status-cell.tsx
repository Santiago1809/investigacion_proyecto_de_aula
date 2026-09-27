"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  ALLOWED_TRANSITIONS,
  STATUS_LABELS,
  statusErrorMessage,
  useRequestHistory,
  useUpdateRequestStatus,
  type RequestStatus,
} from "@/hooks/use-request-status";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_MANAGER_ROLES = [2, 3]; // AGENTE y COORDINADOR

function RequestHistory({ requestId }: { requestId: string }) {
  const { data: history, isPending, isError } = useRequestHistory(requestId, true);

  if (isPending) {
    return (
      <div className="mt-2 space-y-2" aria-label="Cargando historial">
        {Array.from({ length: 2 }, (_, index) => (
          <Skeleton key={index} className="h-4 w-full max-w-56" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="mt-2 text-xs text-red-600" role="alert">
        No se pudo cargar el historial.
      </p>
    );
  }

  if (!history || history.length === 0) {
    return <p className="mt-2 text-xs text-slate-400">Sin cambios registrados.</p>;
  }

  return (
    <ol className="mt-2 space-y-2 border-l-2 border-slate-200 pl-3">
      {history.map((change) => (
        <li key={change.id} className="text-xs text-slate-600">
          <span className="font-medium text-slate-800">
            {change.changed_by_name}
          </span>{" "}
          {change.previous_status
            ? `${STATUS_LABELS[change.previous_status]} → ${STATUS_LABELS[change.new_status]}`
            : STATUS_LABELS[change.new_status]}
          <span className="block text-[11px] text-slate-400">
            {new Date(change.changed_at).toLocaleString("es-CO", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function RequestStatusCell({
  requestId,
  status,
}: {
  requestId: string;
  status: RequestStatus;
}) {
  const { data: session } = useSession();
  const roles = session?.user.roles ?? [];
  const canChangeStatus = roles.some((role) =>
    STATUS_MANAGER_ROLES.includes(role),
  );

  const [showHistory, setShowHistory] = useState(false);
  const { mutate, isPending, isError, error, reset } = useUpdateRequestStatus();

  const transitions = canChangeStatus ? ALLOWED_TRANSITIONS[status] : [];

  function handleTransition(next: RequestStatus) {
    if (isError) reset();
    mutate({ requestId, status: next });
  }

  if (!canChangeStatus && !showHistory) {
    return (
      <Button
        className="h-7 text-xs"
        onClick={() => setShowHistory(true)}
        size="sm"
        type="button"
        variant="outline"
      >
        Ver historial
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {transitions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {transitions.map((next) => (
            <Button
              key={next}
              className={
                next === "CERRADO"
                  ? "h-7 text-xs bg-slate-800 text-white hover:bg-slate-900"
                  : "h-7 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
              }
              disabled={isPending}
              onClick={() => handleTransition(next)}
              size="sm"
              type="button"
            >
              {isPending ? "Cambiando…" : `Pasar a ${STATUS_LABELS[next]}`}
            </Button>
          ))}
        </div>
      )}
      {isError && (
        <span className="max-w-56 text-xs text-red-600" role="alert">
          {statusErrorMessage(error)}
        </span>
      )}
      <Button
        aria-expanded={showHistory}
        className="h-7 w-fit text-xs"
        onClick={() => setShowHistory((current) => !current)}
        size="sm"
        type="button"
        variant="outline"
      >
        {showHistory ? "Ocultar historial" : "Ver historial"}
      </Button>
      {showHistory && <RequestHistory requestId={requestId} />}
    </div>
  );
}
