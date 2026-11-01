# 示例派单:M1 修 12 条坏链

```text
你在 D:\work\doc-site 执行里程碑 M1。当前 dev 分支,HEAD abc1234。

## 开工前必读
docs/plans/link-fix.md(只看 M1 与 D1)、CONTRIBUTING.md。

## 范围
只改:docs/**.md、public/_redirects
禁止:src/**、package.json、.github/**

## 目标
站内 12 条坏链全部可解析。

## 验收(自己先跑,把原样输出留下)
1. node scripts/linkcheck.mjs → "broken: 0",exit 0
2. npm test → 88/88
3. grep -rn "old-api" docs/ → 只允许出现在 _redirects 里

## 提交与汇报
- 在 dev 上提交;**不要 push**;
- 报「待审核」+ ① linkcheck 原样输出 ② 测试计数 ③ commit 列表 ④ 做法与偏离;
- 不要改看板;另附「发现但没动手改的问题」。

## 硬规矩
- 不改内容语义,只改链接或加重定向;
- 异常立刻停下报告,不要补救式重试。
```
