export type Destination = { name: string; country: string; latitude: number; longitude: number };

// Static geography used to auto-fill hotel coordinates; it is not supplier data.
export const destinations: Destination[] = [
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.0805, longitude: 55.1403 },
  { name: 'Abu Dhabi', country: 'United Arab Emirates', latitude: 24.4539, longitude: 54.3773 },
  { name: 'Lagos', country: 'Nigeria', latitude: 6.5244, longitude: 3.3792 },
  { name: 'Abuja', country: 'Nigeria', latitude: 9.0765, longitude: 7.3986 },
  { name: 'Maldives', country: 'Maldives', latitude: 3.2028, longitude: 73.2207 },
  { name: 'Gan Island', country: 'Maldives', latitude: -0.6937, longitude: 73.1553 },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
  { name: 'London', country: 'United Kingdom', latitude: 51.5072, longitude: -0.1276 },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
  { name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  { name: 'Bangkok', country: 'Thailand', latitude: 13.7563, longitude: 100.5018 },
  { name: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784 },
  { name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357 },
  { name: 'Makkah', country: 'Saudi Arabia', latitude: 21.3891, longitude: 39.8579 },
  { name: 'Madinah', country: 'Saudi Arabia', latitude: 24.5247, longitude: 39.5692 },
  { name: 'Doha', country: 'Qatar', latitude: 25.2854, longitude: 51.531 },
  { name: 'Nairobi', country: 'Kenya', latitude: -1.2921, longitude: 36.8219 },
  { name: 'Accra', country: 'Ghana', latitude: 5.6037, longitude: -0.187 },
  { name: 'Cape Town', country: 'South Africa', latitude: -33.9249, longitude: 18.4241 },
];

export function findDestination(name: string): Destination | undefined {
  const query = name.trim().toLowerCase();
  return query ? destinations.find(destination => destination.name.toLowerCase() === query) : undefined;
}
