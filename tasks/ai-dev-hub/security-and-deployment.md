# AI Dev Hub 安全与部署方案

## 1. 部署结论

推荐部署在腾讯云服务器。

原因：

- Cursor CLI 已在腾讯云服务器上。
- 用户上班和下班可以访问同一个开发现场。
- 任务、日志、上下文、代码工作区集中管理。
- 不需要在公司电脑和个人电脑重复配置环境。

## 2. 推荐部署结构

```text
/opt/ai-dev-hub/          # 程序目录
/srv/ai-workspaces/       # 项目代码目录
/srv/ai-data/             # SQLite、日志、运行记录
/srv/ai-secrets/          # 密钥和私有配置
```

## 3. 访问方式

不建议直接把 Web UI 暴露在公网。

推荐方式：

1. SSH Tunnel。
2. WireGuard。
3. Tailscale。
4. Cloudflare Zero Trust。
5. 腾讯云安全组限制固定 IP。

MVP 最简单方式：

```bash
ssh -L 3000:127.0.0.1:3000 user@server
```

然后本地访问：

```text
http://127.0.0.1:3000
```

## 4. 权限原则

### 4.1 不用 root 跑服务

创建专用用户：

```text
aihub
```

所有 AI Dev Hub 服务和 Cursor CLI 执行都使用该用户。

### 4.2 项目隔离

每个项目独立目录：

```text
/srv/ai-workspaces/project-a
/srv/ai-workspaces/project-b
```

### 4.3 密钥隔离

密钥不进入 Git。

推荐放置：

```text
/srv/ai-secrets/.env
```

并限制文件权限：

```bash
chmod 600 /srv/ai-secrets/.env
```

## 5. 高风险操作控制

MVP 默认禁止自动执行：

- push main。
- merge PR。
- deploy production。
- 删除大量文件。
- 修改 `.env`、密钥、证书。
- 修改服务器 SSH 配置。

如确需执行，必须人工确认。

## 6. Git 安全策略

推荐策略：

1. 每个任务创建独立 branch。
2. Cursor CLI 执行前记录 git status。
3. Cursor CLI 执行后记录 git diff。
4. 不自动 commit。
5. 不自动 push。
6. 用户确认后手动提交。

后续可以加入半自动 commit，但仍不自动 push。

## 7. 公司代码风险

如果处理公司代码，需要确认：

- 公司是否允许将代码 clone 到个人腾讯云服务器。
- 公司是否允许使用外部 AI 工具处理代码。
- 公司是否允许代码日志和 diff 存储在个人服务器。

如果不允许，本方案只能用于个人项目或公司批准的隔离环境。

## 8. 日志安全

执行日志可能包含：

- 文件路径。
- 代码片段。
- 错误信息。
- 环境变量泄漏风险。

需要：

- 日志文件权限限制。
- 过滤明显密钥格式。
- 避免将完整日志自动提交到 Git。
- 只把任务总结和 handoff 提交到仓库。

## 9. Web UI 安全

MVP 要求：

- 只监听 `127.0.0.1`。
- 通过 SSH tunnel 访问。
- 不开放公网端口。

后续如果需要公网访问，必须增加：

- 登录认证。
- HTTPS。
- CSRF 防护。
- 操作审计。
- 访问控制。

## 10. 最小安全基线

MVP 实现前必须满足：

1. 服务不用 root 跑。
2. UI 不公网裸露。
3. 密钥不进 Git。
4. 不自动 push / merge / deploy。
5. 执行日志可追踪。
6. 高风险文件变更有提示。
