# AI Work Hub Implementation Status

## 1. 当前阶段

当前已进入第一批 MVP 实现阶段。

目标是跑通：

```text
初始化系统 → 创建需求调研任务 → 添加资料 → Manual Assistant 生成 Prompt → 回填外部 AI 输出 → 生成 Output → 编辑 Output → 标记最终版
```

## 2. 已实现

### 应用骨架

```text
Next.js App Router
TypeScript
SQLite
better-sqlite3
文件系统存储
Server Actions
```

### 初始化

```text
/onboarding 初始化页面
/api/health 健康检查
数据目录初始化
SQLite schema 自动创建
默认 Workspace
默认 Project
默认助手模板
默认流程模板
```

### 首页

```text
首页任务类型入口
最近任务列表
未初始化引导
```

### 任务

```text
任务创建
任务列表
任务详情
任务类型推荐默认助手和流程
```

### 资料

```text
添加文本资料
重点资料 / 普通资料 / 暂不使用
Output 转为任务资料
```

### Manual Assistant

```text
默认助手运行
Prompt 生成
Run waiting_user
复制 Prompt
外部 AI 输出回填
Run success
```

### Output

```text
Output 创建
Output 编辑
另存为新版本
标记最终版
复制 Markdown
输出列表
基于 Output 创建新任务
```

### 搜索

```text
/search 搜索任务、资料、输出
```

### 错误兜底

```text
error.tsx
not-found.tsx
```

## 3. 暂未实现

```text
Workflow Runtime 完整执行
Workflow Run 暂停/继续/恢复
CLI Assistant
HTTP Assistant
MCP Server
ChatGPT Action
多用户权限
登录鉴权
成本统计
复杂 DAG
文件上传解析
导出 docx/pdf
自动代码执行
```

## 4. 当前可验收 Demo

必须能演示：

```text
1. 访问 /onboarding 初始化
2. 首页选择“做需求调研”
3. 创建任务并添加资料
4. 点击继续生成
5. 复制 Prompt
6. 粘贴外部 AI 输出
7. 保存为 Output
8. 编辑 Output
9. 另存为新版本
10. 标记最终版
11. 转为任务资料
12. 在 /outputs 查看输出
13. 基于输出创建新任务
14. 在 /search 搜索历史内容
```

## 5. 当前风险

### 风险 1：尚未真实运行验证

当前代码已做构建风险修补，但还需要在真实环境执行：

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

### 风险 2：better-sqlite3 原生依赖

部分服务器需要编译环境。

Ubuntu 可安装：

```bash
sudo apt-get update
sudo apt-get install -y build-essential python3
```

### 风险 3：无登录鉴权

当前是单用户私有部署版本，不建议公网裸露。

建议通过：

```text
SSH Tunnel
VPN
Tailscale
Cloudflare Zero Trust
```

访问。

## 6. 下一步建议

优先级：

```text
P0：真实运行 npm install/typecheck/build/dev
P0：按 QA.md 跑首个 Demo
P1：修复真实运行报错
P1：补 Workflow Runtime 基础版
P2：补 CLI Assistant / MCP / Action
```
