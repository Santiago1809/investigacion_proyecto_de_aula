import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { RequestPriority } from "@/hooks/use-all-requests";
import type { RequestStatus } from "@/hooks/use-request-status";

/** Estado del filtro en la UI: cadena vacia = "todas" (no se envia al backend). */
export interface MetricsFilters {
  q: string;
  status: string;
  priority: string;
  category_id: string;
}

export interface StatusVolume {
  status: RequestStatus;
  total: number;
}

export interface CycleTime {
  mediana_horas: number | null;
  muestra: number;
}

export interface AppliedMetricsFilters {
  q?: string;
  status?: RequestStatus;
  priority?: RequestPriority;
  category_id?: number;
}

export interface MetricsSummary {
  volumen_por_estado: StatusVolume[];
  ciclo: CycleTime;
  total_filtradas: number;
  applied_filters: AppliedMetricsFilters;
}

interface MetricsSummaryResponse {
  status: number;
  data: MetricsSummary;
}

export const EMPTY_METRICS_FILTERS: MetricsFilters = {
  q: "",
  status: "",
  priority: "",
  category_id: "",
};

export function useMetricsSummary(filters: MetricsFilters) {
  return useQuery({
    queryKey: ["metrics", "summary", filters],
    queryFn: async () => {
      const response = await api.get<MetricsSummaryResponse>("/metrics/summary", {
        // El esquema del backend es estricto: los vacios deben omitirse, no enviarse
        // como "" (una cadena vacia en category_id responde 400).
        params: {
          q: filters.q || undefined,
          status: filters.status || undefined,
          priority: filters.priority || undefined,
          category_id: filters.category_id || undefined,
        },
      });

      return response.data.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
