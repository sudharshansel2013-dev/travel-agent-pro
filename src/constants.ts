import { PaperSize, AppSettings } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  agencyName: "SkyHigh Travel Agency",
  agencyEmail: "contact@skyhightravel.com",
  agencyPhone: "+1 (555) 0123-456",
  agencyAddress: "123 Cloud Avenue, Traveler City, TC 90210",
  logoUrl: "https://picsum.photos/200/80",
  primaryColor: "#0284c7",
  currency: "$",
  defaultTaxRate: 10,
  paperSize: PaperSize.A4,
  layoutTemplate: 'modern',
  termsAndConditions: "Payment is due within 14 days. Travel insurance is highly recommended.",
  bankDetails: "Bank: Global Bank \nAccount: 123456789 \nSort Code: 11-22-33"
};

export const PAPER_DIMENSIONS: Record<PaperSize, string> = {
  [PaperSize.A4]: 'w-[210mm] min-h-[297mm]',
  [PaperSize.A5]: 'w-[148mm] min-h-[210mm]',
  [PaperSize.B4]: 'w-[250mm] min-h-[353mm]',
  [PaperSize.B5]: 'w-[176mm] min-h-[250mm]',
  [PaperSize.LETTER]: 'w-[216mm] min-h-[279mm]',
};

export const MOCK_CUSTOMERS = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '555-0101', address: '123 Maple St' },
  { id: '2', name: 'Acme Corp', email: 'billing@acme.com', phone: '555-0900', address: '456 Industrial Blvd' },
  { id: '3', name: 'Jane Smith', email: 'jane.smith@email.com', phone: '555-0202', address: '789 Oak Ln' },
];
