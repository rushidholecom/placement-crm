-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "industry" TEXT NOT NULL,
    "companySize" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PROSPECT',
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Company" ("address", "city", "companySize", "createdAt", "deletedAt", "id", "industry", "name", "notes", "status", "updatedAt", "website") SELECT "address", "city", "companySize", "createdAt", "deletedAt", "id", "industry", "name", "notes", "status", "updatedAt", "website" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
CREATE INDEX "Company_name_idx" ON "Company"("name");
CREATE INDEX "Company_status_idx" ON "Company"("status");
CREATE INDEX "Company_industry_idx" ON "Company"("industry");
CREATE INDEX "Company_city_idx" ON "Company"("city");
CREATE INDEX "Company_deletedAt_idx" ON "Company"("deletedAt");
CREATE UNIQUE INDEX "Company_name_city_key" ON "Company"("name", "city");
CREATE TABLE "new_HrContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "linkedIn" TEXT,
    "designation" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "remark" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "lastContactDate" DATETIME,
    "nextFollowUpDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HrContact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_HrContact" ("city", "companyId", "createdAt", "deletedAt", "designation", "email", "fullName", "id", "lastContactDate", "linkedIn", "nextFollowUpDate", "phone", "priority", "remark", "status", "updatedAt", "whatsapp") SELECT "city", "companyId", "createdAt", "deletedAt", "designation", "email", "fullName", "id", "lastContactDate", "linkedIn", "nextFollowUpDate", "phone", "priority", "remark", "status", "updatedAt", "whatsapp" FROM "HrContact";
DROP TABLE "HrContact";
ALTER TABLE "new_HrContact" RENAME TO "HrContact";
CREATE UNIQUE INDEX "HrContact_email_key" ON "HrContact"("email");
CREATE INDEX "HrContact_companyId_idx" ON "HrContact"("companyId");
CREATE INDEX "HrContact_city_idx" ON "HrContact"("city");
CREATE INDEX "HrContact_phone_idx" ON "HrContact"("phone");
CREATE INDEX "HrContact_priority_idx" ON "HrContact"("priority");
CREATE INDEX "HrContact_status_idx" ON "HrContact"("status");
CREATE INDEX "HrContact_nextFollowUpDate_idx" ON "HrContact"("nextFollowUpDate");
CREATE INDEX "HrContact_deletedAt_idx" ON "HrContact"("deletedAt");
CREATE TABLE "new_Vacancy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "assignedRecruiterId" TEXT,
    "title" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "openings" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "technology" TEXT,
    "skills" TEXT,
    "compensationLpa" REAL NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "remark" TEXT,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vacancy_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vacancy_assignedRecruiterId_fkey" FOREIGN KEY ("assignedRecruiterId") REFERENCES "HrContact" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Vacancy" ("assignedRecruiterId", "companyId", "compensationLpa", "createdAt", "deletedAt", "experience", "id", "location", "openings", "priority", "remark", "skills", "status", "technology", "title", "updatedAt") SELECT "assignedRecruiterId", "companyId", "compensationLpa", "createdAt", "deletedAt", "experience", "id", "location", "openings", "priority", "remark", "skills", "status", "technology", "title", "updatedAt" FROM "Vacancy";
DROP TABLE "Vacancy";
ALTER TABLE "new_Vacancy" RENAME TO "Vacancy";
CREATE INDEX "Vacancy_companyId_idx" ON "Vacancy"("companyId");
CREATE INDEX "Vacancy_assignedRecruiterId_idx" ON "Vacancy"("assignedRecruiterId");
CREATE INDEX "Vacancy_title_idx" ON "Vacancy"("title");
CREATE INDEX "Vacancy_location_idx" ON "Vacancy"("location");
CREATE INDEX "Vacancy_technology_idx" ON "Vacancy"("technology");
CREATE INDEX "Vacancy_skills_idx" ON "Vacancy"("skills");
CREATE INDEX "Vacancy_priority_idx" ON "Vacancy"("priority");
CREATE INDEX "Vacancy_status_idx" ON "Vacancy"("status");
CREATE INDEX "Vacancy_deletedAt_idx" ON "Vacancy"("deletedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
