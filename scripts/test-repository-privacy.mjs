import test from 'node:test';
import assert from 'node:assert/strict';
import { privateRepositoryPath } from './audit-repository-privacy.mjs';

test('blocks operational exports and credential files, including nested paths', () => {
  for (const file of [
    '.env', '.env.production', 'server/.env.local', '.pgpass', 'secrets/server.key',
    'cert.pem', 'identity.p12', 'identity.pfx', 'database.dump', 'database.bak',
    'users.sqlite', 'users.sqlite3', 'users.db', 'output/customers.json', 'review_exports/users.csv',
    'private_exports/members.json', 'backups/database.sql',
    'audit_artifacts/report.json', 'supabase/.temp/connection', 'results.sarif',
    'nested\\review_exports\\users.csv',
  ]) assert.equal(privateRepositoryPath(file), true, file);
});

test('allows public configuration examples, migrations and product assets', () => {
  for (const file of [
    '.env.example', 'server/.env.example', 'docs/assets/landing.png',
    'src/data/flashcards.json', 'supabase/schema.sql', 'docs/evidence/checksums.json',
    'scripts/test-repository-privacy.mjs',
  ]) assert.equal(privateRepositoryPath(file), false, file);
});
