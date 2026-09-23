"use client";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { AuthResponse } from "@/lib/interfaces/auth";
import { AxiosError } from "axios";
import { Key, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const token = useAuth((state) => state.token);
  const setToken = useAuth((state) => state.setToken);
  const setUser = useAuth((state) => state.setUser);
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
      const res = await api.post<AuthResponse>("/auth/login", login);

      if (res.data.token && res.data.user) {
        setToken(res.data.token);
        setUser(res.data.user);
        router.push("/");
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "Error al iniciar sesión");
      } else {
        console.error(err);
        setError("Error inesperado");
      }
    }
  };
  const router = useRouter();
  useEffect(() => {
    if (token) {
      router.push("/");
    }
  }, [token, router]);
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="h-1/2 w-full flex items-stretch justify-center mx-auto max-w-3/4">
        <div className="w-1/2 bg-primary text-white px-6 py-4 rounded-l-lg flex flex-col justify-around border border-r-0 border-neutral">
          <div className="pb-8 leading-2.5">
            <h1 className="text-7xl font-bold">Nexus Support</h1>
            <small className="font-medium">soluciones enterprise</small>
          </div>
          <div className="">
            <h3 className="text-3xl font-bold mb-1.5">
              Orquestación y Soporete Técnico Distribuido
            </h3>
            <p>
              Consola unificada para la gestión de incidentes críticos, despacho
              de soporte a centros logísticos y resolución colaborativa sin
              fricciones operativas
            </p>
          </div>
        </div>
        <div className="w-1/2 bg-neutral-50 px-6 py-4 rounded-r-lg flex flex-col items-center justify-center border border-l-0 border-primary">
          <form onSubmit={handleSubmit} className="w-full">
            <FieldGroup>
              <FieldSet>
                <FieldLegend>Email o nombre de usuario</FieldLegend>

                <div className="flex items-center border border-tertiary rounded-lg focus-within:ring-2">
                  <User className="size-5 shrink-0 ml-3 text-muted-foreground" />

                  <Input
                    id="email"
                    name="email"
                    value={login.email}
                    onChange={updateValues}
                    className="border-none bg-white rounded-lg shadow-none focus-visible:ring-0 px-3 py-1"
                    placeholder="Ej: john.doe@example.com"
                    type="text"
                    required
                  />
                </div>
              </FieldSet>

              <FieldSet>
                <FieldLegend>Contraseña</FieldLegend>

                <div className="flex items-center border border-tertiary rounded-lg focus-within:ring-2">
                  <Key className="size-5 shrink-0 ml-3 text-muted-foreground" />

                  <Input
                    id="password"
                    name="password"
                    onChange={updateValues}
                    className="border-none bg-white rounded-lg shadow-none focus-visible:ring-0 px-3 py-1"
                    type="password"
                    placeholder="•••••••••"
                    required
                  />
                </div>
              </FieldSet>
              <FieldSet>
                <Button type="submit">Enviar</Button>
                {error !== "" && (
                  <p className="text-lg text-red-600">{error}</p>
                )}
              </FieldSet>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  );
}
