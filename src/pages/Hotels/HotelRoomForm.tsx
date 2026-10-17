import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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

export default function HotelRoomForm({ room, currency, roomTypes, roomAmenities, boards, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<HotelRoom>(room);
  const [errors, setErrors] = useState<string[]>([]);
  const [imageErrors, setImageErrors] = useState<string[]>([]);

  const typeOptions = Array.from(new Set([...roomTypes, ...(draft.roomType ? [draft.roomType] : [])]));
  const amenityOptions = Array.from(new Set([...roomAmenities, ...draft.facilities]));
  const boardOptions = Array.from(new Set([...boards, ...draft.options.map(option => option.board)]));

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
    if (problems.length) return;
    onSave({ ...draft, name: draft.name.trim() || draft.roomType, price: Math.min(...draft.options.map(option => option.price)) });
  };

  const updateOption = (id: string, changes: Partial<HotelRoom['options'][number]>) => setDraft(current => ({ ...current, options: current.options.map(option => option.id === id ? { ...option, ...changes } : option) }));

  return (
    <form className="space-y-5 pb-4" onSubmit={event => { event.preventDefault(); submit(); }}>
      <label className="block text-sm font-medium text-gray-700">Room Type *<select value={draft.roomType} onChange={event => setDraft(current => ({ ...current, roomType: event.target.value }))} className={fieldClass}><option value="">Select room type</option>{typeOptions.map(type => <option key={type}>{type}</option>)}</select></label>
      <label className="block text-sm font-medium text-gray-700">Room label (optional)<input value={draft.name} onChange={event => setDraft(current => ({ ...current, name: event.target.value }))} placeholder="e.g. Deluxe King with sea view" className={fieldClass} /></label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm font-medium text-gray-700">Max guests *<input type="number" min="1" value={draft.maxGuests} onChange={event => setDraft(current => ({ ...current, maxGuests: Number(event.target.value) }))} className={fieldClass} /></label>
        <label className="block text-sm font-medium text-gray-700">Available rooms<input type="number" min="0" value={draft.availableUnits ?? 0} onChange={event => setDraft(current => ({ ...current, availableUnits: Number(event.target.value) }))} className={fieldClass} /></label>
      </div>
      <label className="block text-sm font-medium text-gray-700">Bed type<input value={draft.bedType} onChange={event => setDraft(current => ({ ...current, bedType: event.target.value }))} placeholder="King, twin…" className={fieldClass} /></label>
      <label className="block text-sm font-medium text-gray-700">Description<textarea rows={3} value={draft.description} onChange={event => setDraft(current => ({ ...current, description: event.target.value }))} className={fieldClass} /></label>

      <fieldset>
        <legend className="text-sm font-medium text-gray-700">Room amenities</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">{amenityOptions.map(amenity => <label key={amenity} className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={draft.facilities.includes(amenity)} onChange={() => setDraft(current => ({ ...current, facilities: current.facilities.includes(amenity) ? current.facilities.filter(item => item !== amenity) : [...current.facilities, amenity] }))} className="rounded border-gray-300" />{amenity}</label>)}</div>
      </fieldset>

      <fieldset>
        <div className="flex items-center justify-between"><legend className="text-sm font-medium text-gray-700">Price options ({currency}) *</legend><button type="button" onClick={() => setDraft(current => ({ ...current, options: [...current.options, { id: crypto.randomUUID(), board: boardOptions.find(board => !current.options.some(option => option.board === board)) ?? '', price: 0 }] }))} className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-800"><Plus size={14} /> Add option</button></div>
        <div className="mt-2 space-y-2">{draft.options.map(option => <div key={option.id} className="flex items-center gap-2"><select aria-label="Board" value={option.board} onChange={event => updateOption(option.id, { board: event.target.value })} className="w-1/2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"><option value="">Board</option>{boardOptions.map(board => <option key={board}>{board}</option>)}</select><input aria-label="Price per night" type="number" min="0" step="0.01" value={option.price} onChange={event => updateOption(option.id, { price: Number(event.target.value) })} className="w-1/2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />{draft.options.length > 1 && <button type="button" onClick={() => setDraft(current => ({ ...current, options: current.options.filter(item => item.id !== option.id) }))} aria-label="Remove option" className="rounded p-1.5 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>}</div>)}</div>
        <p className="mt-1 text-xs text-gray-500">Rates are per night in the hotel currency. They are entered by an administrator and are not live supplier prices.</p>
      </fieldset>

      <div>
        <label className="block text-sm font-medium text-gray-700">Room images<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={event => void addImages(event)} className="mt-1.5 block w-full text-xs text-gray-600" /></label>
        <p className="mt-1 text-xs text-gray-500">JPG, PNG or WEBP, up to 5MB each.</p>
        {imageErrors.map(error => <p key={error} role="alert" className="mt-1 text-xs text-red-700">{error}</p>)}
        <div className="mt-2 flex flex-wrap gap-2">{draft.images.map(image => <div key={image.id} className="relative"><img src={image.src} alt={image.name} className="h-14 w-14 rounded object-cover" /><button type="button" onClick={() => setDraft(current => ({ ...current, images: current.images.filter(item => item.id !== image.id) }))} aria-label={`Remove ${image.name}`} className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 text-red-600 shadow"><Trash2 size={12} /></button></div>)}</div>
      </div>

      {errors.length > 0 && <ul role="alert" className="list-disc space-y-0.5 rounded-lg border border-red-200 bg-red-50 py-3 pl-8 pr-4 text-sm text-red-800">{errors.map(error => <li key={error}>{error}</li>)}</ul>}
      <div className="flex gap-3"><button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="submit" className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700">Save room</button></div>
    </form>
  );
}
