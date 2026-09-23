"use client";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signIn, useSession } from "next-auth/react";
import { KeyRound, LogIn, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Page() {
  const { data: session } = useSession();
  const [login, setLogin] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const updateValues = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogin((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await signIn("credentials", {
        email: login.email,
        password: login.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales inválidas");
      } else {
        router.push("/");
      }
    } catch {
      setError("Error inesperado");
    }
  };
  const router = useRouter();
  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-slate-100 p-4 sm:p-8">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
        <section className="hidden w-1/2 flex-col justify-between bg-slate-950 px-10 py-12 text-white lg:flex">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500">
                <LogIn className="size-5" />
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
              Todo el soporte, en un solo lugar.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              Coordina incidentes, asigna soporte y mantén la operación en
              movimiento.
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
                Bienvenido de nuevo
              </p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                Inicia sesión
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Ingresa tus credenciales para continuar.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <FieldSet>
                  <FieldLegend>Email o nombre de usuario</FieldLegend>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 transition-colors focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                    <Mail className="ml-3 size-4 shrink-0 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      value={login.email}
                      onChange={updateValues}
                      className="border-none bg-transparent shadow-none focus-visible:ring-0"
                      placeholder="Ej: john.doe@example.com"
                      type="text"
                      autoComplete="username"
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
                      value={login.password}
                      onChange={updateValues}
                      className="border-none bg-transparent shadow-none focus-visible:ring-0"
                      type="password"
                      placeholder="Tu contraseña"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </FieldSet>

                <FieldSet className="pt-2">
                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-700"
                  >
                    Ingresar
                  </Button>
                  {error && (
                    <p className="text-sm font-medium text-red-600">{error}</p>
                  )}
                </FieldSet>

                <FieldSet className="flex w-full items-center justify-center pt-1">
                  <p className="text-sm text-slate-500">
                    ¿Sin cuenta aún?{" "}
                    <Link
                      href="/register"
                      className="font-semibold text-emerald-700 underline-offset-4 hover:text-emerald-800 hover:underline"
                    >
                      Crea una aquí
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
