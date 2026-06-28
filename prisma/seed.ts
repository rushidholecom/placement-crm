import bcrypt from "bcryptjs";
import {
  ActivityType,
  FollowUpStatus,
  FollowUpType,
  HrPriority,
  HrStatus,
  PrismaClient,
  VacancyPriority,
  VacancyStatus
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
        website: "https://apextalent.example",
        industry: "SaaS",
        companySize: "MID_MARKET",
        city: "Bengaluru",
        address: "Indiranagar, Bengaluru",
        notes: "Strong internship hiring partner.",
        status: "ACTIVE"
      }
    }),
    prisma.company.create({
      data: {
        name: "Northstar Mobility",
        website: "https://northstar.example",
        industry: "Automotive",
        companySize: "ENTERPRISE",
        city: "Pune",
        address: "Hinjawadi, Pune",
        notes: "Prefers embedded and mechanical roles.",
        status: "PROSPECT"
      }
    }),
    prisma.company.create({
      data: {
        name: "Bluefin Analytics",
        website: "https://bluefin.example",
        industry: "Fintech",
        companySize: "SMALL",
        city: "Mumbai",
        address: "BKC, Mumbai",
        notes: "Data roles open every quarter.",
        status: "ACTIVE"
      }
    }),
    prisma.company.create({
      data: {
        name: "Orbit Digital Health",
        website: "https://orbithealth.example",
        industry: "HealthTech",
        companySize: "MID_MARKET",
        city: "Hyderabad",
        address: "HITEC City, Hyderabad",
        notes: "Requires onboarding documentation early.",
        status: "ON_HOLD"
      }
    }),
    prisma.company.create({
      data: {
        name: "Vertex Cloud Labs",
        website: "https://vertexcloud.example",
        industry: "Cloud Infrastructure",
        companySize: "STARTUP",
        city: "Gurugram",
        address: "Cyber City, Gurugram",
        notes: "High growth account.",
        status: "PROSPECT"
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
        whatsapp: "+91-9876501001",
        linkedIn: "https://linkedin.com/in/neha-kapoor",
        designation: "Senior Talent Partner",
        city: "Bengaluru",
        remark: "Primary contact for assessment scheduling.",
        priority: HrPriority.HIGH,
        lastContactDate: new Date(now.getTime() - hour * 24),
        nextFollowUpDate: new Date(now.getTime() + hour * 2),
        status: HrStatus.FOLLOW_UP,
        createdAt: new Date(now.getTime() - hour * 20)
      }
    }),
    prisma.hrContact.create({
      data: {
        companyId: companies[1].id,
        fullName: "Rohit Malhotra",
        email: "rohit.malhotra@northstar.example",
        phone: "+91-9876501002",
        whatsapp: "+91-9876501002",
        linkedIn: "https://linkedin.com/in/rohit-malhotra",
        designation: "Lead Recruiter",
        city: "Pune",
        remark: "Needs drive date approval from business team.",
        priority: HrPriority.URGENT,
        lastContactDate: new Date(now.getTime() - hour * 30),
        nextFollowUpDate: new Date(now.getTime() - hour * 18),
        status: HrStatus.FOLLOW_UP,
        createdAt: new Date(now.getTime() - hour * 15)
      }
    }),
    prisma.hrContact.create({
      data: {
        companyId: companies[2].id,
        fullName: "Aisha Khan",
        email: "aisha.khan@bluefin.example",
        phone: "+91-9876501003",
        whatsapp: "+91-9876501003",
        linkedIn: "https://linkedin.com/in/aisha-khan",
        designation: "HR Business Partner",
        city: "Mumbai",
        remark: "Prefers email summaries after calls.",
        priority: HrPriority.MEDIUM,
        lastContactDate: new Date(now.getTime() - hour * 12),
        nextFollowUpDate: new Date(now.getTime() + hour * 26),
        status: HrStatus.ACTIVE,
        createdAt: new Date(now.getTime() - hour * 9)
      }
    }),
    prisma.hrContact.create({
      data: {
        companyId: companies[3].id,
        fullName: "Karan Sethi",
        email: "karan.sethi@orbit.example",
        phone: "+91-9876501004",
        whatsapp: "+91-9876501004",
        linkedIn: "https://linkedin.com/in/karan-sethi",
        designation: "Campus Hiring Manager",
        city: "Hyderabad",
        remark: "Awaiting onboarding deck confirmation.",
        priority: HrPriority.MEDIUM,
        lastContactDate: new Date(now.getTime() - hour * 18),
        nextFollowUpDate: new Date(now.getTime() + hour * 32),
        status: HrStatus.ACTIVE,
        createdAt: new Date(now.getTime() - hour * 6)
      }
    }),
    prisma.hrContact.create({
      data: {
        companyId: companies[4].id,
        fullName: "Meera Iyer",
        email: "meera.iyer@vertex.example",
        phone: "+91-9876501005",
        whatsapp: "+91-9876501005",
        linkedIn: "https://linkedin.com/in/meera-iyer",
        designation: "Recruitment Specialist",
        city: "Gurugram",
        remark: "Fast response on cloud support profiles.",
        priority: HrPriority.HIGH,
        lastContactDate: new Date(now.getTime() - hour * 3),
        nextFollowUpDate: new Date(now.getTime() + hour * 48),
        status: HrStatus.ACTIVE,
        createdAt: new Date(now.getTime() - hour * 2)
      }
    })
  ]);

  await prisma.vacancy.createMany({
    data: [
      {
        companyId: companies[0].id,
        title: "Software Engineer Intern",
        experience: "0-1 years",
        openings: 8,
        location: "Bengaluru",
        technology: "React, Node.js, TypeScript",
        skills: "Frontend, REST APIs, SQL, problem solving",
        compensationLpa: 12,
        priority: VacancyPriority.HIGH,
        status: VacancyStatus.OPEN,
        assignedRecruiterId: hrContacts[0].id,
        remark: "High-volume campus role."
      },
      {
        companyId: companies[0].id,
        title: "Associate Product Analyst",
        experience: "0-2 years",
        openings: 3,
        location: "Remote",
        technology: "SQL, Tableau, Excel",
        skills: "Analytics, dashboards, stakeholder communication",
        compensationLpa: 10,
        priority: VacancyPriority.MEDIUM,
        status: VacancyStatus.IN_PROGRESS,
        assignedRecruiterId: hrContacts[0].id,
        remark: "Needs analytics screening round."
      },
      {
        companyId: companies[1].id,
        title: "Embedded Systems Engineer",
        experience: "1-3 years",
        openings: 5,
        location: "Pune",
        technology: "C, C++, CAN, RTOS",
        skills: "Embedded development, debugging, hardware interfaces",
        compensationLpa: 9.5,
        priority: VacancyPriority.URGENT,
        status: VacancyStatus.OPEN,
        assignedRecruiterId: hrContacts[1].id,
        remark: "Drive date pending approval."
      },
      {
        companyId: companies[2].id,
        title: "Data Analyst",
        experience: "0-2 years",
        openings: 4,
        location: "Mumbai",
        technology: "Python, SQL, Power BI",
        skills: "Data cleaning, reporting, business analysis",
        compensationLpa: 11,
        priority: VacancyPriority.HIGH,
        status: VacancyStatus.OPEN,
        assignedRecruiterId: hrContacts[2].id,
        remark: "Shortlist data portfolio candidates."
      },
      {
        companyId: companies[3].id,
        title: "Implementation Associate",
        experience: "0-1 years",
        openings: 6,
        location: "Hyderabad",
        technology: "SaaS, CRM, APIs",
        skills: "Client onboarding, documentation, support",
        compensationLpa: 8,
        priority: VacancyPriority.LOW,
        status: VacancyStatus.ON_HOLD,
        assignedRecruiterId: hrContacts[3].id,
        remark: "Waiting for onboarding deck."
      },
      {
        companyId: companies[4].id,
        title: "Cloud Support Engineer",
        experience: "1-2 years",
        openings: 7,
        location: "Gurugram",
        technology: "AWS, Linux, Docker",
        skills: "Cloud support, incident response, scripting",
        compensationLpa: 10.5,
        priority: VacancyPriority.MEDIUM,
        status: VacancyStatus.OPEN,
        assignedRecruiterId: hrContacts[4].id,
        remark: "Linux troubleshooting is mandatory."
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
