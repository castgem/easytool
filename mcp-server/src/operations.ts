import { PDFDocument, degrees } from 'pdf-lib';
import { createHash } from 'node:crypto';

function decodeBase64Pdf(b64: string): Uint8Array {
  const cleaned = b64.replace(/^data:application\/pdf;base64,/, '');
  return Uint8Array.from(Buffer.from(cleaned, 'base64'));
}

function encodeBase64Pdf(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

export async function mergePdf(files: string[]): Promise<string> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const src = await PDFDocument.load(decodeBase64Pdf(file), {
      ignoreEncryption: true,
    });
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  return encodeBase64Pdf(await merged.save());
}

export async function splitPdf(
  file: string,
  startPage: number,
  endPage: number
): Promise<string> {
  const src = await PDFDocument.load(decodeBase64Pdf(file), {
    ignoreEncryption: true,
  });
  const total = src.getPageCount();
  if (startPage < 1 || endPage < startPage || endPage > total) {
    throw new Error(
      `Invalid page range ${startPage}-${endPage} (document has ${total} pages)`
    );
  }
  const out = await PDFDocument.create();
  const indices = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage - 1 + i
  );
  const pages = await out.copyPages(src, indices);
  pages.forEach((p) => out.addPage(p));
  return encodeBase64Pdf(await out.save());
}

export async function rotatePdf(
  file: string,
  rotation: 90 | 180 | 270
): Promise<string> {
  const doc = await PDFDocument.load(decodeBase64Pdf(file), {
    ignoreEncryption: true,
  });
  for (const page of doc.getPages()) {
    const current = page.getRotation().angle;
    page.setRotation(degrees(current + rotation));
  }
  return encodeBase64Pdf(await doc.save());
}

export async function extractPages(
  file: string,
  pages: number[]
): Promise<string> {
  const src = await PDFDocument.load(decodeBase64Pdf(file), {
    ignoreEncryption: true,
  });
  const total = src.getPageCount();
  const out = await PDFDocument.create();
  const indices = pages.map((p) => {
    if (p < 1 || p > total) {
      throw new Error(`Page ${p} out of range (1-${total})`);
    }
    return p - 1;
  });
  const copied = await out.copyPages(src, indices);
  copied.forEach((p) => out.addPage(p));
  return encodeBase64Pdf(await out.save());
}

export async function pdfPageCount(file: string): Promise<number> {
  const doc = await PDFDocument.load(decodeBase64Pdf(file), {
    ignoreEncryption: true,
  });
  return doc.getPageCount();
}

export function base64Encode(text: string): string {
  return Buffer.from(text, 'utf8').toString('base64');
}

export function base64Decode(text: string): string {
  return Buffer.from(text, 'base64').toString('utf8');
}

export function formatJson(text: string, indent = 2): string {
  return JSON.stringify(JSON.parse(text), null, indent);
}

export function hashText(text: string, algorithm: 'sha256' = 'sha256'): string {
  return createHash(algorithm).update(text, 'utf8').digest('hex');
}

export function urlEncode(text: string): string {
  return encodeURIComponent(text);
}

export function urlDecode(text: string): string {
  return decodeURIComponent(text);
}
