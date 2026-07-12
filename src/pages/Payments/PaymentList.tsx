import { useState } from 'react';
import { Search, Download, ArrowRightLeft, CheckCircle, XCircle, Clock, Receipt, RefreshCcw } from 'lucide-react';
import SlideOver from '../../components/Shared/SlideOver';

// Mock Data
const mockTransactions = [
  {
    id: 'TXN-902341',
    bookingId: 'BKG-8492',
    customer: 'Sarah Jenkins',
    amount: '$840.00',
    gateway: 'Stripe',
    date: '14 Jul 2026, 10:42 AM',
    status: 'Successful',
    card: '•••• 4242'
  },
  {
    id: 'TXN-902342',
    bookingId: 'HTL-9022',
    customer: 'Amanda Huggins',
    amount: '$1,400.00',
    gateway: 'PayPal',
    date: '13 Jul 2026, 03:15 PM',
    status: 'Pending',
    card: 'amanda.h@example.com'
  },
  {
    id: 'TXN-902343',
    bookingId: 'PKG-003',
    customer: 'Marcus Johnson',
    amount: '$3,100.00',
    gateway: 'Flutterwave',
    date: '10 Jul 2026, 09:12 AM',
    status: 'Refunded',
    card: '•••• 8891'
  },
  {
    id: 'TXN-902344',
    bookingId: 'VSA-1044',
    customer: 'Michael Scott',
    amount: '$150.00',
    gateway: 'Stripe',
    date: '10 Jul 2026, 08:30 AM',
    status: 'Failed',
    card: '•••• 5521'
  }
];

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    'Successful': 'bg-emerald-50 text-emerald-600',
    'Pending': 'bg-amber-50 text-amber-600',
    'Refunded': 'bg-gray-100 text-gray-600',
    'Failed': 'bg-red-50 text-red-600'
  };
  
  const Icons: Record<string, any> = {
    'Successful': CheckCircle,
    'Pending': Clock,
    'Refunded': ArrowRightLeft,
    'Failed': XCircle
  };
  
  const Icon = Icons[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
      <Icon size={12} /> {status}
    </span>
  );
};

export default function PaymentList() {
  const [selectedTxn, setSelectedTxn] = useState<typeof mockTransactions[0] | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Payments & Transactions</h2>
          <p className="text-sm text-gray-500 mt-1">Monitor booking payments, refunds, and gateway statuses.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          <Download size={16} />
          Export Ledger
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-soft border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center w-full md:w-96 relative">
          <Search className="text-gray-400 absolute ml-3" size={18} />
          <input 
            type="text" 
            placeholder="Search TXN ID, Customer, or Booking ID..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2 outline-none">
            <option value="">All Gateways</option>
            <option value="Stripe">Stripe</option>
            <option value="PayPal">PayPal</option>
            <option value="Flutterwave">Flutterwave</option>
          </select>
          <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2 outline-none">
            <option value="">All Statuses</option>
            <option value="Successful">Successful</option>
            <option value="Pending">Pending</option>
            <option value="Refunded">Refunded</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">Customer & Booking</th>
                <th className="px-6 py-4 font-medium">Gateway</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-primary-600">{txn.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{txn.customer}</div>
                    <div className="text-xs text-gray-400">Ref: {txn.bookingId}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{txn.gateway}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{txn.amount}</td>
                  <td className="px-6 py-4">{txn.date}</td>
                  <td className="px-6 py-4">{getStatusBadge(txn.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => { setSelectedTxn(txn); setIsSlideOverOpen(true); }}
                      className="inline-flex items-center justify-center p-1.5 text-gray-500 bg-gray-50 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      <Receipt size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over TXN Details */}
      <SlideOver isOpen={isSlideOverOpen} onClose={() => setIsSlideOverOpen(false)} title="Transaction Details">
        {selectedTxn && (
          <div className="space-y-6 pb-20">
            <div className="text-center bg-gray-50 p-6 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Amount</p>
              <h3 className="text-3xl font-bold text-gray-900">{selectedTxn.amount}</h3>
              <div className="mt-2 flex justify-center">
                {getStatusBadge(selectedTxn.status)}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Payment Info</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-medium text-gray-900">{selectedTxn.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Booking Reference</span>
                  <span className="font-medium text-primary-600 cursor-pointer hover:underline">{selectedTxn.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Gateway</span>
                  <span className="font-medium text-gray-900">{selectedTxn.gateway}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Source / Card</span>
                  <span className="font-medium text-gray-900">{selectedTxn.card}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-900">{selectedTxn.date}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 space-y-3">
              <button className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
                <Download size={16} /> Download Receipt
              </button>
              
              {selectedTxn.status === 'Successful' && (
                <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-red-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors shadow-sm">
                  <RefreshCcw size={16} /> Issue Refund
                </button>
              )}
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}