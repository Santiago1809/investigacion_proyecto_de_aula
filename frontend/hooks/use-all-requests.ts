import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { RequestsPagination, UserRequest } from "@/hooks/use-user-requests";

export const REQUEST_PRIORITIES = ["BAJA", "MEDIA", "ALTA", "CRITICA"] as const;

export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];
export type RequestSortBy = "priority" | "status" | "created_at";
export type SortOrder = "asc" | "desc";

export interface CoordinatorRequest extends UserRequest {
  created_at: string;
  requester: string;
}

export interface AllRequestsResponse {
  status: number;
  data: CoordinatorRequest[];
  pagination: RequestsPagination;
}

export function useAllRequests(
  page: number,
  limit: number,
  sortBy: RequestSortBy,
  order: SortOrder,
) {
  return useQuery({
    queryKey: ["requests", "all", page, limit, sortBy, order],
    queryFn: async () => {
      const response = await api.get<AllRequestsResponse>("/request/all", {
        params: { page, limit, sortBy, order },
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
