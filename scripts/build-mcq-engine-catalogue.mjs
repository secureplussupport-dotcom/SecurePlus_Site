import { writeFileSync, readFileSync } from 'node:fs';
import { readPublicationFixtures } from './lib/read-publication-fixtures.mjs';
const { assets, oracle } = readPublicationFixtures();
const rows = oracle(assets).mcqs;
const output = `${JSON.stringify(rows, null, 2)}\n`;
const path = 'server/mcq-engine/base-catalogue.json';
if (process.argv.includes('--check')) {
  if (readFileSync(path, 'utf8') !== output) throw new Error('Rebuild the server MCQ catalogue.');
} else writeFileSync(path, output);
console.log(`Server MCQ catalogue: ${rows.length} source-bound questions.`);
