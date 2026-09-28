import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  RequestFilters,
  RequestsPagination,
  UserRequest,
} from "@/hooks/use-user-requests";

export const REQUEST_PRIORITIES = ["BAJA", "MEDIA", "ALTA", "CRITICA"] as const;

export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];
export type RequestSortBy = "priority" | "status" | "created_at";
export type SortOrder = "asc" | "desc";

export interface CoordinatorRequest extends UserRequest {
  created_at: string;
  requester: string;
  agent: string | null;
}

export interface AllRequestsResponse {
  status: number;
  data: CoordinatorRequest[];
  pagination: RequestsPagination;
  applied_filters: RequestFilters;
}

export function useAllRequests(
  page: number,
  limit: number,
  sortBy: RequestSortBy,
  order: SortOrder,
  filters: RequestFilters = {},
) {
  return useQuery({
    queryKey: ["requests", "all", page, limit, sortBy, order, filters],
    queryFn: async () => {
      const response = await api.get<AllRequestsResponse>("/request/all", {
        // Cada filtro viaja solo cuando tiene valor: el backend rechaza los
        // vacíos con 400.
        params: {
          page,
          limit,
          sortBy,
          order,
          q: filters.q || undefined,
          status: filters.status || undefined,
          priority: filters.priority || undefined,
          category_id: filters.category_id || undefined,
        },
      });

      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useUpdateRequestPriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      priority,
    }: {
      id: CoordinatorRequest["id"];
      priority: RequestPriority;
    }) => {
      const response = await api.patch(`/request/${id}/priority`, { priority });
      return response.data;
    },
    // Invalida todas las listas de solicitudes para que reflejen la nueva prioridad
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["requests"] }),
  });
}
