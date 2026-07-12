import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, LayoutIcon, Check } from 'lucide-react';
import SlideOver from '../../components/Shared/SlideOver';

// Mock Data matching the provided screenshot style
const initialFlights = [
  { id: 1, status: true, flightNumber: 'PK304', airline: 'AST Pakistan Airways', origin: 'Lahore', destination: 'Dubai', time: '06:00:00', type: 'recurring', adult: '155.00 USD', child: '116.00 USD', infant: '39.00 USD' },
  { id: 2, status: true, flightNumber: 'LH778', airline: 'Lufthansa', origin: 'Frankfurt', destination: 'Singapore', time: '22:05:00', type: 'fixed', adult: '730.00 USD', child: '547.50 USD', infant: '73.00 USD' },
  { id: 3, status: true, flightNumber: 'EK382', airline: 'Emirates', origin: 'Dubai', destination: 'Hong Kong', time: '03:45:00', type: 'fixed', adult: '560.00 USD', child: '420.00 USD', infant: '56.00 USD' },
  { id: 4, status: true, flightNumber: 'EK398', airline: 'Emirates', origin: 'Dubai', destination: 'Denpasar', time: '02:35:00', type: 'fixed', adult: '580.00 USD', child: '435.00 USD', infant: '58.00 USD' },
  { id: 5, status: true, flightNumber: 'TG910', airline: 'Thai Airways', origin: 'Bangkok', destination: 'London', time: '23:30:00', type: 'fixed', adult: '650.00 USD', child: '487.50 USD', infant: '65.00 USD' },
  { id: 6, status: true, flightNumber: 'TG676', airline: 'Thai Airways', origin: 'Bangkok', destination: 'Tokyo', time: '07:35:00', type: 'fixed', adult: '430.00 USD', child: '322.50 USD', infant: '43.00 USD' },
  { id: 7, status: true, flightNumber: 'QF011', airline: 'Qantas', origin: 'Sydney', destination: 'Los Angeles', time: '09:40:00', type: 'fixed', adult: '1100.00 USD', child: '825.00 USD', infant: '110.00 USD' },
];

export default function FlightList() {
  const [flights, setFlights] = useState(initialFlights);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<any>(null);

  // Toggle the active/inactive status switch
  const toggleStatus = (id: number) => {
    setFlights(flights.map(f => f.id === id ? { ...f, status: !f.status } : f));
  };

  const openAddForm = () => {
    setEditingFlight(null);
    setIsSlideOverOpen(true);
  };

  const openEditForm = (flight: any) => {
    setEditingFlight(flight);
    setIsSlideOverOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this flight record?')) {
      setFlights(flights.filter(f => f.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Matching Screenshot */}
      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Flights Management</h2>
          <p className="text-sm text-gray-500 mt-1">Total: {flights.length} records</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <LayoutIcon size={16} />
            View Columns
          </button>
          <button 
            onClick={openAddForm}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Create New
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-4 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-4 w-10">#</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Flight Number</th>
                <th className="px-4 py-4">Airline</th>
                <th className="px-4 py-4">Origin Airport</th>
                <th className="px-4 py-4">Destination Airport</th>
                <th className="px-4 py-4">Departure Time</th>
                <th className="px-4 py-4">Flight Type</th>
                <th className="px-4 py-4">Economy Adult Price</th>
                <th className="px-4 py-4">Economy Child Price</th>
                <th className="px-4 py-4">Economy Infant Price</th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {flights.map((flight, index) => (
                <tr key={flight.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded border-gray-300 text-primary-600" /></td>
                  <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                  
                  {/* Status Toggle Switch */}
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => toggleStatus(flight.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${flight.status ? 'bg-primary-600' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${flight.status ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </td>

                  <td className="px-4 py-3 font-medium text-gray-900">{flight.flightNumber}</td>
                  <td className="px-4 py-3">{flight.airline}</td>
                  <td className="px-4 py-3">{flight.origin}</td>
                  <td className="px-4 py-3">{flight.destination}</td>
                  <td className="px-4 py-3">{flight.time}</td>
                  <td className="px-4 py-3">{flight.type}</td>
                  <td className="px-4 py-3 font-medium text-emerald-600 bg-emerald-50/30">{flight.adult}</td>
                  <td className="px-4 py-3 font-medium text-emerald-600 bg-emerald-50/30">{flight.child}</td>
                  <td className="px-4 py-3 font-medium text-emerald-600 bg-emerald-50/30">{flight.infant}</td>
                  
                  {/* Actions Column */}
                  <td className="px-4 py-3 text-center space-x-1">
                    <button className="inline-flex p-1.5 text-gray-400 hover:text-primary-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="View">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => openEditForm(flight)} className="inline-flex p-1.5 text-gray-400 hover:text-blue-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(flight.id)} className="inline-flex p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Slide-Over */}
      <SlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)} 
        title={editingFlight ? "Edit Flight Configuration" : "Create New Flight"}
      >
        <form className="space-y-5 pb-24" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
              <input type="text" defaultValue={editingFlight?.flightNumber || ''} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none" placeholder="e.g. EK382" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Airline</label>
              <input type="text" defaultValue={editingFlight?.airline || ''} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none" placeholder="e.g. Emirates" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origin Airport</label>
              <input type="text" defaultValue={editingFlight?.origin || ''} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none" placeholder="City or IATA code" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination Airport</label>
              <input type="text" defaultValue={editingFlight?.destination || ''} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none" placeholder="City or IATA code" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
              <input type="time" defaultValue={editingFlight?.time || ''} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Flight Type</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none">
                <option value="fixed" selected={editingFlight?.type === 'fixed'}>Fixed</option>
                <option value="recurring" selected={editingFlight?.type === 'recurring'}>Recurring</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4 mt-4">
            <h4 className="text-sm font-semibold text-gray-900">Pricing Configuration (Economy)</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Adult Price</label>
                <input type="text" defaultValue={editingFlight?.adult || ''} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none" placeholder="0.00 USD" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Child Price</label>
                <input type="text" defaultValue={editingFlight?.child || ''} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none" placeholder="0.00 USD" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Infant Price</label>
                <input type="text" defaultValue={editingFlight?.infant || ''} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none" placeholder="0.00 USD" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsSlideOverOpen(false)} className="flex-1 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={() => setIsSlideOverOpen(false)} className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              <Check size={16} /> Save Flight
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}