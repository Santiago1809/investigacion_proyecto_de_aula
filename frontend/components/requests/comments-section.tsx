"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  useCreateComment,
  useRequestComments,
} from "@/hooks/use-request-comments";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const COMMENTER_ROLES = [2, 3];

function formatCommentDate(value: string) {
  return new Date(value).toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CommentsSection({ requestId }: { requestId: string }) {
  const { data: session } = useSession();
  const roles = session?.user?.roles ?? [];
  const canComment = COMMENTER_ROLES.some((role) => roles.includes(role));

  const { data, isPending, isError, error, refetch } =
    useRequestComments(requestId);
  const createComment = useCreateComment(requestId);
  const [content, setContent] = useState("");

  if (isPending) {
    return (
      <section aria-label="Comentarios" className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </section>
    );
  }

  if (isError) {
    return (
      <div
        className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center"
        role="alert"
      >
        <p className="font-semibold text-red-900">
          No pudimos cargar los comentarios
        </p>
        <p className="mt-1 text-sm text-red-700">
          {error instanceof Error
            ? error.message
            : "Intenta nuevamente en unos segundos."}
        </p>
        <Button
          className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={() => void refetch()}
          type="button"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  const comments = data?.data ?? [];

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    createComment.mutate(trimmed, {
      onSuccess: () => setContent(""),
    });
  }

  return (
    <section aria-label="Comentarios" className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-950">Comentarios</h2>

      {comments.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center text-slate-500">
          Todavía no hay comentarios en esta solicitud.
        </p>
      ) : (
        <ol className="space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  {comment.author}
                </span>
                <time
                  className="text-xs text-slate-500"
                  dateTime={comment.created_at}
                >
                  {formatCommentDate(comment.created_at)}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {comment.content}
              </p>
            </li>
          ))}
        </ol>
      )}

      {canComment && (
        <form
          className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleSubmit}
        >
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="new-comment"
          >
            Agregar comentario
          </label>
          <textarea
            aria-describedby={createComment.isError ? "comment-error" : undefined}
            className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:border-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-100 disabled:opacity-60"
            disabled={createComment.isPending}
            id="new-comment"
            onChange={(event) => setContent(event.target.value)}
            required
            value={content}
          />
          {createComment.isError && (
            <p className="text-sm text-red-600" id="comment-error" role="alert">
              No se pudo publicar el comentario. Intenta nuevamente.
            </p>
          )}
          <Button
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={createComment.isPending || !content.trim()}
            type="submit"
          >
            {createComment.isPending ? "Publicando..." : "Publicar comentario"}
          </Button>
        </form>
      )}
    </section>
  );
}
