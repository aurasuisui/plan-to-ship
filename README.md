# plan-to-ship

> 先写可判的计划，再把里程碑一个一个派给子智能体，自己只做审核。

一个给 AI 编码 agent 用的 **skill**（技能包）：把「制定计划 → 派单 → 审核」变成可执行流程，而不是靠临场发挥。

**来源**：这套流程是在参加 **MoonBit 黑客松**（OSC 2026，2026-10）期间，用真实项目
[`moonbit-multiindex`](https://github.com/aurasuisui/moonbit-multiindex) 的 **v0.2.2 发布周期**
跑出来的 —— 从写计划到打 tag 上线，每个里程碑都派给子智能体执行，主会话只负责复跑与判分。
踩过的坑（台账被写坏、门禁假绿、发布后 tag 树缺陷……）都固化在 `references/failure-modes.md` 里。

---

## 它解决什么问题

| 失效模式 | 现象 | 这个 skill 的约束 |
|---|---|---|
| 自己给自己判分 | 执行方说「已完成」，其实只跑了一半 | 子智能体只能报「待审核」；✅ 只能由审核者填 |
| 报告当证据 | 一句「测试都过了」，没人知道跑的哪条命令 | 四件必报：命令原样输出 / 测试计数 / commit 列表 / 做法与偏离 |
| 上下文丢失 | 换会话后忘了当初为什么这么定 | 计划是契约，看板是台账，只追加不回改 |
| 破坏性操作失手 | 自动重试 publish、force-push、删分支 | 不可逆动作必须人类确认，一次口令一次尝试 |

## 里面有什么

```
SKILL.md                       主流程：三个模式 + 七块契约 + 生命周期 + 硬规矩
references/
  plan-template.md             计划骨架（七块，可直接抄）
  brief-template.md            派单模板（范围/禁止/验收/停下点）
  review-checklist.md          审核八查（每条给命令）
  failure-modes.md             失败模式库（症状 → 机制 → 对策）
scripts/
  plan-lint.mjs                契约自检：里程碑有没有可执行的出口条件、看板与里程碑是否对齐……
  run-gates.mjs                顺序跑一组门禁命令，只输出 exit code 与输出尾部
  collect-evidence.mjs         收集 commit/diff/CI 原始证据，不下结论
examples/
  plan.example.md              一份最小可用计划
  brief.example.md             一份派单
```

## 怎么用

把它放进你的 agent 的 skills 目录（不同客户端路径不同，常见的是
`<workspace>/.agents/skills/`、`<workspace>/.dsh/skills/` 或用户级 skills 目录），然后：

```
你：制定计划
agent：侦察仓库 → 写 docs/plans/<name>.md → 跑 plan-lint → 停下问「是否开始执行」
你：开始执行
agent：一次派一个里程碑给子智能体 → 收四件真实输出 → 自己复跑 → 判 ✅ / 驳回 → 下一个
```

触发不需要逐字匹配：「定个修复计划」「拆成几个里程碑」「开始动工」都算。
**不适用**：单文件小改、方案还没定的探索期、连一条可执行验收命令都写不出来的活。

### 脚本单独也能用

```bash
node scripts/plan-lint.mjs path/to/plan.md     # 0 error 才准派单
node scripts/run-gates.mjs gates.txt           # 一行一条命令
node scripts/collect-evidence.mjs HEAD~1       # 生成 evidence.md
```

`plan-lint` 中英文计划都能检查；它只做机械检查，**输出里不出现 ✅/❌** —— 判分永远是人做。

## 设计原则

1. **判分权分离**：写的人不判，判的人不写。
2. **出口条件必须可执行**：命令可判 > 数据可判 > 观察可判；禁用「完善 / 优化 / 基本完成」这类词。
3. **一次一个里程碑**：小到能在一轮内验收完。
4. **契约优先于派单**：派单写错了，按计划办。
5. **只追加不回改**：发现旧记录错了，写「更正」，不抹历史。
6. **不可逆动作单点批准**：发布、打 tag、合并、删除、强推，都要人类先点头。

## 它不做什么

- 不生成业务代码，不替代人的判断；
- 不是项目管理工具（没有看板 UI、没有排期）；
- 不保证「按流程走就一定对」—— 它保证的是**每一步都留下可复查的证据**。

## English

A skill for **contract-driven delivery** with AI coding agents: turn a request into a plan whose
every milestone has executable exit criteria, then dispatch **one milestone at a time** to a
subagent while the main session independently re-runs the checks and owns the status board.
Includes a plan template, a dispatch brief template, an 8-point review checklist, a failure-mode
library, and three small scripts (`plan-lint`, `run-gates`, `collect-evidence`).

Distilled from shipping a real library's v0.2.2 release during the **MoonBit hackathon (OSC 2026)**.

## License

MIT. See [LICENSE](LICENSE).
