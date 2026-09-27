import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { RequestsPagination } from "@/hooks/use-user-requests";

export interface AppNotification {
  id: number;
  request_id: number;
  type: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

interface NotificationsResponse {
  status: number;
  data: AppNotification[];
  pagination: RequestsPagination;
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await api.get<NotificationsResponse>("/notifications");
      return response.data.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
