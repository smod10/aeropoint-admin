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

// Other Modules
import HotelList from './pages/Hotels/HotelList';
import PackageList from './pages/Packages/PackageList';
import VisaList from './pages/Visa/VisaList';
import UmrahList from './pages/Umrah/UmrahList';
import CustomerList from './pages/Customers/CustomerList';
import PaymentList from './pages/Payments/PaymentList';
import ApiIntegrations from './pages/Integrations/ApiIntegrations';
import BlogList from './pages/Blog/BlogList';
import MediaLibrary from './pages/Media/MediaLibrary';
import ReportsDashboard from './pages/Reports/ReportsDashboard';
import SettingsPage from './pages/Settings/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route (No Sidebar/Header) */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes (Includes Sidebar/Header) */}
        <Route path="/" element={<AdminLayout />}>
          
          {/* Main Dashboard */}
          <Route index element={<DashboardHome />} />
          
          {/* Core Booking Master List */}
          <Route path="bookings" element={<BookingList />} />
          
          {/* Nested Flights Management */}
          <Route path="flights" element={<FlightList />} />
          <Route path="flights/view/:id" element={<FlightView />} />
          <Route path="flights/edit/:id" element={<FlightEdit />} />
          <Route path="flights/airlines" element={<AirlinesList />} />
          <Route path="flights/airports" element={<AirportsList />} />
          
          {/* Other Modules */}
          <Route path="hotels" element={<HotelList />} />
          <Route path="packages" element={<PackageList />} />
          <Route path="visa" element={<VisaList />} />
          <Route path="umrah" element={<UmrahList />} />
          
          {/* CRM & Finance */}
          <Route path="customers" element={<CustomerList />} />
          <Route path="payments" element={<PaymentList />} />
          
          {/* Configuration & Content */}
          <Route path="integrations" element={<ApiIntegrations />} />
          <Route path="blog" element={<BlogList />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="reports" element={<ReportsDashboard />} />
          <Route path="settings" element={<SettingsPage />} />
          
          {/* Catch-all 404 Route */}
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