import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Copy, ArrowRightLeft, Plus, TrendingUp } from 'lucide-react';

export default function FlightEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <form className="space-y-6 max-w-6xl animate-in fade-in duration-300" onSubmit={(e) => { e.preventDefault(); navigate('/flights'); }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate('/flights')} className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Edit Flight: {id || 'PK304'}</h2>
        </div>
      </div>

      {/* Status & Configuration */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
          <h3 className="text-sm font-bold text-gray-800">Status & Configuration</h3>
          <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer">
            Featured <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
            <input type="text" placeholder="Search by name or email" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flight Type</label>
            <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500">
              <option>Recurring Flight</option>
              <option>Fixed Flight</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flight Information (Legs) */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-gray-800">Flight Information</h3>
          <span className="px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-full">Direct Flight</span>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">1</div>
          <h4 className="font-semibold text-gray-800 text-sm">Flight Leg 1</h4>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Departure Config */}
          <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h5 className="font-bold text-primary-600 text-sm">Departure</h5>
              <div className="flex gap-2">
                <button type="button" className="text-xs flex items-center gap-1 border border-gray-200 px-2 py-1 rounded bg-gray-50 text-gray-600 hover:bg-gray-100"><Copy size={12}/> Copy Route</button>
                <button type="button" className="text-xs flex items-center gap-1 border border-gray-200 px-2 py-1 rounded bg-gray-50 text-gray-600 hover:bg-gray-100"><ArrowRightLeft size={12}/> Swap Airports</button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">From Airport *</label>
                <input type="text" defaultValue="LHE - Lahore" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Airline *</label>
                  <input type="text" defaultValue="PKA" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Flight Number *</label>
                  <input type="text" defaultValue={id || "PK304"} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Day *</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500">
                    <option>Monday</option><option>Tuesday</option><option>Wednesday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Time *</label>
                  <input type="time" defaultValue="06:00" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Arrival Config */}
          <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h5 className="font-bold text-primary-600 text-sm">Arrival</h5>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">To Airport *</label>
                <input type="text" defaultValue="DXB - Dubai" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Flight Duration <span className="text-gray-400 font-normal">(Auto-calculated)</span></label>
                <input type="text" defaultValue="3h 30m" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Day *</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500">
                    <option>Monday</option><option selected>Tuesday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Time *</label>
                  <input type="time" defaultValue="08:30" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button type="button" className="mt-4 flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
          <Plus size={16} /> Add Connecting Flight
        </button>
      </div>

      {/* Journey Summary */}
      <div className="bg-[#eff6ff] rounded-xl shadow-sm border border-blue-100 p-6">
        <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-4"><TrendingUp size={16}/> Journey Summary</h3>
        <div className="bg-white border border-blue-100 rounded-lg p-3 flex justify-between items-center text-sm shadow-sm mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="font-semibold text-gray-800">LHE <ArrowRightLeft size={12} className="inline mx-1 text-gray-400"/> DXB</span>
            <span className="text-gray-500">06:00 → 08:30 | PKA PK304</span>
          </div>
          <span className="text-blue-600 font-medium">3h 30m</span>
        </div>
        <div className="flex justify-between items-center border-t border-blue-200 pt-3">
          <div>
            <p className="font-bold text-gray-800">Total Journey Time:</p>
            <p className="text-xs text-gray-500">Direct Flight</p>
          </div>
          <p className="text-xl font-bold text-blue-700">3h 30m</p>
        </div>
      </div>

      {/* Pricing Config */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: 'Economy Class', adult: '155.00', child: '116.00', infant: '39.00', req: true },
            { name: 'Premium Economy', adult: '50.00', child: '50.00', infant: '50.00', req: false },
            { name: 'Business Class', adult: '450.00', child: '338.00', infant: '113.00', req: false },
            { name: 'First Class', adult: '50.00', child: '50.00', infant: '50.00', req: false }
          ].map((cls, idx) => (
            <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <h4 className="font-semibold text-gray-800 mb-3 text-sm">{cls.name} {cls.req && <span className="text-red-500">*</span>}</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Adult Price {cls.req && '*'}</label>
                  <input type="text" defaultValue={`USD ${cls.adult}`} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Child Price</label>
                  <input type="text" defaultValue={`USD ${cls.child}`} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Infant Price</label>
                  <input type="text" defaultValue={`USD ${cls.infant}`} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities & Footer Actions */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 mb-10">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Amenities</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4" /> WiFi Available</label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4" /> Meal Service</label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4" /> Entertainment System</label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4" /> Power Outlet</label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4" /> Refundable Ticket</label>
        </div>

        <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/flights')} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors">
            <Save size={16} /> Update Flight
          </button>
        </div>
      </div>
    </form>
  );
}