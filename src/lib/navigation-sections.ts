import type React from "react"
import { Home, MessageSquare, History, FileText, BarChart3, User } from "lucide-react"

export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requiresSubscription?: boolean
}

export interface NavigationSection {
  title: string
  items: NavigationItem[]
}

export const getNavigationSections = (isSubscribed: boolean): NavigationSection[] => {
  const allSections: NavigationSection[] = [
    {
      title: "Main",
      items: [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: Home,
          requiresSubscription: false,
        },
        {
          name: "Mock Interviews",
          href: "/mock-interviews",
          icon: MessageSquare,
          requiresSubscription: false,
        },
        {
          name: "Interview History",
          href: "/interview-history",
          icon: History,
          requiresSubscription: true,
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
          requiresSubscription: true,
        },
        {
          name: "Performance Analytics",
          href: "/analytics",
          icon: BarChart3,
          requiresSubscription: true,
        },
      ],
    },
  ]
  if (!isSubscribed) {
    return allSections
      .map((section) => ({
        ...section,
        items: section.items, 
      }))
      .filter((section) => section.items.length > 0)
  }

  return allSections
}

export const getFooterItems = (): NavigationItem[] => {
  return [
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
  ]
}
