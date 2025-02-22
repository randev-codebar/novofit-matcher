import * as XLSX from "xlsx";
import { CustomerRecord, ProcessedData } from "./types";
import { matchCustomers } from "./matching";

export async function processFiles(
  excelAFile: File,
  excelBFile: File,
  onProgress?: (progress: number) => void
): Promise<ProcessedData> {
  // Update progress for file reading (0-20%)
  onProgress?.(10);

  // Read Excel files
  const excelABuffer = await excelAFile.arrayBuffer();
  const excelBBuffer = await excelBFile.arrayBuffer();

  onProgress?.(20);

  const workbookA = XLSX.read(excelABuffer);
  const workbookB = XLSX.read(excelBBuffer);

  const sheetA = workbookA.Sheets[workbookA.SheetNames[0]];
  const sheetB = workbookB.Sheets[workbookB.SheetNames[0]];

  onProgress?.(30);

  const excelAData = XLSX.utils.sheet_to_json(sheetA) as any[];
  console.log("First row of Excel A:", excelAData[0]);

  const excelBData = XLSX.utils.sheet_to_json(sheetB) as any[];

  onProgress?.(40);

  // Process Excel A data
  const customersA: CustomerRecord[] = excelAData.map((row, index) => {
    const customer = {
      id: row.customerId?.toString() || `a-${index}`,
      name: row.customerName || "",
      customerName: row.customerName || "",
      locationId: row.locationId || "",
      customerId: row.customerId || "",
      eq: row.eq || "",
      type: row.type || "",
      eqTracking: row.eqTracking || "",
      model: row.model || "",
      category: row.category || "",
      consoleSerial: row.consoleSerial || "",
      baseSerial: row.baseSerial || "",
      manufacturer: row.manufacturer || "",
      history: row.history || "",
      status: row.status || "",
      notes: row.notes || "",
      status2: row.status2 || "",
    };
    return customer;
  });

  onProgress?.(50);

  // Process Excel B data
  const customersB: CustomerRecord[] = excelBData.map((row, index) => ({
    id: row.CustomerId?.toString() || row.ID?.toString() || `b-${index}`,
    internalId: row.internalId || "",
    name: row.CustomerName || row.Name || "",
  }));

  onProgress?.(60);

  const processedData = {
    excelA: customersA,
    excelB: customersB,
    matches: {
      review: [],
      requiresAction: [],
      unmatched: [],
    },
  };

  // Upload data before completing
  try {
    await fetch("/api/uploadData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(processedData),
    });
    onProgress?.(100);
  } catch (error) {
    console.error("Upload failed:", error);
    throw new Error("Failed to upload data to server");
  }

  return processedData;
}
