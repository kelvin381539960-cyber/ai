# AI Dev Hub Workflow 方案

## 1. 定义

Workflow 是一组可复用的线性步骤，用来固化常见 AI 工作流程。

它不是复杂 Agent 编排，不做自动决策 DAG。

V0 定义：

```text
Workflow = 名称 + 场景 + 步骤列表 + 输入参数 + 输出结果
```

## 2. 目标

让用户把常用流程保存下来，用的时候直接运行。

典型流程：

- Pre-work Workflow：开发前准备。
- Research Workflow：调研。
- Review Workflow：评审。
- Handoff Workflow：交接总结。

## 3. V0 支持范围

V0 只支持线性 Workflow：

```text
Step 1 → Step 2 → Step 3
```

不支持：

- 条件分支。
- 并行步骤。
- 循环。
- 自动多 Agent 协作。
- DAG 可视化。

## 4. Step 类型

### 4.1 manual_input

用户输入信息。

用途：

- 输入调研问题。
- 补充背景。
- 确认任务范围。

### 4.2 context_build

生成上下文。

输入：

- Project。
- Task。
- Rules。
- Commands。
- Handoff。
- Git status / diff。

输出：

- context prompt。

### 4.3 agent_run

调用某个 Agent。

输入：

- Agent ID。
- Task ID。
- Context。
- Prompt template。

输出：

- Run。

### 4.4 review_prompt

生成评审 prompt。

输入：

- Task。
- Git diff。
- Handoff。

输出：

- review prompt。

### 4.5 handoff_build

生成 handoff。

输入：

- Task。
- Runs。
- Diff。
- 用户备注。

输出：

- HANDOFF.md。

## 5. Workflow 配置示例

```yaml
workflows:
  - id: pre-work
    name: Pre-work Workflow
    description: 开发前准备流程
    inputs:
      - task_id
    steps:
      - id: confirm-task
        type: manual_input
        title: 确认任务目标
        required: true
      - id: build-context
        type: context_build
        title: 生成任务上下文
      - id: plan-agent
        type: agent_run
        title: 调用规划 Agent
        agent_id: planning-agent
      - id: handoff
        type: handoff_build
        title: 生成开发前 Handoff

  - id: research
    name: Research Workflow
    description: 调研流程
    inputs:
      - research_question
      - task_id
    steps:
      - id: input-question
        type: manual_input
        title: 输入调研问题
      - id: research-agent
        type: agent_run
        title: 调用调研 Agent
        agent_id: research-agent
      - id: summary-agent
        type: agent_run
        title: 调用总结 Agent
        agent_id: summary-agent
      - id: handoff
        type: handoff_build
        title: 生成调研 Handoff
```

## 6. UI 操作

V0 UI 应支持：

- 创建 Workflow。
- 从模板创建 Workflow。
- 编辑 Workflow 名称。
- 添加/删除步骤。
- 选择每个步骤使用的 Agent。
- 运行 Workflow。
- 查看每个步骤状态。
- 查看每个步骤输出。

## 7. Workflow Run 状态

Workflow Run 状态：

```text
pending
running
waiting_user
success
failed
cancelled
```

Step 状态：

```text
pending
running
waiting_user
success
failed
skipped
```

## 8. Manual Agent 在 Workflow 中的行为

如果步骤调用 Manual Agent：

1. 系统生成 prompt。
2. Workflow Step 进入 `waiting_user`。
3. UI 展示 prompt 和复制按钮。
4. 用户粘贴外部结果。
5. Step 继续完成。
6. Workflow 进入下一步。

## 9. CLI Agent 在 Workflow 中的行为

如果步骤调用 Generic CLI Agent：

1. 系统生成 prompt。
2. 执行 CLI。
3. 捕获 stdout/stderr。
4. Step 完成或失败。
5. Workflow 进入下一步。

## 10. 内置 Workflow 模板

### 10.1 Pre-work Workflow

目标：开发前把任务说清楚。

步骤：

```text
确认任务目标
生成上下文
调用规划 Agent
生成开发前 Handoff
```

### 10.2 Research Workflow

目标：完成调研并形成结论。

步骤：

```text
输入调研问题
调用调研 Agent
用户补充外部资料
调用总结 Agent
生成调研 Handoff
```

### 10.3 Review Workflow

目标：评审当前改动。

步骤：

```text
读取任务
读取 git diff
调用 Review Agent
用户回填结果
生成 Review Handoff
```

## 11. V0 数据文件

建议新增：

```text
.ai/WORKFLOWS.yaml
.ai/WORKFLOW_RUNS/<workflow_run_id>/
```

Workflow run 目录：

```text
.ai/WORKFLOW_RUNS/<workflow_run_id>/
  input.json
  steps.json
  result.json
```

## 12. V0 成功标准

必须能演示：

1. 创建一个 Pre-work Workflow。
2. 创建一个 Review Workflow。
3. 运行 Workflow。
4. Workflow 中 Manual Agent Step 可以暂停等待用户输入。
5. 用户粘贴结果后 Workflow 可继续。
6. Workflow 最终生成 handoff。

## 13. 后续扩展

V1/V2 再考虑：

- 条件分支。
- DAG。
- 并行 Agent。
- 自动质量评分。
- Workflow 模板市场。
- 跨项目 Workflow 复用。
