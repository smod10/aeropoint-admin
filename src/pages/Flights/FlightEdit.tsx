import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Copy, ArrowRightLeft, Plus, TrendingUp, Plane, PlaneTakeoff, PlaneLanding, Trash2, Search as SearchIcon, Briefcase, Star } from 'lucide-react';
import { airports } from '../../data/airports';
import { airlines } from '../../data/airlines';

// -------------------------------------------------------------
// REUSABLE AIRPORT AUTOCOMPLETE (Alphabetically Sorted)
// -------------------------------------------------------------
const AirportAutocomplete = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (val: string) => void, placeholder: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSearchTerm(value); }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  
  // Filter AND Sort alphabetically by City
  const filteredAirports = airports.filter(airport => {
    if (!normalizedSearch) return true; // Show all if clicked and empty
    const searchableText = `${airport.iata} - ${airport.city} ${airport.name} ${airport.country}`.toLowerCase();
    return searchableText.includes(normalizedSearch);
  })
  .sort((a, b) => a.city.localeCompare(b.city)) // Sorts alphabetically A-Z
  .slice(0, 50); // Limit results to prevent lag

  const handleSelect = (airport: typeof airports[0]) => {
    const formattedValue = `${airport.iata} - ${airport.city}`;
    setSearchTerm(formattedValue);
    onChange(formattedValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input 
          type="text" value={searchTerm} 
          onChange={(e) => { setSearchTerm(e.target.value); onChange(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
          autoComplete="off"
        />
        {isOpen ? (
          <SearchIcon size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
        ) : searchTerm && (
          <button type="button" onClick={() => {setSearchTerm(''); onChange(''); setIsOpen(true);}} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
            <Trash2 size={14} />
          </button>
        )}
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredAirports.length > 0 ? (
            <ul className="py-1">
              {filteredAirports.map((airport) => (
                <li key={airport.iata} onClick={() => handleSelect(airport)} className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex flex-col transition-colors border-b border-gray-50 last:border-0">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800 text-sm">{airport.city}</span>
                    <span className="text-xs font-bold bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded">{airport.iata}</span>
                  </div>
                  <span className="text-xs text-gray-500 mt-0.5">{airport.name}, {airport.country}</span>
                </li>
              ))}
            </ul>
          ) : (<div className="px-3 py-3 text-sm text-gray-500 text-center">No airports found.</div>)}
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// REUSABLE AIRLINE AUTOCOMPLETE (Alphabetically Sorted)
// -------------------------------------------------------------
const AirlineAutocomplete = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (val: string) => void, placeholder: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSearchTerm(value); }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  
  // Filter AND Sort alphabetically by Airline Name
  const filteredAirlines = airlines.filter(airline => {
    if (!normalizedSearch) return true;
    const searchableText = `${airline.name} (${airline.iata}) ${airline.country}`.toLowerCase();
    return searchableText.includes(normalizedSearch);
  })
  .sort((a, b) => a.name.localeCompare(b.name)) // Sorts alphabetically A-Z
  .slice(0, 50);

  const handleSelect = (airline: typeof airlines[0]) => {
    const formattedValue = airline.iata;
    setSearchTerm(formattedValue);
    onChange(formattedValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input 
          type="text" value={searchTerm} 
          onChange={(e) => { setSearchTerm(e.target.value); onChange(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
          autoComplete="off"
        />
        {isOpen ? (
          <SearchIcon size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
        ) : searchTerm && (
          <button type="button" onClick={() => {setSearchTerm(''); onChange(''); setIsOpen(true);}} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
            <Trash2 size={14} />
          </button>
        )}
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredAirlines.length > 0 ? (
            <ul className="py-1">
              {filteredAirlines.map((airline) => (
                <li key={airline.iata} onClick={() => handleSelect(airline)} className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors border-b border-gray-50 last:border-0">
                  <span className="font-semibold text-gray-800 text-sm truncate pr-2">{airline.name}</span>
                  <span className="text-xs font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded flex-shrink-0">{airline.iata}</span>
                </li>
              ))}
            </ul>
          ) : (<div className="px-3 py-3 text-sm text-gray-500 text-center">No airlines found.</div>)}
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// MAIN PAGE COMPONENT
// -------------------------------------------------------------
export default function FlightEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const isNew = id === 'new' || !id;

  const [legs, setLegs] = useState(isNew ? [{
    id: Date.now(),
    from: '',
    to: '',
    airline: '',
    flightNumber: '',
    depDate: '',
    depTime: '',
    arrDate: '',
    arrTime: '',
    duration: ''
  }] : [{
    id: Date.now(), 
    from: 'LHE - Lahore',
    to: 'DXB - Dubai',
    airline: 'PKA',
    flightNumber: id,
    depDate: '2026-07-20',
    depTime: '06:00',
    arrDate: '2026-07-21',
    arrTime: '08:30',
    duration: '3h 30m'
  }]);

  const [pricing, setPricing] = useState(isNew ? {
    economy: { adult: '', child: '', infant: '' },
    premium: { adult: '', child: '', infant: '' },
    business: { adult: '', child: '', infant: '' },
    first: { adult: '', child: '', infant: '' },
  } : {
    economy: { adult: '155.00', child: '116.00', infant: '39.00' },
    premium: { adult: '50.00', child: '50.00', infant: '50.00' },
    business: { adult: '450.00', child: '338.00', infant: '113.00' },
    first: { adult: '50.00', child: '50.00', infant: '50.00' },
  });

  const [baggage, setBaggage] = useState(isNew ? {
    checked: '', cabin: '', totalSeats: '0', availableSeats: '0'
  } : {
    checked: '70', cabin: '10', totalSeats: '1', availableSeats: '1'
  });

  const [amenities, setAmenities] = useState(isNew ? {
    wifi: false, meal: false, entertainment: false, power: false, refundable: false
  } : {
    wifi: true, meal: false, entertainment: true, power: true, refundable: false
  });

  const swapAirports = (index: number) => {
    const newLegs = [...legs];
    const temp = newLegs[index].from;
    newLegs[index].from = newLegs[index].to;
    newLegs[index].to = temp;
    setLegs(newLegs);
  };

  const updateLeg = (index: number, field: string, value: string) => {
    const newLegs = [...legs];
    newLegs[index] = { ...newLegs[index], [field]: value };
    setLegs(newLegs);
  };

  const updatePrice = (tier: keyof typeof pricing, field: string, value: string) => {
    setPricing({ ...pricing, [tier]: { ...pricing[tier], [field]: value } });
  };

  const addConnectingFlight = () => {
    setLegs((prevLegs) => {
      const lastLeg = prevLegs[prevLegs.length - 1];
      return [
        ...prevLegs,
        {
          id: Date.now() + Math.random(), 
          from: lastLeg ? lastLeg.to : '', 
          to: '',
          airline: lastLeg ? lastLeg.airline : '',
          flightNumber: '',
          depDate: lastLeg ? lastLeg.arrDate : '',
          depTime: '',
          arrDate: '',
          arrTime: '',
          duration: ''
        }
      ];
    });
  };

  const removeLeg = (idToRemove: number) => {
    if (legs.length > 1) setLegs(legs.filter((leg) => leg.id !== idToRemove));
  };

  const stopText = legs.length === 1 ? 'Direct Flight' : `${legs.length - 1} Stop${legs.length > 2 ? 's' : ''}`;

  return (
    <form className="space-y-6 max-w-6xl animate-in fade-in duration-300" onSubmit={(e) => { e.preventDefault(); navigate('/flights'); }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate('/flights')} className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">{isNew ? 'Add New Flight' : `Edit Flight: ${id}`}</h2>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Plane size={16} className="text-blue-500" /> Flight Information
          </h3>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${legs.length === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-[#fff3cd] text-[#856404]'}`}>
            {stopText}
          </span>
        </div>

        <div className="space-y-8">
          {legs.map((leg, index) => (
            <div key={leg.id} className="relative">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">{index + 1}</div>
                  <h4 className="font-semibold text-gray-800 text-sm">
                    {index === 0 ? 'Flight Leg 1' : `Connecting Flight ${index + 1}`}
                  </h4>
                </div>
                {legs.length > 1 && (
                  <button type="button" onClick={() => removeLeg(leg.id)} className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 transition-colors">
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                    <h5 className="font-bold text-primary-600 text-sm flex items-center gap-2">
                      <PlaneTakeoff size={16} /> Departure
                    </h5>
                    <div className="flex gap-2">
                      <button type="button" className="text-xs flex items-center gap-1 border border-gray-200 px-2 py-1 rounded bg-gray-50 text-gray-600 hover:bg-gray-100"><Copy size={12}/> Copy Route</button>
                      <button type="button" onClick={() => swapAirports(index)} className="text-xs flex items-center gap-1 border border-gray-200 px-2 py-1 rounded bg-gray-50 text-gray-600 hover:bg-gray-100"><ArrowRightLeft size={12}/> Swap Airports</button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <AirportAutocomplete label="From Airport *" value={leg.from} onChange={(val) => updateLeg(index, 'from', val)} placeholder="Search airport, city, or IATA..." />

                    <div className="grid grid-cols-2 gap-4">
                      <AirlineAutocomplete label="Airline *" value={leg.airline} onChange={(val) => updateLeg(index, 'airline', val)} placeholder="Search..." />
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Flight Number *</label>
                        <input type="text" value={leg.flightNumber} onChange={(e) => updateLeg(index, 'flightNumber', e.target.value)} placeholder="e.g. PK304" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
                        <input type="date" value={leg.depDate} onChange={(e) => updateLeg(index, 'depDate', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 text-gray-700" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Time *</label>
                        <input type="time" value={leg.depTime} onChange={(e) => updateLeg(index, 'depTime', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 text-gray-700" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                    <h5 className="font-bold text-primary-600 text-sm flex items-center gap-2">
                      <PlaneLanding size={16} /> Arrival
                    </h5>
                  </div>
                  <div className="space-y-4">
                    <AirportAutocomplete label="To Airport *" value={leg.to} onChange={(val) => updateLeg(index, 'to', val)} placeholder="Search airport, city, or IATA..." />

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Flight Duration <span className="text-gray-400 font-normal">(Auto-calculated)</span></label>
                      <input type="text" value={leg.duration} onChange={(e) => updateLeg(index, 'duration', e.target.value)} placeholder="Auto-calculated" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-gray-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
                        <input type="date" value={leg.arrDate} onChange={(e) => updateLeg(index, 'arrDate', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 text-gray-700" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Time *</label>
                        <input type="time" value={leg.arrTime} onChange={(e) => updateLeg(index, 'arrTime', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 text-gray-700" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addConnectingFlight} className="mt-6 flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
          <Plus size={16} /> Add Connecting Flight
        </button>
      </div>

      <div className="bg-[#eff6ff] rounded-xl shadow-sm border border-blue-100 p-6">
        <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-4"><TrendingUp size={16}/> Journey Summary</h3>
        
        {legs.map((leg) => (
          <div key={leg.id} className="bg-white border border-blue-100 rounded-lg p-3 flex justify-between items-center text-sm shadow-sm mb-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">
                  {leg.from ? leg.from.split(' - ')[0] : 'Origin'} <ArrowRightLeft size={12} className="inline mx-1 text-gray-400"/> {leg.to ? leg.to.split(' - ')[0] : 'Destination'}
                </span>
                <span className="text-gray-500 text-xs mt-0.5">
                  {leg.depTime || '--:--'} → {leg.arrTime || '--:--'} {leg.airline && `| ${leg.airline} ${leg.flightNumber}`}
                </span>
              </div>
            </div>
            <span className="text-blue-600 font-medium">{leg.duration || (isNew && !leg.from ? 'Calculating' : '0m')}</span>
          </div>
        ))}
        
        <div className="flex justify-between items-center border-t border-blue-200 pt-4 mt-2">
          <div>
            <p className="font-bold text-gray-800">Total Journey Time:</p>
            <p className="text-xs text-gray-500">{stopText}</p>
          </div>
          <p className="text-xl font-bold text-blue-700">{legs[0].duration || '0m'}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>
          Pricing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { key: 'economy', name: 'Economy Class', req: true },
            { key: 'premium', name: 'Premium Economy', req: false },
            { key: 'business', name: 'Business Class', req: false },
            { key: 'first', name: 'First Class', req: false }
          ].map((cls) => {
            const tierData = pricing[cls.key as keyof typeof pricing];
            return (
              <div key={cls.key} className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 text-sm">{cls.name} {cls.req && <span className="text-red-500">*</span>}</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Adult Price {cls.req && '*'}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400 text-sm">USD</span>
                      <input type="text" value={tierData.adult} onChange={(e) => updatePrice(cls.key as any, 'adult', e.target.value)} placeholder="0.00" className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Child Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400 text-sm">USD</span>
                      <input type="text" value={tierData.child} onChange={(e) => updatePrice(cls.key as any, 'child', e.target.value)} placeholder="0.00" className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Infant Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400 text-sm">USD</span>
                      <input type="text" value={tierData.infant} onChange={(e) => updatePrice(cls.key as any, 'infant', e.target.value)} placeholder="0.00" className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <Briefcase size={16} className="text-primary-500" /> Baggage & Seats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Checked Baggage</label>
            <input type="text" value={baggage.checked} onChange={(e) => setBaggage({...baggage, checked: e.target.value})} placeholder="e.g., 23kg" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Cabin Baggage</label>
            <input type="text" value={baggage.cabin} onChange={(e) => setBaggage({...baggage, cabin: e.target.value})} placeholder="e.g., 7kg" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Total Seats</label>
            <input type="number" value={baggage.totalSeats} onChange={(e) => setBaggage({...baggage, totalSeats: e.target.value})} placeholder="0" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Available Seats</label>
            <input type="number" value={baggage.availableSeats} onChange={(e) => setBaggage({...baggage, availableSeats: e.target.value})} placeholder="0" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 mb-10">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <Star size={16} className="text-primary-500" /> Amenities
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={amenities.wifi} onChange={(e) => setAmenities({...amenities, wifi: e.target.checked})} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4" /> WiFi Available</label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={amenities.meal} onChange={(e) => setAmenities({...amenities, meal: e.target.checked})} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4" /> Meal Service</label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={amenities.entertainment} onChange={(e) => setAmenities({...amenities, entertainment: e.target.checked})} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4" /> Entertainment System</label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={amenities.power} onChange={(e) => setAmenities({...amenities, power: e.target.checked})} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4" /> Power Outlet</label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={amenities.refundable} onChange={(e) => setAmenities({...amenities, refundable: e.target.checked})} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4" /> Refundable Ticket</label>
        </div>

        <div className="pt-8 mt-6 flex justify-end gap-3 pb-4">
          <button type="button" onClick={() => navigate('/flights')} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors">
            <Save size={16} /> {isNew ? 'Add Flight' : 'Update Flight'}
          </button>
        </div>
      </div>
    </form>
  );
}