"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return null;
  }

  return (
    <div className="h-screen w-screen text-black flex items-center justify-center-safe">
      Bienvenido a Nexus Support, selecciona en el menú a donde deseas navegar
    </div>
  );
}
