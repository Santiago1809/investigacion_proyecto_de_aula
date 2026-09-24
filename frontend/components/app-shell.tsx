"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const publicRoutes = new Set(["/login", "/register"]);

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  if (publicRoutes.has(pathname)) {
    return <SessionProvider>{children}</SessionProvider>;
  }

  return (
    <SessionProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <main className="min-w-0 flex-1">{children}</main>
      </SidebarProvider>
    </SessionProvider>
  );
}
