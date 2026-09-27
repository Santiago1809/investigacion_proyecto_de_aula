"use client";

import { useState } from "react";
import {
  assignmentErrorMessage,
  useAgents,
  useAssignRequest,
} from "@/hooks/use-assign-request";
import type { CoordinatorRequest } from "@/hooks/use-all-requests";
import { Button } from "@/components/ui/button";

export function AssignAgentCell({ request }: { request: CoordinatorRequest }) {
  const { data: agents, isPending: agentsPending, isError: agentsError } =
    useAgents();
  const { mutateAsync, isPending, isError, error } = useAssignRequest();
  const [agentId, setAgentId] = useState("");

  if (request.status !== "NUEVO") {
    return <span className="text-xs text-slate-400">—</span>;
  }

  async function handleAssign() {
    if (!agentId) return;
    await mutateAsync({ requestId: request.id, agentId: Number(agentId) }).then(
      () => setAgentId(""),
      () => undefined,
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <select
          aria-label={`Agente para ${request.title}`}
          className="h-8 max-w-40 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 focus-visible:border-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-100 disabled:opacity-60"
          disabled={isPending || agentsPending || agentsError}
          onChange={(event) => setAgentId(event.target.value)}
          value={agentId}
        >
          <option value="">
            {agentsPending ? "Cargando agentes…" : "Elige un agente"}
          </option>
          {agents?.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.full_name}
            </option>
          ))}
        </select>
        <Button
          className="h-8 bg-emerald-600 text-white hover:bg-emerald-700"
          disabled={!agentId || isPending}
          onClick={handleAssign}
          size="sm"
          type="button"
        >
          {isPending ? "Asignando…" : "Asignar"}
        </Button>
      </div>
      {agentsError && (
        <span className="text-xs text-red-600" role="alert">
          No se pudieron cargar los agentes
        </span>
      )}
      {isError && (
        <span className="max-w-56 text-xs text-red-600" role="alert">
          {assignmentErrorMessage(error)}
        </span>
      )}
    </div>
  );
}
