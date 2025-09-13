import type React from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SidebarTrigger className="-ml-1 md:hidden" />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 pb-20 md:p-6 md:pb-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
