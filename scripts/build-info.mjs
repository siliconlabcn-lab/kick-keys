import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
let commit = process.env.GITHUB_SHA || 'local-preview';
if (commit === 'local-preview') {
  try { commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch {}
}
writeFileSync('dist/build-info.json', JSON.stringify({ commit, builtAt: new Date().toISOString(), source: 'siliconlabcn-lab/kick-keys' }) + '\n');
