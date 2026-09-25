import { CoordinatorRequestsTable } from "@/components/console/coordinator-requests-table";

export default function Console() {
  return (
    <section className="space-y-6 px-4 py-6 sm:px-6 lg:px-9">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Consola coordinador
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Priorizar solicitudes
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Ordena las solicitudes por prioridad, estado o fecha y ajusta su prioridad.
        </p>
      </div>
      <CoordinatorRequestsTable />
    </section>
  );
}
