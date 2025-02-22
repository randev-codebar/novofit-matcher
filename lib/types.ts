export interface CustomerRecord {
  id: string;
  name: string;
  internalId?: string;
  customerName?: string;
  locationId?: string;
  customerId?: string;
  eq?: string;
  type?: string;
  eqTracking?: string;
  model?: string;
  category?: string;
  consoleSerial?: string;
  baseSerial?: string;
  manufacturer?: string;
  history?: string;
  status?: string;
  notes?: string;
  status2?: string;
  matchConfidence?: number;
  matchStatus?: "review" | "requires_action" | "unmatched";
  matchedId?: string;
}

export type ProcessedData = {
  excelA: CustomerRecord[];
  excelB: CustomerRecord[];
  matches: {
    review: Array<[CustomerRecord, CustomerRecord]>;
    requiresAction: Array<[CustomerRecord, CustomerRecord]>;
    unmatched: CustomerRecord[];
  };
};
