# AI Dev Hub 完整方案总览

## 1. 一句话定义

AI Dev Hub 是一个部署在私有环境中的 AI 开发任务中台，用来统一管理多个 AI 编程工具的任务、上下文、能力、执行记录、交接文档和后续接力。

它不是新的 IDE，而是 AI 编程工具的“项目经理”“调度台”和“能力路由层”。

## 2. 当前要解决的问题

用户当前有多种 AI 开发能力：

- IDE 内置 Agent。
- CLI Agent。
- 代码审查 Agent。
- 模型 API。
- 公司内部 API。
- 脚本化自动化工具。

这些工具能力不同，额度不同，使用入口不同。真实痛点不是缺少工具，而是：

1. 不知道什么时候该用哪个能力。
2. 切换工具时上下文断裂。
3. AI 做过什么没有沉淀成项目资产。
4. 上班公司电脑、下班个人电脑，开发现场不统一。
5. 担心某个工具额度用完后，其他工具无法无缝接手。
6. 工具升级、替换或停用时，工作流会被迫重建。

## 3. 核心原则

### 3.1 不绑定工具

系统不应写死某个 AI 工具。

正确抽象：

```text
任务需要能力。
能力由执行器提供。
执行器通过 Adapter 接入。
```

例如：

```text
任务：实现一个功能
需要能力：code_edit + shell_run + test_run
可选执行器：Cursor Adapter / Codex Adapter / 自定义 CLI Adapter
```

### 3.2 先做能力中台，再接工具

AI Dev Hub 要先定义：

- 任务协议。
- 上下文协议。
- 执行协议。
- 日志协议。
- Handoff 协议。
- Adapter 协议。
- 能力模型。

工具接入应该是配置问题，而不是产品架构问题。

### 3.3 用户可以自接执行器

用户后续应该可以自己配置：

```yaml
agents:
  - id: cursor-local
    type: cli
    command: cursor-agent
    capabilities: [plan, code_edit, shell_run, test_run]

  - id: codex-review
    type: cli
    command: codex
    capabilities: [review, test_generate, explain]

  - id: company-api
    type: http
    endpoint: https://internal-api.example.com/chat
    capabilities: [summarize, classify, doc_generate]
```

## 4. 目标状态

理想状态：

```text
公司电脑 / 个人电脑
        ↓
访问同一个私有 AI Dev Hub
        ↓
查看同一个任务列表、上下文、日志和交接文档
        ↓
AI Dev Hub 根据任务需要选择能力
        ↓
能力路由到某个已配置 Adapter
        ↓
执行结果沉淀为日志、diff、handoff
        ↓
后续可换任何执行器继续
```

最终目标：

> 用户可以换电脑、换 AI 工具、换模型供应商，但任务现场不丢。

## 5. 产品定位

AI Dev Hub 的定位不是：

- 不是代码编辑器。
- 不是完整 IDE。
- 不是替代某个 AI 工具。
- 不是一开始就做复杂多模型平台。
- 不是公网 SaaS。

AI Dev Hub 的定位是：

- AI 任务管理器。
- AI 上下文管理器。
- AI 能力目录。
- AI 工具 Adapter 层。
- AI 执行日志中心。
- AI 交接文档生成器。
- AI 工作流记忆系统。

## 6. 第一版产品边界

第一版只解决一个核心问题：

> 让任意已配置 AI 执行器的执行过程可管理、可记录、可交接。

第一版必须有：

1. 项目注册。
2. 任务创建。
3. 上下文生成。
4. Agent / Adapter 注册。
5. 能力声明。
6. 基于能力选择执行器。
7. 执行日志保存。
8. Git diff 读取。
9. Handoff 生成。
10. Review Prompt 生成。
11. 多设备访问同一个任务状态。

第一版暂不做：

1. 不做完整 IDE。
2. 不做在线代码编辑器。
3. 不做多用户权限系统。
4. 不做复杂 agent 编排图。
5. 不做自动部署。
6. 不做自动 merge。
7. 不把任何工具写死为唯一执行器。

## 7. 推荐落地路径

### 阶段 1：CLI 原型

先实现最小命令：

```bash
aihub init
aihub project add
aihub task create
aihub agent add
aihub agent list
aihub context
aihub run --capability code_edit
aihub handoff
aihub review
aihub done
```

目标是跑通“创建任务 → 生成上下文 → 选择能力 → 调用配置执行器 → 保存日志 → 生成交接”的闭环。

### 阶段 2：私有服务器部署

把 CLI、项目工作区、Adapter 配置、数据库和日志都部署到私有服务器。

公司电脑和个人电脑只作为访问终端。

### 阶段 3：本地 Web UI

提供一个只在安全网络内访问的 Web 页面：

- 任务列表。
- 当前任务。
- Agent / Adapter 列表。
- 能力选择。
- 执行按钮。
- 日志查看。
- Diff 查看。
- Handoff 查看。

### 阶段 4：记忆和偏好

逐步记录：

- 用户偏好。
- 项目规则。
- 技术决策。
- 工具使用效果。
- 能力选择效果。

所有记忆必须可查看、可编辑、可删除。

### 阶段 5：多工具接力

在 Adapter 协议稳定后，持续接入不同工具。

示例：

- 代码修改类 Adapter。
- Review 类 Adapter。
- 架构分析类 Adapter。
- 文档生成类 Adapter。
- 公司 API Adapter。
- 本地脚本 Adapter。

## 8. 成功判断标准

MVP 成功不是“AI 自动写多少代码”，而是：

1. 用户换电脑后能继续同一个任务。
2. 任意执行器的执行过程能被记录。
3. 每次执行后能生成明确 handoff。
4. 下一个执行器能基于 handoff 接手。
5. 用户不需要反复解释项目背景。
6. 新工具接入不需要重写核心业务逻辑。

北极星指标：

> 跨工具接续时，用户需要重复解释的次数。

目标是把这个次数降到接近 0。
