import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { BedDouble, ImagePlus, Info, Plus, Settings, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import { processImageFiles } from '../../utils/imageUpload';
import type { HotelRoom } from '../../types/hotel';

type Props = {
  room: HotelRoom;
  currency: string;
  roomTypes: string[];
  roomAmenities: string[];
  boards: string[];
  onSave: (room: HotelRoom) => void;
  onCancel: () => void;
};

const fieldClass = 'mt-1.5 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary-500';
type RoomTab = 'details' | 'options' | 'amenities' | 'policies';

export default function HotelRoomForm({ room, currency, roomTypes, roomAmenities, boards, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<HotelRoom>(room);
  const [errors, setErrors] = useState<string[]>([]);
  const [imageErrors, setImageErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<RoomTab>('details');

  const typeOptions = Array.from(new Set([...roomTypes, ...(draft.roomType ? [draft.roomType] : [])]));
  const amenityOptions = Array.from(new Set([...roomAmenities, ...draft.facilities]));
  const boardOptions = Array.from(new Set([...boards, ...draft.options.map(option => option.board)]));
  const tabs: { id: RoomTab; label: string; icon: typeof Info }[] = [
    { id: 'details', label: 'Room Details', icon: Info },
    { id: 'options', label: 'Room Options', icon: Settings },
    { id: 'amenities', label: 'Room Amenities', icon: Sparkles },
    { id: 'policies', label: 'Policies & Status', icon: ShieldCheck },
  ];

  const addImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;
    const result = await processImageFiles(files);
    setImageErrors(result.errors);
    setDraft(current => ({ ...current, images: [...current.images, ...result.images] }));
  };

  const submit = () => {
    const problems: string[] = [];
    if (!draft.roomType) problems.push('Choose a room type.');
    if (!Number.isInteger(draft.maxGuests) || draft.maxGuests < 1) problems.push('Maximum guests must be a whole number of 1 or more.');
    if (!Number.isInteger(draft.availableUnits ?? 0) || (draft.availableUnits ?? 0) < 0) problems.push('Available rooms must be a whole number of 0 or more.');
    if (draft.options.length === 0) problems.push('Add at least one price option.');
    const boardNames = draft.options.map(option => option.board);
    if (draft.options.some(option => !option.board)) problems.push('Choose a board for every price option.');
    if (new Set(boardNames).size !== boardNames.length) problems.push('Each board can only be used once per room.');
    if (draft.options.some(option => !Number.isFinite(option.price) || option.price < 0)) problems.push('Prices must be zero or more.');
    setErrors(problems);
    if (problems.length) {
      setActiveTab(problems.some(problem => problem.includes('option') || problem.includes('board') || problem.includes('Prices')) ? 'options' : 'details');
      return;
    }
    onSave({ ...draft, name: draft.name.trim() || draft.roomType, price: Math.min(...draft.options.map(option => option.price)) });
  };

  const updateOption = (id: string, changes: Partial<HotelRoom['options'][number]>) => setDraft(current => ({ ...current, options: current.options.map(option => option.id === id ? { ...option, ...changes } : option) }));

  return (
    <form className="-m-6 flex min-h-[min(70vh,42rem)] flex-col" onSubmit={event => { event.preventDefault(); submit(); }}>
      <div role="tablist" aria-label="Room settings" className="flex shrink-0 overflow-x-auto border-b border-gray-200 px-2 sm:px-4">
        {tabs.map(tab => { const Icon = tab.icon; return <button key={tab.id} id={`room-tab-${tab.id}`} type="button" role="tab" aria-controls="room-panel" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium ${activeTab === tab.id ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}><Icon size={16} />{tab.label}</button>; })}
      </div>

      <div id="room-panel" role="tabpanel" aria-labelledby={`room-tab-${activeTab}`} className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
        {activeTab === 'details' && <div className="space-y-5">
          <section className="rounded-lg bg-gray-50 p-4">
            <h3 className="flex items-center gap-2 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900"><BedDouble size={16} className="text-primary-600" /> Basic Information</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">Room Type *<select value={draft.roomType} onChange={event => setDraft(current => ({ ...current, roomType: event.target.value }))} className={fieldClass}><option value="">Select room type</option>{typeOptions.map(type => <option key={type}>{type}</option>)}</select></label>
              <label className="block text-sm font-medium text-gray-700">Room label<input value={draft.name} onChange={event => setDraft(current => ({ ...current, name: event.target.value }))} placeholder="e.g. Deluxe King with sea view" className={fieldClass} /></label>
              <label className="block text-sm font-medium text-gray-700">Max guests *<input type="number" min="1" value={draft.maxGuests} onChange={event => setDraft(current => ({ ...current, maxGuests: Number(event.target.value) }))} className={fieldClass} /></label>
              <label className="block text-sm font-medium text-gray-700">Available rooms<input type="number" min="0" value={draft.availableUnits ?? 0} onChange={event => setDraft(current => ({ ...current, availableUnits: Number(event.target.value) }))} className={fieldClass} /></label>
              <label className="block text-sm font-medium text-gray-700 sm:col-span-2">Bed type<input value={draft.bedType} onChange={event => setDraft(current => ({ ...current, bedType: event.target.value }))} placeholder="King, twin…" className={fieldClass} /></label>
              <label className="block text-sm font-medium text-gray-700 sm:col-span-2">Description<textarea rows={3} value={draft.description} onChange={event => setDraft(current => ({ ...current, description: event.target.value }))} className={fieldClass} /></label>
            </div>
          </section>
          <section className="rounded-lg bg-gray-50 p-4">
            <h3 className="flex items-center gap-2 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900"><ImagePlus size={16} className="text-primary-600" /> Room Gallery</h3>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/60 px-5 py-7 text-center hover:bg-blue-50"><ImagePlus size={24} className="text-primary-600" /><span className="mt-2 text-sm font-semibold text-gray-900">Upload room images</span><span className="mt-1 text-xs text-gray-500">JPG, PNG or WEBP, up to 5MB each</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={event => void addImages(event)} className="sr-only" /></label>
            {imageErrors.map(error => <p key={error} role="alert" className="mt-2 text-xs text-red-700">{error}</p>)}
            <div className="mt-3 flex flex-wrap gap-2">{draft.images.map(image => <div key={image.id} className="relative"><img src={image.src} alt={image.name} className="h-16 w-16 rounded object-cover" /><button type="button" onClick={() => setDraft(current => ({ ...current, images: current.images.filter(item => item.id !== image.id) }))} aria-label={`Remove ${image.name}`} className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 text-red-600 shadow"><Trash2 size={12} /></button></div>)}</div>
          </section>
        </div>}

        {activeTab === 'options' && <section className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-2"><h3 className="text-sm font-semibold text-gray-900">Room Options</h3><button type="button" onClick={() => setDraft(current => ({ ...current, options: [...current.options, { id: crypto.randomUUID(), board: boardOptions.find(board => !current.options.some(option => option.board === board)) ?? '', price: 0 }] }))} className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-900"><Plus size={15} /> Add option</button></div>
          <div className="mt-4 space-y-3">{draft.options.map((option, index) => <div key={option.id} className="grid items-end gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:grid-cols-[1fr_1fr_auto]"><label className="block text-sm font-medium text-gray-700">Board {index + 1}<select aria-label={`Board ${index + 1}`} value={option.board} onChange={event => updateOption(option.id, { board: event.target.value })} className={fieldClass}><option value="">Select board</option>{boardOptions.map(board => <option key={board}>{board}</option>)}</select></label><label className="block text-sm font-medium text-gray-700">Price per night ({currency})<input aria-label={`Price per night for option ${index + 1}`} type="number" min="0" step="0.01" value={option.price} onChange={event => updateOption(option.id, { price: Number(event.target.value) })} className={fieldClass} /></label>{draft.options.length > 1 && <button type="button" onClick={() => setDraft(current => ({ ...current, options: current.options.filter(item => item.id !== option.id) }))} aria-label="Remove option" className="mb-1 rounded p-2 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>}</div>)}</div>
          <p className="mt-3 text-xs text-gray-500">Board options are managed in Stay Settings. Rates are per night in the hotel currency.</p>
        </section>}

        {activeTab === 'amenities' && <section className="rounded-lg bg-gray-50 p-4">
          <h3 className="flex items-center gap-2 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900"><Sparkles size={16} className="text-primary-600" /> Room Amenities</h3>
          {amenityOptions.length ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{amenityOptions.map(amenity => <label key={amenity} className="flex cursor-pointer items-center gap-2 rounded border border-gray-200 bg-white px-3 py-3 text-sm text-gray-800 hover:bg-gray-50"><input type="checkbox" checked={draft.facilities.includes(amenity)} onChange={() => setDraft(current => ({ ...current, facilities: current.facilities.includes(amenity) ? current.facilities.filter(item => item !== amenity) : [...current.facilities, amenity] }))} className="rounded border-gray-300" />{amenity}</label>)}</div> : <p className="mt-4 text-sm text-gray-500">No room amenities are active in Stay Settings.</p>}
          <p className="mt-3 text-xs text-gray-500">Amenity options are managed in Stay Settings.</p>
        </section>}

        {activeTab === 'policies' && <section className="rounded-lg bg-gray-50 p-4">
          <h3 className="flex items-center gap-2 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900"><ShieldCheck size={16} className="text-primary-600" /> Policies &amp; Status</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {([
              ['breakfastIncluded', 'Breakfast Included'],
              ['freeCancellation', 'Free cancellation'],
              ['refundable', 'Refundable'],
              ['active', 'Active Status'],
            ] as const).map(([key, label]) => <label key={key} className="flex cursor-pointer items-center gap-2 rounded border border-gray-200 bg-white px-3 py-3 text-sm text-gray-800"><input type="checkbox" checked={draft[key]} onChange={event => setDraft(current => ({ ...current, [key]: event.target.checked }))} className="rounded border-gray-300" />{label}</label>)}
          </div>
        </section>}

        {errors.length > 0 && <ul role="alert" className="mt-4 list-disc space-y-0.5 rounded-lg border border-red-200 bg-red-50 py-3 pl-8 pr-4 text-sm text-red-800">{errors.map(error => <li key={error}>{error}</li>)}</ul>}
      </div>

      <div className="sticky bottom-0 z-10 flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:px-6">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
        <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Save room</button>
      </div>
    </form>
  );
}
