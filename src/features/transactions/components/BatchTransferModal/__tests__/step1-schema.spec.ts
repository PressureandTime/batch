import { describe, it, expect } from 'vitest';
import { makeStep1Schema } from '../Step1_Details';

function makeFile(name: string, type: string): File {
  return new File([new Uint8Array([1, 2, 3])], name, { type });
}

function asFileList(files: File[]): FileList {
  // Minimal FileList-like object sufficient for our schema guard
  const arr = files.slice();
  const pseudo = {
    length: arr.length,
    item: (i: number) => (arr[i] ?? null) as File | null,
  } as unknown as FileList;
  // index accessors for 0..n-1
  arr.forEach((f, i) => ((pseudo as unknown as Record<number, File>)[i] = f));
  return pseudo;
}

describe('Step1 schema (stored file vs DOM FileList)', () => {
  it('fails when no stored file and empty/invalid file input', () => {
    const schema = makeStep1Schema(false);
    const empty = { batchName: 'x', approver: 'Alice Johnson', file: undefined } as unknown as {
      batchName: string;
      approver: string;
      file?: FileList | undefined;
    };
    const res = schema.safeParse(empty);
    expect(res.success).toBe(false);
  });

  it('allows empty DOM FileList when a stored file exists', () => {
    const schema = makeStep1Schema(true);
    const empty = { batchName: 'x', approver: 'Alice Johnson', file: undefined } as unknown as {
      batchName: string;
      approver: string;
      file?: FileList | undefined;
    };
    const res = schema.safeParse(empty);
    expect(res.success).toBe(true);
  });

  it('accepts CSV by type or name, rejects non-CSV', () => {
    const schema = makeStep1Schema(false);
    const csvByType = {
      batchName: 'x',
      approver: 'Alice Johnson',
      file: asFileList([makeFile('any.txt', 'text/csv')]),
    } as unknown as { batchName: string; approver: string; file: FileList };
    const csvByName = {
      batchName: 'x',
      approver: 'Alice Johnson',
      file: asFileList([makeFile('sample.csv', 'application/octet-stream')]),
    } as unknown as { batchName: string; approver: string; file: FileList };
    const notCsv = {
      batchName: 'x',
      approver: 'Alice Johnson',
      file: asFileList([makeFile('doc.pdf', 'application/pdf')]),
    } as unknown as { batchName: string; approver: string; file: FileList };

    expect(schema.safeParse(csvByType).success).toBe(true);
    expect(schema.safeParse(csvByName).success).toBe(true);
    expect(schema.safeParse(notCsv).success).toBe(false);
  });
});
