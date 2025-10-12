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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import Logo from "@/components/shared/logo";
import axios, { AxiosError } from "axios";
import type { User } from "@/generated/prisma";
import { useRouter, usePathname } from "next/navigation";
import {
  getNavigationSections,
  getFooterItems,
} from "@/lib/navigation-sections";
import { Lock } from "lucide-react";
import Link from "next/link";

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

      console.log(response);
      if (response.success !== "success") {
        throw new AxiosError(
          response.data.message || "Failed to fetch user data!",
        );
      }

      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser({ isSubscribed: false } as User);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const isItemAccessible = (requiresSubscription?: boolean) => {
    if (!requiresSubscription) return true;
    return user?.isSubscribed === true;
  };

  const handleNavClick = (href: string, requiresSubscription?: boolean) => {
    if (isItemAccessible(requiresSubscription)) {
      router.push(href);
    }
  };

  const renderNavItem = (item: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    requiresSubscription?: boolean;
  }) => {
    const Icon = item.icon;
    const isAccessible = isItemAccessible(item.requiresSubscription);
    const isActive = pathname === item.href;

    const button = (
      <SidebarMenuButton
        onClick={() => handleNavClick(item.href, item.requiresSubscription)}
        data-active={isActive}
        className={
          !isAccessible
            ? "relative cursor-not-allowed opacity-60"
            : "cursor-pointer"
        }
      >
        <Icon className="size-4" />
        <span>{item.name}</span>
        {!isAccessible && (
          <Link
            href="/subscription"
            className="bg-background/80 absolute inset-0 flex items-center justify-center rounded-md backdrop-blur-[2px]"
          >
            <div className="flex flex-col items-center gap-1">
              <Lock className="text-muted-foreground size-4" />
              <span className="text-muted-foreground text-[10px] font-semibold">
                Pro Only
              </span>
            </div>
          </Link>
        )}
      </SidebarMenuButton>
    );

    if (!isAccessible) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right" className="max-w-[200px]">
              <p className="font-medium">Upgrade to Pro</p>
              <p className="text-[11px] opacity-90">
                Subscribe to unlock {item.name.toLowerCase()} and all premium
                features
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  };

  const navigationSections = getNavigationSections(user?.isSubscribed ?? false);
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
