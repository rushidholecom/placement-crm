import bcrypt from "bcryptjs";
import {
  ActivityType,
  FollowUpStatus,
  FollowUpType,
  PrismaClient
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const username = "admin";
  const password = "admin123";
  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();
  const hour = 60 * 60 * 1000;

  await prisma.user.upsert({
    where: { username },
    update: {
      fullName: "System Administrator",
      passwordHash,
      role: "admin"
    },
    create: {
      username,
      fullName: "System Administrator",
      passwordHash,
      role: "admin"
    }
  });

  await prisma.activity.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.vacancy.deleteMany();
  await prisma.hrContact.deleteMany();
  await prisma.company.deleteMany();

  const companies = await prisma.$transaction([
    prisma.company.create({
      data: {
        name: "Apex Talent Systems",
        industry: "SaaS",
        location: "Bengaluru"
      }
    }),
    prisma.company.create({
      data: {
        name: "Northstar Mobility",
        industry: "Automotive",
        location: "Pune"
      }
    }),
    prisma.company.create({
      data: {
        name: "Bluefin Analytics",
        industry: "Fintech",
        location: "Mumbai"
      }
    }),
    prisma.company.create({
      data: {
        name: "Orbit Digital Health",
        industry: "HealthTech",
        location: "Hyderabad"
      }
    }),
    prisma.company.create({
      data: {
        name: "Vertex Cloud Labs",
        industry: "Cloud Infrastructure",
        location: "Gurugram"
      }
    })
  ]);

  const hrContacts = await prisma.$transaction([
    prisma.hrContact.create({
      data: {
        companyId: companies[0].id,
        fullName: "Neha Kapoor",
        email: "neha.kapoor@apextalent.example",
        phone: "+91-9876501001",
        designation: "Senior Talent Partner",
        createdAt: new Date(now.getTime() - hour * 20)
      }
    }),
    prisma.hrContact.create({
      data: {
        companyId: companies[1].id,
        fullName: "Rohit Malhotra",
        email: "rohit.malhotra@northstar.example",
        phone: "+91-9876501002",
        designation: "Lead Recruiter",
        createdAt: new Date(now.getTime() - hour * 15)
      }
    }),
    prisma.hrContact.create({
      data: {
        companyId: companies[2].id,
        fullName: "Aisha Khan",
        email: "aisha.khan@bluefin.example",
        phone: "+91-9876501003",
        designation: "HR Business Partner",
        createdAt: new Date(now.getTime() - hour * 9)
      }
    }),
    prisma.hrContact.create({
      data: {
        companyId: companies[3].id,
        fullName: "Karan Sethi",
        email: "karan.sethi@orbit.example",
        phone: "+91-9876501004",
        designation: "Campus Hiring Manager",
        createdAt: new Date(now.getTime() - hour * 6)
      }
    }),
    prisma.hrContact.create({
      data: {
        companyId: companies[4].id,
        fullName: "Meera Iyer",
        email: "meera.iyer@vertex.example",
        phone: "+91-9876501005",
        designation: "Recruitment Specialist",
        createdAt: new Date(now.getTime() - hour * 2)
      }
    })
  ]);

  await prisma.vacancy.createMany({
    data: [
      {
        companyId: companies[0].id,
        title: "Software Engineer Intern",
        openings: 8,
        location: "Bengaluru",
        compensationLpa: 12
      },
      {
        companyId: companies[0].id,
        title: "Associate Product Analyst",
        openings: 3,
        location: "Remote",
        compensationLpa: 10
      },
      {
        companyId: companies[1].id,
        title: "Embedded Systems Engineer",
        openings: 5,
        location: "Pune",
        compensationLpa: 9.5
      },
      {
        companyId: companies[2].id,
        title: "Data Analyst",
        openings: 4,
        location: "Mumbai",
        compensationLpa: 11
      },
      {
        companyId: companies[3].id,
        title: "Implementation Associate",
        openings: 6,
        location: "Hyderabad",
        compensationLpa: 8
      },
      {
        companyId: companies[4].id,
        title: "Cloud Support Engineer",
        openings: 7,
        location: "Gurugram",
        compensationLpa: 10.5
      }
    ]
  });

  await prisma.followUp.createMany({
    data: [
      {
        companyId: companies[0].id,
        hrContactId: hrContacts[0].id,
        subject: "Confirm assessment timeline",
        notes: "Need final shortlist submission window.",
        type: FollowUpType.CALL,
        status: FollowUpStatus.PENDING,
        dueAt: new Date(now.getTime() + hour * 2)
      },
      {
        companyId: companies[1].id,
        hrContactId: hrContacts[1].id,
        subject: "Share JD revision",
        notes: "Updated role requirements for embedded systems drive.",
        type: FollowUpType.EMAIL,
        status: FollowUpStatus.PENDING,
        dueAt: new Date(now.getTime() + hour * 4)
      },
      {
        companyId: companies[2].id,
        hrContactId: hrContacts[2].id,
        subject: "Discuss interview panel availability",
        notes: "Need final confirmation for Thursday panel slots.",
        type: FollowUpType.CALL,
        status: FollowUpStatus.PENDING,
        dueAt: new Date(now.getTime() + hour * 26)
      },
      {
        companyId: companies[3].id,
        hrContactId: hrContacts[3].id,
        subject: "Send onboarding deck",
        notes: "Awaiting revised deck before student distribution.",
        type: FollowUpType.EMAIL,
        status: FollowUpStatus.PENDING,
        dueAt: new Date(now.getTime() + hour * 32)
      },
      {
        companyId: companies[4].id,
        hrContactId: hrContacts[4].id,
        subject: "Reschedule compensation discussion",
        notes: "Previous meeting missed, align on revised range.",
        type: FollowUpType.MEETING,
        status: FollowUpStatus.PENDING,
        dueAt: new Date(now.getTime() + hour * 48)
      },
      {
        companyId: companies[1].id,
        hrContactId: hrContacts[1].id,
        subject: "Pending approval on campus drive date",
        notes: "Original due date missed, urgent escalation required.",
        type: FollowUpType.CALL,
        status: FollowUpStatus.PENDING,
        dueAt: new Date(now.getTime() - hour * 18)
      },
      {
        companyId: companies[2].id,
        hrContactId: hrContacts[2].id,
        subject: "Send candidate feedback summary",
        notes: "Feedback mail still pending from hiring team.",
        type: FollowUpType.EMAIL,
        status: FollowUpStatus.PENDING,
        dueAt: new Date(now.getTime() - hour * 30)
      }
    ]
  });

  await prisma.activity.createMany({
    data: [
      {
        companyId: companies[4].id,
        hrContactId: hrContacts[4].id,
        title: "New HR contact added",
        description: "Meera Iyer was added as the primary recruiter for cloud hiring.",
        type: ActivityType.HR,
        createdAt: new Date(now.getTime() - hour)
      },
      {
        companyId: companies[0].id,
        hrContactId: hrContacts[0].id,
        title: "Call scheduled",
        description: "Assessment timeline call locked for this afternoon.",
        type: ActivityType.CALL,
        createdAt: new Date(now.getTime() - hour * 2)
      },
      {
        companyId: companies[2].id,
        hrContactId: hrContacts[2].id,
        title: "Candidate feedback requested",
        description: "Bluefin requested a consolidated summary for shortlisted candidates.",
        type: ActivityType.EMAIL,
        createdAt: new Date(now.getTime() - hour * 4)
      },
      {
        companyId: companies[1].id,
        title: "New vacancy published",
        description: "Embedded Systems Engineer openings were added to the active drive.",
        type: ActivityType.VACANCY,
        createdAt: new Date(now.getTime() - hour * 7)
      },
      {
        companyId: companies[3].id,
        hrContactId: hrContacts[3].id,
        title: "Follow-up escalated",
        description: "Onboarding deck request marked for same-day response.",
        type: ActivityType.FOLLOW_UP,
        createdAt: new Date(now.getTime() - hour * 10)
      },
      {
        companyId: companies[0].id,
        title: "Company notes updated",
        description: "Compensation notes and internship batch capacity were revised.",
        type: ActivityType.NOTE,
        createdAt: new Date(now.getTime() - hour * 14)
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
