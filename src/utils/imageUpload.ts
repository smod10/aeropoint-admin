import type { HotelImage } from '../types/hotel';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_DIMENSION = 1600;

// Images are stored in browser storage, so they are downscaled and re-encoded to stay within its quota.
async function downscale(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image processing is not available in this browser.');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.82);
}

export async function processImageFiles(files: File[]): Promise<{ images: HotelImage[]; errors: string[] }> {
  const images: HotelImage[] = [];
  const errors: string[] = [];
  for (const file of files) {
    if (!acceptedTypes.includes(file.type)) { errors.push(`${file.name}: only JPG, PNG and WEBP images are supported.`); continue; }
    if (file.size > MAX_IMAGE_BYTES) { errors.push(`${file.name}: larger than the 5MB limit.`); continue; }
    try {
      images.push({ id: crypto.randomUUID(), name: file.name, src: await downscale(file) });
    } catch {
      errors.push(`${file.name}: could not be read as an image.`);
    }
  }
  return { images, errors };
}
