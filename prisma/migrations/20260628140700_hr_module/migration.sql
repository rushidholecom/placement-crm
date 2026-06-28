-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HrContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "linkedIn" TEXT,
    "designation" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT '',
    "remark" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "lastContactDate" DATETIME,
    "nextFollowUpDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HrContact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_HrContact" ("companyId", "createdAt", "designation", "email", "fullName", "id", "phone", "updatedAt")
SELECT "companyId", "createdAt", "designation", "email", "fullName", "id", "phone", "updatedAt" FROM "HrContact";
DROP TABLE "HrContact";
ALTER TABLE "new_HrContact" RENAME TO "HrContact";
CREATE UNIQUE INDEX "HrContact_email_key" ON "HrContact"("email");
CREATE INDEX "HrContact_companyId_idx" ON "HrContact"("companyId");
CREATE INDEX "HrContact_city_idx" ON "HrContact"("city");
CREATE INDEX "HrContact_priority_idx" ON "HrContact"("priority");
CREATE INDEX "HrContact_status_idx" ON "HrContact"("status");
CREATE INDEX "HrContact_nextFollowUpDate_idx" ON "HrContact"("nextFollowUpDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
