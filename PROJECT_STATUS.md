# Aeropoint: project status

## What we're building
A flight booking platform with a customer website (React, repo: C:\Users\USER\Desktop\aeropoint-express) and an admin dashboard (React, path: C:\Users\USER\Desktop\aeropoint-admin). Flights come from GDS/API modules (Amadeus, AirGateway). There is no back end yet. This work is front end only, to check the two apps line up and to prepare a handover for a back end developer.

## Key decisions
- We create our own airline deals in the admin ("Airline Deals"), separate from the Markup & Tax config. Deals appear in customer search like normal flights (source = DIRECT, "Special offer" label) and in a homepage offers slider.
- Bookings on deals are ticketed manually from the admin (status "Pending ticketing"), not through a GDS API.
- Markup & Tax keeps only the default markup (B2C only, B2B removed), base currency (NGN) and tax. Nothing about airline deals there.
- Deals are built from journeys and segments (for connecting flights). Stops, total time and layovers are calculated, never typed.
- Schedule uses defaults plus exceptions, not a per-day table. Seats are tracked per departure date.
- No hardcoded baggage or refund text. Only show what a deal provides. A deal can only be Active when image, baggage, passenger fares and fare conditions are filled in.
- Payment and seat logic are left to the back end (server-side payment confirmation, seat holds, and price and seat re-checks).
- No mock API server and no import feature. No CSV export.

## AirGateway findings (from their API file)
- Deals can be attached through "qualifiers" (contract_id, promo_code, account_id) per airline, and via AgencyPresets. Booking flow: AirShopping, OfferPrice, OrderCreate, AirDocIssue.
- Prices come in "consumer" and "provider" versions (possibly different currencies). Markup is not in the API.
- Open questions for AirGateway: which airlines accept codes, whether AgencyPresets shows our deals, what consumer and provider prices mean, sandbox details, and the error when a price changes.

## Done so far
- Contract file: airline-deals-contract.md; report: airline-deals-mismatch-report.md
- Customer site: deals shown in search through an adapter (stops, duration and layovers verified), conditional baggage and fare conditions, incomplete deals excluded, checkout demo showing "Pending ticketing"
- Admin: deal form with images (compressed, 2 MB limit), baggage, passenger fares, fare conditions and activation checks; Deal Bookings page with ticketing fields, deadline countdown, validation and activity log
- All Flights removed (from menu, routes and code)
- All Deals pagination: Previous and Next arrows with "Page X of Y", rows per page dropdown (10, 25, 50, 100 default), no page number buttons. Shared PaginationControls component, same style as Hotel Management page. Resets to page 1 when search/filters change, localStorage persists rows-per-page choice.
- Deals form with journeys and segments (connecting flights), stops/total time/layovers calculated
- Schedule uses defaults plus exceptions (not per-day table)
- B2B removed from Markup & Tax tab (B2C only, no airline deals on that page)
- CSV export removed (not wanted)
- Deal Bookings page with ticketing fields, deadline countdown, validation and activity log
- Known unrelated lint issues: sidebar and HotelMarkupRules.tsx; 6 npm audit warnings (not fixed, for the developer)

## Still to do
- Final walkthrough: create a connecting deal in the admin, find the equivalent on the customer site, book it, ticket it
- Handover pack for the back end developer: the two contract files plus an endpoint list

## Working rules for the AI
- One step at a time. Wait for confirmation before the next.
- Reuse existing components, styles and data formats. Do not create duplicates.
- Do not read .env files or keys. Do not run npm audit fix.
- Update this file after each step.
