// IATA-approved airlines database. Comprehensive list of major international carriers.
export const airlines = [
  // Middle East & South Asia
  { iata: 'PK', name: 'Pakistan International Airlines', country: 'Pakistan' },
  { iata: 'EK', name: 'Emirates', country: 'United Arab Emirates' },
  { iata: 'QR', name: 'Qatar Airways', country: 'Qatar' },
  { iata: 'EY', name: 'Etihad Airways', country: 'United Arab Emirates' },
  { iata: 'SV', name: 'Saudia', country: 'Saudi Arabia' },
  { iata: 'GF', name: 'Gulf Air', country: 'Bahrain' },
  { iata: 'AI', name: 'Air India', country: 'India' },
  { iata: 'MH', name: 'Malaysia Airlines', country: 'Malaysia' },
  { iata: 'SQ', name: 'Singapore Airlines', country: 'Singapore' },
  { iata: 'TG', name: 'Thai Airways International', country: 'Thailand' },
  { iata: '6E', name: 'IndiGo', country: 'India' },
  { iata: 'G8', name: 'Go Air', country: 'India' },
  { iata: 'FD', name: 'AirAsia', country: 'Malaysia' },
  { iata: 'OD', name: 'Noibai Airlines', country: 'Vietnam' },
  { iata: 'VN', name: 'Vietnam Airlines', country: 'Vietnam' },
  { iata: 'CZ', name: 'China Southern Airlines', country: 'China' },
  { iata: 'CA', name: 'Air China', country: 'China' },
  { iata: 'MU', name: 'China Eastern Airlines', country: 'China' },
  { iata: '8L', name: 'Sichuan Airlines', country: 'China' },
  { iata: 'BZ', name: 'Air Macau', country: 'Macau' },
  
  // Europe
  { iata: 'BA', name: 'British Airways', country: 'United Kingdom' },
  { iata: 'LH', name: 'Lufthansa', country: 'Germany' },
  { iata: 'AF', name: 'Air France', country: 'France' },
  { iata: 'KL', name: 'KLM Royal Dutch Airlines', country: 'Netherlands' },
  { iata: 'IB', name: 'Iberia', country: 'Spain' },
  { iata: 'LX', name: 'SWISS', country: 'Switzerland' },
  { iata: 'OS', name: 'Austrian Airlines', country: 'Austria' },
  { iata: 'TK', name: 'Turkish Airlines', country: 'Turkey' },
  { iata: 'OK', name: 'Czech Airlines', country: 'Czech Republic' },
  { iata: 'LO', name: 'LOT Polish Airlines', country: 'Poland' },
  { iata: 'KL', name: 'KLM', country: 'Netherlands' },
  { iata: 'SN', name: 'Brussels Airlines', country: 'Belgium' },
  { iata: 'AZ', name: 'Alitalia', country: 'Italy' },
  { iata: 'VY', name: 'Vueling', country: 'Spain' },
  { iata: 'FR', name: 'Ryanair', country: 'Ireland' },
  { iata: 'U2', name: 'easyJet', country: 'United Kingdom' },
  { iata: 'BA', name: 'British Airways', country: 'United Kingdom' },
  { iata: 'NK', name: 'Nordic Air', country: 'Sweden' },
  { iata: 'SK', name: 'SAS Scandinavian Airlines', country: 'Sweden' },
  { iata: 'FI', name: 'Icelandair', country: 'Iceland' },
  
  // North America
  { iata: 'AA', name: 'American Airlines', country: 'United States' },
  { iata: 'DL', name: 'Delta Air Lines', country: 'United States' },
  { iata: 'UA', name: 'United Airlines', country: 'United States' },
  { iata: 'JB', name: 'JetBlue Airways', country: 'United States' },
  { iata: 'NK', name: 'Spirit Airlines', country: 'United States' },
  { iata: 'F9', name: 'Frontier Airlines', country: 'United States' },
  { iata: 'AS', name: 'Alaska Airlines', country: 'United States' },
  { iata: 'AC', name: 'Air Canada', country: 'Canada' },
  { iata: 'WS', name: 'WestJet', country: 'Canada' },
  { iata: 'AM', name: 'Aeromexico', country: 'Mexico' },
  { iata: 'Y4', name: 'Volaris', country: 'Mexico' },
  { iata: 'Y5', name: 'AeroTucuman', country: 'Mexico' },
  
  // Asia Pacific
  { iata: 'JL', name: 'Japan Airlines', country: 'Japan' },
  { iata: 'NH', name: 'All Nippon Airways', country: 'Japan' },
  { iata: 'QF', name: 'Qantas', country: 'Australia' },
  { iata: 'CX', name: 'Cathay Pacific', country: 'Hong Kong' },
  { iata: 'BR', name: 'EVA Air', country: 'Taiwan' },
  { iata: 'CI', name: 'China Airlines', country: 'Taiwan' },
  { iata: 'KE', name: 'Korean Air', country: 'South Korea' },
  { iata: 'OZ', name: 'Asiana Airlines', country: 'South Korea' },
  { iata: 'NZ', name: 'Air New Zealand', country: 'New Zealand' },
  
  // Africa
  // South Africa
  { iata: 'SA', name: 'South African Airways', country: 'South Africa' },
  { iata: 'FA', name: 'Flysafair', country: 'South Africa' },
  { iata: 'MN', name: 'Mango Airlines', country: 'South Africa' },
  { iata: 'FN', name: 'Kulula.com', country: 'South Africa' },
  
  // Nigeria
  { iata: 'PC', name: 'Airpeace', country: 'Nigeria' },
  { iata: 'UB', name: 'Air Nigeria (defunct)', country: 'Nigeria' },
  { iata: 'BA', name: 'Arik Air', country: 'Nigeria' },
  { iata: 'AW', name: 'African World Airlines', country: 'Nigeria' },
  { iata: 'ZT', name: 'Azman Air', country: 'Nigeria' },
  { iata: 'NG', name: 'Nigeria Air', country: 'Nigeria' },
  { iata: 'V0', name: 'ValueJet', country: 'Nigeria' },
  { iata: 'IC', name: 'Ibom Air', country: 'Nigeria' },
  
  // East Africa
  { iata: 'MS', name: 'EgyptAir', country: 'Egypt' },
  { iata: 'ET', name: 'Ethiopian Airlines', country: 'Ethiopia' },
  { iata: 'KC', name: 'Kenya Airways', country: 'Kenya' },
  { iata: 'TC', name: 'Air Tanzania', country: 'Tanzania' },
  { iata: 'PZ', name: 'Air Precision', country: 'Tanzania' },
  { iata: 'Z6', name: 'Precision Air', country: 'Tanzania' },
  
  // West Africa
  { iata: 'GH', name: 'Air Ghana', country: 'Ghana' },
  { iata: 'MJ', name: 'Air Côte d\'Ivoire', country: 'Ivory Coast' },
  { iata: 'VU', name: 'ASKY Airlines', country: 'Togo' },
  { iata: 'DF', name: 'Air Senegal', country: 'Senegal' },
  { iata: 'HF', name: 'Air Burkina', country: 'Burkina Faso' },
  
  // North Africa
  { iata: 'AT', name: 'Royal Air Maroc', country: 'Morocco' },
  { iata: 'AH', name: 'Air Algérie', country: 'Algeria' },
  { iata: 'TU', name: 'Tunisair', country: 'Tunisia' },
  { iata: 'LY', name: 'Libyan Arab Airlines', country: 'Libya' },
  
  // Central & Southern Africa
  { iata: 'BA', name: 'British Airways (Zimbabwe)', country: 'Zimbabwe' },
  { iata: 'ZY', name: 'Air Zimbabwe', country: 'Zimbabwe' },
  { iata: 'UW', name: 'Air Botswana', country: 'Botswana' },
  { iata: 'LM', name: 'LAM Mozambique Airlines', country: 'Mozambique' },
  { iata: 'MG', name: 'Air Madagascar', country: 'Madagascar' },
  { iata: 'NM', name: 'Air Namibia', country: 'Namibia' },
  
  // Latin America
  { iata: 'AR', name: 'Aerolíneas Argentinas', country: 'Argentina' },
  { iata: 'LA', name: 'LATAM Airlines', country: 'Chile' },
  { iata: 'AV', name: 'Avianca', country: 'Colombia' },
  { iata: 'UX', name: 'Air Europa', country: 'Spain' },
  
  // Budget & Regional
  { iata: '9W', name: 'Jet Airways', country: 'India' },
  { iata: 'BG', name: 'Biman Bangladesh Airlines', country: 'Bangladesh' },
  { iata: 'FB', name: 'FitsAir', country: 'United States' },
  { iata: 'IE', name: 'Solomon Airlines', country: 'Solomon Islands' },
  { iata: 'SG', name: 'SpiceJet', country: 'India' }
];