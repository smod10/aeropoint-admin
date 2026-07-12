import { useState } from 'react';
import { Plug, ShieldCheck, AlertCircle, Save, Activity } from 'lucide-react';

// Reusable Provider Card Component
const ProviderCard = ({ name, type, isConnected, env }: any) => {
  return (
    <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 mb-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">{type} Provider</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${
            env === 'Production' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
          }`}>
            {env}
          </span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${
            isConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {isConnected ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key / Client ID</label>
            <input 
              type="text" 
              defaultValue="pk_test_51Nx..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
            <input 
              type="password" 
              defaultValue="sk_test_51Nx..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
          <input 
            type="text" 
            defaultValue="https://api.aeropoint.com/webhooks/provider"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-gray-500"
            readOnly
          />
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">Last synchronized: 2 hours ago</p>
          <div className="flex gap-3">
            <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              <Activity size={16} />
              Test Connection
            </button>
            <button className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
              <Save size={16} />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ApiIntegrations() {
  const [activeTab, setActiveTab] = useState('flights');

  const tabs = [
    { id: 'flights', label: 'Flight GDS' },
    { id: 'hotels', label: 'Hotel APIs' },
    { id: 'payments', label: 'Payment Gateways' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Plug className="text-primary-600" />
          API Integrations
        </h2>
        <p className="text-sm text-gray-500 mt-1">Manage connections to third-party travel and payment providers.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'flights' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ProviderCard name="Amadeus" type="Global Distribution System" isConnected={true} env="Production" />
            <ProviderCard name="Sabre" type="Global Distribution System" isConnected={false} env="Sandbox" />
            <ProviderCard name="Duffel" type="Flight Aggregator" isConnected={true} env="Production" />
          </div>
        )}

        {activeTab === 'hotels' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ProviderCard name="Hotelbeds" type="Accommodation" isConnected={true} env="Production" />
            <ProviderCard name="Expedia Rapid" type="Accommodation" isConnected={false} env="Sandbox" />
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ProviderCard name="Stripe" type="Payment Processor" isConnected={true} env="Production" />
            <ProviderCard name="Flutterwave" type="Payment Processor" isConnected={true} env="Production" />
            <ProviderCard name="PayPal" type="Payment Processor" isConnected={false} env="Sandbox" />
          </div>
        )}
      </div>
    </div>
  );
}