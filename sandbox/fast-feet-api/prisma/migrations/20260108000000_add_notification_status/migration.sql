-- TruncateTable
TRUNCATE TABLE "notifications";

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('SENT', 'FAILED');

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN "status" "NotificationStatus" NOT NULL;
