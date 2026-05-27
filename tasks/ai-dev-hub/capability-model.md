# AI Dev Hub 能力模型

## 1. 为什么需要能力模型

AI Dev Hub 不能绑定某个工具。不同 AI 工具有不同强项：有的擅长代码修改，有的擅长架构分析，有的擅长 Review，有的适合低成本总结。

因此系统不应该问：

```text
这个任务用 Cursor 还是 Codex？
```

而应该问：

```text
这个任务需要什么能力？当前有哪些执行器能提供这些能力？
```

## 2. 核心抽象

```text
Task → Required Capabilities → Candidate Agents → Selected Adapter → Run Result → Handoff
```

解释：

- Task：用户要完成的任务。
- Required Capabilities：任务需要的能力。
- Candidate Agents：能提供这些能力的执行器。
- Selected Adapter：本次实际调用的执行器。
- Run Result：执行结果、日志、状态。
- Handoff：给后续工具接力的文档。

## 3. 能力分类

### 3.1 规划能力

```text
plan
```

用于：

- 需求拆解。
- 技术方案。
- 实施步骤。
- 风险分析。

### 3.2 代码能力

```text
code_read
code_edit
code_generate
refactor
```

用于：

- 阅读代码。
- 修改代码。
- 生成新代码。
- 重构。

### 3.3 终端能力

```text
shell_run
test_run
build_run
lint_run
```

用于：

- 执行命令。
- 跑测试。
- 构建项目。
- 跑 lint。

### 3.4 Review 能力

```text
review
security_review
performance_review
architecture_review
```

用于：

- 代码审查。
- 安全检查。
- 性能检查。
- 架构检查。

### 3.5 文档能力

```text
summarize
doc_generate
handoff_generate
changelog_generate
```

用于：

- 总结。
- 文档生成。
- 交接文档生成。
- 变更日志生成。

### 3.6 项目管理能力

```text
task_split
status_update
decision_record
risk_assess
```

用于：

- 拆任务。
- 更新状态。
- 记录决策。
- 评估风险。

## 4. 执行器能力声明

每个 Agent / Adapter 必须声明自己的能力。

示例：

```yaml
agents:
  - id: code-agent-1
    name: Code Agent 1
    type: cli
    capabilities:
      - plan
      - code_read
      - code_edit
      - shell_run
      - test_run
    cost_level: high
    interactive: true
    requires_workspace: true

  - id: review-agent-1
    name: Review Agent 1
    type: cli
    capabilities:
      - review
      - security_review
      - test_generate
    cost_level: medium
    interactive: false
    requires_workspace: true

  - id: summary-api-1
    name: Summary API 1
    type: http
    capabilities:
      - summarize
      - doc_generate
      - handoff_generate
    cost_level: low
    interactive: false
    requires_workspace: false
```

## 5. 任务能力声明

任务也应该声明所需能力。

示例：

```yaml
task:
  id: task-001
  title: 实现 AI Dev Hub CLI 原型
  required_capabilities:
    - plan
    - code_edit
    - shell_run
    - test_run
  preferred_capabilities:
    - review
  forbidden_capabilities:
    - deploy_run
```

## 6. 能力匹配规则

MVP 匹配规则可以很简单：

1. 找出包含所有 required_capabilities 的 Agent。
2. 如果没有完全匹配，找覆盖率最高的 Agent。
3. 根据用户偏好、成本、可用性排序。
4. 用户最终确认后执行。

后续可以加入：

- 成本预算。
- 上下文窗口大小。
- 成功率统计。
- 任务类型偏好。
- 工具额度状态。

## 7. 能力路由策略

MVP 不做复杂自动路由。

推荐方式：

```text
系统推荐，用户确认。
```

例如：

```text
当前任务需要 code_edit + test_run。
可用执行器：code-agent-1、code-agent-2。
推荐：code-agent-1。
原因：支持全部能力，最近成功率更高。
```

## 8. 能力模型的产品价值

能力模型带来的价值：

1. 不绑定单一工具。
2. 后续接新工具不影响任务系统。
3. 用户可以自己配置执行器。
4. 系统可以根据能力做推荐。
5. 成本、质量、成功率可以逐步沉淀。
6. 任务交接不依赖某个工具的聊天记录。
