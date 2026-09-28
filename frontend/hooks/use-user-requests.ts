import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";

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
}

export function useUserRequests(page: number, limit: number, q?: string) {
  return useQuery({
    queryKey: ["requests", page, limit, q ?? ""],
    queryFn: async () => {
      const response = await api.get<UserRequestsResponse>("/request", {
        params: q ? { page, limit, q } : { page, limit },
      });

      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export type RequestPriority = "BAJA" | "MEDIA" | "ALTA" | "CRITICA";

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
