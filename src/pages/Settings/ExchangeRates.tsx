import { useState } from 'react';
import { Save, RefreshCw, Calculator, ArrowRightLeft } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import type { Currency } from '../../context/CurrencyContext'; // FIXED: Explicit Type Import

export default function ExchangeRates() {
  const { exchangeRates, updateExchangeRates } = useCurrency();
  const [localRates, setLocalRates] = useState<Record<Currency, number>>({ ...exchangeRates });
  const [isSaved, setIsSaved] = useState(false);

  const handleRateChange = (currency: Currency, value: string) => {
    const numValue = parseFloat(value);
    setLocalRates(prev => ({
      ...prev,
      [currency]: isNaN(numValue) ? 0 : numValue
    }));
    setIsSaved(false);
  };

  const handleSave = () => {
    updateExchangeRates(localRates);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const currencies: { code: Currency; name: string; symbol: string }[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  ];

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-300 pb-10">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Exchange Rates Management</h2>
          <p className="text-sm text-gray-500 mt-1">Control global currency conversion multipliers relative to your Base Currency (NGN).</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setLocalRates({ ...exchangeRates })}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} /> Discard Changes
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#0d6efd] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
          >
            {isSaved ? <span className="flex items-center gap-2">Saved!</span> : <><Save size={16} /> Save Rates</>}
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex gap-4 items-start">
        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0">
          <Calculator size={20} />
        </div>
        <div>
          <h4 className="font-bold text-blue-900 mb-1">How conversions work</h4>
          <p className="text-sm text-blue-800 leading-relaxed">
            Your system operates entirely in **Nigerian Naira (NGN)** as the absolute baseline. 
            The values below dictate how much **1 unit of foreign currency** is worth in NGN. 
            For example, if you set USD to 1500, a package configured at ₦1,500,000 will display as $1,000 to the user on the frontend.
          </p>
        </div>
      </div>

      {/* Exchange Rates Grid */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
          <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100 font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-4">Currency Code</th>
              <th className="px-6 py-4">Currency Name</th>
              <th className="px-6 py-4">Conversion Formula</th>
              <th className="px-6 py-4">Equivalent in NGN (₦)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            
            {/* Base Currency Row (Read-Only) */}
            <tr className="bg-gray-50/30">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded flex items-center justify-center text-xs">₦</span>
                  NGN
                </div>
              </td>
              <td className="px-6 py-4 font-medium text-gray-700">Nigerian Naira</td>
              <td className="px-6 py-4 text-emerald-600 font-medium flex items-center gap-2">
                Base Currency <ArrowRightLeft size={14} className="opacity-50"/> System Default
              </td>
              <td className="px-6 py-4">
                <input 
                  type="text" 
                  value="1.00" 
                  disabled 
                  className="w-full max-w-[200px] bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-500 cursor-not-allowed font-medium outline-none" 
                />
              </td>
            </tr>

            {/* Editable Currencies */}
            {currencies.map((curr) => (
              <tr key={curr.code} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 font-bold text-gray-900">
                    <span className="w-6 h-6 bg-gray-100 text-gray-700 border border-gray-200 rounded flex items-center justify-center text-xs">
                      {curr.symbol}
                    </span>
                    {curr.code}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-700">{curr.name}</td>
                <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                  1 {curr.code} = {localRates[curr.code]} NGN
                </td>
                <td className="px-6 py-4">
                  <div className="relative max-w-[200px]">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">₦</span>
                    <input 
                      type="number" 
                      value={localRates[curr.code]} 
                      onChange={(e) => handleRateChange(curr.code, e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-4 py-2 text-sm text-gray-900 outline-none focus:border-[#0d6efd] focus:ring-1 focus:ring-[#0d6efd] font-medium transition-shadow" 
                    />
                  </div>
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>

    </div>
  );
}