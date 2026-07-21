import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CurrencyProvider } from './context/CurrencyContext'; 

// Layouts & Auth
import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Auth/Login';

// Dashboard
import DashboardHome from './pages/Dashboard/DashboardHome';

// Bookings Module
import BookingList from './pages/Bookings/BookingList';
import BookingEdit from './pages/Bookings/BookingEdit';
import InvoiceView from './pages/Bookings/InvoiceView';

// Flights Module
import FlightList from './pages/Flights/FlightList';
import FlightView from './pages/Flights/FlightView';
import FlightEdit from './pages/Flights/FlightEdit';
import AirlinesList from './pages/Flights/AirlinesList';
import AirportsList from './pages/Flights/AirportsList';

// Visa Module
import VisaList from './pages/Visa/VisaList';           
import VisaEdit from './pages/Visa/VisaEdit';           
import VisaSettings from './pages/Visa/VisaSettings';   

// Users Module
import UserList from './pages/Users/UserList';
import UserEdit from './pages/Users/UserEdit';

// Packages Module
import PackageList from './pages/Packages/PackageList';
import PackageEdit from './pages/Packages/PackageEdit';
import UmrahList from './pages/Umrah/UmrahList';

// Blog Module
import BlogList from './pages/Blog/BlogList';
import BlogEdit from './pages/Blog/BlogEdit';
import BlogCategories from './pages/Blog/BlogCategories';

// Reports Module
import BookingReports from './pages/Reports/BookingReports';
import UserReports from './pages/Reports/UserReports';
import TransactionReports from './pages/Reports/TransactionReports';
import TransactionView from './pages/Reports/TransactionView';

// Settings & Exchange Rates
import ExchangeRates from './pages/Settings/ExchangeRates';
import SettingsPage from './pages/Settings/SettingsPage';

// Other Modules
import HotelList from './pages/Hotels/HotelList';
import PaymentList from './pages/Payments/PaymentList';
import Modules from './pages/Integrations/modules';
import MediaLibrary from './pages/Media/MediaLibrary';

export default function App() {
  return (
    <CurrencyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<AdminLayout />}>
            <Route index element={<DashboardHome />} />
            
            {/* Bookings */}
            <Route path="bookings" element={<BookingList />} />
            <Route path="bookings/type/:moduleType" element={<BookingList />} />
            <Route path="bookings/edit/:id" element={<BookingEdit />} />
            <Route path="bookings/view/:id" element={<InvoiceView />} />
            
            {/* Flights */}
            <Route path="flights" element={<FlightList />} />
            <Route path="flights/view/:id" element={<FlightView />} />
            <Route path="flights/edit/:id" element={<FlightEdit />} />
            <Route path="flights/airlines" element={<AirlinesList />} />
            <Route path="flights/airports" element={<AirportsList />} />
            
            {/* Visas */}
            <Route path="visa" element={<VisaList />} />
            <Route path="visa/edit/:id" element={<VisaEdit />} />
            <Route path="visa/settings" element={<VisaSettings />} />

            {/* Users */}
            <Route path="users" element={<UserList />} />
            <Route path="users/role/:role" element={<UserList />} />
            <Route path="users/edit/:id" element={<UserEdit />} />
            
            {/* Packages / Umrah */}
            <Route path="packages" element={<PackageList />} />
            <Route path="packages/edit/:id" element={<PackageEdit />} />
            
            <Route path="umrah" element={<UmrahList />} />
            <Route path="umrah/edit/:id" element={<PackageEdit />} />
            
            {/* Blogs */}
            <Route path="blog" element={<BlogList />} />
            <Route path="blog/edit/:id" element={<BlogEdit />} />
            <Route path="blog/categories" element={<BlogCategories />} />

            {/* Reports */}
            <Route path="reports/bookings" element={<BookingReports />} />
            <Route path="reports/users" element={<UserReports />} />
            <Route path="reports/transactions" element={<TransactionReports />} />
            <Route path="reports/transactions/:id" element={<TransactionView />} />
            
            {/* Settings & Other Modules */}
            <Route path="settings" element={<SettingsPage />} />
            <Route path="settings/exchange-rates" element={<ExchangeRates />} />
            
            <Route path="hotels" element={<HotelList />} />
            <Route path="payments" element={<PaymentList />} />
            <Route path="modules" element={<Modules />} /> 
            <Route path="media" element={<MediaLibrary />} />
            
            <Route path="*" element={
              <div className="flex items-center justify-center h-64 text-gray-500 bg-white rounded-xl border border-gray-100 shadow-soft">
                This module could not be found or is currently under construction.
              </div>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </CurrencyProvider>
  );
}