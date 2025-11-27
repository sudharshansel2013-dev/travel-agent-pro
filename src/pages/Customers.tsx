import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { storageService } from '../services/storageService';
import { Search, Plus, Trash2, Edit2, X } from 'lucide-react';

export const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => { refresh(); }, []);
  const refresh = () => setCustomers(storageService.getCustomers());

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure?')) { storageService.deleteCustomer(id); refresh(); }
  };
  const handleEdit = (customer: Customer) => { setEditingCustomer(customer); setIsModalOpen(true); };
  const handleAddNew = () => { setEditingCustomer(null); setIsModalOpen(true); };

  const filtered = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Client Management</h1>
        <div className="flex gap-2">
          <input className="border rounded-lg p-2" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <button onClick={handleAddNew} className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={18} /> Add</button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr><th className="p-4">Name</th><th className="p-4">Contact</th><th className="p-4">Address</th><th className="p-4">Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{c.name}</td>
                <td className="p-4 text-sm">{c.email}<br/>{c.phone}</td>
                <td className="p-4 text-sm">{c.address}</td>
                <td className="p-4 space-x-2">
                  <button onClick={() => handleEdit(c)} className="text-blue-600"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && <CustomerModal customer={editingCustomer} onClose={() => setIsModalOpen(false)} onSave={() => { setIsModalOpen(false); refresh(); }} />}
    </div>
  );
};

const CustomerModal: React.FC<{ customer: Customer | null; onClose: () => void; onSave: () => void }> = ({ customer, onClose, onSave }) => {
  const [formData, setFormData] = useState<Customer>(customer || { id: Date.now().toString(), name: '', email: '', phone: '', address: '', notes: '' });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); storageService.saveCustomer(formData); onSave(); };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Client</h2><button onClick={onClose}><X /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required className="w-full border rounded p-2" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input required className="w-full border rounded p-2" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input className="w-full border rounded p-2" placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <textarea className="w-full border rounded p-2" placeholder="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          <button type="submit" className="w-full bg-brand-600 text-white p-2 rounded">Save</button>
        </form>
      </div>
    </div>
  );
};
