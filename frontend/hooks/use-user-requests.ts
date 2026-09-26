import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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

export function useUserRequests(page: number, limit: number) {
  return useQuery({
    queryKey: ["requests", page, limit],
    queryFn: async () => {
      const response = await api.get<UserRequestsResponse>("/request", {
        params: { page, limit },
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
