import {
  Building2,
  ChartNoAxesCombined,
  BriefcaseBusiness,
  Settings,
  UserRoundCog,
  UsersRound
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
    title: "HR Contacts",
    href: "/dashboard/hr",
    icon: UsersRound,
    description: "Track recruiter contacts, duplicates, and follow-ups"
  },
  {
    title: "Vacancies",
    href: "/dashboard/vacancies",
    icon: BriefcaseBusiness,
    description: "Manage live roles, recruiters, and pipeline progress"
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Theme and security defaults"
  }
] as const;

export function getPageTitle(pathname: string) {
  const matchedItem = dashboardNavigation.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

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
