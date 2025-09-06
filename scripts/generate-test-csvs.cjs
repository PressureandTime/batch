#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(process.cwd(), 'sample-data');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writeCsv(file, rows) {
  const p = path.join(outDir, file);
  const content = rows.join('\n') + '\n';
  fs.writeFileSync(p, content, 'utf8');
  console.log(`Wrote ${file} (${rows.length - 1} data rows)`);
}

function pad(n, len) {
  return String(n).padStart(len, '0');
}

function genAccount(i) {
  const nine = pad(100000000 + (i % 900000000), 9);
  const two = pad(i % 100, 2);
  return `000-${nine}-${two}`;
}

function genName(i) {
  const first = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Hank', 'Ivy', 'Jack'];
  const last = [
    'Johnson',
    'Smith',
    'Williams',
    'Brown',
    'Davis',
    'Miller',
    'Wilson',
    'Moore',
    'Taylor',
    'Anderson',
  ];
  return `${first[i % first.length]} ${last[i % last.length]}`;
}

function genDate(i) {
  const month = pad((i % 12) + 1, 2);
  const day = pad((i % 28) + 1, 2);
  return `2025-${month}-${day}`;
}

function formatWithThousands(n) {
  const str = n.toFixed(2);
  const [int, dec] = str.split('.');
  const withComma = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${withComma}.${dec}`;
}

function genPositiveAmount(i) {
  // Ensure strictly positive base >= 1.00 (avoid 0.00 when i=9999)
  const baseInt = (i % 9999) + 1; // 1..9999
  const base = baseInt + (i % 100) / 100;
  const useComma = i % 10 === 0;
  if (useComma && base >= 1000) {
    return `"${formatWithThousands(base)}"`; // quote when comma present
  }
  return base.toFixed(2);
}

function genMaybeInvalidAmount(i) {
  const base = (i % 10000) + (i % 100) / 100;
  const useComma = i % 10 === 0;
  if (useComma && base >= 1000) {
    return `"${formatWithThousands(base)}"`;
  }
  return base.toFixed(2);
}

function makeHeader() {
  return 'Transaction Date,Account Number,Account Holder Name,Amount';
}

function generateLargeValid(n = 10000) {
  const rows = [makeHeader()];
  for (let i = 0; i < n; i++) {
    rows.push(`${genDate(i)},${genAccount(i)},${genName(i)},${genPositiveAmount(i)}`);
  }
  writeCsv(`large-valid-${n}.csv`, rows);
}

function generateLargeMixed(n = 10000) {
  const rows = [makeHeader()];
  for (let i = 0; i < n; i++) {
    const kind = i % 5; // 0 valid; others invalid patterns
    if (kind === 0) {
      rows.push(`${genDate(i)},${genAccount(i)},${genName(i)},${genPositiveAmount(i)}`);
    } else if (kind === 1) {
      // invalid date format
      rows.push(
        `2025/${pad((i % 12) + 1, 2)}/${pad((i % 28) + 1, 2)},${genAccount(i)},${genName(
          i
        )},${genMaybeInvalidAmount(i)}`
      );
    } else if (kind === 2) {
      // invalid account pattern
      rows.push(`${genDate(i)},000${pad(i, 13)},${genName(i)},${genMaybeInvalidAmount(i)}`);
    } else if (kind === 3) {
      // empty name
      rows.push(`${genDate(i)},${genAccount(i)},,${genMaybeInvalidAmount(i)}`);
    } else {
      // non-positive amount
      rows.push(`${genDate(i)},${genAccount(i)},${genName(i)},-10.00`);
    }
  }
  writeCsv(`large-mixed-${n}.csv`, rows);
}

function generateHeaderMismatch() {
  const rows = ['Txn Date,Acct Number,Name,Amount', '2025-02-20,000-123456789-01,John Doe,100.00'];
  writeCsv('header-mismatch.csv', rows);
}

function generateEdgeAmounts() {
  const rows = [
    makeHeader(),
    `2025-01-01,000-123456789-01,Zero Test,0.00`,
    `2025-01-02,000-123456789-02,Negative Test,-1.00`,
    `2025-01-03,000-123456789-03,Comma Big,"${formatWithThousands(1234567.89)}"`,
    `2025-01-04,000-123456789-04,Spaces ,   250.50  `,
    `2025-01-05,000-123456789-05,Trim Test, 100.00 `,
  ];
  writeCsv('edge-amounts.csv', rows);
}

function generateBoundaryDates() {
  const rows = [
    makeHeader(),
    '2024-02-29,000-123456789-01,Leap Day Valid,100.00',
    '2025-02-29,000-123456789-02,Leap Day Invalid,100.00',
    '2025-04-31,000-123456789-03,Invalid Day,100.00',
    '2025-12-31,000-123456789-04,Year End,100.00',
  ];
  writeCsv('boundary-dates.csv', rows);
}

ensureDir(outDir);
// Curated datasets to keep in repo
generateLargeValid(100);
generateLargeMixed(100);
generateLargeValid(1000);
generateLargeMixed(1000);
generateLargeValid(10000);
generateLargeMixed(10000);
// Larger datasets for performance testing (git-ignored)
generateLargeValid(50000);
generateLargeMixed(50000);
generateLargeValid(100000);
generateLargeMixed(100000);
generateLargeValid(200000);
generateLargeMixed(200000);

generateHeaderMismatch();
generateEdgeAmounts();
generateBoundaryDates();
