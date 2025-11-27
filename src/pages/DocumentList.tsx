import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Document } from '../types';
import { storageService } from '../services/storageService';
import { Plus, Search, Edit2, Trash2, FileText } from 'lucide-react';

interface DocumentListProps { type: 'invoice' | 'quote'; }

export const DocumentList: React.FC<DocumentListProps> = ({ type }) => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const settings = storageService.getSettings();

  useEffect(() => { setDocs(storageService.getDocuments().filter(d => d.type === type)); }, [type]);

  const handleDelete = (id: string) => { if (window.confirm('Delete?')) { storageService.deleteDocument(id); setDocs(prev => prev.filter(d => d.id !== id)); } };

  const filtered = docs.filter(d => d.number.toLowerCase().includes(searchTerm.toLowerCase()) || d.customerSnapshot?.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold capitalize">{type}s</h1>
        <div className="flex gap-2">
           <input className="border rounded-lg p-2" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <Link to={`/${type}s/new`} className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={18} /> New {type}</Link>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr><th className="p-4">Number</th><th className="p-4">Client</th><th className="p-4">Date</th><th className="p-4">Status</th><th className="p-4 text-right">Total</th><th className="p-4 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(doc => {
              const total = doc.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
              const totalWithTax = total + (total * (doc.taxRate/100)) - doc.discount;
              return (
                <tr key={doc.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">#{doc.number}</td>
                  <td className="p-4">{doc.customerSnapshot?.name}</td>
                  <td className="p-4">{doc.date}</td>
                  <td className="p-4">{doc.status}</td>
                  <td className="p-4 text-right">{settings.currency}{totalWithTax.toLocaleString()}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <Link to={`/${type}s/edit/${doc.id}`} className="text-blue-600"><Edit2 size={16} /></Link>
                    <button onClick={() => handleDelete(doc.id)} className="text-red-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
