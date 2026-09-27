import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";

export const REQUEST_STATUSES = [
  "NUEVO",
  "ASIGNADO",
  "EN_PROGRESO",
  "RESUELTO",
  "CERRADO",
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const STATUS_LABELS: Record<RequestStatus, string> = {
  NUEVO: "Nuevo",
  ASIGNADO: "Asignado",
  EN_PROGRESO: "En progreso",
  RESUELTO: "Resuelto",
  CERRADO: "Cerrado",
};

// Transiciones permitidas por estado actual (espejo del backend).
// NUEVO no tiene transición directa: el cambio ocurre al asignar (HU05).
export const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  NUEVO: [],
  ASIGNADO: ["EN_PROGRESO"],
  EN_PROGRESO: ["RESUELTO"],
  RESUELTO: ["CERRADO", "EN_PROGRESO"],
  CERRADO: [],
};

export interface RequestStatusChange {
  id: string; // UUID
  request_id: string; // UUID
  previous_status: RequestStatus | null;
  new_status: RequestStatus;
  changed_by: string;
  changed_by_name: string;
  changed_at: string;
}

interface HistoryResponse {
  status: number;
  data: RequestStatusChange[];
}

export function useRequestHistory(requestId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["requests", "history", requestId],
    queryFn: async () => {
      const response = await api.get<HistoryResponse>(
        `/request/${requestId}/history`,
      );
      return response.data.data;
    },
    enabled,
  });
}

export function statusErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string; message?: string }
      | undefined;
    return (
      data?.message ?? data?.error ?? "No se pudo cambiar el estado."
    );
  }
  return "No se pudo cambiar el estado. Intenta nuevamente.";
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      status,
    }: {
      requestId: string;
      status: RequestStatus;
    }) => {
      const response = await api.patch(`/request/${requestId}/status`, {
        status,
      });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["requests"] });
      void queryClient.invalidateQueries({
        queryKey: ["requests", "history", variables.requestId],
      });
    },
  });
}
