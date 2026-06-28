import { FollowUpStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { GlobalSearchResponse } from "@/lib/search/types";

const SEARCH_LIMIT = 6;

function normalizeQuery(query: string) {
  return query.trim().replace(/\s+/g, " ").slice(0, 80);
}

function toIsoDate(value?: Date | null) {
  return value ? value.toISOString() : null;
}

export async function globalSearch(query: string): Promise<GlobalSearchResponse> {
  const normalizedQuery = normalizeQuery(query);

  if (normalizedQuery.length < 2) {
    return {
      query: normalizedQuery,
      totalCount: 0,
      companies: [],
      hr: [],
      vacancies: []
    };
  }

  const [companies, hrContacts, vacancies] = await Promise.all([
    prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: normalizedQuery } },
          { website: { contains: normalizedQuery } },
          { industry: { contains: normalizedQuery } },
          { city: { contains: normalizedQuery } },
          { notes: { contains: normalizedQuery } },
          { hrContacts: { some: { phone: { contains: normalizedQuery } } } },
          { hrContacts: { some: { email: { contains: normalizedQuery } } } },
          { hrContacts: { some: { remark: { contains: normalizedQuery } } } },
          { vacancies: { some: { title: { contains: normalizedQuery } } } },
          { vacancies: { some: { location: { contains: normalizedQuery } } } },
          { vacancies: { some: { technology: { contains: normalizedQuery } } } },
          { vacancies: { some: { skills: { contains: normalizedQuery } } } }
        ]
      },
      orderBy: { updatedAt: "desc" },
      take: SEARCH_LIMIT,
      select: {
        id: true,
        name: true,
        website: true,
        city: true,
        industry: true,
        notes: true,
        hrContacts: {
          orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
          take: 1,
          select: {
            phone: true,
            email: true
          }
        },
        followUps: {
          where: {
            status: FollowUpStatus.PENDING
          },
          orderBy: {
            dueAt: "asc"
          },
          take: 1,
          select: {
            dueAt: true
          }
        }
      }
    }),
    prisma.hrContact.findMany({
      where: {
        OR: [
          { fullName: { contains: normalizedQuery } },
          { designation: { contains: normalizedQuery } },
          { phone: { contains: normalizedQuery } },
          { whatsapp: { contains: normalizedQuery } },
          { email: { contains: normalizedQuery } },
          { linkedIn: { contains: normalizedQuery } },
          { city: { contains: normalizedQuery } },
          { remark: { contains: normalizedQuery } },
          { company: { name: { contains: normalizedQuery } } },
          { company: { website: { contains: normalizedQuery } } },
          { company: { industry: { contains: normalizedQuery } } },
          { company: { city: { contains: normalizedQuery } } }
        ]
      },
      orderBy: [{ nextFollowUpDate: "asc" }, { updatedAt: "desc" }],
      take: SEARCH_LIMIT,
      select: {
        id: true,
        fullName: true,
        designation: true,
        phone: true,
        email: true,
        linkedIn: true,
        city: true,
        remark: true,
        nextFollowUpDate: true,
        company: {
          select: {
            name: true
          }
        },
        followUps: {
          where: {
            status: FollowUpStatus.PENDING
          },
          orderBy: {
            dueAt: "asc"
          },
          take: 1,
          select: {
            dueAt: true
          }
        }
      }
    }),
    prisma.vacancy.findMany({
      where: {
        OR: [
          { title: { contains: normalizedQuery } },
          { location: { contains: normalizedQuery } },
          { technology: { contains: normalizedQuery } },
          { skills: { contains: normalizedQuery } },
          { company: { name: { contains: normalizedQuery } } },
          { company: { website: { contains: normalizedQuery } } },
          { company: { industry: { contains: normalizedQuery } } },
          { company: { city: { contains: normalizedQuery } } },
          { company: { hrContacts: { some: { phone: { contains: normalizedQuery } } } } },
          { company: { hrContacts: { some: { email: { contains: normalizedQuery } } } } }
        ]
      },
      orderBy: { updatedAt: "desc" },
      take: SEARCH_LIMIT,
      select: {
        id: true,
        title: true,
        location: true,
        technology: true,
        skills: true,
        company: {
          select: {
            id: true,
            name: true,
            notes: true,
            hrContacts: {
              orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
              take: 1,
              select: {
                phone: true,
                email: true,
                remark: true
              }
            },
            followUps: {
              where: {
                status: FollowUpStatus.PENDING
              },
              orderBy: {
                dueAt: "asc"
              },
              take: 1,
              select: {
                dueAt: true
              }
            }
          }
        }
      }
    })
  ]);

  const companyResults = companies.map((company) => {
    const primaryHr = company.hrContacts[0];
    const followUp = company.followUps[0];

    return {
      id: company.id,
      name: company.name,
      website: company.website,
      city: company.city,
      industry: company.industry,
      remark: company.notes,
      phone: primaryHr?.phone ?? null,
      email: primaryHr?.email ?? null,
      nextFollowUp: toIsoDate(followUp?.dueAt),
      href: `/dashboard/companies/${company.id}`,
      editHref: `/dashboard/companies/${company.id}/edit`
    };
  });

  const hrResults = hrContacts.map((contact) => {
    const followUp = contact.followUps[0];

    return {
      id: contact.id,
      fullName: contact.fullName,
      designation: contact.designation,
      companyName: contact.company.name,
      city: contact.city,
      phone: contact.phone,
      email: contact.email,
      linkedIn: contact.linkedIn,
      remark: contact.remark,
      nextFollowUp: toIsoDate(contact.nextFollowUpDate ?? followUp?.dueAt),
      href: `/dashboard/hr/${contact.id}`,
      editHref: `/dashboard/hr/${contact.id}/edit`
    };
  });

  const vacancyResults = vacancies.map((vacancy) => {
    const primaryHr = vacancy.company.hrContacts[0];
    const followUp = vacancy.company.followUps[0];

    return {
      id: vacancy.id,
      title: vacancy.title,
      companyName: vacancy.company.name,
      location: vacancy.location,
      technology: vacancy.technology,
      skills: vacancy.skills,
      phone: primaryHr?.phone ?? null,
      email: primaryHr?.email ?? null,
      remark: primaryHr?.remark ?? vacancy.company.notes,
      nextFollowUp: toIsoDate(followUp?.dueAt),
      href: `/dashboard/companies/${vacancy.company.id}`,
      editHref: `/dashboard/companies/${vacancy.company.id}/edit`
    };
  });

  return {
    query: normalizedQuery,
    totalCount: companyResults.length + hrResults.length + vacancyResults.length,
    companies: companyResults,
    hr: hrResults,
    vacancies: vacancyResults
  };
}
