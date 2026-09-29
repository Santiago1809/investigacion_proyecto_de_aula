import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  RequestFilters,
  RequestsPagination,
  UserRequest,
} from "@/hooks/use-user-requests";

export interface AssignedRequest extends UserRequest {
  created_at: string;
  requester: string;
  agent: string | null;
}

interface AssignedRequestsResponse {
  status: number;
  data: AssignedRequest[];
  pagination: RequestsPagination;
  applied_filters: RequestFilters;
}

/**
 * Solicitudes con asignacion vigente del agente autenticado (rol 2). El backend
 * saca el agente del token, asi que aqui nunca se envia un id.
 */
export function useAssignedRequests(
  page: number,
  limit: number,
  filters: RequestFilters = {},
) {
  return useQuery({
    queryKey: ["requests", "assigned", page, limit, filters],
    queryFn: async () => {
      const response = await api.get<AssignedRequestsResponse>(
        "/request/assigned",
        {
          // El backend responde 400 con un valor vacio (ej. category_id=), asi
          // que cada filtro viaja solo cuando tiene valor.
          params: {
            page,
            limit,
            q: filters.q || undefined,
            status: filters.status || undefined,
            priority: filters.priority || undefined,
            category_id: filters.category_id || undefined,
          },
        },
      );

      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
