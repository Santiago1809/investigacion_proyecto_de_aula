"use client";

import { useSession } from "next-auth/react";
import { AuditEventsTable } from "@/components/audit/audit-events-table";
import { Skeleton } from "@/components/ui/skeleton";

// Rol 4 = AUDITOR. El backend ya responde 403 a cualquiera otro; esta guarda es
// solo UX para no mostrar una pantalla vacía sin explicación.
const AUDITOR_ROLE = 4;

export default function Audit() {
  const { data: session, status } = useSession();
  const isAuditor = (session?.user?.roles ?? []).includes(AUDITOR_ROLE);

  return (
    <section className="space-y-6 px-4 py-6 sm:px-6 lg:px-9">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Auditoría
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Historial de auditoría
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Consulta de solo lectura de los eventos registrados por el sistema.
        </p>
      </div>

      {status === "loading" ? (
        <Skeleton aria-busy="true" className="h-64 w-full" />
      ) : !isAuditor ? (
        <p
          className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-600 shadow-sm"
          role="alert"
        >
          No autorizado: solo el rol Auditor puede consultar el historial de auditoría.
        </p>
      ) : (
        <AuditEventsTable />
      )}
    </section>
  );
}
