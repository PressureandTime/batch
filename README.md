# Batch Transaction Processor

A React + TypeScript + Vite app for uploading a CSV of bank transactions, validating the data, and reviewing a 3‑step batch transfer flow.

## Tech Stack

- React 19, TypeScript (strict), Vite
- Chakra UI for accessible UI primitives
- Zustand for local state
- Zod for validation
- Vitest + Testing Library for unit tests
- Playwright for end‑to‑end tests

## Development

- Install deps: `npm install`
- Start dev server: `npm run dev`
- Type check + build: `npm run build`
- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`

## Project Structure (high‑level)

- `src/features/transactions/components/BatchTransferModal`
  - Step1_Details: step 1 form (batch name, approver, CSV upload)
    - Step1ApproverField: Approver select subcomponent
    - Step1SelectedFileName: Selected file display
  - Step2_Review: CSV parsing + validation + review table
    - Step2ReviewControls: Counts + filter toggle
    - Step2ReviewTable: Virtualized/regular table rendering
  - Step3_Summary: summary stats and confirmation
- `src/features/transactions/components/TransactionsTable`: list of processed transactions

## CSV Expectations

Headers (case/spacing tolerant via normalization):

- Transaction Date (YYYY-MM-DD)
- Account Number (format: 000-000000000-00)
- Account Holder Name
- Amount

Invalid rows display field‑level errors in the review step.

## Testing Notes

- Unit tests (Vitest) cover parsing/validation and UI behavior
- Playwright suite exercises full flow including 10k‑row CSVs

## Accessibility & Responsiveness

- Uses Chakra UI semantics and roles
- Tables are horizontally scrollable on small screens

## License

MIT
