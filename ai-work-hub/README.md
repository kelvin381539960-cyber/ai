# AI Work Hub

产品经理 / 运营的 AI 工作台。

## 当前实现范围

第一批真实用户闭环：

```text
初始化系统 → 首页任务类型入口 → 创建需求调研任务 → 添加资料 → Manual Assistant 生成 Prompt → 回填外部 AI 输出 → 创建 Output → 编辑 Output → 标记最终版
```

已补入基础 Workflow Runtime，但只支持线性流程。

已补入可选访问令牌，适合私有服务器基础防护。

暂不实现：CLI Assistant、MCP、ChatGPT Action、多用户权限、复杂 DAG。

## 启动

```bash
cd ai-work-hub
npm install
npm run check
npm run dev
```

默认数据目录：

```text
./data
```

可通过环境变量覆盖：

```bash
AI_WORK_HUB_DATA_DIR=/srv/ai-work-hub npm run dev
```

## 可选访问令牌

服务器部署建议设置：

```bash
AI_WORK_HUB_ACCESS_TOKEN='your-long-random-token' \
AI_WORK_HUB_DATA_DIR=/srv/ai-work-hub \
npm run start
```

设置后访问页面会进入：

```text
/login
```

退出：

```text
/logout
```

本地调试可以不设置。

## 验证

```bash
npm run check
npm run smoke
```

如果启用了访问令牌：

```bash
AI_WORK_HUB_SMOKE_TOKEN='your-long-random-token' npm run smoke
```

详见：

```text
VERIFY.md
```

## 健康检查

```text
GET /api/health
```

## 主要入口

- `/` 首页任务类型入口
- `/login` 访问令牌登录
- `/logout` 退出登录
- `/onboarding` 初始化
- `/tasks/new?type=research` 创建任务
- `/tasks/[id]` 任务详情
- `/outputs` 输出列表
- `/search` 搜索

## API 快速检查

```text
GET /api/health
GET /api/tasks
GET /api/outputs
GET /api/search?q=AI
```

## 首个 Demo 验收

1. 进入 `/onboarding` 初始化。
2. 回到 `/`，选择“做需求调研”。
3. 创建任务并添加一条资料。
4. 在任务详情点击“继续生成”。
5. 复制 Prompt 到外部 AI。
6. 将外部 AI 输出粘贴回来，保存为输出。
7. 编辑输出内容。
8. 另存为新版本或保存编辑。
9. 标记最终版。
10. 转为任务资料。
11. 在 `/outputs` 查看输出并复制 Markdown。
12. 基于输出创建新任务。
13. 在 `/search` 搜索历史任务、资料、输出。
14. 在任务详情运行推荐流程。

## 运行手册

详见：

```text
RUNBOOK.md
```

## 当前实现状态

详见：

```text
STATUS.md
```

## 部署

详见：

```text
DEPLOY.md
```

## QA

详见：

```text
QA.md
```

## 注意

当前版本使用 Server Actions + SQLite + 文件系统。请不要把 `data/` 提交到 Git。
