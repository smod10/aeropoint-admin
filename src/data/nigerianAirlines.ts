import type { Airline } from './airlines';

// Supplemental IATA-designated Nigerian carriers from the Travelpayouts airline reference.
// The source does not provide ICAO codes; keep those blank instead of guessing.
// Reference: https://api.travelpayouts.com/data/en/airlines.json
export const nigerianAirlineSupplement: Airline[] = [
  { id: 900001, status: true, name: 'Air Peace', code: 'P4', iata: '', country: 'Nigeria' },
  { id: 900002, status: true, name: 'Ibom Air', code: 'QI', iata: '', country: 'Nigeria' },
  // The broad feed says UN; the airline-specific listing identifies U5.
  { id: 900003, status: true, name: 'United Nigeria Airlines', code: 'U5', iata: '', country: 'Nigeria' },
  { id: 900004, status: true, name: 'Overland Airways', code: 'OF', iata: '', country: 'Nigeria' },
  { id: 900005, status: true, name: 'ValueJet', code: 'VK', iata: '', country: 'Nigeria' },
  { id: 900006, status: true, name: 'Max Air', code: 'VM', iata: '', country: 'Nigeria' },
  { id: 900007, status: true, name: 'Green Africa Airways', code: 'Q9', iata: '', country: 'Nigeria' },
  { id: 900008, status: true, name: 'NG Eagle', code: '2N', iata: '', country: 'Nigeria' },
  { id: 900009, status: true, name: 'Rano Air', code: 'R4', iata: '', country: 'Nigeria' },
  { id: 900010, status: true, name: 'Enugu Air', code: 'EE', iata: '', country: 'Nigeria' },
  { id: 900011, status: true, name: 'Umza Air', code: 'UY', iata: '', country: 'Nigeria' },
  { id: 900012, status: true, name: 'Allied Air', code: '4W', iata: '', country: 'Nigeria' },
];