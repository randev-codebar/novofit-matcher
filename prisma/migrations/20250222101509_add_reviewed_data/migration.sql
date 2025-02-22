-- CreateTable
CREATE TABLE "ReviewedData" (
    "id" SERIAL NOT NULL,
    "fitnessEmsId" TEXT NOT NULL,
    "netsuiteId" TEXT NOT NULL,
    "fitnessEmsCustomerName" TEXT NOT NULL,
    "netsuiteCustomerName" TEXT NOT NULL,
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

    CONSTRAINT "ReviewedData_pkey" PRIMARY KEY ("id")
);
