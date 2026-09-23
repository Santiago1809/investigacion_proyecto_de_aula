"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const token = useAuth((state) => state.token);
  const router = useRouter();
  useEffect(() => {
    if (token === null) {
      router.push("/login");
    }
  }, [token, router]);
  return (
    <div className="h-screen w-screen text-black">Página principal</div>
  );
}
