declare module 'airport-timezone' {
  type AirportTimeZone = {
    code: string;
    countryCode: string;
    timezone: string;
    offset: { gmt: number; dst: number };
  };

  const airportTimeZones: AirportTimeZone[];
  export default airportTimeZones;
}