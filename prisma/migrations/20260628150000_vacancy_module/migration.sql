PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vacancy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "assignedRecruiterId" TEXT,
    "title" TEXT NOT NULL,
    "experience" TEXT NOT NULL DEFAULT 'Entry level',
    "openings" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "technology" TEXT,
    "skills" TEXT,
    "compensationLpa" REAL NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "remark" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vacancy_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vacancy_assignedRecruiterId_fkey" FOREIGN KEY ("assignedRecruiterId") REFERENCES "HrContact" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Vacancy" ("companyId", "compensationLpa", "createdAt", "id", "location", "openings", "skills", "technology", "title", "updatedAt")
SELECT "companyId", "compensationLpa", "createdAt", "id", "location", "openings", "skills", "technology", "title", "updatedAt" FROM "Vacancy";
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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
