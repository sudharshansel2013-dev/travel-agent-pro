export enum DocStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}
export enum PaperSize {
  A4 = 'A4',
  A5 = 'A5',
  B4 = 'B4',
  B5 = 'B5',
  LETTER = 'LETTER'
}
export type LayoutTemplate = 'classic' | 'modern' | 'bold';
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
}
export interface LineItem {
  id: string;
  description: string;
  details?: string;
  quantity: number;
  price: number;
}
export interface Document {
  id: string;
  type: 'invoice' | 'quote';
  number: string;
  date: string;
  dueDate?: string;
  validUntil?: string;
  travelDate?: string;
  destination?: string;
  paymentMethod?: string;
  customerId: string;
  customerSnapshot?: Customer;
  items: LineItem[];
  status: DocStatus;
  notes?: string;
  discount: number;
  taxRate: number;
}
export interface AppSettings {
  agencyName: string;
  agencyEmail: string;
  agencyPhone: string;
  agencyAddress: string;
  logoUrl: string;
  primaryColor: string;
  currency: string;
  defaultTaxRate: number;
  paperSize: PaperSize;
  layoutTemplate: LayoutTemplate;
  termsAndConditions: string;
  bankDetails: string;
}
