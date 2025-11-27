import { Document, Customer, AppSettings } from '../types';
import { DEFAULT_SETTINGS, MOCK_CUSTOMERS } from '../constants';

const KEYS = {
  DOCUMENTS: 'travel_docs',
  CUSTOMERS: 'travel_customers',
  SETTINGS: 'travel_settings',
  USER: 'travel_user'
};

export const storageService = {
  init: () => {
    if (!localStorage.getItem(KEYS.CUSTOMERS)) {
      localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(MOCK_CUSTOMERS));
    }
    if (!localStorage.getItem(KEYS.SETTINGS)) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(KEYS.DOCUMENTS)) {
        localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify([]));
    }
  },
  login: (u: string, p: string) => {
    if (u === 'admin' && p === 'password') {
      localStorage.setItem(KEYS.USER, 'true');
      return true;
    }
    return false;
  },
  logout: () => localStorage.removeItem(KEYS.USER),
  isAuthenticated: () => !!localStorage.getItem(KEYS.USER),
  getCustomers: (): Customer[] => JSON.parse(localStorage.getItem(KEYS.CUSTOMERS) || '[]'),
  saveCustomer: (customer: Customer) => {
    const customers = storageService.getCustomers();
    const existingIndex = customers.findIndex(c => c.id === customer.id);
    if (existingIndex >= 0) {
      customers[existingIndex] = customer;
    } else {
      customers.push(customer);
    }
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
  },
  deleteCustomer: (id: string) => {
    const customers = storageService.getCustomers().filter(c => c.id !== id);
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
  },
  getDocuments: (): Document[] => JSON.parse(localStorage.getItem(KEYS.DOCUMENTS) || '[]'),
  getDocument: (id: string): Document | undefined => {
      const docs = storageService.getDocuments();
      return docs.find(d => d.id === id);
  },
  saveDocument: (doc: Document) => {
    const docs = storageService.getDocuments();
    const existingIndex = docs.findIndex(d => d.id === doc.id);
    if (existingIndex >= 0) {
      docs[existingIndex] = doc;
    } else {
      docs.push(doc);
    }
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(docs));
  },
  deleteDocument: (id: string) => {
    const docs = storageService.getDocuments().filter(d => d.id !== id);
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(docs));
  },
  getSettings: (): AppSettings => JSON.parse(localStorage.getItem(KEYS.SETTINGS) || JSON.stringify(DEFAULT_SETTINGS)),
  saveSettings: (settings: AppSettings) => localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings)),
};
storageService.init();
