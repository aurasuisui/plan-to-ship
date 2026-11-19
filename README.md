# plan-to-ship

> **主会话负责判断，子智能体负责动手；子智能体的自述不算证据，主会话要自己复跑一遍。**

这是一套 **主会话 ↔ 子智能体协作协议**，做成 agent skill 的形式。
计划不是为了好看 —— 它是**派单的依据**和**审核的清单**；没有它，主会话就只能凭感觉验收，子智能体也只能凭感觉交活。

**来源**：参加 **MoonBit 黑客松**（OSC 2026，2026-10）时，用真实项目
[`moonbit-multiindex`](https://github.com/aurasuisui/moonbit-multiindex) 的 **v0.2.2 发布周期**
跑出来的 —— 从写计划到打 tag 上线，主会话全程只做三件事：定契约、派单、复跑判分；
每个里程碑都交给子智能体执行。踩过的坑（子智能体报告与事实不符、门禁假绿、
发布后 tag 树带缺陷、不可逆动作被重试……）都固化在 `references/failure-modes.md`。

---

## 协作模型：三个角色不能是同一个输出

| 谁 | 只做这些 | 绝不 |
|---|---|---|
| **主会话**（你是它） | 侦察现场、写契约、派单、**独立复跑**、判定、维护台账 | 替子智能体写实现、替自己判分 |
| **子智能体** | 执行**一个**里程碑、小步提交、报「待审核」+ 四件真实输出 | 给自己判分、改台账、顺手改计划外的东西 |
| **人类** | 拍板不可逆动作（发布 / 合并 / 删除 / 强推） | 被自动重试绕过 |

**一句话**：子智能体说「完成了」不等于完成；主会话跑通验收命令才算完成。

## 它拦住的具体失败

| 失败现场 | 真正的原因 | 协议怎么拦 |
|---|---|---|
| 子智能体说「测试全过」，主会话合并后 CI 红 | 它跑的和你跑的不是同一套命令 | 派单写死命令；主会话**用自己的手再跑一遍** |
| 子和主各自以为对方会做，结果都没做 | 职责交界处没有明确归属 | 派单四必填：范围 / 禁止 / 验收 / 停下点 |
| 子智能体顺手改了测试，把红的改绿 | 没写禁止清单 | 「禁止」清单 + 主会话查 `git diff '*test*'` |
| 子智能体改了看板，把自己标成 ✅ | 判分权交出去了 | 看板/台账**只由主会话**写 |
| 一次派五个里程碑，回来一堆半成品 | 省往返，丢可验收性 | 一次一个，每个都有判定点 |
| 发布失败后自动重试，撞上「版本不可重发」 | 把不可逆当可重试 | 一次口令一次尝试，失败即停 |
| 上下文丢失，下一轮不知道当初为什么这么定 | 决策没落盘 | 计划是契约、看板是台账，只追加不回改 |

## 一轮协作长什么样

```
主会话                          子智能体
  │  侦察仓库、找验证命令
  │  写契约（里程碑 + 可执行出口条件）
  │  plan-lint 自检 → 0 error
  │──┤ 派单：范围/禁止/验收/停下点
  │                              ├─ 执行 → 小步 commit
  │                              └─ 报「待审核」+ 四件真实输出
  │  独立复跑验收命令
  │  查 diff 边界、查断言有没有被放宽
  │  判 ✅ / 驳回（附复跑命令）
  └─ 回写台账 → 下一个里程碑
```

## 里面有什么

```
SKILL.md                  协作协议主体：角色边界、生命周期、五条铁律
references/
  brief-template.md       派单模板（含"领域技能怎么带进派单"）
  review-checklist.md     审核八查（每条给命令，不给形容词）
  plan-template.md        契约骨架（七块，可直接抄）
  failure-modes.md        失败模式库（症状 → 机制 → 对策）
scripts/
  plan-lint.mjs           契约自检：出口条件可执行吗？看板和里程碑对齐吗？
  run-gates.mjs           顺序跑门禁，只输出 exit code 与尾部
  collect-evidence.mjs    收 commit/diff/CI 原始证据，不下结论
examples/
  plan.example.md         一份最小契约
  brief.example.md        一份派单
```

## 怎么用

把目录放进 agent 的 skills 目录（`<workspace>/.agents/skills/`、`<workspace>/.dsh/skills/` 或用户级目录），然后：

```
你：制定计划
主会话：侦察 → 写契约 → plan-lint → 停下问「是否开始执行」

你：开始执行
主会话：派 M1 给子智能体 → 收四件输出 → 自己复跑 → 判 → 下一个
```

触发不需要逐字匹配：「定个修复计划」「拆成几个里程碑」「派子智能体去做」「开始动工」都算。
**不适用**：单文件小改、方案还没定的探索期、连一条可执行验收命令都写不出来的活。

### 脚本单独也能用

```bash
node scripts/plan-lint.mjs path/to/plan.md     # 0 error 才准派单
node scripts/run-gates.mjs gates.txt           # 一行一条命令
node scripts/collect-evidence.mjs HEAD~1       # 生成 evidence.md
```

`plan-lint` 只做机械检查，**输出里不出现 ✅/❌** —— 判分永远由主会话（或人）做。

## 五条铁律

1. **判分权分离**：子智能体写的不判，主会话判的不写。
2. **一次一个里程碑**：小到一轮能验收完。
3. **证据优先于叙述**：只接受命令、输出、commit、run id。
4. **契约优先于派单**：派单写错了，按契约办。
5. **不可逆动作单点批准**：发布、合并、删除、强推，人类点头后一次尝试。

## 它不做什么

- 不生成业务代码，不替代人的判断；
- 不是项目管理工具（没有看板 UI、没有排期）；
- 不保证「按协议走就一定对」—— 它保证的是**每一步都留下可复查的证据**。

## English

A **main-session ↔ subagent collaboration protocol** for AI coding agents. The main session writes
a contract with executable exit criteria, briefs **one milestone at a time** to a subagent, then
**independently re-runs the verification** instead of trusting the report — and owns the status
board, so nobody grades their own work.

Includes: dispatch brief template, 8-point review checklist, plan skeleton, failure-mode library,
and three small scripts (`plan-lint`, `run-gates`, `collect-evidence`).

Distilled from shipping a real library's v0.2.2 release during the **MoonBit hackathon (OSC 2026)**.

## License

MIT. See [LICENSE](LICENSE).
