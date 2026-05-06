# Feishu Message Bridge

## 项目定位

本项目用于构建：

- 飞书消息本地采集器（Collector）
- 腾讯云统一消息索引服务（feishu-message-bridge）
- GPT Action 查询与同步接口
- 多设备增量同步与去重系统

目标：

让 AI 能基于用户最近工作消息进行总结、检索、待办提取、风险识别与工作辅助。

---

## SSOT（唯一事实源）规则

本目录是 Feishu Message Bridge 项目的唯一事实源。

任何 Agent / Codex / ChatGPT 接手任务前，必须先阅读：

1. README.md
2. task-ledger.md
3. decisions.md
4. handoff.md

禁止：

- 根据聊天历史直接执行
- 根据旧上下文猜测架构
- 未阅读任务台账直接修改代码
- 未记录决策直接推进实现

所有：

- 架构变更
- 范围变更
- 风险接受
- 阶段完成
- 任务状态变化

都必须回填：

- task-ledger.md
- decisions.md
- handoff.md

---

## 当前范围（V1）

V1 范围：

- 双电脑本地 Collector
- 飞书 Web + Playwright
- 最近 7~30 天增量同步
- 白名单会话
- 图片 OCR（仅文字提取）
- 腾讯云统一索引
- GPT Action 查询
- sync lock 防止重复扫描

V1 不做：

- 全量长期历史消息
- 云端直接登录飞书
- 复杂图片理解
- 语音转文字
- 附件全文解析
- 全群自动扫描

---

## 目录说明

- task-ledger.md：任务台账与状态
- architecture.md：系统架构设计
- decisions.md：关键决策记录
- implementation-plan.md：阶段执行计划
- handoff.md：当前交接状态
- prompts.md：Codex / Agent 执行与评审提示词
