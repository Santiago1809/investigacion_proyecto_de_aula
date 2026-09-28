import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import {
  apiErrorMessage,
  type RequestFilters,
  type RequestsPagination,
  type UserRequest,
} from "@/hooks/use-user-requests";

export const REQUEST_PRIORITIES = ["BAJA", "MEDIA", "ALTA", "CRITICA"] as const;

export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];
export type RequestSortBy = "priority" | "status" | "created_at";
export type SortOrder = "asc" | "desc";

export interface CoordinatorRequest extends UserRequest {
  created_at: string;
  requester: string;
  agent: string | null;
}

export interface AllRequestsResponse {
  status: number;
  data: CoordinatorRequest[];
  pagination: RequestsPagination;
  applied_filters: RequestFilters;
}

export function useAllRequests(
  page: number,
  limit: number,
  sortBy: RequestSortBy,
  order: SortOrder,
  filters: RequestFilters = {},
) {
  return useQuery({
    queryKey: ["requests", "all", page, limit, sortBy, order, filters],
    queryFn: async () => {
      const response = await api.get<AllRequestsResponse>("/request/all", {
        // Cada filtro viaja solo cuando tiene valor: el backend rechaza los
        // vacíos con 400.
        params: {
          page,
          limit,
          sortBy,
          order,
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

// El backend responde el archivo completo en un solo CSV (sin paginacion), asi
// que el nombre del archivo se fija aqui en vez de leerse de
// Content-Disposition: en una respuesta cross-origin el navegador solo expone
// las cabeceras que el backend declare en Access-Control-Expose-Headers.
const EXPORT_FILENAME = "solicitudes.csv";

/**
 * Entrega un Blob como descarga real: object URL + <a download> temporal.
 * La URL se revoca en el siguiente tick, no de inmediato, porque el navegador
 * todavia puede estar leyendo el blob al procesar el clic.
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * Con `responseType: "blob"` el cuerpo de error del backend llega como Blob y
 * no como objeto: hay que leerlo para mostrar su mensaje en espanol.
 */
async function exportFailureMessage(error: unknown): Promise<string> {
  const fallback = "No se pudo exportar el reporte. Intenta nuevamente.";
  if (!isAxiosError(error)) return fallback;

  const data: unknown = error.response?.data;
  if (!(data instanceof Blob)) return apiErrorMessage(error, fallback);

  try {
    const parsed: unknown = JSON.parse(await data.text());
    if (parsed && typeof parsed === "object") {
      const payload = parsed as { error?: string; message?: string };
      return payload.error ?? payload.message ?? fallback;
    }
  } catch {
    // Cuerpo no JSON: se muestra el fallback, no un error de parseo.
  }

  return fallback;
}

/** Descarga el CSV de solicitudes con los filtros activos de la vista. */
export function useExportRequestsCsv() {
  return useMutation({
    mutationFn: async (filters: RequestFilters) => {
      try {
        const response = await api.get<Blob>("/reports/requests.csv", {
          responseType: "blob",
          // El esquema del backend es estricto: viajan solo los filtros con
          // valor (un category_id vacio responde 400) y nunca page/limit.
          params: {
            q: filters.q || undefined,
            status: filters.status || undefined,
            priority: filters.priority || undefined,
            category_id: filters.category_id || undefined,
          },
        });

        downloadBlob(response.data, EXPORT_FILENAME);
      } catch (error) {
        // Se propaga como Error con el mensaje del backend para que la UI no
        // tenga que volver a interpretarlo.
        throw new Error(await exportFailureMessage(error));
      }
    },
  });
}

export function useUpdateRequestPriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      priority,
    }: {
      id: CoordinatorRequest["id"];
      priority: RequestPriority;
    }) => {
      const response = await api.patch(`/request/${id}/priority`, { priority });
      return response.data;
    },
    // Invalida todas las listas de solicitudes para que reflejen la nueva prioridad
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["requests"] }),
  });
}
