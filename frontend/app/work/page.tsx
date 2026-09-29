"use client";

import { useSession } from "next-auth/react";
import { AssignedRequestsTable } from "@/components/work/assigned-requests-table";
import { Skeleton } from "@/components/ui/skeleton";

// Rol 2 = AGENTE. El backend ya responde 403 a cualquiera otro; esta guarda es
// solo UX para no mostrar una pantalla vacia sin explicacion.
const AGENT_ROLE = 2;

export default function Work() {
  const { data: session, status } = useSession();
  const isAgent = (session?.user?.roles ?? []).includes(AGENT_ROLE);

  return (
    <section className="space-y-6 px-4 py-6 sm:px-6 lg:px-9">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Mesa de trabajo
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Solicitudes asignadas
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Gestiona las solicitudes que tienes asignadas y avanza su estado.
        </p>
      </div>

      {status === "loading" ? (
        <Skeleton aria-busy="true" className="h-64 w-full" />
      ) : !isAgent ? (
        <p
          className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-600 shadow-sm"
          role="alert"
        >
          No autorizado: solo el rol Agente puede ver su mesa de trabajo.
        </p>
      ) : (
        <AssignedRequestsTable />
      )}
    </section>
  );
}
