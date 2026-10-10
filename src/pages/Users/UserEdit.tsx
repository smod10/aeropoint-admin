import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, User as UserIcon, Info, History, Bookmark,
  CreditCard, AlignLeft, Eye, EyeOff, Save, XCircle,
  CheckCircle2, Columns, ChevronDown,
  MapPin, Shield
} from 'lucide-react'; 
import { mockUsers } from '../../data/mockUsers';
import { mockBookings } from '../../data/mockBookings';
import { mockTransactions } from '../../data/mockTransactions';
import { useCurrency } from '../../context/CurrencyContext';
import type { Currency } from '../../context/CurrencyContext';
import { countries } from '../../data/countries';
import { canEditAccount, getCurrentActorRole, readAccountOverrides, saveAccountOverride } from '../../utils/accountAccess';
import apiClient from '../../services/apiClient';

type TabType = 'profile' | 'information' | 'activity' | 'bookings' | 'transactions' | 'notes';
type ActivityColumn = 'recordId' | 'details' | 'date';
type TransactionColumn = 'trxId' | 'type' | 'amount' | 'currency' | 'gatewayId' | 'description' | 'date';

export default function UserEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const accountOverrides = readAccountOverrides();
  const originalUser = isNew ? null : mockUsers.find(account => account.id === Number(id)) ?? null;
  const user = originalUser ? { ...originalUser, ...accountOverrides[originalUser.id] } : null;
  const actorRole = getCurrentActorRole();
  const relatedBookings = user ? mockBookings.filter(booking => booking.user.split('\n')[1]?.toLowerCase() === user.email.toLowerCase()) : [];
  const bookingRows = user ? (relatedBookings.length ? relatedBookings : [{
    id: `SAMPLE-${user.id}`, invoice: `SAMPLE-${user.id}`, moduleType: 'flights', booking: 'SAMPLE BOOKING',
    payment: 'PAID', price: '450.00', createdAt: user.createdAt, user: `${user.firstName} ${user.lastName}\n${user.email}`,
  }]) : [];
  const activityRows = user ? [
    { recordId: `ACT-${user.id}-01`, details: 'Account created', date: user.createdAt },
    ...bookingRows.map(booking => ({ recordId: `ACT-${booking.invoice}`, details: `${booking.moduleType} booking ${booking.invoice} ${booking.booking.split('\n')[0].toLowerCase()}`, date: booking.createdAt })),
  ] : [];
  const transactionRows = user ? [
    ...mockTransactions.filter(transaction => transaction.email.toLowerCase() === user.email.toLowerCase()),
    ...bookingRows.map(booking => ({
      id: `TRX-${booking.invoice}`,
      type: booking.payment === 'REFUNDED' ? 'Refund' : 'Booking payment',
      amount: booking.price,
      currency: 'USD',
      gateway: 'Booking payment',
      reference: booking.invoice,
      date: booking.createdAt,
    })),
  ] : [];
  const noteRows = user ? [{ recordId: `NOTE-${user.id}-01`, details: 'Customer profile reviewed during account onboarding.', date: user.createdAt }] : [];
  const { convertFromAndFormat } = useCurrency();

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [visibleActivityColumns, setVisibleActivityColumns] = useState<Record<ActivityColumn, boolean>>({
    recordId: true,
    details: true,
    date: true,
  });
  const [visibleTransactionColumns, setVisibleTransactionColumns] = useState<Record<TransactionColumn, boolean>>({
    trxId: true,
    type: true,
    amount: true,
    currency: true,
    gatewayId: true,
    description: true,
    date: true,
  });
  const [profile, setProfile] = useState(() => {
    const phoneParts = user?.phone ? user.phone.split(' ') : ['+234', ''];
    return {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phonePrefix: phoneParts[0],
      phoneNumber: phoneParts.slice(1).join(' '),
      status: user?.status ?? true,
    };
  });
  const [isSaved, setIsSaved] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveError, setSaveError] = useState('');

  const phonePrefix = profile.phonePrefix;
  const phoneNumber = profile.phoneNumber;

  const saveProfile = async () => {
    if (!user || !canEditAccount(actorRole, user)) return;
    setSaveError('');
    if (password && password.length < 15) {
      setSaveError('Use a new password with at least 15 characters.');
      return;
    }
    if (password && password !== passwordConfirmation) {
      setSaveError('The new passwords do not match.');
      return;
    }
    if (password) {
      try {
        await apiClient.put(`/users/${user.id}/password`, { password });
      } catch (requestError) {
        setSaveError(requestError instanceof Error ? requestError.message : 'Could not update the password.');
        return;
      }
    }
    saveAccountOverride(user.id, {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: `${profile.phonePrefix} ${profile.phoneNumber}`.trim(),
      status: profile.status,
    });
    setPassword('');
    setPasswordConfirmation('');
    setIsSaved(true);
  };

  const toggleActivityColumn = (column: ActivityColumn) => {
    setVisibleActivityColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  const toggleTransactionColumn = (column: TransactionColumn) => {
    setVisibleTransactionColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  if (!isNew && !user) {
    return <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">Account not found.</div>;
  }

  if (user && !canEditAccount(actorRole, user)) {
    return <div role="alert" className="rounded-lg border border-secondary-200 bg-white p-8 text-center"><h2 className="text-lg font-semibold text-gray-900">Edit access restricted</h2><p className="mt-2 text-sm text-gray-600">Your role cannot edit this account.</p><button onClick={() => navigate(-1)} className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Go back</button></div>;
  }

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in duration-300 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{isNew ? 'New User' : `User ID: ${user?.id}`}</h2>
            {!isNew && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1"><Info size={12}/> {user?.uid}</span> • <span>{user?.email}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Status</label>
            <select value={profile.status ? 'active' : 'inactive'} onChange={event => { setIsSaved(false); setProfile(current => ({ ...current, status: event.target.value === 'active' })); }} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none w-full md:w-32">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Banned Status</label>
            <select defaultValue={isNew ? 'no' : (user?.banned ? 'yes' : 'no')} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none w-full md:w-32">
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className={`grid grid-cols-1 gap-6 ${isNew ? '' : 'lg:grid-cols-3'}`}>
        
        {/* Left Area: Tabs & Form Content */}
        <div className={`${isNew ? '' : 'lg:col-span-2'} bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden flex flex-col min-h-[600px]`}>
          
          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-100 pt-2 overflow-x-auto hide-scrollbar bg-gray-50/50 px-2">
            {[
              { id: 'profile', label: 'Profile', icon: UserIcon },
              { id: 'information', label: 'Information', icon: Info },
              { id: 'activity', label: 'Activity', icon: History },
              { id: 'bookings', label: 'Bookings', icon: Bookmark, badge: isNew ? '0' : String(bookingRows.length) },
              { id: 'transactions', label: 'Transactions', icon: CreditCard },
              { id: 'notes', label: 'Notes', icon: AlignLeft }
            ].filter(tab => !isNew || tab.id === 'profile').map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? 'border-primary-600 text-primary-600 bg-white rounded-t-lg' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={16} /> {tab.label}
                {tab.badge && <span className="bg-gray-200 text-gray-700 text-[10px] px-2 py-0.5 rounded-full">{tab.badge}</span>}
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="p-6 lg:p-8 flex-1">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4"><UserIcon size={16} className="text-gray-500"/> Personal Information</h3>
                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">First Name</label><input type="text" value={profile.firstName} onChange={event => { setIsSaved(false); setProfile(current => ({ ...current, firstName: event.target.value })); }} placeholder="Enter first name" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500" /></div>
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label><input type="text" value={profile.lastName} onChange={event => { setIsSaved(false); setProfile(current => ({ ...current, lastName: event.target.value })); }} placeholder="Enter last name" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Email</label><input type="email" value={profile.email} onChange={event => { setIsSaved(false); setProfile(current => ({ ...current, email: event.target.value })); }} placeholder="email@example.com" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500" /></div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                      <div className="flex gap-2">
                        <select value={phonePrefix} onChange={event => { setIsSaved(false); setProfile(current => ({ ...current, phonePrefix: event.target.value })); }} className="w-28 bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none">
                          {countries.map((c, idx) => (
                            <option key={`phone-${c.code}-${idx}`} value={c.dialCode}>
                              {c.code} {c.dialCode}
                            </option>
                          ))}
                        </select>
                        <input type="text" value={phoneNumber} onChange={event => { setIsSaved(false); setProfile(current => ({ ...current, phoneNumber: event.target.value })); }} placeholder="Phone number" className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-orange-800 flex items-center gap-2 mb-4"><Shield size={16} /> Security</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-xs font-medium text-gray-700">New password (leave blank to keep current password)<span className="relative mt-1 block"><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={15} value={password} onChange={event => { setIsSaved(false); setPassword(event.target.value); }} placeholder="Enter new password to change" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-11 text-sm outline-none focus:border-primary-500" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(current => !current)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-gray-500 hover:bg-gray-100">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span><span className="mt-1 block font-normal text-gray-500">Use at least 15 characters. Password is sent to the account service and is not stored here.</span></label>
                    <label className="block text-xs font-medium text-gray-700">Confirm new password<input type="password" autoComplete="new-password" minLength={15} value={passwordConfirmation} onChange={event => { setIsSaved(false); setPasswordConfirmation(event.target.value); }} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500" /></label>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4"><MapPin size={16} className="text-gray-500"/> Address Information</h3>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                  <textarea rows={3} placeholder="Street address..." className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 resize-none mb-4" />
                  <div className="grid grid-cols-2 gap-6">
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">City</label><input type="text" placeholder="City" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500" /></div>
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">State</label><input type="text" placeholder="State/Province" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500" /></div>
                  </div>
                </div>
              </div>
            )}

            {/* INFORMATION TAB */}
            {activeTab === 'information' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6"><Info size={16} className="text-gray-500"/> User Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">USER ID</p>
                    <p className="text-sm font-mono text-gray-800">{isNew ? 'Pending Creation' : user?.uid}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">EMAIL VERIFIED</p>
                    {!isNew && user?.verified ? (
                      <p className="text-sm font-medium text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14}/> Verified</p>
                    ) : (
                      <p className="text-sm font-medium text-red-500 flex items-center gap-1"><XCircle size={14}/> Not Verified</p>
                    )}
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">ACCOUNT STATUS</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isNew || user?.status ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {isNew || user?.status ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">LOGIN ATTEMPTS</p>
                    <p className="text-sm font-medium text-gray-800">0</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">CREATED AT</p>
                    <p className="text-sm font-medium text-gray-800">{isNew ? 'Not Created Yet' : user?.createdAt}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">UPDATED AT</p>
                    <p className="text-sm font-medium text-gray-800">{isNew ? 'Not Updated Yet' : user?.createdAt}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">LAST LOGIN</p>
                    <p className="text-sm font-medium text-gray-800">Never</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">TIMEZONE</p>
                    <p className="text-sm font-medium text-gray-800">UTC</p>
                  </div>
                </div>
              </div>
            )}

            {/* ACCOUNT RECORDS */}
            {['activity', 'bookings', 'transactions', 'notes'].includes(activeTab) && (
              <div className="animate-in fade-in h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 capitalize">{activeTab} Logs</h3>
                    <p className="text-sm text-gray-500">Total: {activeTab === 'activity' ? activityRows.length : activeTab === 'transactions' ? transactionRows.length : activeTab === 'notes' ? noteRows.length : relatedBookings.length} records</p>
                  </div>
                  <div className="relative">
                    <button type="button" onClick={() => setIsColumnMenuOpen(prev => !prev)} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50">
                      <Columns size={14} /> View Columns <ChevronDown size={14} />
                    </button>
                    {isColumnMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2">
                        {activeTab === 'transactions' && [
                          { key: 'trxId', label: 'TRX ID' },
                          { key: 'type', label: 'Type' },
                          { key: 'amount', label: 'Amount' },
                          { key: 'currency', label: 'Currency' },
                          { key: 'gatewayId', label: 'Gateway ID' },
                          { key: 'description', label: 'Description' },
                          { key: 'date', label: 'Date' },
                        ].map(col => (
                          <label key={col.key} className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                            <input type="checkbox" checked={visibleTransactionColumns[col.key as TransactionColumn]} onChange={() => toggleTransactionColumn(col.key as TransactionColumn)} className="rounded border-gray-300" />
                            <span>{col.label}</span>
                          </label>
                        ))}

                        {activeTab !== 'transactions' && [
                          { key: 'recordId', label: 'Record ID' },
                          { key: 'details', label: 'Details' },
                          { key: 'date', label: 'Date' },
                        ].map(col => (
                          <label key={col.key} className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                            <input type="checkbox" checked={visibleActivityColumns[col.key as ActivityColumn]} onChange={() => toggleActivityColumn(col.key as ActivityColumn)} className="rounded border-gray-300" />
                            <span>{col.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap mb-8 border-b border-gray-200">
                    <thead className="text-[10px] text-gray-500 uppercase bg-white border-b border-gray-200 font-bold tracking-wider">
                      {activeTab === 'transactions' ? <tr><th className="px-4 py-3 w-10">#</th>{visibleTransactionColumns.trxId && <th className="px-4 py-3">TRX ID</th>}{visibleTransactionColumns.type && <th className="px-4 py-3">TYPE</th>}{visibleTransactionColumns.amount && <th className="px-4 py-3">AMOUNT</th>}{visibleTransactionColumns.currency && <th className="px-4 py-3">CURRENCY</th>}{visibleTransactionColumns.gatewayId && <th className="px-4 py-3">REFERENCE</th>}{visibleTransactionColumns.description && <th className="px-4 py-3">GATEWAY</th>}{visibleTransactionColumns.date && <th className="px-4 py-3">DATE</th>}</tr> : <tr><th className="px-4 py-3 w-10">#</th>{visibleActivityColumns.recordId && <th className="px-4 py-3">RECORD ID</th>}{visibleActivityColumns.details && <th className="px-4 py-3">DETAILS</th>}{visibleActivityColumns.date && <th className="px-4 py-3">DATE</th>}</tr>}
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {activeTab === 'transactions' && transactionRows.map((row, index) => <tr key={row.id}><td className="px-4 py-3">{index + 1}</td>{visibleTransactionColumns.trxId && <td className="px-4 py-3 font-mono">{row.id}</td>}{visibleTransactionColumns.type && <td className="px-4 py-3">{row.type}</td>}{visibleTransactionColumns.amount && <td className="px-4 py-3">{convertFromAndFormat(Number(row.amount.replace(/,/g, '')), row.currency as Currency)}</td>}{visibleTransactionColumns.currency && <td className="px-4 py-3">{row.currency}</td>}{visibleTransactionColumns.gatewayId && <td className="px-4 py-3">{row.reference}</td>}{visibleTransactionColumns.description && <td className="px-4 py-3">{row.gateway}</td>}{visibleTransactionColumns.date && <td className="px-4 py-3">{row.date}</td>}</tr>)}
                      {activeTab !== 'transactions' && (activeTab === 'activity' ? activityRows : activeTab === 'notes' ? noteRows : bookingRows.map(booking => ({ recordId: booking.invoice, details: `${booking.moduleType} · ${booking.booking.split('\n')[0]} · ${booking.payment} · ${convertFromAndFormat(Number(booking.price), 'USD')}`, date: booking.createdAt }))).map((row, index) => <tr key={row.recordId}><td className="px-4 py-3">{index + 1}</td>{visibleActivityColumns.recordId && <td className="px-4 py-3 font-mono">{row.recordId}</td>}{visibleActivityColumns.details && <td className="px-4 py-3">{row.details}</td>}{visibleActivityColumns.date && <td className="px-4 py-3">{row.date}</td>}</tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          
          {activeTab === 'profile' && (
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 mt-auto">
              {saveError && <span role="alert" className="mr-auto self-center text-sm text-red-700">{saveError}</span>}
              <button type="button" onClick={saveProfile} className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors">
                <Save size={16} /> Save Profile Changes
              </button>
              {isSaved && <span role="status" className="self-center text-sm font-medium text-emerald-700">Profile saved</span>}
            </div>
          )}
        </div>

        {!isNew && <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col justify-between h-24">
                <div className="flex items-center gap-2 text-blue-600"><Bookmark size={16}/> <span className="text-xs font-bold uppercase">Bookings</span></div>
                <span className="text-2xl font-black text-blue-900">{bookingRows.length}</span>
              </div>
              <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 flex flex-col justify-between h-24">
                <div className="flex items-center gap-2 text-orange-600"><History size={16}/> <span className="text-xs font-bold uppercase">Activities</span></div>
                <span className="text-2xl font-black text-orange-900">{activityRows.length}</span>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex flex-col justify-between h-24">
                <div className="flex items-center gap-2 text-emerald-600"><CreditCard size={16}/> <span className="text-xs font-bold uppercase">Transactions</span></div>
                <span className="text-2xl font-black text-emerald-900">{transactionRows.length}</span>
              </div>
              <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 flex flex-col justify-between h-24">
                <div className="flex items-center gap-2 text-purple-600"><AlignLeft size={16}/> <span className="text-xs font-bold uppercase">Notes</span></div>
                <span className="text-2xl font-black text-purple-900">{noteRows.length}</span>
              </div>
            </div>
          </div>
        </div>}

      </div>
    </div>
  );
}