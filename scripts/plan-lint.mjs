#!/usr/bin/env node
// plan-lint: 计划的"契约自检"。只做机械检查,不做价值判断。
// 用法: node plan-lint.mjs <plan.md> [--warn-only]
import { readFileSync } from 'node:fs';

const file = process.argv[2];
const warnOnly = process.argv.includes('--warn-only');
if (!file) { console.error('usage: plan-lint.mjs <plan.md> [--warn-only]'); process.exit(2); }

const text = readFileSync(file, 'utf8');
const lines = text.split(/\r?\n/);
const errors = [];
const warnings = [];
const err = (n, m) => errors.push(`line ${n}: ${m}`);
const warn = (n, m) => warnings.push(`line ${n}: ${m}`);

const stripCode = (s) => s.replace(/`[^`]*`/g, 'X');
const cells = (line) => {
  const t = stripCode(line).trim();
  if (!t.startsWith('|')) return null;
  const body = t.replace(/^\|/, '').replace(/\|\s*$/, '');
  return body.split('|').map((c) => c.trim());
};
const blank = (c) => !c || c === '—' || c === '-';

// --- collect tables by section heading ---
const sections = [];
let cur = { title: '', line: 0, rows: [] };
lines.forEach((l, i) => {
  if (/^#{1,6}\s/.test(l)) { sections.push(cur); cur = { title: l, line: i + 1, rows: [] }; return; }
  const c = cells(l);
  if (c) cur.rows.push({ line: i + 1, cells: c });
});
sections.push(cur);
const find = (re) => sections.filter((s) => re.test(s.title));

// 1. milestone table
const ms = find(/里程碑|milestone/i).filter((s) => !/看板|board|progress/i.test(s.title));
if (!ms.length) err(1, '没有找到里程碑表(标题含“里程碑”)');
const msIds = new Set();
for (const s of ms) {
  for (const r of s.rows) {
    if (/^\|?\s*-{3,}/.test(r.cells[0])) continue; // separator
  const m = r.cells[0].match(/\*\*(M[^*|]+)\*\*/) || r.cells[0].match(/^(M[0-9]+(?:\.[0-9]+)?(?:-[A-Za-z0-9]+)?)\b/);
    if (!m) continue;
    msIds.add(m[1]);
    if (r.cells.length < 4) err(r.line, `里程碑 ${m[1]} 只有 ${r.cells.length} 列,应有 4 列(编号/名称/内容/出口条件)`);
    const cond = r.cells[3] || '';
    if (blank(cond)) err(r.line, `里程碑 ${m[1]} 的出口条件为空`);
    for (const w of ['完善', '优化', '尽量', '基本', '稳定', '差不多', '保持一致', '跑通', '覆盖到位']) {
      if (cond.includes(w)) err(r.line, `里程碑 ${m[1]} 的出口条件含不可判词“${w}”`);
    }
  }
}
if (!msIds.size) err(1, '里程碑表里没有识别到任何 M 编号');

// 2. board ids == milestone ids
const bd = find(/看板|board|progress/i);
if (!bd.length) err(1, '没有找到进度看板');
const bdIds = new Set();
for (const s of bd) for (const r of s.rows) {
  const m = r.cells[0].match(/\*\*(M[^*|]+)\*\*/) || r.cells[0].match(/^(M[0-9]+(?:\.[0-9]+)?(?:-[A-Za-z0-9]+)?)\b/);
  if (!m) continue;
  const id = m[1];
  bdIds.add(id);
  if (!/⬜|🚧|✅|🟡/.test(r.cells[1] || '')) warn(r.line, `看板 ${id} 的状态不是 ⬜/🚧/✅`);
}
if (bdIds.size) {
  for (const id of msIds) if (!bdIds.has(id)) err(1, `里程碑 ${id} 不在看板里`);
  for (const id of bdIds) if (!msIds.has(id)) err(1, `看板里的 ${id} 不在里程碑表中`);
}

// 3. defect ledger
const dd = find(/台账|缺陷|ledger|defect|risk/i);
const dIds = [];
for (const s of dd) for (const r of s.rows) {
  const m = r.cells[0].match(/\*\*(D\d+)\*\*/) || r.cells[0].match(/^(D\d+)$/);
  if (!m) continue;
  dIds.push(m[1]);
  if (r.cells.length < 3) err(r.line, `缺陷 ${m[1]} 只有 ${r.cells.length} 列,缺关闭条件`);
  else if (blank(r.cells[2])) err(r.line, `缺陷 ${m[1]} 的关闭条件为空`);
}
if (dd.length && !dIds.length) warn(1, '有台账小节但没识别到 D 编号');

// 4. baseline table: third column (复核方式) non-empty
const bl = find(/基线|baseline/i);
for (const s of bl) for (const r of s.rows) {
  if (r.cells.length < 3) { warn(r.line, '基线行少于 3 列,可能缺“复核方式”'); continue; }
  if (blank(r.cells[2])) err(r.line, '基线行缺“复核方式”');
}

// 5. non-goals
if (!/非目标|明确不做|不做清单|不做什么|non-goal|out of scope/i.test(text)) err(1, '没有“非目标 / 明确不做”小节(做什么之外,必须写不做什么)');

// 6. version decision
if (!/版本判定|PATCH|MINOR|MAJOR/i.test(text)) warn(1, '没看到版本判定(PATCH/MINOR/MAJOR)');

// 7. cut list
if (!/砍尾|不可砍|可砍|cut list|scope cut/i.test(text)) warn(1, '没看到砍尾顺序');

const summary = `plan-lint: ${errors.length} error(s), ${warnings.length} warning(s) — ${file}`;
for (const w of warnings) console.log('warn  ' + w);
for (const e of errors) console.log('ERROR ' + e);
console.log(summary);
process.exit(errors.length && !warnOnly ? 1 : 0);
