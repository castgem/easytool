#!/usr/bin/env node
/**
 * Repackage vendored tgz files under the tooleasy-* naming convention.
 * Run after updating vendor tarballs in vendor/tooleasy-pdfium and vendor/tooleasy-viewer.
 */
import {
  mkdirSync,
  rmSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VENDOR = join(ROOT, 'vendor');

const PACKAGES = [
  { dir: 'tooleasy-pdfium', name: 'tooleasy-pdfium' },
  { dir: 'tooleasy-viewer', name: 'tooleasy-viewer' },
  { dir: 'tooleasy-pymupdf-wasm', name: '@tooleasy/pymupdf-wasm' },
  { dir: 'tooleasy-gs-wasm', name: '@tooleasy/gs-wasm' },
];

function repackLocal({ dir, name }) {
  const srcDir = join(VENDOR, dir);
  if (!existsSync(srcDir)) {
    console.log(`skip (missing): ${dir}`);
    return;
  }

  const tgz = readdirSync(srcDir).find((f) => f.endsWith('.tgz'));
  if (!tgz) throw new Error(`No tgz in ${srcDir}`);

  const work = join(tmpdir(), `tooleasy-repack-${dir}`);
  rmSync(work, { recursive: true, force: true });
  mkdirSync(work, { recursive: true });

  execSync(`tar -xzf "${join(srcDir, tgz)}" -C "${work}"`);
  const pkgJsonPath = join(work, 'package', 'package.json');
  const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
  pkg.name = name;
  writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n');

  const version = pkg.version ?? '0.0.0';
  const hash = tgz.match(/-([a-f0-9]+)\.tgz$/)?.[1];
  const baseName = name.replace('@tooleasy/', 'tooleasy-');
  const newTgz = hash
    ? `${baseName}-${hash}.tgz`
    : `${baseName}-${version}.tgz`;
  const destDir = join(VENDOR, dir);
  rmSync(join(destDir, tgz), { force: true });
  execSync(`tar -czf "${join(destDir, newTgz)}" -C "${work}" package`);

  console.log(`repackaged: ${name} (${newTgz})`);
  return { dir, name, newTgz };
}

const results = PACKAGES.map(repackLocal).filter(Boolean);

const pkgPath = join(ROOT, 'package.json');
const rootPkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
for (const r of results) {
  rootPkg.dependencies[r.name] = `file:vendor/${r.dir}/${r.newTgz}`;
}
delete rootPkg.dependencies['tooleasy-pdfium'];
delete rootPkg.dependencies['tooleasy-viewer'];
delete rootPkg.dependencies['@tooleasy/pymupdf-wasm'];
delete rootPkg.dependencies['@tooleasy/gs-wasm'];
writeFileSync(pkgPath, JSON.stringify(rootPkg, null, 2) + '\n');
console.log('updated package.json');
