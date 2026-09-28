import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { RequestsPagination } from "@/hooks/use-user-requests";

// Espejo de audit_action en la BD. El select de filtros ofrece exactamente
// estos valores: cualquier otro llega al enum de Postgres y el backend responde
// 400.
export const AUDIT_ACTIONS = [
  "REQUEST_CREATED",
  "PRIORITY_CHANGED",
  "ASSIGNED",
  "UNASSIGNED",
  "STATUS_CHANGED",
  "COMMENT_CREATED",
  "SOLUTION_CONFIRMED",
  "REQUEST_REOPENED",
  "REPORT_EXPORTED",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

// Etiquetas en espanol para mostrar en la columna "Accion": el enum es tecnico.
export const ACTION_LABELS: Record<AuditAction, string> = {
  REQUEST_CREATED: "Solicitud creada",
  PRIORITY_CHANGED: "Prioridad modificada",
  ASSIGNED: "Agente asignado",
  UNASSIGNED: "Agente desasignado",
  STATUS_CHANGED: "Estado modificado",
  COMMENT_CREATED: "Comentario agregado",
  SOLUTION_CONFIRMED: "Solucion confirmada",
  REQUEST_REOPENED: "Solicitud reabierta",
  REPORT_EXPORTED: "Reporte exportado",
};

/**
 * Estado de los filtros en la UI: cadena vacia = "todos".
 * El backend tiene esquema estricto, asi que los vacios nunca viajan: cada
 * filtro se omite de la query string.
 */
export interface AuditFilters {
  action: string;
  request_id: string;
  actor_id: string;
  from: string;
  to: string;
}

export const EMPTY_AUDIT_FILTERS: AuditFilters = {
  action: "",
  request_id: "",
  actor_id: "",
  from: "",
  to: "",
};

/** Filtros que el backend confirmo en `applied_filters` (solo los aplicados). */
export interface AppliedAuditFilters {
  action?: AuditAction;
  request_id?: string;
  actor_id?: string;
  from?: string;
  to?: string;
}

export interface AuditEvent {
  /** audit_events.id es BIGSERIAL, no un UUID: se maneja como numero. */
  id: number;
  request_id: string;
  action: AuditAction;
  /** Null en acciones sin campo (ej. COMMENT_CREATED). */
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  /** Identidad codificada del actor: es el dato que exige el requisito. */
  actor_id: string;
  /** Null si la fila de `users` ya no existe. */
  actor_name: string | null;
}

interface AuditEventsResponse {
  status: number;
  data: AuditEvent[];
  pagination: RequestsPagination;
  applied_filters: AppliedAuditFilters;
}

interface AuditEventResponse {
  status: number;
  data: AuditEvent;
}

/** HU11 es de solo lectura: no existe ningun hook de mutacion a proposito. */
export function useAuditEvents(
  page: number,
  limit: number,
  filters: AuditFilters = EMPTY_AUDIT_FILTERS,
) {
  return useQuery({
    queryKey: ["audit", page, limit, filters],
    queryFn: async () => {
      const response = await api.get<AuditEventsResponse>("/audit", {
        // Cada filtro viaja solo cuando tiene valor: el esquema del backend es
        // estricto y `from=`/`to=` vacios son 400.
        params: {
          page,
          limit,
          action: filters.action || undefined,
          request_id: filters.request_id || undefined,
          actor_id: filters.actor_id || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined,
        },
      });

      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** Detalle de un evento. `id` en null deja la consulta dormida. */
export function useAuditEvent(id: number | null) {
  return useQuery({
    queryKey: ["audit", "event", id],
    queryFn: async () => {
      const response = await api.get<AuditEventResponse>(`/audit/${id}`);
      return response.data.data;
    },
    enabled: id !== null,
  });
}
