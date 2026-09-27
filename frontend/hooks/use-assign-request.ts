import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";

export interface Agent {
  id: string; // UUID
  full_name: string;
  email: string;
}

interface AgentsResponse {
  status: number;
  data: Agent[];
}

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const response = await api.get<AgentsResponse>("/users/agents");
      return response.data.data;
    },
    staleTime: 60_000,
  });
}

export function assignmentErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string; message?: string }
      | undefined;
    // Backend devuelve errores 400/409 con el detalle en `error` o `message`
    return (
      data?.error ?? data?.message ?? "No se pudo asignar la solicitud."
    );
  }
  return "No se pudo asignar la solicitud. Intenta nuevamente.";
}

export function useAssignRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      agentId,
    }: {
      requestId: number | string;
      agentId: string;
    }) => {
      const response = await api.post(`/request/${requestId}/assign`, {
        agent_id: agentId,
      });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}
