import { RequestsTable } from "@/components/portal/requests-table";

export default function Portal() {
  return (
    <section className="space-y-6 px-4 py-6 sm:px-6 lg:px-9">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Portal
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Mis solicitudes
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Consulta el estado y los detalles de tus solicitudes.
        </p>
      </div>
      <RequestsTable />
    </section>
  );
}
