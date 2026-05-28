# AI Dev Hub UI 页面方案

## 1. UI 原则

V0 必须有 UI。

V0 UI 不是 IDE，不承载代码编辑能力。

它只做 AI 开发任务操作台：

- 看项目。
- 管理 Agent。
- 管理 Workflow。
- 看任务。
- 运行 Agent / Workflow。
- 看 Run。
- 看 Handoff。

## 2. 信息架构

V0 UI 包含 6 个页面：

1. 项目页。
2. Agent 管理页。
3. Workflow 管理页。
4. 任务页。
5. Run 记录页。
6. Handoff 页。

## 3. 项目页

### 3.1 目标

管理服务器上的项目工作区。

### 3.2 核心信息

- 项目名称。
- 项目路径。
- Git 分支。
- Git 状态。
- 当前活跃任务。
- 最近执行时间。

### 3.3 操作

- 添加项目。
- 进入项目。
- 刷新 git 状态。
- 初始化 `.ai/` 工作区。

## 4. Agent 管理页

### 4.1 目标

让用户手动创建和管理常用 Agent。

### 4.2 字段

- Agent 名称。
- Agent 类型：Manual / Generic CLI。
- 能力标签。
- Prompt 模板。
- 是否启用。
- 最近使用时间。

### 4.3 操作

- 创建 Agent。
- 从模板创建 Agent。
- 编辑 Agent。
- 启用/禁用 Agent。
- 测试 Agent。
- 删除 Agent。

### 4.4 V0 内置模板

- Review Agent。
- Security Review Agent。
- Architecture Review Agent。
- Research Agent。
- Handoff Agent。

## 5. Workflow 管理页

### 5.1 目标

让用户创建固定流程，例如 pre-work、调研、评审。

### 5.2 字段

- Workflow 名称。
- 描述。
- 步骤列表。
- 每个步骤类型。
- 每个步骤绑定的 Agent。
- 是否启用。

### 5.3 操作

- 创建 Workflow。
- 从模板创建 Workflow。
- 编辑步骤。
- 调整步骤顺序。
- 删除步骤。
- 运行 Workflow。
- 查看 Workflow Run。

### 5.4 V0 内置模板

- Pre-work Workflow。
- Research Workflow。
- Review Workflow。

## 6. 任务页

### 6.1 目标

承载单个任务的主要操作。

### 6.2 区块

#### 任务说明

显示：

- 目标。
- 范围。
- 不做什么。
- 验收标准。
- 所需能力。

#### 操作区

按钮：

- 生成上下文。
- 运行 Agent。
- 运行 Workflow。
- 生成 Handoff。

#### 关联信息

显示：

- 关联 Run。
- 关联 Workflow Run。
- 当前 Handoff。
- Git 状态。

## 7. Run 记录页

### 7.1 目标

复盘每一次 Agent 执行。

### 7.2 字段

- run_id。
- task。
- agent。
- capability。
- 状态。
- prompt。
- 用户回填结果。
- stdout。
- stderr。
- 开始时间。
- 结束时间。

### 7.3 操作

- 查看 prompt。
- 复制 prompt。
- 粘贴外部 AI 输出。
- 标记完成。
- 生成 Handoff。

## 8. Handoff 页

### 8.1 目标

展示当前任务交接文档。

### 8.2 内容

- 当前状态。
- 已完成事项。
- 修改文件。
- 执行过的 Agent。
- 执行过的 Workflow。
- 风险。
- 下一步建议。

### 8.3 操作

- 重新生成 Handoff。
- 复制 Handoff。
- 下载 Handoff。

## 9. 首页布局草图

```text
┌────────────────────────────────────────────┐
│ AI Dev Hub                                 │
├──────────────┬─────────────────────────────┤
│ 项目列表      │ 当前项目：project-a          │
│ Agent         │ 当前任务：实现 CLI 原型       │
│ Workflow      │ 状态：running                │
│ Task          │                             │
├──────────────┼─────────────────────────────┤
│ 快捷操作      │ [运行 Agent] [运行 Workflow]  │
│ - Review      │ [生成 Handoff]               │
│ - Pre-work    │                             │
├──────────────┴─────────────────────────────┤
│ Run / Workflow Run / Handoff Tabs          │
└────────────────────────────────────────────┘
```

## 10. V0 UI 上线顺序

先做：

1. 项目选择/初始化。
2. Agent 管理。
3. Workflow 管理。
4. 任务详情。
5. Run 详情。
6. Handoff 查看。

不做：

1. 在线代码编辑器。
2. Diff viewer 高级交互。
3. 多用户权限。
4. Agent 市场。
5. 复杂 Workflow DAG 编辑器。
