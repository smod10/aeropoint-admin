import { useState } from 'react';
import { Search, Filter, Download, Eye, FileText, CheckCircle, Clock, XCircle, User, Map, CreditCard } from 'lucide-react';
import SlideOver from '../../components/Shared/SlideOver';

// Mock Data
const mockVisas = [
  {
    id: 'VSA-1042',
    applicant: 'James Peterson',
    passportNo: 'P8923401X',
    nationality: 'United Kingdom',
    country: 'United Arab Emirates',
    type: 'Tourist (30 Days)',
    status: 'Approved',
    payment: 'Paid',
    assignedStaff: 'Sarah Jenkins',
    submissionDate: '02 Jul 2026',
    notes: 'Visa issued and emailed to the client.',
    email: 'j.peterson@example.com',
    phone: '+44 7700 900111',
    documents: [
      { name: 'Passport Copy', verified: true },
      { name: 'Passport Photo', verified: true },
    ]
  },
  {
    id: 'VSA-1043',
    applicant: 'Aisha Rahman',
    passportNo: 'A1290384B',
    nationality: 'India',
    country: 'United Kingdom',
    type: 'Standard Visitor',
    status: 'In Progress',
    payment: 'Paid',
    assignedStaff: 'David Chen',
    submissionDate: '10 Jul 2026',
    notes: 'Awaiting biometrics appointment confirmation.',
    email: 'a.rahman@example.com',
    phone: '+91 98765 43210',
    documents: [
      { name: 'Passport Copy', verified: true },
      { name: 'Bank Statement (6 Months)', verified: true },
      { name: 'Hotel Booking', verified: false },
    ]
  },
  {
    id: 'VSA-1044',
    applicant: 'Michael Scott',
    passportNo: 'US9928347',
    nationality: 'United States',
    country: 'Saudi Arabia',
    type: 'Business / Umrah',
    status: 'Pending Docs',
    payment: 'Unpaid',
    assignedStaff: 'Unassigned',
    submissionDate: '11 Jul 2026',
    notes: 'Client needs to upload a clear passport photo. Current one has glare.',
    email: 'm.scott@example.com',
    phone: '+1 555 019 2834',
    documents: [
      { name: 'Passport Copy', verified: true },
      { name: 'Passport Photo', verified: false },
    ]
  }
];

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    'Approved': 'bg-emerald-50 text-emerald-600',
    'In Progress': 'bg-blue-50 text-blue-600',
    'Pending Docs': 'bg-amber-50 text-amber-600',
    'Rejected': 'bg-red-50 text-red-600'
  };
  return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
};

export default function VisaList() {
  const [selectedVisa, setSelectedVisa] = useState<typeof mockVisas[0] | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const openDetails = (visa: typeof mockVisas[0]) => {
    setSelectedVisa(visa);
    setIsSlideOverOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Visa Applications</h2>
          <p className="text-sm text-gray-500 mt-1">Track customer visa processing, documents, and approvals.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          <Download size={16} />
          Export Data
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-soft border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center w-full md:w-96 relative">
          <Search className="text-gray-400 absolute ml-3" size={18} />
          <input 
            type="text" 
            placeholder="Search by Applicant, Passport No, or Country..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2 outline-none">
            <option value="">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Docs">Pending Docs</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
            <Filter size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">App ID</th>
                <th className="px-6 py-4 font-medium">Applicant</th>
                <th className="px-6 py-4 font-medium">Destination & Type</th>
                <th className="px-6 py-4 font-medium">Submitted</th>
                <th className="px-6 py-4 font-medium">Staff</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockVisas.map((visa) => (
                <tr key={visa.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-primary-600">{visa.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{visa.applicant}</div>
                    <div className="text-xs text-gray-400">{visa.passportNo}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{visa.country}</div>
                    <div className="text-xs text-gray-400">{visa.type}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{visa.submissionDate}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      <User size={12} />
                      {visa.assignedStaff}
                    </span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(visa.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openDetails(visa)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      <Eye size={14} />
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Details Panel */}
      <SlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)} 
        title="Visa Application Details"
      >
        {selectedVisa && (
          <div className="space-y-6 pb-20">
            
            {/* Status & ID Summary */}
            <div className="flex justify-between items-start bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Application ID</p>
                <p className="text-lg font-bold text-gray-900">{selectedVisa.id}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Status</p>
                {getStatusBadge(selectedVisa.status)}
              </div>
            </div>

            {/* Applicant Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Applicant Information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Full Name</span>
                  <span className="font-medium text-gray-900">{selectedVisa.applicant}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Passport Number</span>
                  <span className="font-medium text-gray-900">{selectedVisa.passportNo}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Nationality</span>
                  <span className="font-medium text-gray-900">{selectedVisa.nationality}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-900">{selectedVisa.email}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium text-gray-900">{selectedVisa.phone}</span>
                </div>
              </div>
            </div>

            {/* Visa Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Visa Details</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 items-center">
                  <span className="text-gray-500 flex items-center gap-1.5"><Map size={14}/> Destination</span>
                  <span className="font-medium text-gray-900">{selectedVisa.country}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Visa Type</span>
                  <span className="font-medium text-gray-900">{selectedVisa.type}</span>
                </div>
                <div className="grid grid-cols-2 items-center">
                  <span className="text-gray-500 flex items-center gap-1.5"><CreditCard size={14}/> Payment</span>
                  <span className={`font-medium ${selectedVisa.payment === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {selectedVisa.payment}
                  </span>
                </div>
                <div className="grid grid-cols-2 items-center">
                  <span className="text-gray-500 flex items-center gap-1.5"><User size={14}/> Assigned To</span>
                  <span className="font-medium text-primary-600 cursor-pointer hover:underline">{selectedVisa.assignedStaff}</span>
                </div>
              </div>
            </div>

            {/* Document Checklist */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Documents</h3>
              <div className="space-y-2">
                {selectedVisa.documents.map((doc, index) => (
                  <div key={index} className="flex justify-between items-center p-2 rounded-lg border border-gray-50 bg-gray-50/50">
                    <span className="flex items-center gap-2 text-sm text-gray-700">
                      <FileText size={14} className="text-gray-400" />
                      {doc.name}
                    </span>
                    {doc.verified ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <CheckCircle size={14} /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                        <Clock size={14} /> Pending Review
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Agent Notes</h3>
              <textarea 
                rows={3}
                defaultValue={selectedVisa.notes}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                placeholder="Add internal notes regarding this application..."
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-6 mt-6 border-t border-gray-100 space-y-3">
              <button className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
                <CheckCircle size={16} />
                Mark as Approved
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-colors">
                  <FileText size={16} />
                  Request Docs
                </button>
                <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                  <XCircle size={16} />
                  Reject
                </button>
              </div>
            </div>

          </div>
        )}
      </SlideOver>
    </div>
  );
}