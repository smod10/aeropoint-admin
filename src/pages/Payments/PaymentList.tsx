import { useState } from 'react';
import { Search, Info, Edit2, ArrowLeft, Key, DollarSign, FileText, LayoutIcon, Check } from 'lucide-react';

// Define the structure based on the requirements
type Gateway = {
  id: number;
  name: string;
  type: string;
  status: boolean;
  isDefault: boolean;
  currency: string;
  devMode: boolean; // true = Development/Sandbox, false = Production
  order: number;
  credentials: Record<string, string>;
};

const initialGateways: Gateway[] = [
  { id: 5, name: 'Paystack', type: 'Credit_card', status: false, isDefault: false, currency: 'USD', devMode: true, order: 5, credentials: { publicKey: '', secretKey: '' } },
  { id: 6, name: 'Flutterwave', type: 'Credit_card', status: false, isDefault: false, currency: 'USD', devMode: true, order: 6, credentials: { publicKey: 'FLWPUBK_TEST-fe4f5...', secretKey: 'FLWSECK_TEST-c297...', encryptionKey: 'FLWSECK_TESTe82f...' } },
  { id: 8, name: 'Stripe', type: 'Credit_card', status: true, isDefault: true, currency: 'USD', devMode: true, order: 8, credentials: { publishableKey: 'pk_test_51...', secretKey: 'sk_test_51...', webhookSecret: 'whsec_...' } },
  { id: 9, name: 'PayPal', type: 'Digital_wallet', status: true, isDefault: false, currency: 'USD', devMode: true, order: 9, credentials: { clientId: '', clientSecret: '' } },
];

export default function PaymentGateways() {
  const [gateways, setGateways] = useState<Gateway[]>(initialGateways);
  const [editingId, setEditingId] = useState<number | null>(null);

  const activeGateway = gateways.find(g => g.id === editingId);

  // Business Rules Logic
  const handleStatusToggle = (id: number) => {
    setGateways(gateways.map(g => {
      if (g.id === id) {
        if (g.isDefault && g.status) {
          alert("Payment Gateway Rules: Cannot disable a gateway that is currently set as default. Please set another gateway as default first.");
          return g;
        }
        return { ...g, status: !g.status };
      }
      return g;
    }));
  };

  const handleDefaultToggle = (id: number) => {
    const targetGateway = gateways.find(g => g.id === id);
    if (targetGateway && !targetGateway.status && !targetGateway.isDefault) {
      alert("Payment Gateway Rules: Default gateway must be enabled. Cannot set a disabled gateway as default.");
      return;
    }

    setGateways(gateways.map(g => ({
      ...g,
      isDefault: g.id === id ? true : false // Turn off default for all others
    })));
  };

  const updateGatewayField = (field: keyof Gateway, value: any) => {
    if (!editingId) return;
    setGateways(gateways.map(g => g.id === editingId ? { ...g, [field]: value } : g));
  };

  const updateCredential = (key: string, value: string) => {
    if (!editingId) return;
    setGateways(gateways.map(g => g.id === editingId ? { ...g, credentials: { ...g.credentials, [key]: value } } : g));
  };

  // ----------------------------------------------------------------------
  // VIEW 2: CONFIGURATION VIEW (Replicates Screenshot 2)
  // ----------------------------------------------------------------------
  if (activeGateway) {
    return (
      <div className="space-y-6 max-w-6xl animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setEditingId(null)} className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{activeGateway.name} Configuration</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <FileText size={14} /> {activeGateway.type} Gateway • # ID: {activeGateway.id}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Gateway Status</label>
              <select 
                value={activeGateway.status ? 'Active' : 'Inactive'}
                onChange={(e) => updateGatewayField('status', e.target.value === 'Active')}
                className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2 outline-none shadow-sm"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Environment</label>
              <select 
                value={activeGateway.devMode ? 'Development' : 'Production'}
                onChange={(e) => updateGatewayField('devMode', e.target.value === 'Development')}
                className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2 outline-none shadow-sm"
              >
                <option value="Development">Development / Sandbox</option>
                <option value="Production">Production</option>
              </select>
            </div>
          </div>
        </div>

        {/* Configuration Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* API Credentials Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Key size={16} className="text-gray-500" /> API Credentials
                </h3>
                <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded">{activeGateway.name} Integration</span>
              </div>
              <div className="p-6 space-y-5">
                
                {/* Dynamic Fields based on Provider */}
                {activeGateway.name === 'Flutterwave' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Public Key <span className="text-red-500">*</span></label>
                      <input type="text" value={activeGateway.credentials.publicKey || ''} onChange={(e) => updateCredential('publicKey', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key <span className="text-red-500">*</span></label>
                      <input type="text" value={activeGateway.credentials.secretKey || ''} onChange={(e) => updateCredential('secretKey', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Encryption Key <span className="text-red-500">*</span></label>
                      <input type="text" value={activeGateway.credentials.encryptionKey || ''} onChange={(e) => updateCredential('encryptionKey', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
                    </div>
                  </>
                )}

                {activeGateway.name === 'Stripe' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Publishable Key <span className="text-red-500">*</span></label>
                      <input type="text" value={activeGateway.credentials.publishableKey || ''} onChange={(e) => updateCredential('publishableKey', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key <span className="text-red-500">*</span></label>
                      <input type="password" value={activeGateway.credentials.secretKey || ''} onChange={(e) => updateCredential('secretKey', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret</label>
                      <input type="text" value={activeGateway.credentials.webhookSecret || ''} onChange={(e) => updateCredential('webhookSecret', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
                    </div>
                  </>
                )}

                {(activeGateway.name === 'Paystack' || activeGateway.name === 'PayPal') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client ID / Public Key <span className="text-red-500">*</span></label>
                      <input type="text" value={activeGateway.credentials.publicKey || activeGateway.credentials.clientId || ''} onChange={(e) => updateCredential(activeGateway.name === 'PayPal' ? 'clientId' : 'publicKey', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key <span className="text-red-500">*</span></label>
                      <input type="password" value={activeGateway.credentials.secretKey || activeGateway.credentials.clientSecret || ''} onChange={(e) => updateCredential(activeGateway.name === 'PayPal' ? 'clientSecret' : 'secretKey', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Currency Configuration Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <DollarSign size={16} className="text-gray-500" /> Currency Configuration
                </h3>
              </div>
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Supported Currency</label>
                <select 
                  value={activeGateway.currency} 
                  onChange={(e) => updateGatewayField('currency', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 appearance-none"
                >
                  <option value="USD">USD - United States</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="NGN">NGN - Nigerian Naira</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">Select the primary currency for this payment gateway</p>
              </div>
            </div>

            <button onClick={() => setEditingId(null)} className="flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm w-full md:w-auto">
              <Check size={18} /> Save Configurations
            </button>
          </div>

          {/* Right Column: Info & Help */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Info size={16} className="text-gray-500" /> Gateway Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Gateway ID:</span>
                  <span className="font-medium text-gray-900">{activeGateway.id}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium text-gray-900">{activeGateway.type}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-medium text-gray-900">{activeGateway.name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium ${activeGateway.status ? 'text-blue-600' : 'text-red-600'}`}>
                    {activeGateway.status ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Environment:</span>
                  <span className="font-medium text-blue-600">{activeGateway.devMode ? 'Development' : 'Production'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Currency:</span>
                  <span className="font-medium text-gray-900">{activeGateway.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Order:</span>
                  <span className="font-medium text-gray-900">{activeGateway.order}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                <FileText size={16} className="text-gray-500" /> Help & Documentation
              </h3>
              <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                <FileText size={14} /> Setup Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW 1: LIST VIEW (Replicates Screenshot 1)
  // ----------------------------------------------------------------------
  return (
    <div className="space-y-6">
      
      {/* Alert Banner */}
      <div className="bg-[#eff6ff] border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-bold text-blue-900 mb-2">Payment Gateway Rules:</h4>
          <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
            <li>Default gateway must be enabled. Cannot set a disabled gateway as default.</li>
            <li>Cannot disable a gateway that is currently set as default. Please set another gateway as default first.</li>
          </ul>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Payment Gateways</h2>
          <p className="text-sm text-gray-500 mt-1">Total: {gateways.length} records</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex items-center justify-between gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            <LayoutIcon size={16} /> View Columns <span className="text-gray-400 text-xs ml-2">▼</span>
          </button>
          <button className="flex items-center justify-between gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            All Columns <span className="text-gray-400 text-xs ml-2">▼</span>
          </button>
          <div className="flex relative">
            <input type="text" placeholder="Search records..." className="bg-white border border-gray-200 rounded-l-lg px-4 py-2 text-sm outline-none focus:border-primary-500 w-48" />
            <button className="bg-[#0d6efd] text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors">
              <Search size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50 border-b border-gray-200 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 w-12">#</th>
                <th className="px-6 py-4 w-24">STATUS</th>
                <th className="px-6 py-4 w-24">DEFAULT</th>
                <th className="px-6 py-4">NAME</th>
                <th className="px-6 py-4">CURRENCY</th>
                <th className="px-6 py-4">DEV MODE</th>
                <th className="px-6 py-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {gateways.map((gateway, index) => (
                <tr key={gateway.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                  
                  {/* Status Toggle */}
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleStatusToggle(gateway.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${gateway.status ? 'bg-primary-600' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${gateway.status ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </td>

                  {/* Default Toggle */}
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleDefaultToggle(gateway.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${gateway.isDefault ? 'bg-orange-500' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${gateway.isDefault ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </td>

                  <td className="px-6 py-4 text-gray-900">{gateway.name}</td>
                  <td className="px-6 py-4 text-gray-900">{gateway.currency}</td>
                  
                  {/* Dev Mode Badge */}
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded ${
                      gateway.devMode ? 'bg-[#d1e7dd] text-[#0f5132]' : 'bg-[#e2e3e5] text-[#41464b]'
                    }`}>
                      {gateway.devMode ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => setEditingId(gateway.id)}
                      className="inline-flex p-1.5 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}