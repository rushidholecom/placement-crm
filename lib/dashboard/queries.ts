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
        dueAt: {
          gte: start,
          lt: end
        }
      }
    }),
    prisma.followUp.count({
      where: {
        status: FollowUpStatus.PENDING,
        dueAt: {
          lt: start
        }
      }
    }),
    prisma.followUp.count({
      where: {
        status: FollowUpStatus.PENDING,
        type: FollowUpType.CALL,
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
        dueAt: {
          gte: start,
          lt: end
        }
      }
    }),
    prisma.company.count(),
    prisma.hrContact.count(),
    prisma.vacancy.count(),
    prisma.activity.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 6,
      include: {
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
        dueAt: {
          gt: now
        }
      },
      orderBy: {
        dueAt: "asc"
      },
      take: 5,
      include: {
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
      orderBy: {
        createdAt: "desc"
      },
      take: 5,
      include: {
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
