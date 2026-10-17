# React + TypeScript + Vite

## Flight Inventory Data

The Flight Management page only requests API inventory when `VITE_FLIGHT_INVENTORY_ENDPOINT` is configured. The endpoint is requested through the existing Axios client and may return either a JSON array of flights or an object with a `flights` array. Each flight must include string values for `provider`, `airline`, `flightNumber`, `origin`, `destination`, and `departure`. Optional fields include `id`, `arrival`, `status`, `availability`, `retrievedAt`, and `offers`.

A flight can have many fare offers, and each offer is modelled and priced on its own rather than as one price per passenger type. An offer has an optional `id`, `cabinClass`, `fareBrand`, `fareBasis`, `bookingClass`, `baggage`, `conditions`, `currency`, `availability`, `validUntil`, and a `prices` array. Each price accepts `passengerType` (or `passengerCombination` when the supplier prices a whole passenger group), `baseFare`, `taxesAndFees`, `supplierTotal`, `markup`, and `sellingPrice`. A flat `fares` list is still accepted and is grouped into offers by cabin, brand, fare basis, booking class, baggage, conditions and currency.

AIR/CSV imports group rows into the same structure: rows for one flight (flight number, route and departure) that differ in cabin, brand, baggage, conditions or currency become separate offers, and a new offer for an already imported flight is added to it. Set `VITE_FLIGHT_REVALIDATE_ENDPOINT` to enable supplier revalidation: the page POSTs `{ id }` and expects one flight in the same contract, re-priced by the supplier. AeroPoint markup is configured per fare offer by administrators and stored in this browser; it never alters supplier fare data.

API requests use `VITE_API_BASE_URL` when configured and the existing `aeropoint_token` local-storage token. No provider-specific adapter or booking revalidation endpoint is included; the detail page therefore keeps supplier revalidation disabled and never presents sample data as live inventory.

Flight fare displays are converted to NGN using the admin's saved exchange rates. Rates are stored in browser local storage and apply to list prices, fare details, edit defaults, and import previews. Imported price rows require a supported source currency and a configured rate; missing or unsupported rates are reported rather than estimated.

AIR/CSV import accepts delimited text files with configurable headers and field mapping. Imported records and import history are stored in the current browser's local storage, not a shared server database. Imported inventory is a snapshot and must be checked with a compatible supplier before booking.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
