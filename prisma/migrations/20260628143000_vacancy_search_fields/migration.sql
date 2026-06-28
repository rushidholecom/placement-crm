-- AlterTable
ALTER TABLE "Vacancy" ADD COLUMN "technology" TEXT;
ALTER TABLE "Vacancy" ADD COLUMN "skills" TEXT;

-- CreateIndex
CREATE INDEX "Vacancy_title_idx" ON "Vacancy"("title");
CREATE INDEX "Vacancy_location_idx" ON "Vacancy"("location");
CREATE INDEX "Vacancy_technology_idx" ON "Vacancy"("technology");
CREATE INDEX "Vacancy_skills_idx" ON "Vacancy"("skills");
