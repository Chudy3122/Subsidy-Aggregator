-- AlterTable
ALTER TABLE "nabory" ADD COLUMN     "beneficiaries" TEXT,
ADD COLUMN     "budget" TEXT,
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "description" TEXT;

-- CreateIndex
CREATE INDEX "nabory_deadline_idx" ON "nabory"("deadline");
