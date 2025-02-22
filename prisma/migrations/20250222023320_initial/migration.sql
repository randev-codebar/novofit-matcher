-- CreateTable
CREATE TABLE "ExcelA" (
    "id" SERIAL NOT NULL,
    "customerName" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "eq" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "eqTracking" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "consoleSerial" TEXT NOT NULL,
    "baseSerial" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "history" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "status2" TEXT NOT NULL,

    CONSTRAINT "ExcelA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExcelB" (
    "id" SERIAL NOT NULL,
    "internalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ExcelB_pkey" PRIMARY KEY ("id")
);
