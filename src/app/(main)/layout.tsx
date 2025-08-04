import type React from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/sidebar";
import { Separator } from "@/components/ui/separator";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold md:text-xl">
              Interview <span className="text-primary">AI</span>
            </h1>
          </div>
        </header>
        <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6 max-w-7xl w-full mx-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
