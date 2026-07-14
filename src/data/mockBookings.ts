export const mockBookings = [

  // ─── FLIGHTS ────────────────────────────────────────────────────
  {
    id: 1, invoice: '27122462', moduleType: 'flights', moduleName: 'Duffel\nFlights', booking: 'PENDING\nCANCELLATION REQUESTED', payment: 'UNPAID', price: '149.51', earning: '4.31', user: 'Chinedu Okafor\nchinedu@example.com', ref: 'Pending', createdAt: '2026-07-14 11:26 AM',
    passengers: [{ name: 'Mr. Chinedu Okafor', type: 'Adult', nationality: 'Nigeria', document: 'Pending Issuance' }],
    ancillaries: [{ name: 'Extra Baggage (+20kg)', price: '45.00' }, { name: 'In-flight Meal', price: 'Included' }],
    details: { provider: 'Air Peace', code: 'P47204', class: 'Economy', from: 'LOS', fromName: 'Lagos (Murtala Muhammed)', to: 'DXB', toName: 'Dubai International', depTime: '11:36 AM', arrTime: '08:04 PM', date: '16-07-2026', duration: '6:28', type: 'Non-stop', baggage: '1x 23kg Checked, 1x 7kg Cabin' }
  },
  {
    id: 3, invoice: '82266190', moduleType: 'flights', moduleName: 'Amadeus\nFlights', booking: 'CONFIRMED', payment: 'PAID', price: '850.27', earning: '42.90', user: 'Michael Johnson\nmike.j@example.com', ref: 'XYZ123', createdAt: '2026-07-13 16:45 PM',
    passengers: [{ name: 'Mr. Michael Johnson', type: 'Adult', nationality: 'United States', document: 'e-Ticket: 774-123456' }],
    ancillaries: [{ name: 'Priority Boarding', price: '25.00' }],
    details: { provider: 'British Airways', code: 'BA074', class: 'Business', from: 'LOS', fromName: 'Lagos (Murtala Muhammed)', to: 'LHR', toName: 'London Heathrow', depTime: '10:00 PM', arrTime: '05:30 AM', date: '20-07-2026', duration: '6:30', type: 'Non-stop', baggage: '2x 32kg Checked, 1x 7kg Cabin' }
  },
  {
    id: 10, invoice: 'F3391820', moduleType: 'flights', moduleName: 'Duffel\nFlights', booking: 'CONFIRMED', payment: 'PAID', price: '430.00', earning: '21.50', user: 'Amina Yusuf\namina.y@example.com', ref: 'DF-44821', createdAt: '2026-07-12 09:00 AM',
    passengers: [{ name: 'Ms. Amina Yusuf', type: 'Adult', nationality: 'Nigeria', document: 'e-Ticket: 083-556123' }],
    ancillaries: [],
    details: { provider: 'Qatar Airways', code: 'QR1432', class: 'Economy', from: 'ABV', fromName: 'Abuja (Nnamdi Azikiwe)', to: 'DOH', toName: 'Hamad International', depTime: '02:20 AM', arrTime: '09:45 AM', date: '19-07-2026', duration: '5:25', type: 'Non-stop', baggage: '1x 23kg Checked, 1x 7kg Cabin' }
  },
  {
    id: 11, invoice: 'F5510293', moduleType: 'flights', moduleName: 'Amadeus\nFlights', booking: 'CONFIRMED', payment: 'PAID', price: '1200.00', earning: '85.00', user: 'Priya Sharma\npriya.s@tripmate.in', ref: 'AM-77654', createdAt: '2026-07-10 14:20 PM',
    passengers: [{ name: 'Ms. Priya Sharma', type: 'Adult', nationality: 'India', document: 'e-Ticket: 176-223344' }, { name: 'Mr. Rahul Sharma', type: 'Adult', nationality: 'India', document: 'e-Ticket: 176-223345' }],
    ancillaries: [{ name: 'Seat Selection (x2)', price: '40.00' }, { name: 'Extra Baggage (+20kg x2)', price: '90.00' }],
    details: { provider: 'Emirates', code: 'EK242', class: 'Economy', from: 'DEL', fromName: 'Indira Gandhi International', to: 'LHR', toName: 'London Heathrow', depTime: '03:30 AM', arrTime: '07:45 AM', date: '25-07-2026', duration: '9:15', type: 'Non-stop', baggage: '1x 23kg Checked, 1x 7kg Cabin' }
  },
  {
    id: 12, invoice: 'F6621304', moduleType: 'flights', moduleName: 'Duffel\nFlights', booking: 'CANCELLED', payment: 'REFUNDED', price: '320.00', earning: '0.00', user: 'Emeka Nwosu\nemeka.n@example.com', ref: 'DF-33190', createdAt: '2026-07-08 17:55 PM',
    passengers: [{ name: 'Mr. Emeka Nwosu', type: 'Adult', nationality: 'Nigeria', document: 'Cancelled' }],
    ancillaries: [],
    details: { provider: 'Air Peace', code: 'P47101', class: 'Economy', from: 'LOS', fromName: 'Lagos (Murtala Muhammed)', to: 'JNB', toName: 'O.R. Tambo International', depTime: '08:00 AM', arrTime: '12:30 PM', date: '15-07-2026', duration: '4:30', type: 'Non-stop', baggage: '1x 23kg Checked, 1x 7kg Cabin' }
  },
  {
    id: 13, invoice: 'F7732415', moduleType: 'flights', moduleName: 'Amadeus\nFlights', booking: 'CONFIRMED', payment: 'PAID', price: '565.00', earning: '28.25', user: 'Tariq Mahmoud\ntariq.m@example.com', ref: 'AM-88120', createdAt: '2026-07-09 12:10 PM',
    passengers: [{ name: 'Mr. Tariq Mahmoud', type: 'Adult', nationality: 'United Arab Emirates', document: 'e-Ticket: 157-667788' }],
    ancillaries: [{ name: 'Lounge Access', price: '60.00' }],
    details: { provider: 'Etihad Airways', code: 'EY7', class: 'Business', from: 'AUH', fromName: 'Abu Dhabi International', to: 'JFK', toName: 'John F. Kennedy International', depTime: '09:15 AM', arrTime: '03:00 PM', date: '22-07-2026', duration: '13:45', type: 'Non-stop', baggage: '2x 32kg Checked, 1x 7kg Cabin' }
  },
  {
    id: 14, invoice: 'F8843526', moduleType: 'flights', moduleName: 'Duffel\nFlights', booking: 'PENDING', payment: 'UNPAID', price: '210.00', earning: '10.50', user: 'Grace Otieno\ngrace.o@example.com', ref: 'Pending', createdAt: '2026-07-14 06:30 AM',
    passengers: [{ name: 'Ms. Grace Otieno', type: 'Adult', nationality: 'Kenya', document: 'Pending Issuance' }],
    ancillaries: [],
    details: { provider: 'Kenya Airways', code: 'KQ100', class: 'Economy', from: 'NBO', fromName: 'Jomo Kenyatta International', to: 'LHR', toName: 'London Heathrow', depTime: '11:25 PM', arrTime: '06:30 AM', date: '20-07-2026', duration: '9:05', type: 'Non-stop', baggage: '1x 23kg Checked, 1x 7kg Cabin' }
  },

  // ─── STAYS (HOTELS) ─────────────────────────────────────────────
  {
    id: 4, invoice: '3AF56D63', moduleType: 'stays', moduleName: 'Booking.com\nStays', booking: 'CONFIRMED', payment: 'PAID', price: '340.00', earning: '34.00', user: 'Sarah Jenkins\nsarah.j@example.com', ref: 'BK-99482', createdAt: '2026-07-13 14:12 PM',
    passengers: [{ name: 'Mrs. Sarah Jenkins', type: 'Adult', nationality: 'United Kingdom', document: 'Confirmed' }],
    ancillaries: [{ name: 'Airport Transfer', price: '50.00' }],
    details: { hotel: 'Atlantis The Palm', stars: 5, location: 'Crescent Rd, Dubai, UAE', checkIn: '22-07-2026 (15:00)', checkOut: '26-07-2026 (11:00)', nights: 4, room: 'Ocean King Room', board: 'Breakfast Included', guests: '2 Adults' }
  },
  {
    id: 7, invoice: '64333665', moduleType: 'stays', moduleName: 'Hotelbeds\nStays', booking: 'PENDING', payment: 'UNPAID', price: '420.94', earning: '42.24', user: 'David Chen\ndavid.chen@example.com', ref: 'Pending', createdAt: '2026-07-11 20:05 PM',
    passengers: [{ name: 'Mr. David Chen', type: 'Adult', nationality: 'Canada', document: 'Pending' }],
    ancillaries: [],
    details: { hotel: 'The Savoy', stars: 5, location: 'Strand, London, UK', checkIn: '01-08-2026 (15:00)', checkOut: '03-08-2026 (12:00)', nights: 2, room: 'Luxury Suite', board: 'Room Only', guests: '1 Adult' }
  },
  {
    id: 20, invoice: 'S1102847', moduleType: 'stays', moduleName: 'Booking.com\nStays', booking: 'CONFIRMED', payment: 'PAID', price: '180.00', earning: '18.00', user: 'Zainab Hassan\nzainab.h@example.com', ref: 'BK-11283', createdAt: '2026-07-07 10:30 AM',
    passengers: [{ name: 'Ms. Zainab Hassan', type: 'Adult', nationality: 'Nigeria', document: 'Confirmed' }],
    ancillaries: [],
    details: { hotel: 'Movenpick Hotel Abuja', stars: 4, location: 'Abuja, Nigeria', checkIn: '20-07-2026 (14:00)', checkOut: '23-07-2026 (12:00)', nights: 3, room: 'Deluxe King', board: 'Bed & Breakfast', guests: '1 Adult' }
  },
  {
    id: 21, invoice: 'S2213958', moduleType: 'stays', moduleName: 'Hotelbeds\nStays', booking: 'CONFIRMED', payment: 'PAID', price: '950.00', earning: '95.00', user: 'Kolade Adebayo\nkolade.a@travelagency.com', ref: 'HB-55491', createdAt: '2026-07-06 16:00 PM',
    passengers: [{ name: 'Mr. Kolade Adebayo', type: 'Adult', nationality: 'Nigeria', document: 'Confirmed' }, { name: 'Mrs. Kolade Adebayo', type: 'Adult', nationality: 'Nigeria', document: 'Confirmed' }],
    ancillaries: [{ name: 'Spa Package (x2)', price: '120.00' }],
    details: { hotel: 'Burj Al Arab', stars: 7, location: 'Jumeirah St, Dubai, UAE', checkIn: '28-07-2026 (15:00)', checkOut: '02-08-2026 (12:00)', nights: 5, room: 'Duplex Ocean Suite', board: 'Full Board', guests: '2 Adults' }
  },
  {
    id: 22, invoice: 'S3324069', moduleType: 'stays', moduleName: 'Booking.com\nStays', booking: 'CANCELLED', payment: 'REFUNDED', price: '260.00', earning: '0.00', user: 'Blessing Obi\nblessing.o@example.com', ref: 'BK-78801', createdAt: '2026-07-05 09:20 AM',
    passengers: [{ name: 'Ms. Blessing Obi', type: 'Adult', nationality: 'Nigeria', document: 'Cancelled' }],
    ancillaries: [],
    details: { hotel: 'Sheraton Abuja Hotel', stars: 4, location: 'Ladi Kwali St, Abuja, Nigeria', checkIn: '12-07-2026 (14:00)', checkOut: '15-07-2026 (12:00)', nights: 3, room: 'Superior Room', board: 'Room Only', guests: '1 Adult' }
  },
  {
    id: 23, invoice: 'S4435170', moduleType: 'stays', moduleName: 'Hotelbeds\nStays', booking: 'PENDING', payment: 'UNPAID', price: '300.00', earning: '30.00', user: 'Oluwaseun Babatunde\nseun.b@example.com', ref: 'Pending', createdAt: '2026-07-14 10:05 AM',
    passengers: [{ name: 'Mr. Oluwaseun Babatunde', type: 'Adult', nationality: 'Nigeria', document: 'Pending' }],
    ancillaries: [{ name: 'Late Check-out (14:00)', price: '30.00' }],
    details: { hotel: 'Radisson Blu Anchorage Hotel', stars: 5, location: '1A Ozumba Mbadiwe, Lagos, Nigeria', checkIn: '25-07-2026 (15:00)', checkOut: '28-07-2026 (12:00)', nights: 3, room: 'Business Class Room', board: 'Breakfast Included', guests: '1 Adult' }
  },

  // ─── TOURS ──────────────────────────────────────────────────────
  {
    id: 8, invoice: 'C06A1401', moduleType: 'tours', moduleName: 'Viator\nTours', booking: 'CONFIRMED', payment: 'PAID', price: '85.00', earning: '8.50', user: 'Elena Rodriguez\nelena.r@example.com', ref: 'VT-7712', createdAt: '2026-07-11 15:40 PM',
    passengers: [{ name: 'Ms. Elena Rodriguez', type: 'Adult', nationality: 'Spain', document: 'Voucher Issued' }],
    ancillaries: [{ name: 'English Speaking Guide', price: 'Included' }],
    details: { tour: 'Desert Safari with BBQ Dinner', location: 'Dubai, UAE', date: '24-07-2026', time: '15:30 PM', duration: '6 Hours', meetingPoint: 'Hotel Pickup', inclusions: 'Dune Bashing, Camel Ride, Dinner' }
  },
  {
    id: 24, invoice: 'T1103821', moduleType: 'tours', moduleName: 'Viator\nTours', booking: 'CONFIRMED', payment: 'PAID', price: '145.00', earning: '14.50', user: 'Yemi Adeleke\nyemi.a@example.com', ref: 'VT-9934', createdAt: '2026-07-09 11:00 AM',
    passengers: [{ name: 'Mr. Yemi Adeleke', type: 'Adult', nationality: 'Nigeria', document: 'Voucher Issued' }, { name: 'Mrs. Yemi Adeleke', type: 'Adult', nationality: 'Nigeria', document: 'Voucher Issued' }],
    ancillaries: [],
    details: { tour: 'Pyramids of Giza & Sphinx Full Day Tour', location: 'Cairo, Egypt', date: '30-07-2026', time: '08:00 AM', duration: '8 Hours', meetingPoint: 'Hotel Pickup', inclusions: 'Guided Tour, Entry Tickets, Lunch, Transport' }
  },
  {
    id: 25, invoice: 'T2214932', moduleType: 'tours', moduleName: 'Viator\nTours', booking: 'PENDING', payment: 'UNPAID', price: '60.00', earning: '6.00', user: 'Tariq Mahmoud\ntariq.m@example.com', ref: 'Pending', createdAt: '2026-07-14 07:45 AM',
    passengers: [{ name: 'Mr. Tariq Mahmoud', type: 'Adult', nationality: 'United Arab Emirates', document: 'Pending' }],
    ancillaries: [],
    details: { tour: 'Abu Dhabi City Tour', location: 'Abu Dhabi, UAE', date: '23-07-2026', time: '09:00 AM', duration: '4 Hours', meetingPoint: 'Hotel Pickup', inclusions: 'Sheikh Zayed Mosque, Corniche, Guides' }
  },
  {
    id: 26, invoice: 'T3325043', moduleType: 'tours', moduleName: 'Viator\nTours', booking: 'CONFIRMED', payment: 'PAID', price: '220.00', earning: '22.00', user: 'Priya Sharma\npriya.s@tripmate.in', ref: 'VT-5521', createdAt: '2026-07-08 13:15 PM',
    passengers: [{ name: 'Ms. Priya Sharma', type: 'Adult', nationality: 'India', document: 'Voucher Issued' }, { name: 'Mr. Rahul Sharma', type: 'Adult', nationality: 'India', document: 'Voucher Issued' }],
    ancillaries: [{ name: 'Photography Package', price: '35.00' }],
    details: { tour: 'Taj Mahal Sunrise Tour with Agra Fort', location: 'Agra, India', date: '28-07-2026', time: '05:30 AM', duration: '10 Hours', meetingPoint: 'Hotel Pickup (Delhi)', inclusions: 'Transport, Guide, Entry, Breakfast' }
  },

  // ─── VISA ────────────────────────────────────────────────────────
  {
    id: 2, invoice: '3D54E422', moduleType: 'visa', moduleName: 'Internal\nVisa', booking: 'PENDING', payment: 'UNPAID', price: '120.00', earning: '25.00', user: 'Fatima Al-Sayed\nfatima.sayed@example.com', ref: 'APP-9921', createdAt: '2026-07-14 09:06 AM',
    passengers: [{ name: 'Ms. Fatima Al-Sayed', type: 'Adult', nationality: 'Nigeria', document: 'Under Review' }],
    ancillaries: [{ name: 'Biometric Appointment Assistance', price: '15.00' }],
    details: { country: 'United Kingdom', visaType: 'Tourist Visa', entry: 'Multiple Entry', duration: '6 Months', processing: 'Standard (7-10 Days)', applicant: 'Fatima Al-Sayed', passport: 'A0098123' }
  },
  {
    id: 27, invoice: 'V1104723', moduleType: 'visa', moduleName: 'Internal\nVisa', booking: 'CONFIRMED', payment: 'PAID', price: '85.00', earning: '20.00', user: 'Emeka Nwosu\nemeka.n@example.com', ref: 'APP-7710', createdAt: '2026-07-05 10:30 AM',
    passengers: [{ name: 'Mr. Emeka Nwosu', type: 'Adult', nationality: 'Nigeria', document: 'Visa Approved' }],
    ancillaries: [],
    details: { country: 'Canada', visaType: 'Visitor Visa', entry: 'Single Entry', duration: '30 Days', processing: 'Express (3-5 Days)', applicant: 'Emeka Nwosu', passport: 'B0112233' }
  },
  {
    id: 28, invoice: 'V2215834', moduleType: 'visa', moduleName: 'Internal\nVisa', booking: 'CONFIRMED', payment: 'PAID', price: '65.00', earning: '15.00', user: 'Zainab Hassan\nzainab.h@example.com', ref: 'APP-6654', createdAt: '2026-07-03 14:00 PM',
    passengers: [{ name: 'Ms. Zainab Hassan', type: 'Adult', nationality: 'Nigeria', document: 'Visa Approved' }],
    ancillaries: [],
    details: { country: 'United Arab Emirates', visaType: 'Tourist Visa', entry: 'Multiple Entry', duration: '90 Days', processing: 'Standard (7-10 Days)', applicant: 'Zainab Hassan', passport: 'C0223344' }
  },
  {
    id: 29, invoice: 'V3326945', moduleType: 'visa', moduleName: 'Internal\nVisa', booking: 'PENDING', payment: 'UNPAID', price: '200.00', earning: '40.00', user: 'Oluwaseun Babatunde\nseun.b@example.com', ref: 'APP-8832', createdAt: '2026-07-14 11:00 AM',
    passengers: [{ name: 'Mr. Oluwaseun Babatunde', type: 'Adult', nationality: 'Nigeria', document: 'Under Review' }],
    ancillaries: [{ name: 'Document Translation Service', price: '30.00' }],
    details: { country: 'United States', visaType: 'Business Visa', entry: 'Multiple Entry', duration: '6 Months', processing: 'Rush (1-2 Days)', applicant: 'Oluwaseun Babatunde', passport: 'D0334455' }
  },
  {
    id: 30, invoice: 'V4437056', moduleType: 'visa', moduleName: 'Internal\nVisa', booking: 'CANCELLED', payment: 'REFUNDED', price: '55.00', earning: '0.00', user: 'Blessing Obi\nblessing.o@example.com', ref: 'APP-5543', createdAt: '2026-06-28 09:00 AM',
    passengers: [{ name: 'Ms. Blessing Obi', type: 'Adult', nationality: 'Nigeria', document: 'Cancelled' }],
    ancillaries: [],
    details: { country: 'Schengen (France)', visaType: 'Tourist Visa', entry: 'Multiple Entry', duration: '90 Days', processing: 'Standard (7-10 Days)', applicant: 'Blessing Obi', passport: 'E0445566' }
  },

  // ─── UMRAH ───────────────────────────────────────────────────────
  {
    id: 9, invoice: '00405814', moduleType: 'umrah', moduleName: 'Internal\nUmrah', booking: 'PENDING', payment: 'UNPAID', price: '1850.00', earning: '150.00', user: 'Omar Farooq\nomar.f@example.com', ref: 'UMR-5541', createdAt: '2026-07-10 11:10 AM',
    passengers: [{ name: 'Mr. Omar Farooq', type: 'Adult', nationality: 'Nigeria', document: 'Pending' }],
    ancillaries: [{ name: 'Haram View Room Upgrade', price: '200.00' }],
    details: { package: '14 Days Premium Umrah', makkahHotel: 'Swissôtel Makkah (5★) - 7 Nights', madinahHotel: 'Pullman Zamzam (5★) - 7 Nights', transport: 'Private VIP SUV', visaIncluded: 'Yes', flightsIncluded: 'No' }
  },
  {
    id: 31, invoice: 'U1106521', moduleType: 'umrah', moduleName: 'Internal\nUmrah', booking: 'CONFIRMED', payment: 'PAID', price: '2400.00', earning: '200.00', user: 'Amina Yusuf\namina.y@example.com', ref: 'UMR-7712', createdAt: '2026-07-01 08:00 AM',
    passengers: [{ name: 'Ms. Amina Yusuf', type: 'Adult', nationality: 'Nigeria', document: 'Visa Issued' }, { name: 'Mr. Usman Yusuf', type: 'Adult', nationality: 'Nigeria', document: 'Visa Issued' }],
    ancillaries: [{ name: 'Ziyarat Tour Package', price: '180.00' }],
    details: { package: '21 Days Economy Umrah', makkahHotel: 'Mövenpick Hotel (4★) - 14 Nights', madinahHotel: 'Al Ansar (3★) - 7 Nights', transport: 'Shared Bus', visaIncluded: 'Yes', flightsIncluded: 'Yes' }
  },
  {
    id: 32, invoice: 'U2217632', moduleType: 'umrah', moduleName: 'Internal\nUmrah', booking: 'CONFIRMED', payment: 'PAID', price: '3200.00', earning: '280.00', user: 'Tariq Mahmoud\ntariq.m@example.com', ref: 'UMR-3398', createdAt: '2026-06-25 15:30 PM',
    passengers: [{ name: 'Mr. Tariq Mahmoud', type: 'Adult', nationality: 'United Arab Emirates', document: 'Visa Issued' }, { name: 'Mrs. Layla Mahmoud', type: 'Adult', nationality: 'United Arab Emirates', document: 'Visa Issued' }, { name: 'Master Khalid Mahmoud', type: 'Child', nationality: 'United Arab Emirates', document: 'Visa Issued' }],
    ancillaries: [{ name: 'Premium Ziyarat (x3)', price: '300.00' }, { name: 'Wheelchair Assistance', price: '0.00' }],
    details: { package: '10 Days VIP Umrah', makkahHotel: 'Raffles Makkah Palace (5★) - 6 Nights', madinahHotel: 'Anwar Al Madinah Mövenpick (5★) - 4 Nights', transport: 'Private VIP Van', visaIncluded: 'No', flightsIncluded: 'No' }
  },
  {
    id: 33, invoice: 'U3328743', moduleType: 'umrah', moduleName: 'Internal\nUmrah', booking: 'PENDING', payment: 'UNPAID', price: '1600.00', earning: '120.00', user: 'Zainab Hassan\nzainab.h@example.com', ref: 'UMR-9901', createdAt: '2026-07-13 19:00 PM',
    passengers: [{ name: 'Ms. Zainab Hassan', type: 'Adult', nationality: 'Nigeria', document: 'Pending' }],
    ancillaries: [],
    details: { package: '14 Days Standard Umrah', makkahHotel: 'Dar Al Tawhid (4★) - 7 Nights', madinahHotel: 'Oberoi Madinah (5★) - 7 Nights', transport: 'Shared Bus', visaIncluded: 'Yes', flightsIncluded: 'No' }
  },

  // ─── BUS ─────────────────────────────────────────────────────────
  {
    id: 16, invoice: 'B99812A', moduleType: 'bus', moduleName: 'Internal\nBus', booking: 'CONFIRMED', payment: 'PAID', price: '25.00', earning: '2.50', user: 'Samuel Ojo\nsamuel.o@example.com', ref: 'TK-1102', createdAt: '2026-07-14 08:10 AM',
    passengers: [{ name: 'Mr. Samuel Ojo', type: 'Adult', nationality: 'Nigeria', document: 'Seat 14A' }],
    ancillaries: [],
    details: { operator: 'GUO Transport', from: 'Lagos (Jibowu)', to: 'Abuja (Utako)', depDate: '18-07-2026', depTime: '06:00 AM', arrTime: '18:00 PM', seat: '14A (Window)', busType: 'AC Executive' }
  },
  {
    id: 34, invoice: 'B1105241', moduleType: 'bus', moduleName: 'Internal\nBus', booking: 'CONFIRMED', payment: 'PAID', price: '18.00', earning: '1.80', user: 'Chinedu Okafor\nchinedu@example.com', ref: 'TK-2291', createdAt: '2026-07-12 07:30 AM',
    passengers: [{ name: 'Mr. Chinedu Okafor', type: 'Adult', nationality: 'Nigeria', document: 'Seat 7B' }],
    ancillaries: [],
    details: { operator: 'ABC Transport', from: 'Lagos (Mile 2)', to: 'Benin City', depDate: '15-07-2026', depTime: '07:00 AM', arrTime: '13:00 PM', seat: '7B (Aisle)', busType: 'AC Standard' }
  },
  {
    id: 35, invoice: 'B2216352', moduleType: 'bus', moduleName: 'Internal\nBus', booking: 'PENDING', payment: 'UNPAID', price: '35.00', earning: '3.50', user: 'Ngozi Eze\nngozi.e@aeropoint.com', ref: 'Pending', createdAt: '2026-07-14 12:00 PM',
    passengers: [{ name: 'Ms. Ngozi Eze', type: 'Adult', nationality: 'Nigeria', document: 'Pending' }],
    ancillaries: [],
    details: { operator: 'Peace Mass Transit', from: 'Abuja (Utako)', to: 'Enugu (New Market)', depDate: '19-07-2026', depTime: '08:00 AM', arrTime: '14:30 PM', seat: 'Pending', busType: 'AC Executive' }
  },
  {
    id: 36, invoice: 'B3327463', moduleType: 'bus', moduleName: 'Internal\nBus', booking: 'CANCELLED', payment: 'REFUNDED', price: '22.00', earning: '0.00', user: 'Emeka Nwosu\nemeka.n@example.com', ref: 'TK-3302', createdAt: '2026-07-10 09:00 AM',
    passengers: [{ name: 'Mr. Emeka Nwosu', type: 'Adult', nationality: 'Nigeria', document: 'Cancelled' }],
    ancillaries: [],
    details: { operator: 'Young Shall Grow Motors', from: 'Lagos (Ojota)', to: 'Port Harcourt (Rumuola)', depDate: '13-07-2026', depTime: '06:30 AM', arrTime: '16:00 PM', seat: '11C', busType: 'AC Standard' }
  },
];