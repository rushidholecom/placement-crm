import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { COMPANIES_PAGE_SIZE } from "@/lib/company/constants";
import {
  companiesQuerySchema,
  type CompaniesQueryInput
} from "@/lib/company/validators";

function buildCompanyWhereClause(filters: CompaniesQueryInput): Prisma.CompanyWhereInput {
  const search = filters.search.trim();

  return {
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { website: { contains: search } },
            { industry: { contains: search } },
            { city: { contains: search } }
          ]
        }
      : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.industry
      ? { industry: { contains: filters.industry } }
      : {}),
    ...(filters.city ? { city: { contains: filters.city } } : {})
  };
}

export function parseCompaniesQuery(
  searchParams?: Record<string, string | string[] | undefined>
) {
  return companiesQuerySchema.parse({
    search: Array.isArray(searchParams?.search)
      ? searchParams?.search[0]
      : searchParams?.search,
    status: Array.isArray(searchParams?.status)
      ? searchParams?.status[0]
      : searchParams?.status,
    industry: Array.isArray(searchParams?.industry)
      ? searchParams?.industry[0]
      : searchParams?.industry,
    city: Array.isArray(searchParams?.city)
      ? searchParams?.city[0]
      : searchParams?.city,
    sortBy: Array.isArray(searchParams?.sortBy)
      ? searchParams?.sortBy[0]
      : searchParams?.sortBy,
    sortOrder: Array.isArray(searchParams?.sortOrder)
      ? searchParams?.sortOrder[0]
      : searchParams?.sortOrder,
    page: Array.isArray(searchParams?.page)
      ? searchParams?.page[0]
      : searchParams?.page
  });
}

export async function getCompaniesPage(
  searchParams?: Record<string, string | string[] | undefined>
) {
  const filters = parseCompaniesQuery(searchParams);
  const where = buildCompanyWhereClause(filters);

  const [companies, totalCount, industries, cities] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: {
        [filters.sortBy]: filters.sortOrder
      } as Prisma.CompanyOrderByWithRelationInput,
      skip: (filters.page - 1) * COMPANIES_PAGE_SIZE,
      take: COMPANIES_PAGE_SIZE,
      include: {
        _count: {
          select: {
            hrContacts: true,
            vacancies: true,
            followUps: true
          }
        }
      }
    }),
    prisma.company.count({ where }),
    prisma.company.findMany({
      where: { deletedAt: null },
      distinct: ["industry"],
      select: { industry: true },
      orderBy: { industry: "asc" }
    }),
    prisma.company.findMany({
      where: { deletedAt: null },
      distinct: ["city"],
      select: { city: true },
      orderBy: { city: "asc" }
    })
  ]);

  return {
    filters,
    companies,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / COMPANIES_PAGE_SIZE)),
    filterOptions: {
      industries: industries.map((item) => item.industry),
      cities: cities.map((item) => item.city)
    }
  };
}

export async function getCompanyById(companyId: string) {
  return prisma.company.findFirst({
    where: {
      id: companyId,
      deletedAt: null
    },
    include: {
      _count: {
        select: {
          hrContacts: true,
          vacancies: true,
          followUps: true,
          activities: true
        }
      }
    }
  });
}
