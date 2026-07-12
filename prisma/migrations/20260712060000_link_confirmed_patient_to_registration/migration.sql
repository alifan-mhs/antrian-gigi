-- AlterTable
ALTER TABLE "ConfirmedPatient" ADD COLUMN     "sourceRegistrationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ConfirmedPatient_sourceRegistrationId_key" ON "ConfirmedPatient"("sourceRegistrationId");

-- AddForeignKey
ALTER TABLE "ConfirmedPatient" ADD CONSTRAINT "ConfirmedPatient_sourceRegistrationId_fkey" FOREIGN KEY ("sourceRegistrationId") REFERENCES "Registration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
