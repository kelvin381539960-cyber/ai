# AI Work Hub

AI Work Hub 是一个私有智能工作台，用 UI 管理项目知识、Workflow、规则、Agent、Run 和 Output。

第一版定位：

- 产品/运营/产研通用工作流。
- Workflow 使用可视化线性画布。
- 项目知识库使用标签 + 全文搜索。
- Output 使用 Markdown，支持版本、最终版和转知识。
- Harness 优先作为 CLI Agent 执行层，Direct CLI 和 Manual 作为兜底。

## Local Run

```bash
npm install
npm run check
npm run build
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

Smoke:

```bash
npm run smoke
```

If access token is enabled:

```bash
AI_WORK_HUB_SMOKE_TOKEN='your-token' npm run smoke
```

## Deployment

Current private server deployment:

```text
server: 43.133.44.67
service: ai-work-hub.service
bind: 127.0.0.1:3200
data: /var/lib/ai-work-hub
app: /srv/ai-work-hub
user: aihub
```

Use SSH tunnel or VPN; do not expose the service directly to the public internet.

## Environment

```text
AI_WORK_HUB_DATA_DIR=/var/lib/ai-work-hub
AI_WORK_HUB_ACCESS_TOKEN=optional-token
```

Do not commit tokens, CLI sessions, or runtime data.
