-- CreateTable
CREATE TABLE "FollowUpReminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "followUpId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "hrContactId" TEXT,
    "bucket" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueAt" DATETIME NOT NULL,
    "scheduledFor" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNREAD',
    "doneAt" DATETIME,
    "dismissedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FollowUpReminder_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "FollowUp" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FollowUpReminder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FollowUpReminder_hrContactId_fkey" FOREIGN KEY ("hrContactId") REFERENCES "HrContact" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FollowUpReminder_followUpId_key" ON "FollowUpReminder"("followUpId");
CREATE INDEX "FollowUpReminder_companyId_idx" ON "FollowUpReminder"("companyId");
CREATE INDEX "FollowUpReminder_hrContactId_idx" ON "FollowUpReminder"("hrContactId");
CREATE INDEX "FollowUpReminder_bucket_idx" ON "FollowUpReminder"("bucket");
CREATE INDEX "FollowUpReminder_status_idx" ON "FollowUpReminder"("status");
CREATE INDEX "FollowUpReminder_scheduledFor_idx" ON "FollowUpReminder"("scheduledFor");
