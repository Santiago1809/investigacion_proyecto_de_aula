import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { RequestStatus } from "@/hooks/use-request-status";

export interface RequestDetailData {
  id: string; // UUID
  title: string;
  description: string;
  priority: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  category: string;
  requester_id: string; // UUID
  requester: string;
  agent_id: string | null; // UUID
  agent: string | null;
  assigned_by_name: string | null;
  assigned_at: string | null;
}

interface RequestDetailResponse {
  status: number;
  data: RequestDetailData;
}

/** Detalle de una solicitud. El backend permite los roles 1, 2, 3 y 4. */
export function useRequestDetail(id: string) {
  return useQuery({
    queryKey: ["requests", "detail", id],
    queryFn: async () => {
      const response = await api.get<RequestDetailResponse>(`/request/${id}`);
      return response.data.data;
    },
    staleTime: 30_000,
  });
}
