import { CommentsSection } from "@/components/requests/comments-section";

export default async function ConsoleRequestDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <section className="space-y-6 px-4 py-6 sm:px-6 lg:px-9">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Consola
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Detalle de la solicitud
        </h1>
        <p className="mt-2 font-mono text-xs text-slate-500">{id}</p>
      </div>
      <CommentsSection requestId={id} />
    </section>
  );
}
