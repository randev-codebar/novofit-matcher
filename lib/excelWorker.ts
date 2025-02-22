import * as XLSX from 'xlsx';
import { CustomerRecord } from './types';
import { matchCustomers } from './matching';

self.onmessage = (event) => {
  const { customersA, customersB } = event.data;
  
  // Process matches
  const matches = matchCustomers(customersA, customersB);
  
  // Send back the processed data
  self.postMessage({
    matches
  });
}; 