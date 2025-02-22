'use client';

import { create } from 'zustand';
import { ProcessedData, CustomerRecord } from './types';
import * as XLSX from 'xlsx';

interface MatchState {
  data: ProcessedData | null;
  setData: (data: ProcessedData) => void;
  confirmMatch: (recordA: CustomerRecord, recordB: CustomerRecord) => void;
  rejectMatch: (recordA: CustomerRecord) => void;
  bulkConfirm: (matches: Array<[CustomerRecord, CustomerRecord]>) => void;
  bulkReject: (records: CustomerRecord[]) => void;
  exportResults: () => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  data: null,
  setData: (data) => set({ data }),
  
  confirmMatch: (recordA, recordB) => {
    const data = get().data;
    if (!data) return;

    // Update match status
    recordA.matchStatus = 'review';
    recordA.matchedId = recordB.id;

    set({ data: { ...data } });
  },

  rejectMatch: (recordA) => {
    const data = get().data;
    if (!data) return;

    // Move to unmatched
    recordA.matchStatus = 'unmatched';
    recordA.matchedId = undefined;

    set({ data: { ...data } });
  },

  bulkConfirm: (matches) => {
    const data = get().data;
    if (!data) return;

    matches.forEach(([recordA, recordB]) => {
      recordA.matchStatus = 'review';
      recordA.matchedId = recordB.id;
    });

    set({ data: { ...data } });
  },

  bulkReject: (records) => {
    const data = get().data;
    if (!data) return;

    records.forEach(record => {
      record.matchStatus = 'unmatched';
      record.matchedId = undefined;
    });

    set({ data: { ...data } });
  },

  exportResults: () => {
    const data = get().data;
    if (!data) return;

    // Prepare data for export
    const exportData = data.excelA.map(record => ({
      'Old System ID': record.id,
      'Old System Name': record.name,
      'NetSuite ID': record.matchedId || '',
      'Match Status': record.matchStatus || 'unmatched',
      'Match Confidence': record.matchConfidence ? `${record.matchConfidence.toFixed(1)}%` : '',
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Matched Customers');

    // Save file
    XLSX.writeFile(wb, 'customer-matches.xlsx');
  },
}));