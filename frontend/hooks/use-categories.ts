import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Category {
  id: number;
  name: string;
}

interface CategoriesResponse {
  status: number;
  data: Category[];
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get<CategoriesResponse>("/categories");
      return response.data.data;
    },
    staleTime: 5 * 60_000,
  });
}
