# Feishu Message Bridge - Task Ledger

## Task Meta

| 字段 | 内容 |
|---|---|
| Task ID | FMB-001 |
| 任务 | 飞书消息采集与 GPT 工作助手系统 |
| 状态 | Confirming |
| 当前阶段 | 架构与任务规划 |
| 仓库 | kelvin381539960-cyber/ai |
| 任务目录 | tasks/feishu-message-bridge |

---

## SSOT 规则

- 本文件是任务状态唯一事实源。
- ChatGPT 对话内容不是事实源。
- Codex / Agent 执行结果必须回填本文件。
- 未记录在 decisions.md 的关键决策视为未确认。
- 未记录在 handoff.md 的当前状态视为不可接手。

---

## 当前任务

### T-001：Feishu Message Bridge 架构设计

状态：Confirming
执行角色：PM / Architect
输入：用户需求、飞书限制、双电脑场景
输出：architecture.md
完成标准：
- 明确 Collector / Cloud / GPT Action 架构
- 明确同步机制
- 明确 OCR 范围
- 明确风险边界
结果回填：待开始
问题 / Gap：
- 是否支持首扫 90 天
- OCR 存储策略
- 是否需要本地全文缓存
下一步：输出 architecture.md

---

### T-002：同步与去重机制设计

状态：Todo
执行角色：Architect
输入：双电脑轮换场景
输出：sync lock + dedup 方案
完成标准：
- 避免重复扫描
- 避免重复入库
- 支持断点续扫
结果回填：未开始
问题 / Gap：待分析
下一步：设计 sync lock

---

### T-003：OCR 与消息模型设计

状态：Todo
执行角色：Data Architect
输入：飞书消息类型
输出：统一消息结构
完成标准：
- 文本 / 图片 OCR 统一结构
- 可用于 GPT 检索
- 可用于任务提取
结果回填：未开始
问题 / Gap：待分析
下一步：设计 message schema

---

### T-004：GPT Action API 设计

状态：Todo
执行角色：Backend Architect
输入：GPT 使用场景
输出：OpenAPI schema
完成标准：
- 支持查询
- 支持摘要
- 支持同步触发
结果回填：未开始
问题 / Gap：待分析
下一步：设计 API
