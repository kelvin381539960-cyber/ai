# Agent 预设与手动创建 Agent 方案

## 1. 结论

AI Dev Hub 应该支持用户手动创建常用 Agent。

这不是复杂 Agent 编排，而是“Agent 预设库”：用户可以把常用角色保存起来，用的时候直接调用。

典型场景：

- 代码评审 Agent。
- 架构评审 Agent。
- 安全评审 Agent。
- 测试补全 Agent。
- 文档总结 Agent。
- Handoff 生成 Agent。
- 需求拆解 Agent。

## 2. 为什么要做

用户经常会重复使用同类 AI 工作流，例如：

```text
请帮我 review 当前 diff
请检查安全风险
请从架构角度看有没有问题
请帮我补测试
请总结当前任务进度
```

如果每次都重新写 prompt，会浪费时间，也容易不一致。

Agent 预设可以让用户把这些固定角色沉淀下来。

## 3. 产品定义

Agent 不是必须自动执行代码的复杂智能体。

在 AI Dev Hub 中，Agent 可以只是一个可复用配置：

```text
Agent = 名称 + 角色说明 + 能力声明 + Prompt 模板 + Adapter 类型 + 执行方式
```

例如：

```text
Review Agent = 代码评审角色 + review 能力 + review prompt 模板 + manual/cli adapter
```

## 4. V0 应支持的 Agent 类型

### 4.1 Manual Agent

最简单，也最重要。

行为：

1. 系统根据 Agent 模板生成 prompt。
2. 用户复制到任意外部 AI 工具。
3. 用户把结果粘贴回来。
4. 系统保存结果并更新 handoff。

适合：

- Claude Code。
- Codex。
- ChatGPT。
- Cursor Chat。
- 其他没有 CLI/API 的工具。

### 4.2 Generic CLI Agent

通过通用 CLI Adapter 调用命令行工具。

行为：

1. 系统生成 prompt。
2. 通过 stdin 或文件传给 CLI。
3. 捕获 stdout/stderr。
4. 保存 run 记录。

适合：

- 任意本地 CLI Agent。
- 用户自己的脚本。
- 后续具体工具 CLI。

## 5. 推荐内置 Agent 预设

V0 可以内置少量模板，但不绑定具体工具。

### 5.1 Code Review Agent

能力：

```text
review
```

用途：

- 审查当前 git diff。
- 找高风险 bug。
- 找测试缺口。
- 找可维护性问题。

模板重点：

```text
只指出高风险问题、测试缺口、可维护性问题。不要重写代码，除非问题明确。
```

### 5.2 Security Review Agent

能力：

```text
security_review
```

用途：

- 检查密钥泄漏。
- 检查权限问题。
- 检查注入风险。
- 检查危险命令。

### 5.3 Architecture Review Agent

能力：

```text
architecture_review
```

用途：

- 检查模块边界。
- 检查是否过度设计。
- 检查扩展性。
- 检查是否偏离 MVP。

### 5.4 Test Agent

能力：

```text
test_run
test_generate
```

用途：

- 找测试缺口。
- 生成测试用例。
- 建议测试命令。

### 5.5 Handoff Agent

能力：

```text
handoff_generate
summarize
```

用途：

- 生成交接文档。
- 总结当前进度。
- 给下一个工具生成接力说明。

## 6. Agent 配置示例

```yaml
agents:
  - id: review-manual
    name: Code Review Agent
    type: manual
    capabilities:
      - review
    prompt_template: review-basic
    enabled: true

  - id: security-review-manual
    name: Security Review Agent
    type: manual
    capabilities:
      - security_review
    prompt_template: security-review
    enabled: true

  - id: architecture-review-manual
    name: Architecture Review Agent
    type: manual
    capabilities:
      - architecture_review
    prompt_template: architecture-review
    enabled: true

  - id: generic-review-cli
    name: Generic Review CLI
    type: cli
    command: some-review-command
    input_mode: stdin
    capabilities:
      - review
    timeout_seconds: 600
    enabled: true
```

## 7. CLI 命令建议

### 7.1 创建 Agent

```bash
aihub agent create review-agent \
  --type manual \
  --capabilities review \
  --template review-basic
```

或：

```bash
aihub agent add \
  --id review-agent \
  --name "Review Agent" \
  --type manual \
  --capabilities review \
  --template review-basic
```

### 7.2 查看 Agent

```bash
aihub agent list
```

### 7.3 调用 Agent

```bash
aihub run --agent review-agent --task <task_id>
```

或按能力调用：

```bash
aihub run --capability review --task <task_id>
```

### 7.4 完成 Manual Agent Run

```bash
aihub run complete <run_id>
```

用户粘贴外部 AI 工具的输出后，系统保存结果。

## 8. Prompt 模板机制

Agent 应该支持 prompt_template。

模板变量：

```text
{{project_summary}}
{{task}}
{{handoff}}
{{git_status}}
{{git_diff}}
{{changed_files}}
{{commands}}
{{rules}}
```

模板示例：

```text
你是代码评审 Agent。

请基于以下信息审查当前改动：

项目背景：
{{project_summary}}

当前任务：
{{task}}

当前 diff：
{{git_diff}}

评审要求：
1. 只指出高风险问题。
2. 标出测试缺口。
3. 标出可维护性风险。
4. 不要重写代码，除非问题明确。
```

## 9. V0 范围建议

V0 应该支持：

1. 用户手动创建 Agent。
2. Agent 声明 capabilities。
3. Agent 绑定 prompt_template。
4. Manual Agent 生成可复制 prompt。
5. 用户粘贴结果完成 run。
6. Generic CLI Agent 通过通用命令执行。

V0 不做：

1. 多 Agent 自动串联。
2. Agent 自动互相调用。
3. Agent 市场。
4. 自动评分。
5. 自动选择多个 Agent 并行评审。

## 10. 产品价值

Agent 预设能让用户把常用工作流沉淀下来。

这符合 AI Dev Hub 的定位：

```text
不是替用户决定所有工具
而是让用户把常用能力配置成可复用 Agent
```

它也符合“不要复杂”的原则：

```text
手动创建
手动调用
结果可记录
后续可复用
```
