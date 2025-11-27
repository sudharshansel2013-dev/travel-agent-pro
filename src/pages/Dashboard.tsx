import React, { useEffect, useState } from 'react';
import { Document, DocStatus } from '../types';
import { storageService } from '../services/storageService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, FileText, CheckCircle, Clock } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [docs, setDocs] = useState<Document[]>([]);
  const settings = storageService.getSettings();

  useEffect(() => { setDocs(storageService.getDocuments()); }, []);

  const totalRevenue = docs.filter(d => d.type === 'invoice' && d.status === DocStatus.PAID).reduce((sum, d) => sum + d.items.reduce((a, i) => a + (i.price * i.quantity), 0), 0);
  const pendingInvoices = docs.filter(d => d.type === 'invoice' && d.status === DocStatus.SENT).length;
  const acceptedQuotes = docs.filter(d => d.type === 'quote' && d.status === DocStatus.ACCEPTED).length;

  const chartData = [
    { name: 'Paid', value: docs.filter(d => d.status === DocStatus.PAID).length },
    { name: 'Sent', value: docs.filter(d => d.status === DocStatus.SENT).length },
    { name: 'Draft', value: docs.filter(d => d.status === DocStatus.DRAFT).length },
  ];

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`p-4 rounded-full ${color}`}><Icon size={24} className="text-white" /></div>
      <div><p className="text-sm text-gray-500">{label}</p><h3 className="text-2xl font-bold text-gray-800">{value}</h3></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="mb-8"><h1 className="text-2xl font-bold text-gray-900">Dashboard</h1></header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={DollarSign} label="Total Revenue" value={`${settings.currency}${totalRevenue.toLocaleString()}`} color="bg-green-500" />
        <StatCard icon={Clock} label="Pending Invoices" value={pendingInvoices} color="bg-orange-500" />
        <StatCard icon={CheckCircle} label="Accepted Quotes" value={acceptedQuotes} color="bg-blue-500" />
        <StatCard icon={FileText} label="Total Documents" value={docs.length} color="bg-indigo-500" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Status Overview</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={['#22c55e', '#f97316', '#94a3b8'][index] || '#0ea5e9'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
