import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { AppSettings, PaperSize, LayoutTemplate } from '../types';
import { Save, Upload, Layout } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  const [saved, setSaved] = useState(false);

  const handleChange = (field: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit warning
        alert("File is too large. Please use an image under 500KB for best performance.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    storageService.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Settings & Branding</h1>
        <button 
          onClick={handleSave}
          className="bg-brand-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-brand-700 shadow-md transition-all"
        >
          <Save size={18} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Agency Details</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Agency Name</label>
            <input className="w-full border rounded p-2" value={settings.agencyName} onChange={e => handleChange('agencyName', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input className="w-full border rounded p-2" value={settings.agencyEmail} onChange={e => handleChange('agencyEmail', e.target.value)} />
          </div>
           <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input className="w-full border rounded p-2" value={settings.agencyPhone} onChange={e => handleChange('agencyPhone', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea className="w-full border rounded p-2" rows={3} value={settings.agencyAddress} onChange={e => handleChange('agencyAddress', e.target.value)} />
          </div>
        </div>

        {/* Branding & Visuals */}
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
           <h2 className="text-lg font-semibold border-b pb-2">Branding & Layout</h2>
           
           {/* Logo Upload */}
           <div>
            <label className="block text-sm font-medium mb-1">Agency Logo</label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 border rounded flex items-center justify-center bg-gray-50 overflow-hidden">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-xs text-gray-400">No Logo</span>
                )}
              </div>
              <div className="flex-1">
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm flex items-center gap-2 w-max transition-colors">
                  <Upload size={16} /> Upload Logo
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </label>
                <input 
                  className="w-full border rounded p-2 text-xs mt-2" 
                  value={settings.logoUrl} 
                  placeholder="Or paste image URL..."
                  onChange={e => handleChange('logoUrl', e.target.value)} 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                 <label className="block text-sm font-medium mb-1">Primary Color</label>
                 <div className="flex items-center gap-2">
                    <input type="color" className="h-10 w-10 border rounded cursor-pointer" value={settings.primaryColor} onChange={e => handleChange('primaryColor', e.target.value)} />
                    <span className="text-sm text-gray-600">{settings.primaryColor}</span>
                 </div>
            </div>
            <div>
                 <label className="block text-sm font-medium mb-1">Paper Size</label>
                 <select className="w-full border rounded p-2" value={settings.paperSize} onChange={e => handleChange('paperSize', e.target.value as PaperSize)}>
                    {Object.values(PaperSize).map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Document Layout Style</label>
             <div className="grid grid-cols-3 gap-2">
                {(['classic', 'modern', 'bold'] as LayoutTemplate[]).map((template) => (
                  <button
                    key={template}
                    onClick={() => handleChange('layoutTemplate', template)}
                    className={`p-2 border rounded-lg text-center text-sm capitalize transition-all ${
                      settings.layoutTemplate === template 
                        ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Layout size={16} className="mx-auto mb-1" />
                    {template}
                  </button>
                ))}
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium mb-1">Currency Symbol</label>
             <input className="w-full border rounded p-2 max-w-[100px]" value={settings.currency} onChange={e => handleChange('currency', e.target.value)} />
          </div>
        </div>

        {/* Terms & Payment */}
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4 md:col-span-2">
           <h2 className="text-lg font-semibold border-b pb-2">Terms & Payment</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                   <label className="block text-sm font-medium mb-1">Bank Account Details (Invoices)</label>
                   <textarea className="w-full border rounded p-2" rows={5} value={settings.bankDetails} onChange={e => handleChange('bankDetails', e.target.value)} placeholder="Bank Name, Account Number, SWIFT/IBAN..." />
               </div>
               <div>
                   <label className="block text-sm font-medium mb-1">Default Terms & Conditions</label>
                   <textarea className="w-full border rounded p-2" rows={5} value={settings.termsAndConditions} onChange={e => handleChange('termsAndConditions', e.target.value)} placeholder="Payment terms, cancellation policy..." />
               </div>
           </div>
            <div>
                 <label className="block text-sm font-medium mb-1">Default Tax Rate (%)</label>
                 <input type="number" className="w-full border rounded p-2 max-w-[150px]" value={settings.defaultTaxRate} onChange={e => handleChange('defaultTaxRate', parseFloat(e.target.value))} />
            </div>
        </div>
      </div>
    </div>
  );
};