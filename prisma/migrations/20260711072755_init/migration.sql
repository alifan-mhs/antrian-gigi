-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('MENUNGGU', 'DIHUBUNGI', 'DIKONFIRMASI', 'SELESAI', 'BATAL', 'TIDAK_DATANG');

-- CreateTable
CREATE TABLE "Operator" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySession" (
    "id" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "quota" INTEGER NOT NULL,
    "promoText" TEXT,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "queueNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "complaint" TEXT,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'MENUNGGU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Operator_email_key" ON "Operator"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DailySession_operatorId_date_key" ON "DailySession"("operatorId", "date");

-- CreateIndex
CREATE INDEX "Registration_sessionId_status_idx" ON "Registration"("sessionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_sessionId_phone_key" ON "Registration"("sessionId", "phone");

-- AddForeignKey
ALTER TABLE "DailySession" ADD CONSTRAINT "DailySession_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DailySession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
