# Task Agent Strategy

## 1. 结论

AI Dev Hub 的实际执行策略应采用：

```text
任务级主 Agent + 少量辅助 Agent
```

而不是：

```text
一个任务中频繁切换多个 Agent
```

## 2. 原因

真实场景中：

- 同一任务大概率由同一个 CLI / Agent 完成。
- 不同任务可能选择不同工具。
- 任务执行中切换工具是少数情况。
- 频繁切换会增加 token 成本。
- 频繁切换会降低上下文连续性。
- 频繁切换会增加管理复杂度。

因此，系统应优化“任务内稳定执行”，而不是默认鼓励跨工具接力。

## 3. 核心模型

```text
Task
  ├── Primary Agent
  ├── Supporting Agents
  ├── Runs
  ├── Workflow Runs
  └── Handoff
```

## 4. Primary Agent

Primary Agent 是任务主执行器。

规则：

1. 每个任务可以指定一个 Primary Agent。
2. 任务执行默认使用 Primary Agent。
3. Workflow Step 默认使用 Primary Agent。
4. Context 优先为 Primary Agent 优化。
5. Handoff 主要用于阶段总结和少数切换场景。

## 5. Supporting Agent

Supporting Agent 是辅助执行器。

典型类型：

- Review Agent。
- Security Review Agent。
- Architecture Review Agent。
- Test Agent。
- Handoff Agent。

调用场景：

- 评审阶段。
- 安全检查。
- 架构检查。
- Primary Agent 失败。
- Primary Agent 额度不足。
- 用户需要第二意见。

## 6. 任务创建时的 Agent 选择

创建任务时，用户可以：

1. 手动选择 Primary Agent。
2. 让系统根据 required capabilities 推荐。
3. 暂不选择，后续运行前再选。

推荐逻辑：

```text
任务能力需求 → 可用 Agent → 最近使用偏好 → 用户确认
```

## 7. Workflow 与 Primary Agent

Workflow 不应默认每一步切换 Agent。

规则：

1. Workflow Step 未指定 Agent 时，使用任务 Primary Agent。
2. Workflow Step 可显式指定 Supporting Agent。
3. Review Workflow 可以指定 Review Agent。
4. Handoff Step 可以指定 Handoff Agent。
5. Workflow 不做自动多 Agent 智能编排。

## 8. Context 策略

同一任务内，Primary Agent 应尽量获得连续上下文。

建议：

- Primary Agent 默认 context_mode = standard。
- Supporting Agent 默认 context_mode = light 或 standard。
- Review Agent 只拿任务摘要、handoff、diff 摘要。
- Handoff Agent 只拿 run 摘要和当前状态。
- 不默认把完整历史发给所有 Agent。

## 9. 切换 Agent 的触发条件

切换或调用其他 Agent 必须有明确原因：

```text
review
security_review
architecture_review
primary_failed
quota_low
capability_missing
user_requested_second_opinion
```

每次切换应记录原因。

## 10. 产品收益

该策略带来的收益：

- 更符合真实使用习惯。
- 降低 token 浪费。
- 保持任务连续性。
- 降低工具管理复杂度。
- Handoff 用在关键时刻，而不是每一步都打断。

## 11. UI 体现

任务详情页应显示：

- Primary Agent。
- Supporting Agent Runs。
- 当前 Agent 执行状态。
- 是否建议切换 Agent。
- 最近 Handoff。

运行按钮建议：

```text
Run with Primary Agent
Run Supporting Agent
Generate Handoff
```

## 12. 成功指标

可观察指标：

- 每个任务是否设置 Primary Agent。
- 同一任务内 Agent 切换次数。
- Supporting Agent 调用原因。
- Handoff 生成次数。
- 任务完成率。
- 用户重复解释次数。

目标不是让切换次数越多越好，而是：

```text
多数任务由 Primary Agent 连续完成；少数关键节点由 Supporting Agent 补充。
```
