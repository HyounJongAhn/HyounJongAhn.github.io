import { execFileSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(command, args, options = {}) {
  execFileSync(command, args, { stdio: 'inherit', cwd: ROOT, ...options });
}

run('node', [path.join('scripts', 'build-data.mjs')]);

const diff = execFileSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' }).trim();
if (!diff) {
  console.log('No publishable changes.');
  process.exit(0);
}

run('git', ['add', '.']);
run('git', ['commit', '-m', `Publish ransomware brief ${new Date().toISOString()}`]);
run('git', ['push', 'origin', 'HEAD']);
