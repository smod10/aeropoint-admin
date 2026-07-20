import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Download, CheckCircle2, CreditCard, Building } from 'lucide-react';
import { mockTransactions } from '../../data/mockTransactions';

export default function TransactionView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const transaction = mockTransactions.find(item => item.id === id) ?? mockTransactions[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/reports/transactions')} className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Transaction Details</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">
            <Printer size={16} /> Print Receipt
          </button>
          <button className="flex items-center gap-2 bg-[#0d6efd] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors">
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      {/* Receipt Card */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        
        {/* Top Banner */}
        <div className="bg-emerald-50 p-8 border-b border-emerald-100 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-xl font-bold text-emerald-800 mb-1">Receipt</h3>
          <p className="text-sm text-emerald-600 font-medium">{transaction.status} via {transaction.gateway}</p>
        </div>

        {/* Breakdown */}
        <div className="p-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row justify-between gap-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Transaction ID</p>
              <p className="text-lg font-mono text-gray-900 font-bold">{transaction.id}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date & Time</p>
              <p className="text-lg text-gray-900 font-medium">{transaction.date} • 15:45 PM</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building size={16} className="text-gray-400"/>
                <h4 className="text-sm font-bold text-gray-800">Merchant Info</h4>
              </div>
              <p className="text-sm text-gray-600 font-medium">Aeropoint Inc.</p>
              <p className="text-sm text-gray-500">123 Aviation Way</p>
              <p className="text-sm text-gray-500">Dubai, UAE</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={16} className="text-gray-400"/>
                <h4 className="text-sm font-bold text-gray-800">Customer Info</h4>
              </div>
              <p className="text-sm text-gray-600 font-medium">{transaction.customer}</p>
              <p className="text-sm text-gray-500">{transaction.email}</p>
              <p className="text-sm text-gray-500">{transaction.reference}</p>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-800 mb-4">Payment Summary</h4>
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">Base Amount</span>
                <span className="text-sm text-gray-900 font-medium">{transaction.currency} {transaction.netAmount}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">Gateway Processing Fee</span>
                <span className="text-sm text-gray-900 font-medium">{transaction.currency} {transaction.fees}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-2">
                <span className="text-base font-bold text-gray-800">Total Paid</span>
                <span className="text-xl font-black text-[#0d6efd]">{transaction.currency} {transaction.amount}</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3">Transaction Details</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between gap-4"><span>Gateway</span><span className="font-medium text-gray-900">{transaction.gateway}</span></div>
                <div className="flex justify-between gap-4"><span>Type</span><span className="font-medium text-gray-900">{transaction.type}</span></div>
                <div className="flex justify-between gap-4"><span>Status</span><span className="font-medium text-gray-900">{transaction.status}</span></div>
                <div className="flex justify-between gap-4"><span>Reference</span><span className="font-medium text-gray-900">{transaction.reference}</span></div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3">Receipt Notes</h4>
              <p className="text-sm text-gray-600 leading-6">
                This receipt confirms the captured payment details for the selected transaction.
                Use the print or download action to archive it with the customer booking record.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}