# plan-to-ship

> **主会话负责判断，子智能体负责动手；子智能体的自述不算证据，主会话要自己复跑一遍。**

一个给 AI coding agent 用的 skill：**主会话 ↔ 子智能体协作协议**。
它回答一个问题——当工作要交给子智能体时，谁定标准、谁干活、谁来验收、证据长什么样。

**来源**：参加 **MoonBit 黑客松**（OSC 2026，2026-10）期间，用真实项目的 v0.2.2 发布周期跑出来的流程沉淀。
踩过的坑都固化在 `references/failure-modes.md`。

---

## 它管什么

| 谁 | 只做这些 | 绝不 |
|---|---|---|
| **主会话** | 定契约、派单、**独立复跑**、判定、维护台账 | 替子智能体写实现、替自己判分 |
| **子智能体** | 执行**一个**里程碑、报「待审核」+ 四件真实输出 | 给自己判分、改台账 |
| **人类** | 拍板不可逆动作（发布 / 合并 / 删除 / 强推） | 被自动重试绕过 |

计划不是文档作业，是**派单的依据**和**审核的清单**；没有可执行的出口条件，验收就只能凭感觉。

## 里面有什么

```
SKILL.md                        协议主体：角色边界、生命周期、铁律
references/
  onboarding-a-session.md       把一个新会话带进方向：验证 → 复述 → 再开工
  brief-template.md             派单模板（范围 / 禁止 / 验收 / 停下点）
  review-checklist.md           审核八查（每条给命令）
  plan-template.md              契约骨架（七块）
  failure-modes.md              失败模式库（症状 → 机制 → 对策）
scripts/
  plan-lint.mjs                 契约自检
  run-gates.mjs                 顺序跑门禁
  collect-evidence.mjs          收原始证据
examples/
  plan.example.md               一份最小契约
  brief.example.md              一份派单
```

## 装与用

放进 agent 的 skills 目录（`<workspace>/.agents/skills/`、`<workspace>/.dsh/skills/` 或用户级目录），然后：

```
你：制定计划
主会话：侦察 → 写契约 → plan-lint → 停下问「是否开始执行」

你：开始执行
主会话：派 M1 给子智能体 → 收四件输出 → 自己复跑 → 判 ✅ / 驳回 → 下一个
```

触发不需要逐字匹配：「定个修复计划」「拆成几个里程碑」「派子智能体去做」「开始动工」都算。

**不适用**：单文件小改、方案还没定的探索期、写不出任何可执行验收命令的活。

### 脚本单独也能用

```bash
node scripts/plan-lint.mjs path/to/plan.md     # 0 error 才准派单
node scripts/run-gates.mjs gates.txt           # 一行一条命令
node scripts/collect-evidence.mjs HEAD~1       # 生成 evidence.md
```

脚本只做机械检查，输出里**不出现 ✅/❌** —— 判分永远由人做。

## 深入阅读

- 协作边界与派单细节：`SKILL.md` §3.5、`references/brief-template.md`
- 新会话怎么接手方向：`references/onboarding-a-session.md`
- 审核怎么算数：`references/review-checklist.md`
- 踩过哪些坑：`references/failure-modes.md`

## English

A **main-session ↔ subagent collaboration protocol** for coding agents: the main session writes a
contract with executable exit criteria, briefs one milestone at a time, then independently re-runs
the checks instead of trusting the report — and alone owns the status board.
Includes templates, an 8-point review checklist, a failure-mode library, and three small scripts.

Distilled from shipping a real library's release during the **MoonBit hackathon (OSC 2026)**.

## License

MIT. See [LICENSE](LICENSE).
