"use client";

import { useState } from "react";
import axios from "axios";
import { Plus } from "lucide-react";
import { useCategories } from "@/hooks/use-categories";
import {
  useCreateRequest,
  type RequestPriority,
} from "@/hooks/use-user-requests";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const PRIORITIES: { value: RequestPriority; label: string }[] = [
  { value: "BAJA", label: "Baja" },
  { value: "MEDIA", label: "Media" },
  { value: "ALTA", label: "Alta" },
  { value: "CRITICA", label: "Crítica" },
];

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20";

export function CreateRequestSheet() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priority, setPriority] = useState<RequestPriority>("MEDIA");
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: categories, isPending: categoriesPending } = useCategories();
  const createRequest = useCreateRequest();

  const isValid = title.trim() !== "" && description.trim() !== "" && categoryId !== "";

  function resetForm() {
    setTitle("");
    setDescription("");
    setCategoryId("");
    setPriority("MEDIA");
    setServerError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid || createRequest.isPending) return;
    setServerError(null);
    createRequest.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        category_id: Number(categoryId),
        priority,
      },
      {
        onSuccess: () => {
          setOpen(false);
          resetForm();
        },
        onError: (error) => {
          setServerError(
            axios.isAxiosError(error)
              ? ((error.response?.data as { message?: string } | undefined)
                  ?.message ?? "No pudimos crear la solicitud.")
              : "No pudimos crear la solicitud.",
          );
        },
      },
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" />
        Nueva solicitud
      </Button>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nueva solicitud</SheetTitle>
          <SheetDescription>
            Completa los datos y un agente revisará tu solicitud.
          </SheetDescription>
        </SheetHeader>
        <form className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6" onSubmit={handleSubmit}>
          <Field>
            <FieldLabel htmlFor="request-title">Título</FieldLabel>
            <Input
              id="request-title"
              maxLength={200}
              placeholder="Describe brevemente tu solicitud"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="request-description">Descripción</FieldLabel>
            <textarea
              id="request-description"
              className={`${inputClasses} min-h-28 resize-y`}
              placeholder="Cuenta los detalles del problema o pedido"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="request-category">Categoría</FieldLabel>
            <select
              id="request-category"
              className={inputClasses}
              disabled={categoriesPending}
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              required
            >
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {(categories ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="request-priority">Prioridad</FieldLabel>
            <select
              id="request-priority"
              className={inputClasses}
              value={priority}
              onChange={(event) => setPriority(event.target.value as RequestPriority)}
              required
            >
              {PRIORITIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          {serverError && <FieldError>{serverError}</FieldError>}
          <div className="mt-auto pt-2">
            <Button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={!isValid || createRequest.isPending}
            >
              {createRequest.isPending ? "Enviando..." : "Enviar solicitud"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
