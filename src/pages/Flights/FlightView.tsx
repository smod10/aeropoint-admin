import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Info, PlaneTakeoff, PlaneLanding, DollarSign, Briefcase, Star, CheckCircle2 } from 'lucide-react';

export default function FlightView() {
  const navigate = useNavigate();
  const { id } = useParams(); // e.g., PK304

  // Mock data representing the flight details
  const flight = {
    flightNumber: id || 'PK304',
    status: 'Active',
    type: 'Recurring Flight',
    airline: 'AST Pakistan Airways (PKA)',
    departure: { airport: 'LHE - Lahore', country: 'Pakistan', day: 'Monday', time: '06:00' },
    arrival: { airport: 'DXB - Dubai', country: 'United Arab Emirates', day: 'Tuesday', time: '08:30' },
    duration: '3h 30m',
    pricing: {
      economy: { adult: '155.00', child: '116.00', infant: '39.00' },
      premium: { adult: '50.00', child: '50.00', infant: '50.00' },
      business: { adult: '450.00', child: '338.00', infant: '113.00' },
      first: { adult: '50.00', child: '50.00', infant: '50.00' }
    },
    baggage: { checked: '70', cabin: '10' },
    seats: { total: '1', available: '1' },
    amenities: ['WiFi Available', 'Entertainment System', 'Power Outlet']
  };

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/flights')} className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">View Flight: {flight.flightNumber}</h2>
        </div>
        <button 
          onClick={() => navigate(`/flights/edit/${flight.flightNumber}`)}
          className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Edit size={16} /> Edit Flight
        </button>
      </div>

      {/* Basic Info Card */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
          <Info size={16} className="text-primary-500" /> Flight Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Status</p>
            <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-md">
              {flight.status}
            </span>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Flight Type</p>
            <p className="font-medium text-gray-900">{flight.type}</p>
          </div>
        </div>
      </div>

      {/* Flight Legs */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <PlaneTakeoff size={16} className="text-primary-500" /> Flight Route
          </h3>
          <span className="px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-full">Direct Flight</span>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">1</div>
          <h4 className="font-semibold text-gray-800 text-sm">Flight Leg 1</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Departure */}
          <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/50">
            <h5 className="font-semibold text-gray-800 flex items-center gap-2 mb-4 text-sm border-b border-gray-100 pb-2">
              <PlaneTakeoff size={14} className="text-primary-500" /> Departure
            </h5>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">From Airport</p>
                <p className="font-medium text-gray-900">{flight.departure.airport}</p>
                <p className="text-xs text-gray-500">{flight.departure.country}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Airline</p>
                <p className="font-medium text-gray-900">{flight.airline}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Flight Number</p>
                <p className="font-medium text-gray-900">{flight.flightNumber}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Day</p>
                  <p className="font-medium text-gray-900">{flight.departure.day}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Time</p>
                  <p className="font-medium text-gray-900">{flight.departure.time}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Arrival */}
          <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/50">
            <h5 className="font-semibold text-gray-800 flex items-center gap-2 mb-4 text-sm border-b border-gray-100 pb-2">
              <PlaneLanding size={14} className="text-primary-500" /> Arrival
            </h5>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">To Airport</p>
                <p className="font-medium text-gray-900">{flight.arrival.airport}</p>
                <p className="text-xs text-gray-500">{flight.arrival.country}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Flight Duration</p>
                <p className="font-medium text-gray-900">{flight.duration}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-11">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Day</p>
                  <p className="font-medium text-gray-900">{flight.arrival.day}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Time</p>
                  <p className="font-medium text-gray-900">{flight.arrival.time}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6">
          <DollarSign size={16} className="text-primary-500" /> Pricing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(flight.pricing).map(([cls, prices]) => (
            <div key={cls} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <h4 className="font-semibold text-gray-800 capitalize mb-3 text-sm">{cls} Class</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-500">Adult Price</span>
                  <span className="font-medium text-gray-900">USD {prices.adult}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-500">Child Price</span>
                  <span className="font-medium text-gray-900">USD {prices.child}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Infant Price</span>
                  <span className="font-medium text-gray-900">USD {prices.infant}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Baggage & Amenities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Briefcase size={16} className="text-primary-500" /> Baggage & Seats
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Checked Baggage</p>
              <p className="font-medium text-gray-900">{flight.baggage.checked} kg</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Cabin Baggage</p>
              <p className="font-medium text-gray-900">{flight.baggage.cabin} kg</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Total Seats</p>
              <p className="font-medium text-gray-900">{flight.seats.total}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Available Seats</p>
              <p className="font-medium text-gray-900">{flight.seats.available}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Star size={16} className="text-primary-500" /> Amenities
          </h3>
          <div className="flex flex-wrap gap-4">
            {flight.amenities.map((amenity, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <CheckCircle2 size={16} className="text-emerald-500" /> {amenity}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}