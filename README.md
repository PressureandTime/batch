# Batch Transaction Processor

A React and TypeScript app for uploading, validating, reviewing and confirming batch transfers from CSV files. It shows invalid rows before confirmation and uses virtualization to keep large files responsive.

[View the portfolio case study](https://www.petar.rocks/work/batch/)

## What it does

- Three-step flow for batch details, record review and confirmation
- Strict CSV schema validation with Zod and an optional permissive header mode
- State-preserving back and forward navigation
- Virtualized record review for large files
- Synthetic test data covering files with up to 10,000 rows
- Unit and component tests with Vitest and Testing Library
- End-to-end coverage with Playwright

## Technology

- React 19, TypeScript and Vite
- Chakra UI for the component system
- Zustand for client state
- React Hook Form and Zod for form and schema validation
- Papa Parse for CSV processing
- TanStack Virtual for large review sets
- Vitest, Testing Library and Playwright for automated tests

## Getting started

Prerequisites: Node.js and npm.

```bash
npm ci
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Quality checks

```bash
npm run lint
npm run build
npm run test -- --run
npm run test:e2e
```

Playwright starts the development server automatically for the end-to-end suite.

Playwright browsers:

- Browsers are installed automatically during `npm install` (postinstall runs `playwright install`).
- Linux only: if your system is missing shared libraries, run `npm run setup:e2e:linux` once (may require sudo).

## Usage

1. Start the app and open the home page.
2. Select **Batch Transfer**.
3. Enter a batch name, upload a CSV and select an approver. Sample files are available in [`sample-data/`](sample-data/).
4. Review the parsed rows and resolve validation errors.
5. Review the totals and confirm the batch.

After confirmation, new transactions appear in the home table. You can navigate back and forth between steps without losing data.

## CSV contract

| Header | Requirement |
| --- | --- |
| `Transaction Date` | Valid date in `YYYY-MM-DD` format |
| `Account Number` | Matches `000-000000000-00` |
| `Account Holder Name` | Non-empty value |
| `Amount` | Positive decimal |

Example:

```
Transaction Date,Account Number,Account Holder Name,Amount
2025-02-20,000-123456789-01,John Doe,100.00
```

## Header validation mode

By default, the app accepts only the canonical headers shown above. Matching is case-insensitive and trims or collapses whitespace. Synonyms are not accepted in strict mode.

An optional permissive mode normalizes these common variations:

- `Txn Date` to `Transaction Date`
- `Acct Number` to `Account Number`
- `Name` to `Account Holder Name`

The mode is controlled by `STRICT_HEADER_MODE` in [`src/config/csv-validation.ts`](src/config/csv-validation.ts). End-to-end tests verify the default strict behavior.

## Test coverage

- Valid, invalid and partially valid CSV uploads
- Strict header validation and row-level error feedback
- State preservation when moving between steps
- Confirmation and transaction-list updates
- Large valid and mixed datasets containing up to 10,000 rows

See [`TESTING_GUIDE.md`](TESTING_GUIDE.md) for the test structure and commands.
