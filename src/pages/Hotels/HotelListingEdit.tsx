import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BedDouble, CheckCircle2, Columns, Edit2, Image as ImageIcon, ImagePlus, Info, Mail, MapPin, Plus, Save, Search, Sparkles, Star, Trash2, X } from 'lucide-react';
import { createBlankHotel, createBlankRoom, hotelDuplicateKey, readHotelListings, saveHotelListing, supportedCurrencies } from '../../utils/hotelStorage';
import { readActiveStayNames } from '../../utils/stayStorage';
import { canManageTeam, getCurrentActorRole } from '../../utils/accountAccess';
import { destinations, findDestination } from '../../data/destinations';
import { findHotelOwner, hotelOwners } from '../../data/hotelOwners';
import { sanitizeHtml } from '../../utils/richText';
import { processImageFiles } from '../../utils/imageUpload';
import { getTripadvisorSearchEndpoint, searchTripadvisor } from '../../services/tripadvisorApi';
import { useCurrency } from '../../context/CurrencyContext';
import RichTextEditor from '../../components/Shared/RichTextEditor';
import SlideOver from '../../components/Shared/SlideOver';
import ToggleSwitch from '../../components/Shared/ToggleSwitch';
import HotelRoomForm from './HotelRoomForm';
import type { TripadvisorMatch } from '../../services/tripadvisorApi';
import type { Currency } from '../../context/CurrencyContext';
import type { HotelListing, HotelRoom } from '../../types/hotel';
const sections = [
  { id: 'general', label: 'General Info', icon: Info },
  { id: 'rooms', label: 'Rooms', icon: BedDouble },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'contact', label: 'Contact', icon: Mail },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'amenities', label: 'Amenities', icon: Sparkles },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'reviews', label: 'Reviews', icon: Star },
] as const;

const errorSection: Record<string, string> = { name: 'general', category: 'general', discount: 'general', age: 'general', duplicate: 'general', city: 'location', address: 'location', latitude: 'location', longitude: 'location', email: 'contact', website: 'contact', rooms: 'rooms', tripadvisor: 'reviews' };

const inputClass = 'mt-1.5 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500';
const panelClass = 'rounded-lg bg-gray-50 p-4';
const sectionClass = 'scroll-mt-24 border-t border-gray-100 p-6 first:border-t-0';

const ratingSteps = Array.from({ length: 21 }, (_, index) => String(index * 0.5));
const ratingLabel = (value: string) => Number(value) % 1 === 0 ? Number(value).toFixed(1) : String(Number(value));

export default function HotelListingEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { convertToNGNAndFormat } = useCurrency();
  const canManage = canManageTeam(getCurrentActorRole());
  const isNew = !id || id === 'new';
  const existing = useMemo(() => isNew ? undefined : readHotelListings().find(hotel => hotel.id === id), [id, isNew]);
  const [hotel, setHotel] = useState<HotelListing>(() => existing ?? createBlankHotel());
  const initialSnapshot = useRef(JSON.stringify(hotel));
  const settings = useMemo(() => ({
    accommodation: readActiveStayNames('accommodation'),
    amenities: readActiveStayNames('stayAmenity'),
    roomTypes: readActiveStayNames('roomType'),
    roomAmenities: readActiveStayNames('roomAmenity'),
    boards: readActiveStayNames('board'),
  }), []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<string>('general');
  const [ownerQuery, setOwnerQuery] = useState('');
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [roomEditor, setRoomEditor] = useState<HotelRoom>();
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
  const [roomColumns, setRoomColumns] = useState({ status: true, image: true, roomType: true, price: true });
  const [roomColumnMenu, setRoomColumnMenu] = useState(false);
  const [imageErrors, setImageErrors] = useState<string[]>([]);
  const [dropActive, setDropActive] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const [taName, setTaName] = useState<string>();
  const [taCity, setTaCity] = useState<string>();
  const [taResults, setTaResults] = useState<TripadvisorMatch[]>([]);
  const [taStatus, setTaStatus] = useState('');
  const [taLoading, setTaLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      if (scrollPosition >= documentHeight - 60) {
        setActiveSection(sections[sections.length - 1].id);
        return;
      }

      const offset = 140;
      let currentSection = sections[0].id;
      for (const section of sections) {
        const el = document.getElementById(`hotel-section-${section.id}`);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= offset) {
            currentSection = section.id;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const update = <K extends keyof HotelListing>(key: K, value: HotelListing[K]) => setHotel(current => ({ ...current, [key]: value }));
  const fieldError = (key: string) => errors[key] ? <p role="alert" className="mt-1 text-xs text-red-700">{errors[key]}</p> : null;
  const goTo = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`hotel-section-${sectionId}`);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const destination = findDestination(hotel.city);
  const owner = findHotelOwner(hotel.ownerId);
  const ownerMatches = hotelOwners.filter(candidate => `${candidate.name} ${candidate.email}`.toLowerCase().includes(ownerQuery.trim().toLowerCase())).slice(0, 6);
  const locationMatches = destinations.filter(item => item.name.toLowerCase().includes(hotel.city.trim().toLowerCase())).slice(0, 6);
  const typeOptions = Array.from(new Set([...settings.accommodation, hotel.category]));
  const amenityOptions = Array.from(new Set([...settings.amenities, ...hotel.amenities]));
  const ratingValue = String(hotel.rating);
  const ratingOptions = ratingSteps.includes(ratingValue) ? ratingSteps : [...ratingSteps, ratingValue].sort((left, right) => Number(left) - Number(right));
  const active = hotel.status === 'Published';

  const setActive = (next: boolean) => update('status', next ? 'Published' : isNew || existing?.status === 'Draft' ? 'Draft' : 'Unpublished');

  const chooseDestination = (item: (typeof destinations)[number]) => {
    setHotel(current => ({ ...current, city: item.name, country: item.country, latitude: item.latitude, longitude: item.longitude }));
    setLocationOpen(false);
  };

  const addImages = async (files: File[]) => {
    if (!files.length) return;
    const result = await processImageFiles(files);
    setImageErrors(result.errors);
    setHotel(current => ({ ...current, images: [...current.images, ...result.images], featuredImageId: current.featuredImageId || result.images[0]?.id || '' }));
  };

  const removeImage = (imageId: string) => setHotel(current => {
    const images = current.images.filter(image => image.id !== imageId);
    return { ...current, images, featuredImageId: current.featuredImageId === imageId ? images[0]?.id ?? '' : current.featuredImageId };
  });

  const moveImage = (from: number, to: number) => setHotel(current => {
    if (from === to) return current;
    const images = [...current.images];
    const [moved] = images.splice(from, 1);
    images.splice(to, 0, moved);
    return { ...current, images };
  });

  const saveRoom = (room: HotelRoom) => {
    setHotel(current => ({ ...current, rooms: current.rooms.some(item => item.id === room.id) ? current.rooms.map(item => item.id === room.id ? room : item) : [...current.rooms, room] }));
    setRoomEditor(undefined);
  };

  const removeRooms = (ids: string[]) => {
    if (!window.confirm(`Delete ${ids.length === 1 ? 'this room' : `${ids.length} rooms`}?`)) return;
    setHotel(current => ({ ...current, rooms: current.rooms.filter(room => !ids.includes(room.id)) }));
    setSelectedRooms(new Set());
  };

  const runTripadvisorSearch = async () => {
    setTaStatus('');
    setTaResults([]);
    if (!getTripadvisorSearchEndpoint()) { setTaStatus('Tripadvisor search is not connected (VITE_TRIPADVISOR_SEARCH_ENDPOINT). Enter the location ID manually.'); return; }
    setTaLoading(true);
    try {
      const results = await searchTripadvisor(taName ?? hotel.name, taCity ?? hotel.city);
      setTaResults(results);
      if (results.length === 0) setTaStatus('No matching Tripadvisor locations were found.');
    } catch {
      setTaStatus('The Tripadvisor search failed. Try again or enter the location ID manually.');
    } finally {
      setTaLoading(false);
    }
  };

  const validate = () => {
    const found: Record<string, string> = {};
    if (!hotel.name.trim()) found.name = 'Name is required.';
    if (!hotel.category) found.category = 'Choose an accommodation type.';
    if (hotel.discountPercent < 0 || hotel.discountPercent > 100) found.discount = 'Discount must be between 0 and 100.';
    if (hotel.ageRequirement !== null && (!Number.isInteger(hotel.ageRequirement) || hotel.ageRequirement < 0)) found.age = 'Age requirement must be a whole number of 0 or more.';
    if (!hotel.city.trim()) found.city = 'Location is required.';
    if (!hotel.address.trim()) found.address = 'Address is required.';
    if (hotel.latitude !== undefined && (hotel.latitude < -90 || hotel.latitude > 90)) found.latitude = 'Latitude must be between -90 and 90.';
    if (hotel.longitude !== undefined && (hotel.longitude < -180 || hotel.longitude > 180)) found.longitude = 'Longitude must be between -180 and 180.';
    if (hotel.contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(hotel.contactEmail.trim())) found.email = 'Enter a valid email address.';
    if (hotel.website.trim() && !/^https?:\/\/\S+\.\S+/i.test(hotel.website.trim())) found.website = 'Website must start with http:// or https://.';
    if (active && hotel.rooms.length === 0) found.rooms = 'Add at least one room before activating the hotel.';
    if (hotel.tripadvisorLocationId.trim() && !/^\d+$/.test(hotel.tripadvisorLocationId.trim())) found.tripadvisor = 'The Tripadvisor location ID is a number.';
    const key = hotelDuplicateKey(hotel);
    if (hotel.name.trim() && readHotelListings().some(item => item.id !== hotel.id && hotelDuplicateKey(item) === key)) found.duplicate = `A hotel named "${hotel.name.trim()}" already exists in ${hotel.city.trim() || 'this location'}.`;
    return found;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    const firstSection = sections.find(section => Object.keys(found).some(key => errorSection[key] === section.id));
    if (firstSection) { goTo(firstSection.id); return; }
    const translations = Object.fromEntries(Object.entries(hotel.translations).filter(([, value]) => value.name.trim() || value.description.trim()));
    const images = hotel.images;
    saveHotelListing({
      ...hotel,
      name: hotel.name.trim(),
      description: sanitizeHtml(hotel.description),
      translations,
      city: hotel.city.trim(),
      address: hotel.address.trim(),
      contactEmail: hotel.contactEmail.trim(),
      website: hotel.website.trim(),
      tripadvisorLocationId: hotel.tripadvisorLocationId.trim(),
      featuredImageId: images.some(image => image.id === hotel.featuredImageId) ? hotel.featuredImageId : images[0]?.id ?? '',
    });
    navigate('/hotels');
  };

  const cancel = () => {
    if (JSON.stringify(hotel) !== initialSnapshot.current && !window.confirm('Discard your unsaved changes?')) return;
    navigate('/hotels');
  };

  if (!isNew && !existing) return <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">Hotel not found. <Link to="/hotels" className="text-primary-600 underline">Back to Stay Management</Link></div>;
  if (!canManage) return <div role="alert" className="rounded-lg border border-red-200 bg-white p-8 text-center text-gray-600">You do not have permission to manage hotels.</div>;

  const errorMessages = Object.values(errors);
  const pill = 'inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50';
  const roomIconButton = 'inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50';
  const th = 'px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500';

  return (
    <div className="pb-6">
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button type="button" onClick={cancel} aria-label="Back to Stay Management" className="rounded-lg bg-gray-700 p-3 text-white hover:bg-gray-800"><ArrowLeft size={20} /></button>
          <h1 className="text-xl font-bold text-gray-900">{isNew ? 'Create New Hotel' : `Edit: ${existing?.name}`}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className={pill}><input type="checkbox" checked={hotel.refundable} onChange={event => update('refundable', event.target.checked)} className="rounded border-gray-300" /> Refundable Booking</label>
          <label className={pill}><input type="checkbox" checked={hotel.featured} onChange={event => update('featured', event.target.checked)} className="rounded border-gray-300" /> Featured Hotel</label>
          <label className={pill}><input type="checkbox" checked={active} onChange={event => setActive(event.target.checked)} className="rounded border-gray-300" /> Active Status</label>
        </div>
      </header>

      {errorMessages.length > 0 && <ul role="alert" className="list-disc space-y-0.5 rounded-lg border border-red-200 bg-red-50 py-3 pl-8 pr-4 text-sm text-red-800">{errorMessages.map(message => <li key={message}>{message}</li>)}</ul>}

      <div className="grid items-start gap-5 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <nav aria-label="Hotel form sections" className="flex gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-white p-2 lg:sticky lg:top-20 lg:flex-col">
          {sections.map(section => { const Icon = section.icon; return <button key={section.id} type="button" onClick={() => goTo(section.id)} aria-current={activeSection === section.id ? 'true' : undefined} className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${activeSection === section.id ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}><Icon size={17} />{section.label}</button>; })}
        </nav>

        <div className="min-w-0 rounded-lg border border-gray-200 bg-white">
          <section id="hotel-section-general" className={sectionClass}>
            <div role="tablist" aria-label="Content language" className="mb-5 flex flex-wrap gap-2">{languages.map(([code, label]) => <button key={code} type="button" role="tab" aria-selected={language === code} onClick={() => setLanguage(code)} className={`rounded-lg border px-4 py-2 text-xs font-semibold ${language === code ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}>{label}</button>)}</div>
            <div className={panelClass}>
              <h2 className="flex items-center gap-2 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900"><BedDouble size={16} className="text-primary-600" /> Basic Information</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-900">{language === 'en' ? 'Name *' : 'Name'}<input value={translation ? translation.name : hotel.name} onChange={event => translation ? setTranslation({ name: event.target.value }) : update('name', event.target.value)} aria-invalid={Boolean(errors.name)} placeholder={translation ? hotel.name : undefined} className={inputClass} />{fieldError('name')}{fieldError('duplicate')}</label>
                <div className="relative text-sm font-medium text-gray-700">
                  <label htmlFor="hotel-owner">Property Owner</label>
                  {owner ? <div className="mt-1.5 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"><span>{owner.name} <span className="text-gray-500">({owner.email})</span></span><button type="button" onClick={() => update('ownerId', null)} aria-label="Clear owner" className="text-gray-400 hover:text-gray-700"><X size={15} /></button></div>
                    : <><input id="hotel-owner" value={ownerQuery} onChange={event => { setOwnerQuery(event.target.value); setOwnerOpen(true); }} onFocus={() => setOwnerOpen(true)} onBlur={() => window.setTimeout(() => setOwnerOpen(false), 150)} placeholder="Search by name or email" autoComplete="off" className={inputClass} />
                      {ownerOpen && <ul className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg">{ownerMatches.length ? ownerMatches.map(candidate => <li key={candidate.id}><button type="button" onMouseDown={event => event.preventDefault()} onClick={() => { update('ownerId', candidate.id); setOwnerQuery(''); setOwnerOpen(false); }} className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"><span className="font-medium text-gray-900">{candidate.name}</span> <span className="text-xs text-gray-500">{candidate.email} · {candidate.role}</span></button></li>) : <li className="px-3 py-2 text-sm text-gray-500">No matching owners.</li>}</ul>}</>}
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1.4fr_1fr_1fr_1fr]">
                <label className="text-sm font-medium text-gray-700">Accommodation Type<select value={hotel.category} onChange={event => update('category', event.target.value)} className={inputClass}>{typeOptions.map(type => <option key={type}>{type}</option>)}</select>{fieldError('category')}</label>
                <label className="text-sm font-medium text-gray-700">Discount (%)<input type="number" min="0" max="100" step="0.01" value={hotel.discountPercent} onChange={event => update('discountPercent', Number(event.target.value))} className={inputClass} />{fieldError('discount')}</label>
                <label className="text-sm font-medium text-gray-700">Stars<select value={hotel.stars} onChange={event => update('stars', Number(event.target.value))} className={inputClass}>{[1, 2, 3, 4, 5].map(stars => <option key={stars} value={stars}>{stars} {stars === 1 ? 'Star' : 'Stars'}</option>)}</select></label>
                <label className="text-sm font-medium text-gray-700">Rating<select value={ratingValue} onChange={event => update('rating', Number(event.target.value))} className={inputClass}>{ratingOptions.map(value => <option key={value} value={value}>{ratingLabel(value)}</option>)}</select></label>
                <label className="text-sm font-medium text-gray-700">Currency *<select value={hotel.currency} disabled={!isNew} onChange={event => update('currency', event.target.value as Currency)} title={isNew ? undefined : 'The currency cannot change after creation because room rates use it'} className={inputClass}>{supportedCurrencies.map(code => <option key={code}>{code}</option>)}</select></label>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-900">Description{translation ? ` (${language.toUpperCase()})` : ''}</p>
                <div className="mt-1.5"><RichTextEditor key={language} label="Description" value={translation ? translation.description : hotel.description} onChange={html => translation ? setTranslation({ description: html }) : update('description', html)} placeholder="Describe the property" /></div>
              </div>
            </div>

            <div className={`${panelClass} mt-5`}>
              <h2 className="border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900">Check-in/out &amp; Policies</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <label className="text-sm font-medium text-gray-700">Check-in Time<input type="time" value={hotel.checkInTime} onChange={event => update('checkInTime', event.target.value)} className={inputClass} /></label>
                <label className="text-sm font-medium text-gray-700">Check-out Time<input type="time" value={hotel.checkOutTime} onChange={event => update('checkOutTime', event.target.value)} className={inputClass} /></label>
                <label className="text-sm font-medium text-gray-700">Age Requirement<input type="number" min="0" value={hotel.ageRequirement ?? ''} onChange={event => update('ageRequirement', event.target.value === '' ? null : Number(event.target.value))} className={inputClass} />{fieldError('age')}</label>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">Cancellation Policy<textarea rows={4} value={hotel.cancellationPolicy} onChange={event => update('cancellationPolicy', event.target.value)} className={inputClass} /></label>
                <label className="text-sm font-medium text-gray-700">Privacy Policy<textarea rows={4} value={hotel.privacyPolicy} onChange={event => update('privacyPolicy', event.target.value)} placeholder="Enter privacy policy details" className={inputClass} /></label>
              </div>
            </div>
          </section>

          <section id="hotel-section-rooms" className={sectionClass}>
            <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-base font-semibold text-gray-900"><BedDouble size={18} /> Rooms Management</h2><button type="button" onClick={() => setRoomEditor({ ...createBlankRoom(), options: [{ id: crypto.randomUUID(), board: settings.boards[0] ?? 'Room Only', price: 0 }] })} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"><Plus size={16} /> Add Room</button></div>
            {fieldError('rooms')}
            <div className="mt-4 rounded-lg bg-gray-50">
              <div className="flex items-start justify-between gap-3 p-4">
                <div><h3 className="text-lg font-bold text-gray-900">Rooms</h3><p className="text-sm text-gray-500">{hotel.rooms.length} records</p></div>
                <div className="relative"><button type="button" onClick={() => setRoomColumnMenu(open => !open)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Columns size={16} /> View Columns</button>
                  {roomColumnMenu && <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">{([['status', 'Status'], ['image', 'Image'], ['roomType', 'Room Type'], ['price', 'Price and Options']] as const).map(([key, label]) => <label key={key} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"><input type="checkbox" checked={roomColumns[key]} onChange={() => setRoomColumns(current => ({ ...current, [key]: !current[key] }))} className="rounded border-gray-300" />{label}</label>)}</div>}</div>
              </div>
              {selectedRooms.size > 0 && <div className="mx-4 mb-3 flex items-center justify-between rounded-lg border border-primary-100 bg-primary-50 px-4 py-2 text-sm text-primary-800"><span>{selectedRooms.size} selected</span><button type="button" onClick={() => removeRooms(Array.from(selectedRooms))} className="inline-flex items-center gap-1.5 font-medium text-red-700"><Trash2 size={15} /> Delete selected</button></div>}
              <div className="overflow-x-auto border-t border-gray-200 bg-white">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="border-b border-gray-100"><tr>
                    <th className="w-10 px-4 py-3"><input type="checkbox" aria-label="Select all rooms" checked={hotel.rooms.length > 0 && selectedRooms.size === hotel.rooms.length} onChange={() => setSelectedRooms(selectedRooms.size === hotel.rooms.length ? new Set() : new Set(hotel.rooms.map(room => room.id)))} className="rounded border-gray-300" /></th>
                    <th className={`${th} w-10`}>#</th>{roomColumns.status && <th className={th}>Status</th>}{roomColumns.image && <th className={th}>Image</th>}{roomColumns.roomType && <th className={th}>Room Type</th>}{roomColumns.price && <th className={th}>Price and Options</th>}<th className={`${th} border-l border-gray-100 text-right`}>Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {hotel.rooms.map((room, index) => <tr key={room.id}>
                      <td className="px-4 py-3"><input type="checkbox" aria-label={`Select ${room.name || room.roomType}`} checked={selectedRooms.has(room.id)} onChange={() => setSelectedRooms(current => { const next = new Set(current); if (next.has(room.id)) next.delete(room.id); else next.add(room.id); return next; })} className="rounded border-gray-300" /></td>
                      <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                      {roomColumns.status && <td className="px-4 py-3"><ToggleSwitch checked={room.availability === 'Available'} label={`${room.name || room.roomType} available`} onChange={available => setHotel(current => ({ ...current, rooms: current.rooms.map(item => item.id === room.id ? { ...item, availability: available ? 'Available' : 'Unavailable' } : item) }))} /></td>}
                      {roomColumns.image && <td className="px-4 py-3">{room.images[0] ? <img src={room.images[0].src} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-300"><ImageIcon size={16} /></span>}</td>}
                      {roomColumns.roomType && <td className="px-4 py-3 text-gray-800">{room.roomType || room.name}{room.name && room.name !== room.roomType && <span className="block text-xs text-gray-500">{room.name}</span>}</td>}
                      {roomColumns.price && <td className="px-4 py-3"><span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{hotel.currency} {room.price.toFixed(2)}, Total Options ({room.options.length})</span><span className="mt-1 block text-xs text-gray-500">≈ {convertToNGNAndFormat(room.price, hotel.currency)} per night</span></td>}
                      <td className="border-l border-gray-100 px-4 py-3"><div className="flex justify-end gap-1.5"><button type="button" onClick={() => setRoomEditor(room)} aria-label={`Edit ${room.name || room.roomType}`} title="Edit room" className={roomIconButton}><Edit2 size={15} /></button><button type="button" onClick={() => removeRooms([room.id])} aria-label={`Delete ${room.name || room.roomType}`} title="Delete room" className={`${roomIconButton} hover:text-red-600`}><Trash2 size={15} /></button></div></td>
                    </tr>)}
                    {hotel.rooms.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500">No rooms yet. Use Add Room to create the first one.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="hotel-section-location" className={sectionClass}>
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900"><MapPin size={18} /> Location</h2>
            <div className={`${panelClass} mt-3`}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative text-sm font-medium text-gray-700">
                  <label htmlFor="hotel-location">Location *</label>
                  <div className="relative"><input id="hotel-location" value={hotel.city} onChange={event => { const value = event.target.value; const match = findDestination(value); setHotel(current => ({ ...current, city: value, ...(match ? { country: match.country, latitude: match.latitude, longitude: match.longitude } : {}) })); setLocationOpen(true); }} onFocus={() => setLocationOpen(true)} onBlur={() => window.setTimeout(() => setLocationOpen(false), 150)} autoComplete="off" aria-invalid={Boolean(errors.city)} className={`${inputClass} ${destination ? 'border-emerald-300 bg-emerald-50' : ''} pr-9`} />{hotel.city && <button type="button" onClick={() => setHotel(current => ({ ...current, city: '', latitude: undefined, longitude: undefined }))} aria-label="Clear location" className="absolute right-3 top-4 text-gray-400 hover:text-gray-700"><X size={15} /></button>}</div>
                  {locationOpen && hotel.city !== destination?.name && locationMatches.length > 0 && <ul className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg">{locationMatches.map(item => <li key={item.name}><button type="button" onMouseDown={event => event.preventDefault()} onClick={() => chooseDestination(item)} className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"><span className="font-medium text-gray-900">{item.name}</span> <span className="text-xs text-gray-500">{item.country}</span></button></li>)}</ul>}
                  {fieldError('city')}
                </div>
                <label className="text-sm font-medium text-gray-700">Address *<input value={hotel.address} onChange={event => update('address', event.target.value)} aria-invalid={Boolean(errors.address)} className={inputClass} />{fieldError('address')}</label>
                {!destination && hotel.city.trim() && <label className="text-sm font-medium text-gray-700">Country<input value={hotel.country} onChange={event => update('country', event.target.value)} className={inputClass} /></label>}
                <label className="text-sm font-medium text-gray-700">Latitude<input type="number" step="any" readOnly={Boolean(destination)} value={hotel.latitude ?? ''} onChange={event => update('latitude', event.target.value === '' ? undefined : Number(event.target.value))} className={`${inputClass} ${destination ? 'cursor-not-allowed bg-gray-200 font-semibold text-gray-600' : ''}`} /><span className="mt-1 block text-xs font-normal text-gray-500">{destination ? 'Auto-filled from location' : 'Enter manually for locations not in the list'}</span>{fieldError('latitude')}</label>
                <label className="text-sm font-medium text-gray-700">Longitude<input type="number" step="any" readOnly={Boolean(destination)} value={hotel.longitude ?? ''} onChange={event => update('longitude', event.target.value === '' ? undefined : Number(event.target.value))} className={`${inputClass} ${destination ? 'cursor-not-allowed bg-gray-200 font-semibold text-gray-600' : ''}`} /><span className="mt-1 block text-xs font-normal text-gray-500">{destination ? 'Auto-filled from location' : 'Enter manually for locations not in the list'}</span>{fieldError('longitude')}</label>
              </div>
            </div>
          </section>

          <section id="hotel-section-contact" className={sectionClass}>
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900"><Mail size={18} /> Contact Information</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-medium text-gray-900">Email<input type="email" value={hotel.contactEmail} onChange={event => update('contactEmail', event.target.value)} className={inputClass} />{fieldError('email')}</label>
              <label className="text-sm font-medium text-gray-900">Phone<input type="tel" value={hotel.contactPhone} onChange={event => update('contactPhone', event.target.value)} className={inputClass} /></label>
              <label className="text-sm font-medium text-gray-900">Website<input type="url" value={hotel.website} onChange={event => update('website', event.target.value)} placeholder="https://example.com" className={inputClass} />{fieldError('website')}</label>
            </div>
          </section>

          <section id="hotel-section-seo" className={sectionClass}>
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900"><Search size={18} /> SEO Information</h2>
            <div className="mt-3 space-y-4">
              <label className="block text-sm font-medium text-gray-900">MetaTitle<input value={hotel.metaTitle} onChange={event => update('metaTitle', event.target.value)} placeholder="Enter SEO meta title" className={inputClass} /></label>
              <label className="block text-sm font-medium text-gray-900">Meta Keywords<textarea rows={4} value={hotel.metaKeywords} onChange={event => update('metaKeywords', event.target.value)} placeholder="Enter keywords separated by commas" className={inputClass} /></label>
            </div>
          </section>

          <section id="hotel-section-amenities" className={sectionClass}>
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900"><Sparkles size={18} /> Amenities ({amenityOptions.length} available)</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{amenityOptions.map(amenity => <label key={amenity} className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 hover:bg-gray-50"><input type="checkbox" checked={hotel.amenities.includes(amenity)} onChange={() => update('amenities', hotel.amenities.includes(amenity) ? hotel.amenities.filter(item => item !== amenity) : [...hotel.amenities, amenity])} className="rounded border-gray-300" />{amenity}</label>)}</div>
            <p role="status" className="mt-4 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700"><CheckCircle2 size={17} />{hotel.amenities.length} {hotel.amenities.length === 1 ? 'amenity' : 'amenities'} selected</p>
            <p className="mt-2 text-xs text-gray-500">Amenity options are managed in Stay Settings.</p>
          </section>

          <section id="hotel-section-gallery" className={sectionClass}>
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900"><ImageIcon size={18} /> Hotel Gallery</h2>
            {hotel.images.length > 0 && <div className="mt-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">Existing Images ({hotel.images.length}) <span className="text-xs font-medium text-gray-500">Drag to reorder</span></p>
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{hotel.images.map((image, index) => { const isDefault = (hotel.featuredImageId || hotel.images[0]?.id) === image.id; return <li key={image.id} draggable onDragStart={() => { dragIndex.current = index; }} onDragOver={(event: DragEvent) => event.preventDefault()} onDrop={() => { if (dragIndex.current !== null) moveImage(dragIndex.current, index); dragIndex.current = null; }} className={`relative cursor-grab overflow-hidden rounded-lg border-2 bg-white ${isDefault ? 'border-emerald-300' : 'border-gray-200'}`}>
                <img src={image.src} alt={image.name} className="aspect-[4/3] w-full object-cover" />
                {isDefault ? <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white"><CheckCircle2 size={12} /> Default</span> : <button type="button" onClick={() => update('featuredImageId', image.id)} className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-white">Set default</button>}
                <button type="button" onClick={() => removeImage(image.id)} aria-label={`Remove ${image.name}`} className="absolute right-2 top-2 rounded bg-white/90 p-1 text-red-600 hover:bg-white"><Trash2 size={14} /></button>
              </li>; })}</ul>
            </div>}
            <label onDragOver={event => { event.preventDefault(); setDropActive(true); }} onDragLeave={() => setDropActive(false)} onDrop={event => { event.preventDefault(); setDropActive(false); void addImages(Array.from(event.dataTransfer.files)); }} className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center ${dropActive ? 'border-primary-400 bg-primary-50' : 'border-blue-200 bg-blue-50/50 hover:bg-blue-50'}`}>
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-primary-600"><ImagePlus size={26} /></span>
              <span className="mt-3 text-base font-semibold text-gray-900">{hotel.images.length ? 'Upload More Images' : 'Upload Images'}</span>
              <span className="mt-1 text-sm text-gray-500">Drag and drop images here, or click to select files</span>
              <span className="mt-4 text-xs text-gray-500">Supported formats: JPG, PNG, WEBP • Max size: 5MB per image</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event: ChangeEvent<HTMLInputElement>) => { const files = Array.from(event.target.files ?? []); event.target.value = ''; void addImages(files); }} className="sr-only" />
            </label>
            {imageErrors.map(message => <p key={message} role="alert" className="mt-2 text-sm text-red-700">{message}</p>)}
          </section>

          <section id="hotel-section-reviews" className={sectionClass}>
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900"><span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-400 text-[10px] font-bold text-black">TA</span> Tripadvisor</h2>
            <div className={`${panelClass} mt-3`}>
              <label className="block text-sm font-medium text-gray-900">Tripadvisor location ID<input value={hotel.tripadvisorLocationId} onChange={event => update('tripadvisorLocationId', event.target.value)} placeholder="302457" inputMode="numeric" className={inputClass} /></label>
              {fieldError('tripadvisor')}
              <p className="mt-2 text-xs text-gray-500">The number after "-d" in the hotel's Tripadvisor address (e.g. …-d302457-…). Ratings and reviews are only shown once a live Tripadvisor connection is available.</p>
            </div>
            <div className={`${panelClass} mt-4`}>
              <h3 className="flex items-center gap-2 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900"><Search size={15} className="text-primary-600" /> Find the hotel on Tripadvisor</h3>
              <div className="mt-3 grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]">
                <label className="text-sm font-medium text-gray-900">Hotel Name<input value={taName ?? hotel.name} onChange={event => setTaName(event.target.value)} className={inputClass} /></label>
                <label className="text-sm font-medium text-gray-900">City<input value={taCity ?? hotel.city} onChange={event => setTaCity(event.target.value)} className={inputClass} /></label>
                <button type="button" onClick={() => void runTripadvisorSearch()} disabled={taLoading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"><Search size={15} /> {taLoading ? 'Searching…' : 'Search'}</button>
              </div>
              <p className="mt-2 text-xs text-gray-500">Each search uses up to 6 Tripadvisor calls.</p>
              {taStatus && <p role="status" className="mt-3 text-sm text-gray-700">{taStatus}</p>}
              {taResults.length > 0 && <ul className="mt-3 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">{taResults.map(result => <li key={result.locationId} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"><span><span className="font-medium text-gray-900">{result.name}</span>{result.address && <span className="block text-xs text-gray-500">{result.address}</span>}<span className="text-xs text-gray-500">ID {result.locationId}</span></span><button type="button" onClick={() => { update('tripadvisorLocationId', result.locationId); setTaResults([]); }} className="rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">Use this ID</button></li>)}</ul>}
            </div>
          </section>

          <div className="sticky bottom-0 z-30 flex justify-end gap-3 rounded-b-lg border-t border-gray-200 bg-white px-6 py-4">
            <button type="button" onClick={cancel} className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"><Save size={16} /> {isNew ? 'Create' : 'Update'}</button>
          </div>
        </div>
      </div>
    </form>

      <SlideOver isOpen={Boolean(roomEditor)} onClose={() => setRoomEditor(undefined)} title={roomEditor && hotel.rooms.some(room => room.id === roomEditor.id) ? 'Edit Room' : 'Add Room'}>
        {roomEditor && <HotelRoomForm key={roomEditor.id} room={roomEditor} currency={hotel.currency} roomTypes={settings.roomTypes} roomAmenities={settings.roomAmenities} boards={settings.boards} onSave={saveRoom} onCancel={() => setRoomEditor(undefined)} />}
      </SlideOver>
    </div>
  );
}
