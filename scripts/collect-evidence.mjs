#!/usr/bin/env node
// collect-evidence: 收集"这一单做了什么"的原始证据。不写结论。
// 用法: node collect-evidence.mjs [baseRef] > evidence.md
import { execSync } from 'node:child_process';

const base = process.argv[2] || 'HEAD~1';
const run = (cmd) => { try { return execSync(cmd, { shell: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim(); } catch (e) { return `<failed: ${String(e.message).split('\n')[0]}>`; } };

const out = [];
out.push('# Evidence', '', `- base: \`${base}\``, `- head: \`${run('git rev-parse --short HEAD')}\``, `- branch: \`${run('git rev-parse --abbrev-ref HEAD')}\``, '');
out.push('## Commits', '', '\u0060\u0060\u0060', run(`git log --oneline ${base}..HEAD`) || '(none)', '\u0060\u0060\u0060', '');
out.push('## Diff stat', '', '\u0060\u0060\u0060', run(`git diff --stat ${base}..HEAD`) || '(none)', '\u0060\u0060\u0060', '');
out.push('## Working tree', '', '\u0060\u0060\u0060', run('git status --porcelain') || '(clean)', '\u0060\u0060\u0060', '');
out.push('## Content-clean check', '', `\`git diff --quiet \\u003cpath\\u003e\`: use it instead of git status when autocrlf is on.`, '');
out.push('## CI runs', '', '\u0060\u0060\u0060', run('gh run list --limit 5 --json databaseId,headSha,conclusion') || '(gh unavailable)', '\u0060\u0060\u0060', '');
console.log(out.join('\n'));
