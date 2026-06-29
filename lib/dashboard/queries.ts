import { FollowUpStatus, FollowUpType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function getTodayRange() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { now, start, end };
}

export async function getDashboardData() {
  const { now, start, end } = getTodayRange();

  const [
    todaysFollowUps,
    overdueFollowUps,
    todaysCalls,
    todaysEmails,
    totalCompanies,
    totalHr,
    totalVacancies,
    recentActivities,
    upcomingFollowUps,
    latestAddedHr
  ] = await Promise.all([
    prisma.followUp.count({
      where: {
        status: FollowUpStatus.PENDING,
        deletedAt: null,
        company: {
          deletedAt: null
        },
        dueAt: {
          gte: start,
          lt: end
        }
      }
    }),
    prisma.followUp.count({
      where: {
        status: FollowUpStatus.PENDING,
        deletedAt: null,
        company: {
          deletedAt: null
        },
        dueAt: {
          lt: start
        }
      }
    }),
    prisma.followUp.count({
      where: {
        status: FollowUpStatus.PENDING,
        type: FollowUpType.CALL,
        deletedAt: null,
        company: {
          deletedAt: null
        },
        dueAt: {
          gte: start,
          lt: end
        }
      }
    }),
    prisma.followUp.count({
      where: {
        status: FollowUpStatus.PENDING,
        type: FollowUpType.EMAIL,
        deletedAt: null,
        company: {
          deletedAt: null
        },
        dueAt: {
          gte: start,
          lt: end
        }
      }
    }),
    prisma.company.count({ where: { deletedAt: null } }),
    prisma.hrContact.count({
      where: {
        deletedAt: null,
        company: {
          deletedAt: null
        }
      }
    }),
    prisma.vacancy.count({
      where: {
        deletedAt: null,
        company: {
          deletedAt: null
        }
      }
    }),
    prisma.activity.findMany({
      where: {
        deletedAt: null,
        company: {
          deletedAt: null
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 6,
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        createdAt: true,
        company: {
          select: {
            name: true
          }
        },
        hrContact: {
          select: {
            fullName: true
          }
        }
      }
    }),
    prisma.followUp.findMany({
      where: {
        status: FollowUpStatus.PENDING,
        deletedAt: null,
        company: {
          deletedAt: null
        },
        dueAt: {
          gt: now
        }
      },
      orderBy: {
        dueAt: "asc"
      },
      take: 5,
      select: {
        id: true,
        subject: true,
        notes: true,
        type: true,
        dueAt: true,
        company: {
          select: {
            name: true
          }
        },
        hrContact: {
          select: {
            fullName: true,
            designation: true
          }
        }
      }
    }),
    prisma.hrContact.findMany({
      where: {
        deletedAt: null,
        company: {
          deletedAt: null
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5,
      select: {
        id: true,
        fullName: true,
        designation: true,
        email: true,
        phone: true,
        createdAt: true,
        company: {
          select: {
            name: true
          }
        }
      }
    })
  ]);

  return {
    metrics: {
      todaysFollowUps,
      overdueFollowUps,
      todaysCalls,
      todaysEmails,
      totalCompanies,
      totalHr,
      totalVacancies
    },
    recentActivities,
    upcomingFollowUps,
    latestAddedHr
  };
}
