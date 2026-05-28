# AI Work Hub Deploy Guide

## 1. 推荐部署方式

推荐部署到私有服务器，例如腾讯云服务器。

目标：

```text
公司电脑和个人电脑访问同一个 AI Work Hub 地址，看到同一份任务、资料和输出。
```

## 2. 基础启动

```bash
cd ai-work-hub
npm install
npm run build
AI_WORK_HUB_DATA_DIR=/srv/ai-work-hub npm run start
```

## 3. 数据目录

推荐：

```text
/srv/ai-work-hub
```

目录会保存：

```text
db.sqlite
materials/
outputs/
runs/
workflow-runs/
exports/
templates/
```

不要删除该目录，否则任务数据会丢失。

## 4. 访问方式

不建议直接公网裸露。

推荐：

```text
SSH Tunnel
VPN
Tailscale
Cloudflare Zero Trust
```

## 5. SSH Tunnel 示例

服务器运行：

```bash
AI_WORK_HUB_DATA_DIR=/srv/ai-work-hub npm run start
```

本地电脑执行：

```bash
ssh -L 3000:localhost:3000 user@your-server
```

浏览器访问：

```text
http://localhost:3000
```

## 6. 健康检查

访问：

```text
/api/health
```

正常返回：

```json
{
  "ok": true,
  "initialized": true
}
```

## 7. 备份

备份整个数据目录：

```bash
tar -czf ai-work-hub-backup.tgz /srv/ai-work-hub
```

恢复时把目录放回同一路径，重新启动应用。

## 8. 安全边界

当前版本：

```text
单用户
无登录系统
不建议公网裸露
Manual Assistant 需要用户手动复制 Prompt 到外部 AI
不会自动 push / merge / deploy
```

## 9. 常见问题

### better-sqlite3 安装失败

确认服务器有 Node.js 编译环境。

Ubuntu 可安装：

```bash
sudo apt-get update
sudo apt-get install -y build-essential python3
```

### 数据没有同步

确认公司电脑和个人电脑访问的是同一个服务器实例，并且服务使用同一个 `AI_WORK_HUB_DATA_DIR`。
