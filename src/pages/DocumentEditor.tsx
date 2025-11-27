import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, DocStatus, LineItem, AppSettings } from '../types';
import { PAPER_DIMENSIONS } from '../constants';
import { storageService } from '../services/storageService';
import { generateEmailDraft, enhanceItineraryDescription, isAiAvailable } from '../services/geminiService';
import { Save, Printer, Mail, Plus, Trash2, ArrowLeft, Wand2, Loader2 } from 'lucide-react';

interface Props { type: 'invoice' | 'quote'; }

export const DocumentEditor: React.FC<Props> = ({ type }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const settings = storageService.getSettings();
  const customers = storageService.getCustomers();
  const [isLoading, setIsLoading] = useState(false);
  
  const [doc, setDoc] = useState<Document>({
    id: Date.now().toString(), type, number: `${type === 'invoice' ? 'INV' : 'QT'}-${Math.floor(Math.random() * 10000)}`,
    date: new Date().toISOString().split('T')[0], dueDate: '', travelDate: '', destination: '', paymentMethod: 'Bank Transfer',
    customerId: '', items: [], status: DocStatus.DRAFT, taxRate: settings.defaultTaxRate, discount: 0, notes: '',
  });

  useEffect(() => { if (id) { const ex = storageService.getDocument(id); if (ex) setDoc(ex); } }, [id]);

  const handleSave = () => { storageService.saveDocument(doc); navigate(`/${type}s`); };
  const handlePrint = () => window.print();
  const addItem = () => setDoc(p => ({...p, items: [...p.items, {id: Date.now().toString(), description:'', quantity:1, price:0}]}));
  
  const updateItem = (idx: number, field: any, val: any) => {
      const items = [...doc.items]; items[idx] = {...items[idx], [field]: val}; setDoc({...doc, items});
  };

  const handleAiEnhance = async (idx: number) => {
      setIsLoading(true);
      const txt = await enhanceItineraryDescription(doc.items[idx].description);
      updateItem(idx, 'description', txt);
      setIsLoading(false);
  };

  const subtotal = doc.items.reduce((a, i) => a + (i.price * i.quantity), 0);
  const total = subtotal + (subtotal * (doc.taxRate/100)) - doc.discount;

  const LayoutRenderer = () => {
      if (settings.layoutTemplate === 'bold') return <div className="p-8 bg-gray-900 text-white"><h1 className="text-4xl">{doc.type}</h1><p>#{doc.number}</p></div>;
      if (settings.layoutTemplate === 'modern') return <div className="p-8 border-l-4 border-blue-500"><h1 className="text-4xl text-blue-900">{doc.type}</h1><p>#{doc.number}</p></div>;
      return <div className="p-8 border-b-2"><h1 className="text-4xl font-serif">{doc.type}</h1><p>#{doc.number}</p></div>;
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      <div className="w-full xl:w-1/3 space-y-4 print:hidden">
        <div className="flex items-center gap-4"><button onClick={() => navigate(-1)}><ArrowLeft/></button><h1 className="text-2xl font-bold">Edit {type}</h1></div>
        <div className="bg-white p-4 rounded shadow space-y-4">
            <input className="w-full border p-2 rounded" placeholder="Number" value={doc.number} onChange={e => setDoc({...doc, number: e.target.value})} />
            <input type="date" className="w-full border p-2 rounded" value={doc.date} onChange={e => setDoc({...doc, date: e.target.value})} />
            <select className="w-full border p-2 rounded" value={doc.customerId} onChange={e => {
                const c = customers.find(c => c.id === e.target.value);
                setDoc({...doc, customerId: e.target.value, customerSnapshot: c});
            }}>
                <option value="">Select Client...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>
        <button onClick={handleSave} className="w-full bg-brand-600 text-white p-3 rounded flex justify-center gap-2"><Save/> Save</button>
        <button onClick={handlePrint} className="w-full bg-gray-800 text-white p-3 rounded flex justify-center gap-2"><Printer/> Print</button>
      </div>

      <div className="flex-1 bg-gray-200 p-4 print:p-0 print:bg-white flex justify-center">
        <div className={`bg-white shadow-lg print:shadow-none p-12 ${PAPER_DIMENSIONS[settings.paperSize]}`}>
            <LayoutRenderer />
            <div className="mt-8 mb-8">
                <h4 className="font-bold text-gray-500 uppercase text-xs">Bill To</h4>
                <p className="font-bold">{doc.customerSnapshot?.name || 'Select Client'}</p>
                <p>{doc.customerSnapshot?.address}</p>
            </div>
            
            <table className="w-full text-left mb-8">
                <thead className="border-b"><tr><th>Description</th><th>Qty</th><th className="text-right">Price</th><th className="text-right">Total</th><th className="print:hidden"></th></tr></thead>
                <tbody>
                    {doc.items.map((item, idx) => (
                        <tr key={item.id} className="border-b">
                            <td className="py-2">
                                <input className="w-full print:hidden border-none" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="Item" />
                                <div className="hidden print:block">{item.description}</div>
                                {isAiAvailable() && <button onClick={() => handleAiEnhance(idx)} className="text-xs text-purple-600 print:hidden">AI Enhance</button>}
                            </td>
                            <td><input type="number" className="w-12 print:hidden" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} /><span className="hidden print:block">{item.quantity}</span></td>
                            <td className="text-right">{item.price}</td>
                            <td className="text-right">{(item.price * item.quantity).toFixed(2)}</td>
                            <td className="print:hidden"><button onClick={() => {const ni = [...doc.items]; ni.splice(idx,1); setDoc({...doc, items: ni})}}><Trash2 size={14}/></button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={addItem} className="print:hidden mb-8 text-blue-600 text-sm font-bold">+ Add Item</button>

            <div className="flex justify-end">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between"><span>Subtotal</span><span>{subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span>{settings.currency}{total.toFixed(2)}</span></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
