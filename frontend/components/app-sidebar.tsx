"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@base-ui/react";
import {
  FingerprintPattern,
  Home,
  Inbox,
  LogOut,
  Notebook,
  SquareChevronRight,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "./ui/avatar";

const SECTIONS = [
  {
    label: "Inicio",
    link: "/",
    icon: Home,
    role: 0,
  },
  {
    label: "Portal operativo",
    link: "/portal",
    icon: Inbox,
    role: 1,
  },
  {
    label: "Mesa de trabajo",
    link: "/work",
    icon: Notebook,
    role: 2,
  },
  {
    label: "Consola coordinador",
    link: "/console",
    icon: SquareChevronRight,
    role: 3,
  },
  {
    label: "Auditoria de logs",
    link: "/audit",
    icon: FingerprintPattern,
    role: 4,
  },
];

export function AppSidebar() {
  const { data: session } = useSession();
  const roles = session?.user.roles ?? [];
  const path = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 bg-white">
      <SidebarHeader className="border-b border-slate-100 px-4 py-5">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
          <Avatar
            size="lg"
            className="rounded-xl bg-slate-900 text-white after:border-slate-900"
          >
            <AvatarFallback className="rounded-xl bg-slate-900 text-white font-semibold">
              N
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight text-slate-950">
              Nexus Support
            </p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Centro operativo
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0 px-3 py-4">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Menú operativo
          </SidebarGroupLabel>
        </SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = path === section.link;

              if (!roles.includes(section.role) && section.role !== 0) {
                return null;
              }

              return (
                <SidebarMenuItem key={section.link}>
                  <SidebarMenuButton
                    className={
                      isActive
                        ? "h-11 rounded-xl bg-slate-900 px-3 text-white shadow-sm hover:bg-slate-800 hover:text-white"
                        : "h-11 rounded-xl px-3 text-slate-500 hover:bg-emerald-50 hover:text-emerald-800"
                    }
                  >
                    <Link
                      href={section.link}
                      className="flex w-full items-center gap-3"
                    >
                      <Icon className="size-4.5" strokeWidth={1.8} />
                      <span className="text-sm font-medium">
                        {section.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>
      <SidebarFooter className="mb-4 border-t border-slate-100 px-3 pt-4">
        <Button
          aria-label="Cerrar sesión"
          className="group  h-11 w-full flex justify-center items-center gap-3 rounded-xl border border-red-500 px-3 text-sm font-semibold text-slate-500 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-700 focus-visible:border-red-200 focus-visible:ring-4 focus-visible:ring-red-100 active:scale-[0.98]"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-red-500 transition-colors group-hover:bg-red-100 group-hover:text-red-600">
            <LogOut className="size-4" strokeWidth={2} />
          </span>
          <span className="flex-1 text-left group-data-[collapsible=icon]:hidden text-red-500">
            Cerrar sesión
          </span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
