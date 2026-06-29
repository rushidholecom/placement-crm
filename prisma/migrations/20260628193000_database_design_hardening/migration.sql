-- Add soft delete support to core business tables
ALTER TABLE "User" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "Company" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "HrContact" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "Vacancy" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "FollowUp" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "Activity" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "FollowUpReminder" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "EmailTemplate" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "EmailLog" ADD COLUMN "deletedAt" DATETIME;

-- Indexes for common filters and dashboard queries
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

CREATE INDEX "Company_name_idx" ON "Company"("name");
CREATE INDEX "Company_deletedAt_idx" ON "Company"("deletedAt");

CREATE INDEX "HrContact_phone_idx" ON "HrContact"("phone");
CREATE INDEX "HrContact_deletedAt_idx" ON "HrContact"("deletedAt");

CREATE INDEX "Vacancy_deletedAt_idx" ON "Vacancy"("deletedAt");

CREATE INDEX "FollowUp_type_idx" ON "FollowUp"("type");
CREATE INDEX "FollowUp_deletedAt_idx" ON "FollowUp"("deletedAt");

CREATE INDEX "Activity_type_idx" ON "Activity"("type");
CREATE INDEX "Activity_deletedAt_idx" ON "Activity"("deletedAt");

CREATE INDEX "FollowUpReminder_deletedAt_idx" ON "FollowUpReminder"("deletedAt");

CREATE INDEX "EmailTemplate_isDefault_idx" ON "EmailTemplate"("isDefault");
CREATE INDEX "EmailTemplate_deletedAt_idx" ON "EmailTemplate"("deletedAt");

CREATE INDEX "EmailLog_templateKey_idx" ON "EmailLog"("templateKey");
CREATE INDEX "EmailLog_deletedAt_idx" ON "EmailLog"("deletedAt");
