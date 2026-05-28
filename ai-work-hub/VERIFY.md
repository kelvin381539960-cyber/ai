# AI Work Hub Verification Guide

## 1. 目标

本文件用于验证当前实现是否达到可继续试用的状态。

## 2. 本地静态检查

```bash
cd ai-work-hub
npm install
npm run check
```

`npm run check` 会执行：

```text
npm run typecheck
npm run build
```

## 3. 一键本地检查脚本

```bash
cd ai-work-hub
bash scripts/verify-local.sh
```

## 4. 启动应用

```bash
npm run dev
```

访问：

```text
http://localhost:3000
```

## 5. API Smoke Test

启动应用后，新开一个终端：

```bash
cd ai-work-hub
npm run smoke
```

默认检查：

```text
GET /api/health
GET /api/tasks
GET /api/outputs
GET /api/search?q=AI
```

如果启用了访问令牌：

```bash
AI_WORK_HUB_SMOKE_TOKEN='your-long-random-token' npm run smoke
```

如果服务不是 `localhost:3000`：

```bash
AI_WORK_HUB_BASE_URL=http://your-host:3000 npm run smoke
```

可以组合：

```bash
AI_WORK_HUB_BASE_URL=http://your-host:3000 \
AI_WORK_HUB_SMOKE_TOKEN='your-long-random-token' \
npm run smoke
```

## 6. Demo 验收

完成 smoke test 后，按以下路径手动验收：

```text
/onboarding
→ 首页选择“做需求调研”
→ 创建任务
→ 添加资料
→ 继续生成
→ 复制 Prompt
→ 回填外部 AI 输出
→ 保存 Output
→ 编辑 Output
→ 标记最终版
→ 转为任务资料
→ /outputs 查看输出
→ /search 搜索历史内容
→ 运行推荐流程
```

## 7. 通过标准

必须满足：

```text
npm run check 通过
npm run smoke 通过
需求调研 Demo 可完整跑通
```

## 8. 失败时优先排查

```text
Node.js 版本是否为 20+
better-sqlite3 是否安装成功
AI_WORK_HUB_DATA_DIR 是否可写
Next.js params/searchParams 类型是否报错
涉及 SQLite 页面是否 force-dynamic
如果启用访问令牌，smoke 是否传入 AI_WORK_HUB_SMOKE_TOKEN
```
