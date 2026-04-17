"use client";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Logo from "@/components/shared/logo";
import axios, { AxiosError } from "axios";
import type { User } from "@/generated/prisma";
import { useRouter, usePathname } from "next/navigation";
import {
  getNavigationSections,
  getFooterItems,
} from "@/lib/navigation-sections";

export const AppSidebar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const { data: response } = await axios.get("/api/user/get", {
        withCredentials: true,
      });

      if (response.success !== "success") {
        throw new AxiosError(
          response.data.message || "Failed to fetch user data!",
        );
      }

      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      if (error instanceof AxiosError) {
        console.error("Axios error details:", {
          message: error.message,
          response: error.response,
        });
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const renderNavItem = (item: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    requiresSubscription?: boolean;
  }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;

    const button = (
      <SidebarMenuButton
        onClick={() => router.push(item.href)}
        data-active={isActive}
        className={"relative cursor-pointer opacity-60"}
      >
        <Icon className="size-4" />
        <span>{item.name}</span>
      </SidebarMenuButton>
    );

    return button;
  };

  const navigationSections = getNavigationSections(user !== null);
  const footerItems = getFooterItems();

  return (
    <Sidebar className="pt-4">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 text-lg font-semibold">
          <Logo /> Interview AI
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigationSections.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    {renderNavItem(item)}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {footerItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              {renderNavItem(item)}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
