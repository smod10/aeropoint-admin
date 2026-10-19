# Amadeus Markup Rules API Contract

The current UI persists flight-module rules and B2C defaults in browser `localStorage` under `aeropoint-amadeus-markup-rules-v1` and `aeropoint-amadeus-markup-defaults-v1`, keyed by module ID. `src/services/markupRulesApi.ts` contains the future Axios adapter; the editor does not call it until a backend is available.

## Endpoints

All endpoints are scoped to the integration/module ID and use the existing bearer-token Axios client.

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/integrations/{moduleId}/markup-rules` | List rules, including inactive rules |
| POST | `/integrations/{moduleId}/markup-rules` | Create a manual rule; server sets ID and timestamps |
| PATCH | `/integrations/{moduleId}/markup-rules/{ruleId}` | Update rule fields; API-sourced discount fields must be rejected or ignored |
| DELETE | `/integrations/{moduleId}/markup-rules/{ruleId}` | Delete a rule |
| POST | `/integrations/{moduleId}/markup-rules/test-price` | Evaluate a fare using active rules and supplied default pricing |

The test-price request is `{ airlineCode, origin, destination, cabin, fare, date?, defaults }`. The response should include `appliedRule`, `fare`, `airlineDiscount`, `ourCost`, `passedDiscount`, `markup`, `tax`, `customerPrice`, `marginAmount`, and `marginPercent`. Search results and booking repricing should call the same server-side pricing service as this endpoint.

## Persistence Shape

Store rule ownership by integration, not by mutable display name. Recommended tables are `markup_rules` and `markup_rule_routes`; one rule has zero or more route rows. Route rows store nullable origin/destination values and their `airport`, `city`, or `country` types. Use a foreign key to the integration record, checks for discount/markup type and source, and indexes on integration, airline, active status, cabin, and validity dates. Store values as decimal money/percent fields, not floating-point columns.

The rule record maps to the UI model as follows: `airlineCode` → `airline_code`, `markupValueB2C` → `markup_value_b2c`, `passThroughPercent` → `pass_through_percent`, `validFrom`/`validTo` → `valid_from`/`valid_to`, `priority` → `priority`, `isActive` → `is_active`, and `source` → `source` (`MANUAL` or `API`). Module pricing and airline rules are B2C-only; B2B markup fields are removed.

## Pricing Semantics

Select only active, date-valid, airline/cabin/route-matching rules. Rank exact airline + airport route above airline + city/country/partial route, then airline-only; use descending `priority` for equal specificity. With no match, use the existing default B2C markup. Airline discount reduces our cost. The pass-through share reduces the published fare for the customer; add rule/default markup, then apply default tax. Margin is calculated before tax. A result below the configured minimum margin is returned with a warning; the UI does not silently block the fare.

No database migration is included: this workspace contains no backend or migration framework. The schema and routes above are the implementation contract for the backend project.