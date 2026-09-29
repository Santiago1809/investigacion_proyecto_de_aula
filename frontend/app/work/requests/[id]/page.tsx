import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RequestDetail } from "@/components/requests/request-detail";

export default async function WorkRequestDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <section className="space-y-6 px-4 py-6 sm:px-6 lg:px-9">
      <div className="space-y-3">
        <Link
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-700"
          href="/work"
        >
          <ArrowLeft className="size-4" strokeWidth={1.8} />
          Volver a la mesa de trabajo
        </Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Mesa de trabajo
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Detalle de la solicitud
          </h1>
          <p className="mt-2 font-mono text-xs text-slate-500">{id}</p>
        </div>
      </div>
      <RequestDetail requestId={id} />
    </section>
  );
}
