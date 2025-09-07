# Batch Transaction Processor

A small React + TypeScript + Vite app that processes batch transfers from a CSV. Upload a file, review the records, and confirm the batch in a simple three step flow.

## What’s included

- Batch Transfer modal with three steps (details, review, summary)
- CSV parsing and validation
- Transactions table on the home page with status labels and tooltips
- Sample CSV files for quick testing

## Tech stack

- React 19, TypeScript, Vite
- Chakra UI
- Zustand for client state
- Zod for validation
- Vitest + Testing Library for unit tests
- Playwright for end to end tests

## Key libraries

- Papa Parse: CSV parsing and streaming
- React Hook Form: forms and validation wiring
- @tanstack/react-virtual: virtualization for large review tables
- uuid: unique IDs for transactions

## Getting started

Prerequisites: Node and npm.

- Install dependencies: `npm install`
- Start the dev server: `npm run dev` (http://localhost:5173)
- Type check and build: `npm run build`
- Run unit tests: `npm run test`
- Run e2e tests: `npm run test:e2e` (Playwright starts the dev server automatically)

Playwright browsers:

- Browsers are installed automatically during `npm install` (postinstall runs `playwright install`).
- Linux only: if your system is missing shared libraries, run `npm run setup:e2e:linux` once (may require sudo).

## Usage

1. Start the app and open the home page
2. Click “Batch Transfer”
3. Step 1: enter a batch name, upload a CSV, select an approver (sample files live in `sample-data/`)
4. Step 2: review parsed rows and fix any validation errors
5. Step 3: review totals and confirm

After confirmation, new transactions appear in the home table. You can navigate back and forth between steps without losing data.

## CSV format

Headers:

- Transaction Date (YYYY-MM-DD)
- Account Number (000-000000000-00)
- Account Holder Name
- Amount

Example:

```
Transaction Date,Account Number,Account Holder Name,Amount
2025-02-20,000-123456789-01,John Doe,100.00
```

## Validation rules

- Transaction Date must be a valid date in YYYY-MM-DD
- Account Number must match 000-000000000-00
- Account Holder Name must not be empty
- Amount must be a positive decimal

## Header validation mode

By default, the app enforces strict header compliance exactly as defined in requirements.md:

- Transaction Date
- Account Number
- Account Holder Name
- Amount

Matching is case-insensitive and trims/collapses whitespace. Synonyms are NOT accepted by default.

If you need to accept a few common header variations, you can enable a permissive mode in code:

- Location: src/config/csv-validation.ts
- Flag: STRICT_HEADER_MODE (boolean)

Modes:

- STRICT (default, recommended for audits): Only canonical headers accepted
- PERMISSIVE (opt-in): Also accept and normalize these synonyms:
  - "Txn Date" → "Transaction Date"
  - "Acct Number" → "Account Number"
  - "Name" → "Account Holder Name"

Note: End-to-end tests validate the default STRICT behavior.

Where to switch header mode: src/config/csv-validation.ts (set STRICT_HEADER_MODE).

See requirements.md for the full spec and extra examples.

## Notes

- Playwright uses http://localhost:5173 by default (see playwright.config.ts)
- Large CSVs from `sample-data/` are available for stress testing

## License

MIT
