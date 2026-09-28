import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import type { RequestStatus } from "@/hooks/use-request-status";

export interface UserRequest {
  id: number | string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
}

export interface RequestsPagination {
  page: number;
  limit: number;
  itemsInPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UserRequestsResponse {
  status: number;
  data: UserRequest[];
  pagination: RequestsPagination;
  applied_filters: RequestFilters;
}

export type RequestPriority = "BAJA" | "MEDIA" | "ALTA" | "CRITICA";

// Filtros combinables del listado (se aplican con AND). Es la misma forma que
// devuelve `applied_filters`, así que la respuesta y el estado local comparten
// tipo.
export interface RequestFilters {
  q?: string;
  status?: RequestStatus;
  priority?: RequestPriority;
  category_id?: number;
}

export function useUserRequests(
  page: number,
  limit: number,
  filters: RequestFilters = {},
) {
  return useQuery({
    queryKey: ["requests", page, limit, filters],
    queryFn: async () => {
      const response = await api.get<UserRequestsResponse>("/request", {
        // El backend responde 400 con un valor vacío (ej. category_id=), así que
        // cada filtro viaja solo cuando tiene valor.
        params: {
          page,
          limit,
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

export interface CreateRequestPayload {
  title: string;
  description: string;
  category_id: number;
  priority: RequestPriority;
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateRequestPayload) => {
      const response = await api.post("/request", payload);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string; message?: string }
      | undefined;
    // Backend returns 400/403/409 details in `error` or `message`
    return data?.error ?? data?.message ?? fallback;
  }
  return fallback;
}

export function useConfirmSolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const response = await api.post(`/request/${requestId}/confirm`);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

export function useReopenRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      reason,
    }: {
      requestId: string;
      reason: string;
    }) => {
      const response = await api.post(`/request/${requestId}/reopen`, {
        reason,
      });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}
