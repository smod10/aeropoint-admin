import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts & Auth
import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Auth/Login';

// Pages
import DashboardHome from './pages/Dashboard/DashboardHome';
import BookingList from './pages/Bookings/BookingList';

// Flights Module
import FlightList from './pages/Flights/FlightList';
import FlightView from './pages/Flights/FlightView';
import FlightEdit from './pages/Flights/FlightEdit';
import AirlinesList from './pages/Flights/AirlinesList';
import AirportsList from './pages/Flights/AirportsList';

// Visa Module
import VisaList from './pages/Visa/VisaList';           // New Main Page
import VisaEdit from './pages/Visa/VisaEdit';           // New Add/Edit form
import VisaSettings from './pages/Visa/VisaSettings';   // Formerly your old VisaList.tsx

// Other Modules
import HotelList from './pages/Hotels/HotelList';
import PackageList from './pages/Packages/PackageList';
import UmrahList from './pages/Umrah/UmrahList';
import CustomerList from './pages/Customers/CustomerList';
import PaymentList from './pages/Payments/PaymentList';
import Modules from './pages/Integrations/modules';
import BlogList from './pages/Blog/BlogList';
import MediaLibrary from './pages/Media/MediaLibrary';
import ReportsDashboard from './pages/Reports/ReportsDashboard';
import SettingsPage from './pages/Settings/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="bookings" element={<BookingList />} />
          
          <Route path="flights" element={<FlightList />} />
          <Route path="flights/view/:id" element={<FlightView />} />
          <Route path="flights/edit/:id" element={<FlightEdit />} />
          <Route path="flights/airlines" element={<AirlinesList />} />
          <Route path="flights/airports" element={<AirportsList />} />
          
          {/* New Nested Visa Routes */}
          <Route path="visa" element={<VisaList />} />
          <Route path="visa/edit/:id" element={<VisaEdit />} />
          <Route path="visa/settings" element={<VisaSettings />} />
          
          <Route path="hotels" element={<HotelList />} />
          <Route path="packages" element={<PackageList />} />
          <Route path="umrah" element={<UmrahList />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="payments" element={<PaymentList />} />
          <Route path="modules" element={<Modules />} /> 
          <Route path="blog" element={<BlogList />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="reports" element={<ReportsDashboard />} />
          <Route path="settings" element={<SettingsPage />} />
          
          <Route path="*" element={
            <div className="flex items-center justify-center h-64 text-gray-500 bg-white rounded-xl border border-gray-100 shadow-soft">
              This module could not be found or is currently under construction.
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;