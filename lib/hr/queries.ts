import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { HR_PAGE_SIZE } from "@/lib/hr/constants";
import { hrQuerySchema, type HrQueryInput } from "@/lib/hr/validators";

function buildHrWhereClause(filters: HrQueryInput): Prisma.HrContactWhereInput {
  const search = filters.search.trim();

  return {
    ...(search
      ? {
          OR: [
            { fullName: { contains: search } },
            { designation: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
            { whatsapp: { contains: search } },
            { city: { contains: search } },
            { company: { name: { contains: search } } }
          ]
        }
      : {}),
    ...(filters.companyId ? { companyId: filters.companyId } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.city ? { city: { contains: filters.city } } : {})
  };
}

export function parseHrQuery(
  searchParams?: Record<string, string | string[] | undefined>
) {
  return hrQuerySchema.parse({
    search: Array.isArray(searchParams?.search)
      ? searchParams?.search[0]
      : searchParams?.search,
    companyId: Array.isArray(searchParams?.companyId)
      ? searchParams?.companyId[0]
      : searchParams?.companyId,
    priority: Array.isArray(searchParams?.priority)
      ? searchParams?.priority[0]
      : searchParams?.priority,
    status: Array.isArray(searchParams?.status)
      ? searchParams?.status[0]
      : searchParams?.status,
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

export async function getHrPage(
  searchParams?: Record<string, string | string[] | undefined>
) {
  const filters = parseHrQuery(searchParams);
  const where = buildHrWhereClause(filters);

  const [hrContacts, totalCount, companies, cities, duplicateGroups] =
    await Promise.all([
      prisma.hrContact.findMany({
        where,
        orderBy:
          filters.sortBy === "nextFollowUpDate"
            ? [{ nextFollowUpDate: filters.sortOrder }, { createdAt: "desc" }]
            : ({
                [filters.sortBy]: filters.sortOrder
              } as Prisma.HrContactOrderByWithRelationInput),
        skip: (filters.page - 1) * HR_PAGE_SIZE,
        take: HR_PAGE_SIZE,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              city: true
            }
          },
          _count: {
            select: {
              followUps: true,
              activities: true
            }
          }
        }
      }),
      prisma.hrContact.count({ where }),
      prisma.company.findMany({
        select: {
          id: true,
          name: true
        },
        orderBy: {
          name: "asc"
        }
      }),
      prisma.hrContact.findMany({
        distinct: ["city"],
        select: { city: true },
        orderBy: { city: "asc" }
      }),
      prisma.hrContact.groupBy({
        by: ["phone"],
        where: {
          phone: {
            not: ""
          }
        },
        _count: {
          phone: true
        },
        having: {
          phone: {
            _count: {
              gt: 1
            }
          }
        }
      })
    ]);

  const duplicatePhones = new Set(duplicateGroups.map((group) => group.phone));

  return {
    filters,
    hrContacts: hrContacts.map((contact) => ({
      ...contact,
      hasDuplicatePhone: duplicatePhones.has(contact.phone)
    })),
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / HR_PAGE_SIZE)),
    filterOptions: {
      companies,
      cities: cities.map((item) => item.city).filter(Boolean)
    }
  };
}

export async function getHrFormOptions() {
  return prisma.company.findMany({
    select: {
      id: true,
      name: true,
      city: true
    },
    orderBy: {
      name: "asc"
    }
  });
}

export async function getHrById(hrId: string) {
  return prisma.hrContact.findUnique({
    where: { id: hrId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          industry: true,
          city: true
        }
      },
      followUps: {
        orderBy: {
          dueAt: "desc"
        },
        take: 10
      },
      activities: {
        orderBy: {
          createdAt: "desc"
        },
        take: 10
      }
    }
  });
}
