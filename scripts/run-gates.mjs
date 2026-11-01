#!/usr/bin/env node
// run-gates: 顺序跑一组门禁命令,只报 exit code 与输出尾部。不做判断。
// 用法: node run-gates.mjs gates.txt [--tail=3] [--stop]
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const file = process.argv[2];
if (!file) { console.error('usage: run-gates.mjs <gates.txt>'); process.exit(2); }
const tail = Number((process.argv.find((a) => a.startsWith('--tail=')) || '--tail=3').split('=')[1]);
const stop = process.argv.includes('--stop');

const cmds = readFileSync(file, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
let failed = 0;
for (const cmd of cmds) {
  let out = '', code = 0;
  try { out = execSync(cmd, { shell: true, stdio: 'pipe', encoding: 'utf8' }); }
  catch (e) { code = e.status ?? 1; out = String(e.stderr || e.stdout || e.message); }
  const lines = out.split(/\r?\n/).filter(Boolean);
  console.log(`\n$ ${cmd}`);
  console.log(`exit=${code}`);
  for (const l of lines.slice(-tail)) console.log('  ' + l);
  if (code !== 0) { failed++; if (stop) { console.log('\n[stopped on first failure]'); break; } }
}
console.log(`\ngates: ${cmds.length} run, ${failed} non-zero`);
process.exit(failed ? 1 : 0);
