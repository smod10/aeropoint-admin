# Airline Deals: Admin and Customer Mismatch Report

Scope: the current admin `AirlineDeal` model and `ManagedBooking` type, the customer `NormalizedFlightResult`/`FlightCard` shape, static deal adapter, flight details modal, and checkout demo. This report proposes backend interfaces only; it does not implement an API or alter either app's storage.

## Deal Fields Versus Customer Display

| Area | Admin model | Customer site | Gap or implication |
| --- | --- | --- | --- |
| Identity | Deal ID is a string; `status` is Draft, Active, Paused, or Expired. | Result `id` is numeric. The adapter derives it from the numeric suffix in the sample deal ID. The result itself has no deal ID or status. | A live adapter needs a stable result ID plus a separate `dealId`; the current suffix mapping is only suitable for fixtures. Customer visibility must be based on server-eligible active deals. |
| Title, description, image | Deal has `title`, `description`, `image`, `featured`, and `displayOrder`. | `FlightCard` has no title, description, or image field. The card displays a separate Special offer label. | Deal images and descriptions are not shown in search results. Featured/order values are not consumed by the search adapter. |
| Airline and flight number | Top-level values are legacy summaries; each segment has its own marketing and optional operating airline and flight number. | The result card has one `airline` and one `flightNumber`. | A multi-airline or connecting itinerary can only show a primary segment in the card. The full segment list is not represented in the result contract. |
| Route and journey | Admin has ordered outbound segments and an optional ordered return journey, with airport codes, terminals, local times, and day offsets. | The card has flat departure/arrival airport and time fields, plus a layover list containing airport, optional country, and formatted duration. It has no terminal, operating carrier, segment flight number, or day offset fields. | The adapter flattens outbound data. The details modal now renders actual supplied deal segments and hides a missing return journey. The flat result still cannot carry every per-segment field. |
| Stops and duration | Admin stores legacy top-level `stops`; journey segments are the detailed source. | Result has numeric `stops` and formatted string `duration`. | These must be calculated from segments using airport time zones. Do not trust the admin summary fields for live result metrics. |
| Layovers | Admin segments determine each connection and its timing, airport change, overnight, and over-24-hour conditions. | Customer layovers have only airport, optional country, and formatted duration. | The card can show a basic connection summary, but cannot show all admin warnings or connection metadata. |
| Price and passenger types | Admin has currency, adult/child/infant base fares and taxes, schedule default adult price, and adult price overrides on exceptions. | The card has one formatted string `price`. The deal adapter sends the adult total. Checkout currently presents one adult's amount; it does not calculate child/infant totals from the deal's passenger fares. | Keep numeric currency amounts authoritative in the API. Format only at the UI boundary. Return per-passenger fare breakdowns if checkout is to support all passenger types. |
| Baggage | Admin stores baggage per segment and a legacy top-level summary. | The card's optional baggage summary is derived from deal segments; the modal shows baggage only on segments that provide it. Normal flight results without baggage omit the section. | No generic baggage allowance is displayed. The customer result contract has optional `baggage`; per-segment baggage remains in the adapter envelope for the itinerary modal. |
| Refundability and fare rules | `AirlineDeal` has no refund, change, or fare-rule fields. | Hardcoded “Partially Refundable”, “Flexible Ticket”, and generic ticket rules have been removed. | Refund/rule sections are omitted because no source value exists. Add typed deal refund/fare conditions on the admin/backend side before exposing those claims. |
| Schedule | Admin has travel bounds, sales bounds, weekday defaults, return-day offset, per-date exceptions, seats, price overrides, and closed dates. | The adapter checks active status, sales/travel dates, route/trip type, weekdays, closed exceptions, and remaining seats for a departure. | Search results do not carry the full schedule or seat count. Booking must recheck seat availability and price atomically on the server. The current card does not show sale cutoff or date-specific inventory. |
| Connection validation | Admin stores `minimumConnectionMinutes` and validates a deal's segments. | Customer adapter calculates elapsed time and layovers but does not enforce that minimum during search. | Only publish validated deals; the backend should validate again when deals are saved and when a booking is created. |
| Booking | Admin has generic `ManagedBooking` lifecycle/payment fields and arbitrary string `details`. It has no typed deal-ticketing model. | Checkout demo shows an in-memory Pending ticketing confirmation after simulated payment; reload/navigation loses it. The customer account reads static fixtures. | There is no live or persisted contract connecting customer checkout to admin deal bookings. A DealBooking API and ticketing statuses are still needed. |
| Search-specific presentation | Admin has `featured` and `displayOrder`; it has no `isCheapest` field. | Customer result has optional `isCheapest`; the adapter adds Special offer as a separate card prop, not a result field. | Keep ranking and deal badges as presentation metadata; do not persist them as deal eligibility or ticketing state. |

## Missing Data

- **Admin deal model:** customer-facing refundability/change rules and a stable public image contract are not defined beyond an image string. The current booking model does not type deal ID, selected departure, passenger snapshot, ticketing status, PNR, ticket numbers, or e-ticket document.
- **Customer result/checkout:** deal ID is carried separately from `NormalizedFlightResult`; the flat result has no return journey, passenger fare breakdown, segment details, terminals, arrival-day offsets, booking cutoff, refund rules, or availability count. Baggage is optional and sourced only when the deal provides it. The simulated confirmation has no booking record and no payment verification.
- **Both apps:** there is no shared backend, cross-app data contract at runtime, seat hold, or server-side price revalidation. Browser local storage in the admin is not shared with the customer site.

## Checkout And Admin Booking Differences

The customer checkout currently sends deal identity, title, selected dates, trip type, airline/flight summary, cabin, fare, and tax through React Router state. That state is temporary and disappears on reload. The traveler/contact forms are not assembled into a submitted passenger object. Paystack's browser callback displays a provider reference and a pending-verification message, but does not create a booking. The simulated deal confirmation creates only a component-state reference and the text “Pending ticketing.” The customer account page continues to read static `CustomerBooking` fixtures.

The admin `ManagedBooking` requires `id`, `bookingType`, `bookingId`, `customerId`, `customerName`, `customerEmail`, `customerPhone`, `guestBooking`, `amount`, `currency`, `bookingStatus`, `paymentStatus`, `createdAt`, and a free-form `details` map. That is enough for a generic booking list, but it does not formally describe the selected deal, departure inventory, passenger list, itinerary snapshot, fare split, payment-provider reference/verification, or ticketing workflow. The admin `details` map can carry strings, but relying on it for these fields loses type validation and stable semantics.

Differences in each direction:

- Customer checkout needs account-or-guest identity, contact details, structured passengers, selected deal and departure/return dates, the purchased itinerary snapshot, amount/currency and fare breakdown, payment verification, and a booking reference. The current UI captures some traveler/contact fields visually, but does not submit them as a booking payload; passenger counts and fares are not expanded into one record per traveler.
- Admin needs customer/guest ownership, generic booking/payment lifecycle, and timestamps. The customer `CustomerBooking` fixture instead uses `reference`, `ownerEmail`, `category`, `title`, `summary`, `dateLabel`, `startDate`, customer-facing status text, `amountPaid`, free-form `paymentStatus`, traveler summary, label/value details, document names, notes, and balance due date. These fields/statuses do not directly match `ManagedBooking`.
- Deal ticketing additionally needs a ticketing status, airline booking reference/PNR, ticket numbers, e-ticket document, ticketing deadline, and a reason when ticketing fails. None is a first-class field in `ManagedBooking`; the current proposed shared `DealBooking` in `airline-deals-contract.md` covers these fields but is not implemented by either app.

## Risks And Bugs

- Deal details now render the supplied outbound and return segments and hide absent segment fields. Normal inventory flights still use the modal's demo fare choices; the demo UI is not a supplier-confirmed itinerary or price.
- Customer search currently starts from fixed LOS/LHR display state and has hardcoded normal flights, counts, carousel prices, and calendar values. A live deal search must use the submitted search criteria consistently rather than those fallbacks.
- The customer card now shows baggage only when supplied by the deal and omits refund/fare-rule sections because the current admin Deal has no such fields. Those sections should remain hidden until authoritative condition data is added.
- The adapter checks deal status, sales/travel dates, weekday schedule, exceptions, route, trip type, and seats, but it is a static client demo. Seat counts, price, booking cutoff, and connection validity must be rechecked server-side at booking time.
- A browser-side payment callback or simulated confirmation is not proof of payment. Only a verified provider webhook should move a booking to paid and trigger Pending ticketing.
- Admin data is local-storage scoped to the admin origin; customer-side fixtures and in-memory checkout state are separate. No current change can make these live or cross-app without an API.

## Booking API Example

Checkout request (passenger details abbreviated):

```json
{
  "dealId": "deal-demo-2",
  "departureDate": "2026-11-24",
  "returnDate": null,
  "passengers": [{ "type": "adult", "firstName": "Ada", "lastName": "Okafor" }],
  "currency": "NGN",
  "idempotencyKey": "checkout-attempt-unique-value"
}
```

After server-side price/seat validation, return a booking reference and payment initialization. After a verified payment webhook, set `paymentStatus` to `Paid` and `ticketingStatus` to `Pending ticketing`. The booking response should include the shared `DealBooking` fields; it should not trust a client-calculated amount as authoritative.

## Suggested Backend Interface

These are implementation suggestions, not existing endpoints.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/deals/search?origin=LOS&destination=LHR&departureDate=2026-11-24&tripType=One-way&passengers=1` | Return eligible deals, selected-date seats/pricing, `dealId`, and a `NormalizedFlightResult`. Include `returnDate` for return searches. |
| `GET /api/deals/{dealId}` | Return public deal and complete outbound/return journeys; omit internal notes. |
| `POST /api/deal-bookings` | Validate current price/seats, reserve inventory, accept passengers/dates/idempotency key, and return `DealBooking` plus payment initialization. |
| `POST /api/payments/webhook` | Verify the provider event and update payment state; do not trust a client success flag. |
| `GET /api/deal-bookings/{bookingId}` | Return customer-visible booking, payment, and ticketing status. |
| `GET /api/admin/deals`, `POST /api/admin/deals`, `PATCH /api/admin/deals/{dealId}` | List/create/edit shared `Deal` records and validate schedule/connections. |
| `PATCH /api/admin/deal-bookings/{bookingId}/ticketing` | Set ticketing status and record PNR, ticket numbers, e-ticket URL, or cannot-ticket reason. |

Example search response:

```json
{
  "items": [
    {
      "dealId": "deal-demo-2",
      "dealTitle": "Lagos to London via Paris",
      "departureDate": "2026-11-24",
      "returnDate": null,
      "adultPrice": 810000,
      "currency": "NGN",
      "result": {
        "id": 102,
        "airline": "Air France",
        "flightNumber": "AF 149",
        "departureTime": "22:45",
        "arrivalTime": "09:00",
        "departureAirport": "LOS",
        "arrivalAirport": "LHR",
        "duration": "11h 15m",
        "stops": 1,
        "price": "₦810,000",
        "layovers": [
          { "airport": "CDG", "country": "France", "duration": "2h 30m" }
        ]
      }
    }
  ]
}
```

The booking endpoint should return the shared `DealBooking` shape from `airline-deals-contract.md`, with `paymentStatus: "Pending"` until payment verification and `ticketingStatus: "Pending ticketing"` after successful payment confirmation.