import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, Plane, Briefcase, Download, Mail,
  Home, Clock, Ban, Users, PackagePlus, Building2, MapPin,
  Flag, FileCheck, Moon, Bus, CheckCircle2
} from 'lucide-react';
import { mockBookings } from '../../data/mockBookings'; 
import { useCurrency } from '../../context/CurrencyContext';

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { convertFromAndFormat } = useCurrency();

  // Find the booking in our DB
  const booking = mockBookings.find(b => b.invoice === id) || mockBookings[0];
  const { details } = booking; 

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in duration-300 pb-10">
      <div className="text-sm text-gray-500 flex items-center gap-2 mb-2">
        <span className="hover:text-primary-600 cursor-pointer capitalize" onClick={() => navigate(`/bookings/type/${booking.moduleType}`)}>{booking.moduleType}</span> 
        <span>›</span> 
        <span className="font-semibold text-gray-800">Invoice #{booking.invoice}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Invoice Info Card */}
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6 pb-2 border-b border-gray-100"><FileText size={16} className="text-gray-500" /> Invoice Details</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Invoice Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Invoice ID:</span><span className="font-bold text-gray-900">#{booking.invoice}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Booking Date:</span><span className="font-medium text-gray-900">{booking.createdAt}</span></div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-medium text-gray-900">{booking.user.split('\n')[0]}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Email:</span><span className="font-medium text-gray-900">{booking.user.split('\n')[1]}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Status:</span><span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Registered</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC CARD RENDERING BASED ON MODULE TYPE */}

          {/* --- FLIGHTS DETAILS --- */}
          {booking.moduleType === 'flights' && (
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6 pb-2 border-b border-gray-100"><Plane size={16} className="text-gray-500" /> Flight Details</h3>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50"><Plane size={24} className="text-blue-600" /></div>
                <div><h4 className="font-bold text-gray-900">{details.provider}</h4><p className="text-xs text-gray-500">{details.code} • {details.class}</p></div>
              </div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{details.from}</h2>
                  <p className="text-xs text-gray-500 max-w-[200px]">{details.fromName}</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">{details.depTime}</p>
                </div>
                <div className="flex-1 px-8 flex flex-col items-center relative">
                  <span className="text-[10px] font-bold text-gray-400 mb-1">{details.duration}</span>
                  <div className="w-full border-t-2 border-dashed border-gray-300 relative"><Plane size={16} className="text-primary-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" /></div>
                  <span className="text-[10px] font-bold text-emerald-500 mt-1">{details.type}</span>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-black text-gray-900">{details.to}</h2>
                  <p className="text-xs text-gray-500 max-w-[200px] ml-auto">{details.toName}</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">{details.arrTime}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Baggage Allowance</p>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2"><Briefcase size={14} className="text-gray-400"/> {details.baggage}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Additional Information</p>
                  <p className="text-sm text-red-600 font-bold flex items-center gap-2"><Ban size={14}/> Non-refundable</p>
                </div>
              </div>
            </div>
          )}

          {/* --- STAYS (HOTEL) DETAILS --- */}
          {booking.moduleType === 'stays' && (
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6 pb-2 border-b border-gray-100"><Building2 size={16} className="text-gray-500" /> Accommodation Details</h3>
              <div className="mb-6">
                <h4 className="text-xl font-bold text-gray-900">{details.hotel}</h4>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={14} /> {details.location}</p>
                <div className="text-yellow-500 mt-2 text-sm tracking-widest">{'★'.repeat(details.stars ?? 0)}</div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-gray-100 pt-6 mb-6">
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Check In</p><p className="font-bold text-gray-900 text-sm">{details.checkIn}</p></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Check Out</p><p className="font-bold text-gray-900 text-sm">{details.checkOut}</p></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Duration</p><p className="font-bold text-gray-900 text-sm">{details.nights} Nights</p></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Guests</p><p className="font-bold text-gray-900 text-sm">{details.guests}</p></div>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex justify-between items-center">
                <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Room Reserved</p><p className="font-bold text-gray-900">{details.room}</p></div>
                <div className="text-right"><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Board Basis</p><p className="font-bold text-emerald-600">{details.board}</p></div>
              </div>
            </div>
          )}

          {/* --- TOURS DETAILS --- */}
          {booking.moduleType === 'tours' && (
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6 pb-2 border-b border-gray-100"><Flag size={16} className="text-gray-500" /> Tour Details</h3>
              <div className="mb-6">
                <h4 className="text-xl font-bold text-gray-900">{details.tour}</h4>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={14} /> {details.location}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6 mb-6">
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Date & Time</p><p className="font-bold text-gray-900 text-sm">{details.date} • {details.time}</p></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Duration</p><p className="font-bold text-gray-900 text-sm">{details.duration}</p></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Meeting Point</p><p className="font-bold text-gray-900 text-sm">{details.meetingPoint}</p></div>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Inclusions</p>
                <p className="text-sm font-medium text-gray-800">{details.inclusions}</p>
              </div>
            </div>
          )}

          {/* --- VISA DETAILS --- */}
          {booking.moduleType === 'visa' && (
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6 pb-2 border-b border-gray-100"><FileCheck size={16} className="text-gray-500" /> Visa Application Details</h3>
              <div className="mb-6">
                <h4 className="text-xl font-bold text-gray-900">Destination: {details.country}</h4>
                <p className="text-sm text-gray-500 mt-1">Application processed via internal module.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-100 pt-6 mb-6">
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Visa Type</p><p className="font-bold text-gray-900 text-sm">{details.visaType}</p></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Entry</p><p className="font-bold text-gray-900 text-sm">{details.entry}</p></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Duration</p><p className="font-bold text-gray-900 text-sm">{details.duration}</p></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Processing</p><p className="font-bold text-gray-900 text-sm">{details.processing}</p></div>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex justify-between items-center">
                <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Primary Applicant</p><p className="font-bold text-gray-900">{details.applicant}</p></div>
                <div className="text-right"><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Passport Number</p><p className="font-bold text-gray-900 font-mono tracking-widest">{details.passport}</p></div>
              </div>
            </div>
          )}

          {/* --- UMRAH DETAILS --- */}
          {booking.moduleType === 'umrah' && (
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6 pb-2 border-b border-gray-100"><Moon size={16} className="text-gray-500" /> Umrah Package Details</h3>
              <div className="mb-6">
                <h4 className="text-xl font-bold text-gray-900">{details.package}</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-6 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Makkah Accommodation</p>
                  <p className="font-bold text-gray-900 text-sm">{details.makkahHotel}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Madinah Accommodation</p>
                  <p className="font-bold text-gray-900 text-sm">{details.madinahHotel}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Transport</p><p className="font-bold text-gray-900 text-sm">{details.transport}</p></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Visa Included</p><p className="font-bold text-emerald-600 text-sm">{details.visaIncluded}</p></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Flights Included</p><p className="font-bold text-red-600 text-sm">{details.flightsIncluded}</p></div>
              </div>
            </div>
          )}

          {/* --- BUS DETAILS --- */}
          {booking.moduleType === 'bus' && (
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6 pb-2 border-b border-gray-100"><Bus size={16} className="text-gray-500" /> Bus Travel Details</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50"><Bus size={24} className="text-blue-600" /></div>
                <div><h4 className="font-bold text-gray-900">{details.operator}</h4><p className="text-xs text-gray-500">{details.busType}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-6 border-t border-gray-100 pt-6 mb-6">
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Departure</p><p className="font-bold text-gray-900 text-sm">{details.from}</p><p className="text-xs text-gray-500">{details.depDate} • {details.depTime}</p></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Arrival</p><p className="font-bold text-gray-900 text-sm">{details.to}</p><p className="text-xs text-gray-500">{details.arrTime} (Est.)</p></div>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex justify-between items-center">
                <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Seat Number</p><p className="font-bold text-gray-900">{details.seat}</p></div>
              </div>
            </div>
          )}

          {/* Combined Passenger & Ancillary Section */}
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 space-y-8">
            <div>
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                <Users size={16} className="text-gray-500" /> Passenger Information
              </h3>
              <div className="overflow-x-auto border border-gray-100 rounded-lg">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50/80 text-[11px] text-gray-500 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3 border-b border-gray-100">Passenger Name</th>
                      <th className="px-4 py-3 border-b border-gray-100">Type</th>
                      <th className="px-4 py-3 border-b border-gray-100">Nationality</th>
                      <th className="px-4 py-3 border-b border-gray-100">e-Ticket / Document Ref.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {booking.passengers.map((p, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                        <td className="px-4 py-3">{p.type}</td>
                        <td className="px-4 py-3">{p.nationality}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.document}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                <PackagePlus size={16} className="text-gray-500" /> Ancillary Services & Extras
              </h3>
              {booking.ancillaries.length > 0 ? (
                <div className="space-y-3">
                  {booking.ancillaries.map((a, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-gray-50/80 border border-gray-100 rounded-lg">
                      <div><p className="text-sm font-bold text-gray-800">{a.name}</p><p className="text-xs text-gray-500 mt-0.5">Applied to booking</p></div>
                      <span className="font-medium text-gray-900 bg-white px-3 py-1 rounded border border-gray-200">
                        {a.price === 'Included' ? 'Included' : convertFromAndFormat(Number(a.price), 'USD')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-gray-400 italic">No extra services booked.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6 pb-2 border-b border-gray-100"><FileText size={16} className="text-gray-500" /> Payments Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center bg-orange-50 border border-orange-100 p-3 rounded-lg">
                <span className="flex items-center gap-2 text-sm text-orange-800"><Clock size={16} className="text-orange-500"/> Booking Status:</span>
                <span className="font-bold text-orange-700">{booking.booking.split('\n')[0]}</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                <span className="flex items-center gap-2 text-sm text-emerald-800"><CheckCircle2 size={16} className="text-emerald-500"/> Payment Status:</span>
                <span className="font-bold text-emerald-700">{booking.payment}</span>
              </div>
            </div>

            <div className="space-y-3 text-sm mb-6 border-b border-gray-100 pb-6">
              <div className="flex justify-between"><span className="text-gray-500">Base Fare:</span><span className="font-medium text-gray-900">{convertFromAndFormat(Number(booking.price) - 5, 'USD')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Taxes & Fees:</span><span className="font-medium text-gray-900">{convertFromAndFormat(5, 'USD')}</span></div>
            </div>

            <div className="flex justify-between items-end mb-8">
              <span className="font-bold text-gray-800">Total Amount:</span>
              <span className="text-2xl font-black text-gray-900">{convertFromAndFormat(Number(booking.price), 'USD')}</span>
            </div>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
                <Download size={16} /> Download Invoice
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
                <Mail size={16} /> Resend Invoice to Email
              </button>
              <button onClick={() => navigate('/')} className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-600 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors mt-6">
                <Home size={16} /> Back to Homepage
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}