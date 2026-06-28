import {
  Building2,
  ChartNoAxesCombined,
  Settings,
  UserRoundCog
} from "lucide-react";

export const dashboardNavigation = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: ChartNoAxesCombined,
    description: "Live follow-ups, HR activity, and company metrics"
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: UserRoundCog,
    description: "View the active user session"
  },
  {
    title: "Companies",
    href: "/dashboard/companies",
    icon: Building2,
    description: "Manage company records and recruiting partners"
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Theme and security defaults"
  }
] as const;

export function getPageTitle(pathname: string) {
  const matchedItem = dashboardNavigation.find((item) => item.href === pathname);

  if (matchedItem) {
    return matchedItem.title;
  }

  if (pathname.startsWith("/dashboard")) {
    return "Dashboard";
  }

  return "Placement CRM";
}

export const foundationChecklist = [
  "Next.js App Router with strict TypeScript",
  "Prisma ORM configured for SQLite",
  "Session-based username/password authentication",
  "Protected routes with reusable dashboard shell",
  "Global theme, toast system, loading states, and error handling"
] as const;
