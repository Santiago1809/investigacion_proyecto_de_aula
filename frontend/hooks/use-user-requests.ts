import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
