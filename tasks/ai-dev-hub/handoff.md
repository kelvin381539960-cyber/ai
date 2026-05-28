# AI Work Hub Handoff

## 当前状态

P0 可用性缺口已补齐，可以进入技术方案设计阶段。

已新增：

```text
tasks/ai-dev-hub/onboarding.md
tasks/ai-dev-hub/seed-templates.md
tasks/ai-dev-hub/manual-run-flow.md
tasks/ai-dev-hub/output-rules.md
tasks/ai-dev-hub/material-rules.md
tasks/ai-dev-hub/workflow-run-rules.md
```

## 当前产品定位

```text
产品经理 / 运营的 AI 工作台
```

正式定义：

```text
面向产品、运营、技术型 PM 和个人开发者的 AI 工作流任务中台。
```

## 当前主路径

```text
选择任务类型 → 填写目标 → 添加资料 → 系统推荐助手和流程 → 开始执行 → 查看输出 → 继续优化 / 评审 → 生成最终结论
```

## P0 已补齐内容

### 1. 首次启动向导

文件：`onboarding.md`

覆盖：

- 运行模式。
- 数据目录。
- Workspace 创建。
- 默认模板安装。
- 空状态。
- 多电脑使用说明。

### 2. 默认模板

文件：`seed-templates.md`

覆盖：

- 默认任务类型。
- 默认助手。
- 默认流程。
- 默认输出类型。
- 模板安装和恢复规则。

### 3. 手动助手运行流程

文件：`manual-run-flow.md`

覆盖：

- Prompt 生成。
- 复制 Prompt。
- 等待用户回填。
- 保存 Output。
- 恢复 waiting_user 状态。
- 敏感信息提示。

### 4. 输出规则

文件：`output-rules.md`

覆盖：

- Output 类型。
- 编辑。
- 版本。
- 标记最终版。
- 复制 Markdown。
- Output 转 Material。
- 基于 Output 创建新任务。

### 5. 资料规则

文件：`material-rules.md`

覆盖：

- Material 类型。
- 重点资料。
- 暂不使用。
- 运行前资料确认。
- 资料引用记录。
- 隐私提示。

### 6. 流程运行规则

文件：`workflow-run-rules.md`

覆盖：

- Workflow Run 状态。
- Step 状态。
- waiting_user。
- 暂停。
- 继续。
- 取消。
- 失败重试。
- 页面关闭后恢复。

## 当前可用性判断

补齐 P0 后，方案已达到可进入技术方案设计的标准。

当前评估：

```text
产品主线：清晰
用户路径：完整
真实可用性：基本可控
技术方案前置条件：满足
```

仍可后续增强，但不阻塞技术方案。

## 技术方案必须遵守

1. 用户从任务类型开始，不从 Agent / Workflow 配置开始。
2. Material 是输入核心。
3. Output 是产出核心。
4. Assistant / Workflow 是支撑能力。
5. Run 是底层记录。
6. Handoff 是 Output 的一种。
7. Manual Assistant 回填流程必须可恢复。
8. Workflow Run 必须可暂停、继续、恢复。
9. 默认模板必须随初始化安装。
10. 多电脑使用以同一服务器和数据目录为准。

## 下一步建议

进入技术方案设计。

技术方案应输出：

```text
总体架构
技术栈
模块划分
数据库模型
文件存储结构
初始化流程
模板系统
Material 管理
Assistant Runtime
Manual Run Runtime
Workflow Runtime
Output 管理
Context Builder
安全策略
部署方案
实现计划
```

## 给下一个 AI 工具的接力提示

```text
请先阅读 tasks/ai-dev-hub/brd.md、prd.md、prd-detail.md、ux-optimized-plan.md、usability-readiness-assessment.md、onboarding.md、seed-templates.md、manual-run-flow.md、output-rules.md、material-rules.md、workflow-run-rules.md、handoff.md。

当前 P0 可用性缺口已补齐，可以进入技术方案设计。

技术方案必须围绕产品/运营用户体验展开，不要回退到开发者工具视角。

用户主路径必须是：选择任务类型 → 添加资料 → 推荐助手和流程 → 生成输出。

Material / Source 和 Output 是核心对象。Assistant / Workflow / Run / Handoff 是支撑对象。

Git、Diff、CLI、Code Agent 是高级能力，不是默认主流程。
```
