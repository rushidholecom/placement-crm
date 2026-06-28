-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
DROP INDEX IF EXISTS "Company_name_location_key";
CREATE TABLE "new_Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "industry" TEXT NOT NULL,
    "companySize" TEXT NOT NULL DEFAULT 'MID_MARKET',
    "city" TEXT NOT NULL,
    "address" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PROSPECT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Company" ("city", "createdAt", "id", "industry", "name", "updatedAt")
SELECT "location", "createdAt", "id", "industry", "name", "updatedAt" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
CREATE UNIQUE INDEX "Company_name_city_key" ON "Company"("name", "city");
CREATE INDEX "Company_status_idx" ON "Company"("status");
CREATE INDEX "Company_industry_idx" ON "Company"("industry");
CREATE INDEX "Company_city_idx" ON "Company"("city");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
