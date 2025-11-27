import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, DocStatus, LineItem, AppSettings } from '../types';
import { PAPER_DIMENSIONS } from '../constants';
import { storageService } from '../services/storageService';
import { generateEmailDraft, enhanceItineraryDescription, isAiAvailable } from '../services/geminiService';
import { 
  Save, Printer, Mail, Plus, Trash2, ArrowLeft, Wand2, Loader2, FileDown
} from 'lucide-react';

interface Props {
  type: 'invoice' | 'quote';
}

export const DocumentEditor: React.FC<Props> = ({ type }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const settings = storageService.getSettings();
  const customers = storageService.getCustomers();

  const [isLoading, setIsLoading] = useState(false);
  const [doc, setDoc] = useState<Document>({
    id: Date.now().toString(),
    type,
    number: `${type === 'invoice' ? 'INV' : 'QT'}-${Math.floor(Math.random() * 10000)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    travelDate: '',
    destination: '',
    paymentMethod: 'Bank Transfer',
    customerId: '',
    items: [],
    status: DocStatus.DRAFT,
    taxRate: settings.defaultTaxRate,
    discount: 0,
    notes: '',
  });

  // Load existing
  useEffect(() => {
    if (id) {
      const existing = storageService.getDocument(id);
      if (existing) setDoc(existing);
    }
  }, [id]);

  // Handle customer selection
  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setDoc(prev => ({
      ...prev,
      customerId,
      customerSnapshot: customer // Snapshot for printing consistency
    }));
  };

  const addItem = () => {
    setDoc(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), description: '', quantity: 1, price: 0 }]
    }));
  };

  const updateItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...doc.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setDoc(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index: number) => {
    setDoc(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const handleSave = () => {
    storageService.saveDocument(doc);
    navigate(`/${type}s`);
  };

  const handlePrint = () => {
    window.print();
  };

  const [emailDraft, setEmailDraft] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

  const handleAiEmailDraft = async () => {
    if (!doc.customerId) {
        alert("Please select a customer first");
        return;
    }
    const cust = customers.find(c => c.id === doc.customerId);
    if (!cust) return;

    setIsGeneratingEmail(true);
    setShowEmailModal(true);
    const draft = await generateEmailDraft(doc, cust, settings);
    setEmailDraft(draft);
    setIsGeneratingEmail(false);
  };

  const handleAiEnhanceItem = async (index: number) => {
      const item = doc.items[index];
      if(!item.description) return;
      setIsLoading(true);
      const enhanced = await enhanceItineraryDescription(item.description);
      updateItem(index, 'description', enhanced);
      setIsLoading(false);
  }

  // Calculate totals
  const subtotal = doc.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const taxAmount = subtotal * (doc.taxRate / 100);
  const total = subtotal + taxAmount - doc.discount;

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full print:block print:w-full print:h-auto">
      {/* LEFT COLUMN - EDITOR CONTROLS (Hidden on Print) */}
      <div className="w-full xl:w-1/3 space-y-6 print:hidden">
        <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full">
                <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">Edit {type === 'invoice' ? 'Invoice' : 'Quote'}</h1>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
            <h2 className="font-semibold text-gray-700 border-b pb-2">Document Details</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm text-gray-500">Number</label>
                    <input className="w-full border p-2 rounded" value={doc.number} onChange={e => setDoc({...doc, number: e.target.value})} />
                </div>
                <div>
                    <label className="text-sm text-gray-500">Status</label>
                    <select className="w-full border p-2 rounded" value={doc.status} onChange={e => setDoc({...doc, status: e.target.value as DocStatus})}>
                        {Object.values(DocStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm text-gray-500">Date</label>
                    <input type="date" className="w-full border p-2 rounded" value={doc.date} onChange={e => setDoc({...doc, date: e.target.value})} />
                </div>
                 <div>
                    <label className="text-sm text-gray-500">{type === 'invoice' ? 'Due Date' : 'Valid Until'}</label>
                    <input type="date" className="w-full border p-2 rounded" value={doc.dueDate} onChange={e => setDoc({...doc, dueDate: e.target.value})} />
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
             <h2 className="font-semibold text-gray-700 border-b pb-2">Travel Information</h2>
             <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="text-sm text-gray-500">Destination</label>
                    <input 
                      className="w-full border p-2 rounded" 
                      placeholder="e.g. Paris, France"
                      value={doc.destination || ''} 
                      onChange={e => setDoc({...doc, destination: e.target.value})} 
                    />
                </div>
                <div>
                    <label className="text-sm text-gray-500">Traveling Date</label>
                    <input 
                      type="date" 
                      className="w-full border p-2 rounded" 
                      value={doc.travelDate || ''} 
                      onChange={e => setDoc({...doc, travelDate: e.target.value})} 
                    />
                </div>
             </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
            <h2 className="font-semibold text-gray-700 border-b pb-2">Client</h2>
            <select 
                className="w-full border p-2 rounded" 
                value={doc.customerId} 
                onChange={e => handleCustomerChange(e.target.value)}
            >
                <option value="">Select Client...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {doc.customerId && (
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
                    <p className="font-medium text-gray-900">{doc.customerSnapshot?.name}</p>
                    <p>{doc.customerSnapshot?.email}</p>
                    <p>{doc.customerSnapshot?.address}</p>
                </div>
            )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
            <h2 className="font-semibold text-gray-700 border-b pb-2">Financials & Payment</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="text-sm text-gray-500">Tax Rate (%)</label>
                     <input type="number" className="w-full border p-2 rounded" value={doc.taxRate} onChange={e => setDoc({...doc, taxRate: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                     <label className="text-sm text-gray-500">Discount</label>
                     <input type="number" className="w-full border p-2 rounded" value={doc.discount} onChange={e => setDoc({...doc, discount: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="col-span-2">
                    <label className="text-sm text-gray-500">Payment Method</label>
                    <select 
                      className="w-full border p-2 rounded"
                      value={doc.paymentMethod || ''}
                      onChange={e => setDoc({...doc, paymentMethod: e.target.value})}
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                </div>
            </div>
        </div>

        <div className="flex gap-4 sticky bottom-4 z-10">
             <button onClick={handleSave} className="flex-1 bg-brand-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-brand-700 shadow-lg transition-colors">
                <Save size={20} /> Save
            </button>
            <button onClick={handlePrint} className="flex-1 bg-gray-800 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-900 shadow-lg transition-colors">
                <Printer size={20} /> PDF / Print
            </button>
            <button onClick={handleAiEmailDraft} className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 shadow-lg transition-colors" title="AI Email Draft">
                <Mail size={20} />
            </button>
        </div>
      </div>

      {/* RIGHT COLUMN - PREVIEW / PRINT AREA */}
      <div className="flex-1 bg-gray-200 overflow-auto p-4 print:p-0 print:bg-white print:overflow-visible flex justify-center">
        {/* Render the specific layout */}
        <DocumentRenderer 
          doc={doc} 
          settings={settings} 
          updateItem={updateItem} 
          addItem={addItem} 
          removeItem={removeItem} 
          subtotal={subtotal} 
          taxAmount={taxAmount} 
          total={total}
          handleAiEnhanceItem={handleAiEnhanceItem}
          isLoading={isLoading}
        />
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                 <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Mail /> Email Draft {isGeneratingEmail && <Loader2 className="animate-spin" size={20} />}
                 </h2>
                 {isGeneratingEmail ? (
                     <div className="h-40 flex items-center justify-center text-gray-500">
                        AI is writing your email...
                     </div>
                 ) : (
                     <>
                        <textarea 
                            className="w-full border rounded p-3 h-48 mb-4 font-mono text-sm"
                            value={emailDraft}
                            onChange={(e) => setEmailDraft(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                             <button onClick={() => setShowEmailModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                             <a 
                                href={`mailto:${doc.customerSnapshot?.email}?subject=${type.toUpperCase()} ${doc.number}&body=${encodeURIComponent(emailDraft)}`}
                                className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 flex items-center gap-2"
                                onClick={() => setShowEmailModal(false)}
                             >
                                Open Mail Client
                             </a>
                        </div>
                     </>
                 )}
            </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// SUB-COMPONENT: Layout Renderer
// ----------------------------------------------------------------------

interface RendererProps {
  doc: Document;
  settings: AppSettings;
  updateItem: (index: number, field: keyof LineItem, value: any) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  subtotal: number;
  taxAmount: number;
  total: number;
  handleAiEnhanceItem: (index: number) => void;
  isLoading: boolean;
}

const DocumentRenderer: React.FC<RendererProps> = (props) => {
  const { settings } = props;

  // Render logic based on template
  if (settings.layoutTemplate === 'modern') {
    return <ModernLayout {...props} />;
  }
  if (settings.layoutTemplate === 'bold') {
    return <BoldLayout {...props} />;
  }
  return <ClassicLayout {...props} />;
};

// --- LAYOUT 1: CLASSIC (Similar to original) ---
const ClassicLayout: React.FC<RendererProps> = ({ doc, settings, updateItem, addItem, removeItem, subtotal, taxAmount, total, handleAiEnhanceItem, isLoading }) => (
    <div 
        className={`bg-white shadow-2xl print:shadow-none print:w-full mx-auto relative flex flex-col ${PAPER_DIMENSIONS[settings.paperSize]}`}
        style={{ fontFamily: 'Times New Roman, serif' }}
    >
        <div className="p-8 sm:p-12 border-b-2 flex justify-between items-start" style={{ borderColor: settings.primaryColor }}>
            <div>
                {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="h-20 mb-4 object-contain" />}
                <h1 className="text-4xl font-bold uppercase tracking-wide text-gray-800">{doc.type}</h1>
                <p className="text-gray-500 mt-1">#{doc.number}</p>
            </div>
            <div className="text-right text-gray-600 text-sm">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{settings.agencyName}</h3>
                <p className="whitespace-pre-line">{settings.agencyAddress}</p>
                <p>{settings.agencyEmail}</p>
                <p>{settings.agencyPhone}</p>
            </div>
        </div>

        <div className="p-8 sm:p-12 flex justify-between">
            <div>
                <h4 className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-2">Bill To</h4>
                {doc.customerSnapshot ? (
                    <div className="text-gray-800">
                        <p className="font-bold text-lg">{doc.customerSnapshot.name}</p>
                        <p>{doc.customerSnapshot.address}</p>
                        <p>{doc.customerSnapshot.email}</p>
                        <p>{doc.customerSnapshot.phone}</p>
                    </div>
                ) : <p className="text-gray-400 italic">Select a client...</p>}
            </div>
            <div className="text-right space-y-2">
                <div className="flex gap-4 justify-end">
                  <div className="text-right">
                    <h4 className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-1">Date</h4>
                    <p className="font-medium">{doc.date}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-1">{doc.type === 'invoice' ? 'Due' : 'Valid'}</h4>
                    <p className="font-medium">{doc.dueDate}</p>
                  </div>
                </div>
                {doc.travelDate && (
                    <div className="flex gap-4 justify-end">
                        <div className="text-right">
                            <h4 className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-1">Travel Date</h4>
                            <p className="font-medium">{doc.travelDate}</p>
                        </div>
                        {doc.destination && (
                           <div className="text-right">
                              <h4 className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-1">Destination</h4>
                              <p className="font-medium">{doc.destination}</p>
                          </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Common Items Table */}
        <ItemsTable {...{ doc, settings, updateItem, addItem, removeItem, handleAiEnhanceItem, isLoading }} />

        {/* Totals */}
        <div className="px-8 sm:px-12 py-8 flex justify-end">
            <TotalsSection {...{ subtotal, taxAmount, total, doc, settings }} />
        </div>

        {/* Footer */}
        <div className="p-8 sm:p-12 mt-auto bg-gray-50 print:bg-white print:border-t">
            <FooterSection {...{ doc, settings }} />
        </div>
    </div>
);

// --- LAYOUT 2: MODERN (Sans-serif, clean lines, colorful headers) ---
const ModernLayout: React.FC<RendererProps> = ({ doc, settings, updateItem, addItem, removeItem, subtotal, taxAmount, total, handleAiEnhanceItem, isLoading }) => (
    <div 
        className={`bg-white shadow-2xl print:shadow-none print:w-full mx-auto relative flex flex-col ${PAPER_DIMENSIONS[settings.paperSize]}`}
        style={{ fontFamily: "'Inter', sans-serif" }}
    >
        <div className="p-8 sm:p-12 flex justify-between items-center">
             <div className="flex items-center gap-4">
                {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="h-16 object-contain" />}
                {!settings.logoUrl && <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">Logo</div>}
                <div>
                   <h3 className="font-bold text-xl text-gray-900">{settings.agencyName}</h3>
                   <p className="text-gray-500 text-sm">{settings.agencyEmail}</p>
                </div>
             </div>
             <div className="text-right">
                <h1 className="text-5xl font-extrabold uppercase tracking-tighter text-gray-100" style={{color: settings.primaryColor + '20'}}>{doc.type}</h1>
                <p className="text-xl font-bold text-gray-800 -mt-8 relative z-10" style={{color: settings.primaryColor}}>#{doc.number}</p>
             </div>
        </div>

        <div className="grid grid-cols-2 gap-8 px-12 py-6 bg-gray-50">
             <div>
                <h4 className="uppercase text-xs font-bold tracking-wider mb-2 text-gray-400">Bill To</h4>
                {doc.customerSnapshot ? (
                    <div>
                        <p className="font-bold text-gray-800">{doc.customerSnapshot.name}</p>
                        <p className="text-sm text-gray-600">{doc.customerSnapshot.address}</p>
                    </div>
                ) : <p className="text-gray-400 italic">Select a client...</p>}
             </div>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <h4 className="uppercase text-xs font-bold tracking-wider mb-1 text-gray-400">Date issued</h4>
                    <p className="font-medium text-gray-800">{doc.date}</p>
                 </div>
                 <div>
                    <h4 className="uppercase text-xs font-bold tracking-wider mb-1 text-gray-400">{doc.type === 'invoice' ? 'Due Date' : 'Valid Until'}</h4>
                    <p className="font-medium text-gray-800">{doc.dueDate}</p>
                 </div>
                 {doc.travelDate && (
                   <>
                    <div>
                        <h4 className="uppercase text-xs font-bold tracking-wider mb-1 text-gray-400">Travel Date</h4>
                        <p className="font-medium text-gray-800">{doc.travelDate}</p>
                    </div>
                    <div>
                        <h4 className="uppercase text-xs font-bold tracking-wider mb-1 text-gray-400">Destination</h4>
                        <p className="font-medium text-gray-800">{doc.destination}</p>
                    </div>
                   </>
                 )}
             </div>
        </div>

        <ItemsTable {...{ doc, settings, updateItem, addItem, removeItem, handleAiEnhanceItem, isLoading }} modern />

        <div className="px-12 py-8 flex justify-end">
            <TotalsSection {...{ subtotal, taxAmount, total, doc, settings }} />
        </div>

        <div className="p-12 mt-auto border-t">
            <FooterSection {...{ doc, settings }} />
        </div>
    </div>
);

// --- LAYOUT 3: BOLD (Full header background) ---
const BoldLayout: React.FC<RendererProps> = ({ doc, settings, updateItem, addItem, removeItem, subtotal, taxAmount, total, handleAiEnhanceItem, isLoading }) => (
    <div 
        className={`bg-white shadow-2xl print:shadow-none print:w-full mx-auto relative flex flex-col ${PAPER_DIMENSIONS[settings.paperSize]}`}
        style={{ fontFamily: "'Inter', sans-serif" }}
    >
        <div className="p-12 text-white" style={{ backgroundColor: settings.primaryColor }}>
             <div className="flex justify-between items-start">
                <div className="w-1/2">
                    {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="h-16 mb-6 object-contain bg-white/10 p-2 rounded" />}
                    <h1 className="text-6xl font-bold uppercase tracking-tight opacity-90">{doc.type}</h1>
                    <p className="text-xl opacity-80 mt-2">#{doc.number}</p>
                </div>
                <div className="text-right opacity-90">
                    <h3 className="font-bold text-xl mb-1">{settings.agencyName}</h3>
                    <p className="whitespace-pre-line text-sm">{settings.agencyAddress}</p>
                    <p className="text-sm">{settings.agencyEmail}</p>
                </div>
             </div>
        </div>

        <div className="p-12 grid grid-cols-2 gap-12">
             <div>
                <h4 className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-3">Billed To</h4>
                 {doc.customerSnapshot ? (
                    <div className="text-gray-800">
                        <p className="font-bold text-2xl mb-2">{doc.customerSnapshot.name}</p>
                        <p className="text-gray-600">{doc.customerSnapshot.address}</p>
                        <p className="text-gray-600">{doc.customerSnapshot.email}</p>
                    </div>
                ) : <p className="text-gray-400 italic">Select a client...</p>}
             </div>
             <div className="space-y-4">
                 <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500 font-medium">Date</span>
                    <span className="font-bold">{doc.date}</span>
                 </div>
                 <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500 font-medium">{doc.type === 'invoice' ? 'Payment Due' : 'Valid Until'}</span>
                    <span className="font-bold">{doc.dueDate}</span>
                 </div>
                 {doc.travelDate && (
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500 font-medium">Traveling On</span>
                        <span className="font-bold">{doc.travelDate}</span>
                    </div>
                 )}
                 {doc.destination && (
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500 font-medium">Destination</span>
                        <span className="font-bold">{doc.destination}</span>
                    </div>
                 )}
             </div>
        </div>

        <div className="px-12 flex-1">
             <ItemsTable {...{ doc, settings, updateItem, addItem, removeItem, handleAiEnhanceItem, isLoading }} modern />
        </div>

        <div className="px-12 py-8 flex justify-end">
            <TotalsSection {...{ subtotal, taxAmount, total, doc, settings }} />
        </div>

        <div className="px-12 py-8 mt-auto bg-gray-50">
             <FooterSection {...{ doc, settings }} />
        </div>
    </div>
);

// --- HELPER COMPONENTS ---

const ItemsTable: React.FC<any> = ({ doc, settings, updateItem, addItem, removeItem, handleAiEnhanceItem, isLoading, modern }) => (
    <div className={`flex-1 ${modern ? 'mt-4' : 'px-8 sm:px-12'}`}>
        <table className="w-full text-left">
            <thead>
                <tr className={`${modern ? 'bg-gray-100 text-gray-700' : 'border-b-2 border-gray-100 text-gray-600'}`}>
                    <th className={`py-3 text-sm font-bold ${modern ? 'pl-4 rounded-l' : ''} w-1/2`}>Description</th>
                    <th className="py-3 text-sm font-bold text-center">Qty</th>
                    <th className="py-3 text-sm font-bold text-right">Price</th>
                    <th className={`py-3 text-sm font-bold text-right ${modern ? 'pr-4 rounded-r' : ''}`}>Total</th>
                    <th className="print:hidden w-10"></th>
                </tr>
            </thead>
            <tbody>
                {doc.items.map((item: LineItem, index: number) => (
                    <tr key={item.id} className="border-b border-gray-50 group">
                        <td className={`py-4 align-top ${modern ? 'pl-4' : ''}`}>
                            <textarea 
                                className="w-full outline-none resize-none bg-transparent font-medium text-gray-800 print:hidden focus:bg-gray-50 rounded p-1"
                                placeholder="Enter itinerary details..."
                                value={item.description}
                                onChange={e => updateItem(index, 'description', e.target.value)}
                                rows={2}
                            />
                            <div className="hidden print:block whitespace-pre-wrap text-sm">{item.description}</div>
                            
                            <div className="print:hidden mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isAiAvailable() && (
                                    <button 
                                        onClick={() => handleAiEnhanceItem(index)}
                                        className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800"
                                    >
                                        {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                        AI Enhance
                                    </button>
                                )}
                            </div>
                        </td>
                        <td className="py-4 align-top text-center">
                            <input 
                                type="number"
                                className="w-16 text-center outline-none bg-transparent print:hidden"
                                value={item.quantity}
                                onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            />
                            <span className="hidden print:inline">{item.quantity}</span>
                        </td>
                        <td className="py-4 align-top text-right">
                            <span className="print:hidden">
                                <input 
                                    type="number"
                                    className="w-24 text-right outline-none bg-transparent"
                                    value={item.price}
                                    onChange={e => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                                />
                            </span>
                            <span className="hidden print:inline">{item.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </td>
                        <td className={`py-4 align-top text-right font-medium ${modern ? 'pr-4' : ''}`}>
                            {(item.price * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                        <td className="py-4 align-top print:hidden">
                            <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600">
                                <Trash2 size={16} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        <button onClick={addItem} className="mt-4 flex items-center gap-2 text-sm text-brand-600 hover:text-brand-800 font-medium print:hidden px-4">
            <Plus size={16} /> Add Line Item
        </button>
    </div>
);

const TotalsSection: React.FC<any> = ({ subtotal, taxAmount, total, doc, settings }) => (
    <div className="w-64 space-y-3">
        <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{settings.currency}{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
        </div>
        {doc.taxRate > 0 && (
            <div className="flex justify-between text-gray-600">
                <span>Tax ({doc.taxRate}%)</span>
                <span>{settings.currency}{taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
        )}
        {doc.discount > 0 && (
            <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{settings.currency}{doc.discount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
        )}
        <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-3 border-gray-200" style={{color: settings.layoutTemplate === 'bold' ? settings.primaryColor : ''}}>
            <span>Total</span>
            <span>{settings.currency}{total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
        </div>
    </div>
);

const FooterSection: React.FC<any> = ({ doc, settings }) => (
    <div className="grid grid-cols-2 gap-8">
        <div>
            <h4 className="font-bold text-gray-800 mb-2 text-sm">Notes / Payment Terms</h4>
            <div className="text-sm text-gray-600 whitespace-pre-wrap">
                {doc.notes || settings.termsAndConditions}
            </div>
        </div>
        {doc.type === 'invoice' && (
                <div>
                <h4 className="font-bold text-gray-800 mb-2 text-sm">Payment Details</h4>
                <div className="text-sm text-gray-600 whitespace-pre-wrap mb-2">{settings.bankDetails}</div>
                {doc.paymentMethod && <p className="text-sm text-gray-800 font-semibold">Method: {doc.paymentMethod}</p>}
                </div>
        )}
    </div>
);
