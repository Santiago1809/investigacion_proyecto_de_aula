import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface RequestComment {
  id: string;
  request_id: string;
  author_id: string;
  author: string;
  content: string;
  created_at: string;
}

export interface CommentsResponse {
  status: number;
  data: RequestComment[];
}

export function useRequestComments(requestId: string) {
  return useQuery({
    queryKey: ["comments", requestId],
    queryFn: async () => {
      const response = await api.get<CommentsResponse>(
        `/request/${requestId}/comments`,
      );
      return response.data;
    },
    staleTime: 30_000,
  });
}

export function useCreateComment(requestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post<CommentsResponse>(
        `/request/${requestId}/comments`,
        { content },
      );
      return response.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["comments", requestId] }),
  });
}
