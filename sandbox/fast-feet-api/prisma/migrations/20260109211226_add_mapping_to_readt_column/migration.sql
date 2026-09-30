/*
  Warnings:

  - You are about to rename the column `readAt` on the `notifications` table to `read_at`. Existing data will be preserved.

*/
-- AlterTable
ALTER TABLE "notifications" RENAME COLUMN "readAt" TO "read_at";
