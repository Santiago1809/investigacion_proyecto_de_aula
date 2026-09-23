"use client";

import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { AxiosError } from "axios";
import { KeyRound, Mail, User, UserRoundPlus } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type RegisterForm = {
  username: string;
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type RegisterResponse = {
  message?: string;
};

export default function Page() {
  const { data: session } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>({
    username: "",
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session) {
      router.replace("/");
    }
  }, [session, router]);

  const updateValues = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post<RegisterResponse>("/auth/register", {
        username: form.username,
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      });

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Registro exitoso, pero no se pudo iniciar sesión");
        return;
      }

      router.replace("/");
    } catch (requestError) {
      if (requestError instanceof AxiosError) {
        setError(
          requestError.response?.data?.message ??
            requestError.response?.data?.error ??
            "No fue posible crear la cuenta",
        );
      } else {
        setError("Error inesperado al crear la cuenta");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-slate-100 p-4 sm:p-8">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
        <section className="hidden w-1/2 flex-col justify-between bg-slate-950 px-10 py-12 text-white lg:flex">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500">
                <UserRoundPlus className="size-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  Nexus Support
                </h1>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  Soluciones enterprise
                </p>
              </div>
            </div>
            <h2 className="max-w-md text-4xl font-bold leading-tight tracking-tight">
              Un espacio para resolver mejor.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              Crea tu cuenta y únete a la operación colaborativa de soporte
              técnico.
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Acceso seguro para equipos operativos
          </p>
        </section>

        <section className="w-full px-6 py-8 sm:px-10 sm:py-12 lg:w-1/2">
          <div className="mx-auto max-w-md">
            <div className="mb-8">
              <p className="text-sm font-semibold text-emerald-700">
                Nuevo usuario
              </p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                Crea tu cuenta
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Completa tus datos para comenzar.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <FieldSet>
                  <FieldLegend>Nombre de usuario</FieldLegend>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 transition-colors focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                    <User className="ml-3 size-4 shrink-0 text-slate-400" />
                    <Input
                      id="username"
                      name="username"
                      value={form.username}
                      onChange={updateValues}
                      className="border-none bg-transparent shadow-none focus-visible:ring-0"
                      placeholder="Ej: john.doe"
                      autoComplete="username"
                      required
                    />
                  </div>
                </FieldSet>

                <FieldSet>
                  <FieldLegend>Nombre completo</FieldLegend>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 transition-colors focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                    <UserRoundPlus className="ml-3 size-4 shrink-0 text-slate-400" />
                    <Input
                      id="full_name"
                      name="full_name"
                      value={form.full_name}
                      onChange={updateValues}
                      className="border-none bg-transparent shadow-none focus-visible:ring-0"
                      placeholder="Ej: John Doe"
                      autoComplete="name"
                      required
                    />
                  </div>
                </FieldSet>

                <FieldSet>
                  <FieldLegend>Correo electrónico</FieldLegend>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 transition-colors focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                    <Mail className="ml-3 size-4 shrink-0 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={updateValues}
                      className="border-none bg-transparent shadow-none focus-visible:ring-0"
                      placeholder="Ej: john.doe@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </FieldSet>

                <FieldSet>
                  <FieldLegend>Contraseña</FieldLegend>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 transition-colors focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                    <KeyRound className="ml-3 size-4 shrink-0 text-slate-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={updateValues}
                      className="border-none bg-transparent shadow-none focus-visible:ring-0"
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </div>
                </FieldSet>

                <FieldSet>
                  <FieldLegend>Confirmar contraseña</FieldLegend>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 transition-colors focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                    <KeyRound className="ml-3 size-4 shrink-0 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={updateValues}
                      className="border-none bg-transparent shadow-none focus-visible:ring-0"
                      placeholder="Repite tu contraseña"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </div>
                </FieldSet>

                <FieldSet className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-xl bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-700"
                  >
                    {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                  </Button>
                  {error && (
                    <p className="text-sm font-medium text-red-600">{error}</p>
                  )}
                </FieldSet>
                <FieldSet className="flex w-full items-center justify-center pt-1">
                  <p className="text-sm text-slate-500">
                    ¿Ya tienes una cuenta?{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-emerald-700 underline-offset-4 hover:text-emerald-800 hover:underline"
                    >
                      Inicia sesión
                    </Link>
                  </p>
                </FieldSet>
              </FieldGroup>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
