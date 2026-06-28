import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { VACANCIES_PAGE_SIZE } from "@/lib/vacancy/constants";
import { vacanciesQuerySchema, type VacanciesQueryInput } from "@/lib/vacancy/validators";
import type { ActivityType } from "@prisma/client";

function where(filters: VacanciesQueryInput): Prisma.VacancyWhereInput {
  const search = filters.search.trim();
  return {
    ...(search ? { OR: [
      { title: { contains: search } },
      { location: { contains: search } },
      { skills: { contains: search } },
      { technology: { contains: search } },
      { experience: { contains: search } },
      { remark: { contains: search } },
      { company: { name: { contains: search } } },
      { company: { industry: { contains: search } } },
      { company: { city: { contains: search } } },
      { assignedRecruiter: { fullName: { contains: search } } },
      { assignedRecruiter: { phone: { contains: search } } },
      { assignedRecruiter: { email: { contains: search } } }
    ] } : {}),
    ...(filters.companyId ? { companyId: filters.companyId } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.location ? { location: { contains: filters.location } } : {})
  };
}

export function parseVacanciesQuery(searchParams?: Record<string, string | string[] | undefined>) {
  return vacanciesQuerySchema.parse({
    search: Array.isArray(searchParams?.search) ? searchParams.search[0] : searchParams?.search,
    companyId: Array.isArray(searchParams?.companyId) ? searchParams.companyId[0] : searchParams?.companyId,
    priority: Array.isArray(searchParams?.priority) ? searchParams.priority[0] : searchParams?.priority,
    status: Array.isArray(searchParams?.status) ? searchParams.status[0] : searchParams?.status,
    location: Array.isArray(searchParams?.location) ? searchParams.location[0] : searchParams?.location,
    sortBy: Array.isArray(searchParams?.sortBy) ? searchParams.sortBy[0] : searchParams?.sortBy,
    sortOrder: Array.isArray(searchParams?.sortOrder) ? searchParams.sortOrder[0] : searchParams?.sortOrder,
    page: Array.isArray(searchParams?.page) ? searchParams.page[0] : searchParams?.page
  });
}

export async function getVacanciesPage(searchParams?: Record<string, string | string[] | undefined>) {
  const filters = parseVacanciesQuery(searchParams);
  const whereClause = where(filters);
  const [vacancies, totalCount, companies, locations] = await Promise.all([
    prisma.vacancy.findMany({
      where: whereClause,
      orderBy:
        filters.sortBy === "company"
          ? { company: { name: filters.sortOrder } }
          : ({ [filters.sortBy]: filters.sortOrder } as Prisma.VacancyOrderByWithRelationInput),
      skip: (filters.page - 1) * VACANCIES_PAGE_SIZE,
      take: VACANCIES_PAGE_SIZE,
      include: {
        company: { select: { id: true, name: true } },
        assignedRecruiter: {
          select: { id: true, fullName: true, phone: true, email: true, city: true }
        }
      }
    }),
    prisma.vacancy.count({ where: whereClause }),
    prisma.company.findMany({
      select: { id: true, name: true, city: true },
      orderBy: { name: "asc" }
    }),
    prisma.vacancy.findMany({ distinct: ["location"], select: { location: true }, orderBy: { location: "asc" } })
  ]);

  return {
    filters,
    vacancies,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / VACANCIES_PAGE_SIZE)),
    filterOptions: { companies, locations: locations.map((item) => item.location) }
  };
}

export async function getVacancyFormOptions() {
  const [companies, recruiters] = await Promise.all([
    prisma.company.findMany({
      select: { id: true, name: true, city: true },
      orderBy: { name: "asc" }
    }),
    prisma.hrContact.findMany({
      select: {
        id: true,
        fullName: true,
        designation: true,
        city: true,
        company: { select: { id: true, name: true, city: true } }
      },
      orderBy: { fullName: "asc" }
    })
  ]);
  return { companies, recruiters };
}

export async function getVacancyById(vacancyId: string) {
  return prisma.vacancy.findUnique({
    where: { id: vacancyId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          website: true,
          industry: true,
          companySize: true,
          city: true,
          address: true,
          notes: true,
          status: true,
          _count: {
            select: {
              hrContacts: true,
              vacancies: true,
              followUps: true,
              activities: true
            }
          }
        }
      },
      assignedRecruiter: {
        select: {
          id: true,
          fullName: true,
          designation: true,
          phone: true,
          email: true,
          whatsapp: true,
          linkedIn: true,
          city: true,
          status: true,
          company: { select: { id: true, name: true, city: true } }
        }
      }
    }
  });
}

export type VacancyTimelineKind = "create" | "update" | "delete" | "activity";

export type VacancyTimelineItem = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  kind: VacancyTimelineKind;
  type: ActivityType;
};

function classifyVacancyTimelineItem(title: string): VacancyTimelineKind {
  const normalized = title.toLowerCase();

  if (normalized.includes("deleted")) return "delete";
  if (normalized.includes("created")) return "create";
  if (normalized.includes("updated")) return "update";
  return "activity";
}

export async function getVacancyTimeline(vacancyId: string) {
  const vacancy = await prisma.vacancy.findUnique({
    where: { id: vacancyId },
    select: { companyId: true, assignedRecruiterId: true }
  });

  if (!vacancy) return [];

  const activities = await prisma.activity.findMany({
    where: {
      OR: [
        { companyId: vacancy.companyId },
        ...(vacancy.assignedRecruiterId ? [{ hrContactId: vacancy.assignedRecruiterId }] : [])
      ]
    },
    orderBy: { createdAt: "desc" },
    take: 8
  });

  return activities.map((activity) => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    createdAt: activity.createdAt,
    kind: classifyVacancyTimelineItem(activity.title),
    type: activity.type
  })) as VacancyTimelineItem[];
}
