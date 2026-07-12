-- CreateEnum
CREATE TYPE "ConfirmedTimeSlot" AS ENUM ('SIANG_SORE', 'MALAM');

-- CreateEnum
CREATE TYPE "ConfirmedPatientStatus" AS ENUM ('TERKONFIRMASI', 'SELESAI', 'TIDAK_DATANG', 'BATAL');

-- CreateTable
CREATE TABLE "ConfirmedPatient" (
    "id" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "promoLabel" TEXT NOT NULL,
    "timeSlot" "ConfirmedTimeSlot" NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "complaint" TEXT,
    "status" "ConfirmedPatientStatus" NOT NULL DEFAULT 'TERKONFIRMASI',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfirmedPatient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConfirmedPatient_operatorId_date_idx" ON "ConfirmedPatient"("operatorId", "date");

-- CreateIndex
CREATE INDEX "ConfirmedPatient_date_timeSlot_idx" ON "ConfirmedPatient"("date", "timeSlot");

-- AddForeignKey
ALTER TABLE "ConfirmedPatient" ADD CONSTRAINT "ConfirmedPatient_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
