/*
  Warnings:

  - Added the required column `updatedAt` to the `Branch` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FuelSessionStatus" AS ENUM ('OPEN', 'CLOSED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "FuelRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "vehicleCode" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacityLiters" DOUBLE PRECISION NOT NULL,
    "standardConsumption" DOUBLE PRECISION NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelSession" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "erpTaskRef" TEXT NOT NULL,
    "status" "FuelSessionStatus" NOT NULL DEFAULT 'OPEN',
    "openedById" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "FuelSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelSessionInitialState" (
    "id" TEXT NOT NULL,
    "fuelSessionId" TEXT NOT NULL,
    "odometerStart" INTEGER NOT NULL,
    "fuelLevelStart" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FuelSessionInitialState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelSessionFinalState" (
    "id" TEXT NOT NULL,
    "fuelSessionId" TEXT NOT NULL,
    "odometerEnd" INTEGER NOT NULL,
    "fuelLevelEnd" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FuelSessionFinalState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelSessionMetadata" (
    "id" TEXT NOT NULL,
    "fuelSessionId" TEXT NOT NULL,
    "departure" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "description" TEXT,
    "timeOut" TIMESTAMP(3) NOT NULL,
    "recordedById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FuelSessionMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelRequest" (
    "id" TEXT NOT NULL,
    "fuelSessionId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedAmount" DOUBLE PRECISION NOT NULL,
    "approvedAmount" DOUBLE PRECISION,
    "approvedById" TEXT,
    "status" "FuelRequestStatus" NOT NULL DEFAULT 'PENDING',
    "managerComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FuelRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceTransaction" (
    "id" TEXT NOT NULL,
    "fuelRequestId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedById" TEXT NOT NULL,

    CONSTRAINT "FinanceTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelConsumptionAnalysis" (
    "id" TEXT NOT NULL,
    "fuelSessionId" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "expectedConsumption" DOUBLE PRECISION NOT NULL,
    "actualConsumption" DOUBLE PRECISION NOT NULL,
    "variance" DOUBLE PRECISION NOT NULL,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "analyzedById" TEXT NOT NULL,

    CONSTRAINT "FuelConsumptionAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FraudCase" (
    "id" TEXT NOT NULL,
    "fuelSessionId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "investigatedById" TEXT NOT NULL,

    CONSTRAINT "FraudCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vehicleCode_key" ON "Vehicle"("vehicleCode");

-- CreateIndex
CREATE UNIQUE INDEX "FuelSessionInitialState_fuelSessionId_key" ON "FuelSessionInitialState"("fuelSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "FuelSessionFinalState_fuelSessionId_key" ON "FuelSessionFinalState"("fuelSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "FuelSessionMetadata_fuelSessionId_key" ON "FuelSessionMetadata"("fuelSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceTransaction_fuelRequestId_key" ON "FinanceTransaction"("fuelRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "FuelConsumptionAnalysis_fuelSessionId_key" ON "FuelConsumptionAnalysis"("fuelSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "FraudCase_fuelSessionId_key" ON "FraudCase"("fuelSessionId");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelSession" ADD CONSTRAINT "FuelSession_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelSession" ADD CONSTRAINT "FuelSession_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelSession" ADD CONSTRAINT "FuelSession_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelSession" ADD CONSTRAINT "FuelSession_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelSessionInitialState" ADD CONSTRAINT "FuelSessionInitialState_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelSessionInitialState" ADD CONSTRAINT "FuelSessionInitialState_fuelSessionId_fkey" FOREIGN KEY ("fuelSessionId") REFERENCES "FuelSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelSessionFinalState" ADD CONSTRAINT "FuelSessionFinalState_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelSessionFinalState" ADD CONSTRAINT "FuelSessionFinalState_fuelSessionId_fkey" FOREIGN KEY ("fuelSessionId") REFERENCES "FuelSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelSessionMetadata" ADD CONSTRAINT "FuelSessionMetadata_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelSessionMetadata" ADD CONSTRAINT "FuelSessionMetadata_fuelSessionId_fkey" FOREIGN KEY ("fuelSessionId") REFERENCES "FuelSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelRequest" ADD CONSTRAINT "FuelRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelRequest" ADD CONSTRAINT "FuelRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelRequest" ADD CONSTRAINT "FuelRequest_fuelSessionId_fkey" FOREIGN KEY ("fuelSessionId") REFERENCES "FuelSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceTransaction" ADD CONSTRAINT "FinanceTransaction_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceTransaction" ADD CONSTRAINT "FinanceTransaction_fuelRequestId_fkey" FOREIGN KEY ("fuelRequestId") REFERENCES "FuelRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelConsumptionAnalysis" ADD CONSTRAINT "FuelConsumptionAnalysis_analyzedById_fkey" FOREIGN KEY ("analyzedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelConsumptionAnalysis" ADD CONSTRAINT "FuelConsumptionAnalysis_fuelSessionId_fkey" FOREIGN KEY ("fuelSessionId") REFERENCES "FuelSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FraudCase" ADD CONSTRAINT "FraudCase_investigatedById_fkey" FOREIGN KEY ("investigatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FraudCase" ADD CONSTRAINT "FraudCase_fuelSessionId_fkey" FOREIGN KEY ("fuelSessionId") REFERENCES "FuelSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


