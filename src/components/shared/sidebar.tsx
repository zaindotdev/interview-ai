"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  FileText,
  History,
  Home,
  MessageSquare,
  Settings,
  User,
  HelpCircle,
  Briefcase,
  Target,
} from "lucide-react";

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
  SidebarRail,
} from "@/components/ui/sidebar";
import Logo from "./logo";

// Types
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  disabled?: boolean;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

// Constants
const NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    title: "Main",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: Home,
      },
      {
        name: "Mock Interviews",
        href: "/mock-interviews",
        icon: MessageSquare,
      },
      {
        name: "Practice Questions",
        href: "/practice-questions",
        icon: BookOpen,
      },
      {
        name: "Interview History",
        href: "/interview-history",
        icon: History,
      },
    ],
  },
  {
    title: "Analysis & Tools",
    items: [
      {
        name: "Resume Analysis",
        href: "/resume-analysis",
        icon: FileText,
      },
      {
        name: "Performance Analytics",
        href: "/analytics",
        icon: BarChart3,
      },
      {
        name: "Career Resources",
        href: "/career-resources",
        icon: Briefcase,
      },
      {
        name: "Skill Assessment",
        href: "/skill-assessment",
        icon: Target,
      },
    ],
  },
];

const FOOTER_ITEMS: NavigationItem[] = [
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    name: "Help & Support",
    href: "/help",
    icon: HelpCircle,
  },
];

const MOBILE_NAV_ITEMS: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Interviews", href: "/mock-interviews", icon: MessageSquare },
  { name: "Resume", href: "/resume-analysis", icon: FileText },
  { name: "History", href: "/interview-history", icon: History },
  { name: "Profile", href: "/profile", icon: User },
];

const APP_CONFIG = {
  name: "Interview AI",
  description: "Mock Interview Platform",
  logo: Logo,
};

// Components
interface SidebarHeaderBrandProps {
  name: string;
  description: string;
  logo: React.ComponentType<{ className?: string }>;
}

const SidebarHeaderBrand: React.FC<SidebarHeaderBrandProps> = ({
  name,
  description,
  logo: Logo,
}) => (
  <SidebarHeader className="border-sidebar-border border-b">
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
        <Logo className="size-4" />
      </div>
      <div className="flex flex-col gap-0.5 leading-none">
        <span className="font-semibold">{name}</span>
        <span className="text-sidebar-foreground/70 text-xs">
          {description}
        </span>
      </div>
    </div>
  </SidebarHeader>
);

interface NavigationMenuItemProps {
  item: NavigationItem;
  isActive: boolean;
}

const NavigationMenuItem: React.FC<NavigationMenuItemProps> = ({
  item,
  isActive,
}) => {
  const { name, href, icon: Icon, badge, disabled } = item;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        disabled={disabled}
        className={disabled ? "cursor-not-allowed opacity-50" : ""}
      >
        <Link
          href={disabled ? "#" : href}
          aria-label={`Navigate to ${name}`}
          className={disabled ? "pointer-events-none" : ""}
        >
          <Icon className="size-4" />
          <span className="flex-1">{name}</span>
          {badge && (
            <span className="bg-primary text-primary-foreground ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium">
              {badge}
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

interface NavigationSectionProps {
  section: NavigationSection;
  pathname: string;
}

const NavigationSection: React.FC<NavigationSectionProps> = ({
  section,
  pathname,
}) => (
  <SidebarGroup>
    <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        {section.items.map((item) => (
          <NavigationMenuItem
            key={item.name}
            item={item}
            isActive={pathname === item.href}
          />
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);

interface DesktopSidebarProps {
  pathname: string;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ pathname }) => (
  <Sidebar className="hidden lg:flex">
    <SidebarHeaderBrand
      name={APP_CONFIG.name}
      description={APP_CONFIG.description}
      logo={APP_CONFIG.logo}
    />

    <SidebarContent>
      {NAVIGATION_SECTIONS.map((section) => (
        <NavigationSection
          key={section.title}
          section={section}
          pathname={pathname}
        />
      ))}
    </SidebarContent>

    <SidebarFooter className="border-sidebar-border border-t">
      <SidebarMenu>
        {FOOTER_ITEMS.map((item) => (
          <NavigationMenuItem
            key={item.name}
            item={item}
            isActive={pathname === item.href}
          />
        ))}
      </SidebarMenu>
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
);

interface MobileBottomNavProps {
  pathname: string;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ pathname }) => (
  <div className="bg-background border-border fixed right-0 bottom-0 left-0 z-50 border-t md:hidden">
    <nav
      className="flex items-center justify-around px-2 py-2"
      role="navigation"
      aria-label="Mobile navigation"
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const { name, href, icon: Icon, disabled } = item;

        return (
          <Link
            key={name}
            href={disabled ? "#" : href}
            className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors ${
              disabled
                ? "pointer-events-none cursor-not-allowed opacity-50"
                : isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
            aria-label={`Navigate to ${name}`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon
              className={`size-5 flex-shrink-0 ${isActive ? "text-primary" : ""}`}
            />
            <span className="truncate text-xs font-medium">{name}</span>
          </Link>
        );
      })}
    </nav>
  </div>
);

// Main Component
export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <DesktopSidebar pathname={pathname} />
      <MobileBottomNav pathname={pathname} />
    </>
  );
}
