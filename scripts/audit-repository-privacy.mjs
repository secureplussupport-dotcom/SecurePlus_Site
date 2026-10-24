import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// Filename protection complements secret scanning; it cannot classify arbitrary PII.
export function privateRepositoryPath(file) {
  const path = file.replaceAll('\\', '/');
  const name = path.split('/').at(-1);
  return /(^|\/)(output|review_exports|audit_artifacts|private_exports|backups|\.temp)(\/|$)/i.test(path)
    || (name !== '.env.example' && /^\.env(?:\.|$)/i.test(name))
    || /^\.pgpass$/i.test(name)
    || /\.(pem|key|p12|pfx|dump|bak|db|sqlite3?|sarif)$/i.test(name);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const files = execFileSync('git', ['ls-files', '--cached', '-z'], { encoding: 'utf8' })
    .split('\0').filter(Boolean);
  const blocked = files.filter(privateRepositoryPath);
  if (blocked.length) {
    console.error('Private-file patterns found in the Git index (filenames only):');
    for (const file of blocked) console.error(`- ${file}`);
    process.exitCode = 1;
  } else {
    console.log(`Repository privacy paths: PASS (${files.length} indexed files).`);
  }
}
