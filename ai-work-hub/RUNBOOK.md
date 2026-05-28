# AI Work Hub Runbook

## 1. 目标

本手册用于从零启动 AI Work Hub，并跑通第一个 Demo。

## 2. 环境要求

推荐：

```text
Node.js 20+
npm
Linux / macOS / Windows WSL
```

如果使用 Linux 服务器并安装 `better-sqlite3` 失败，安装编译依赖：

```bash
sudo apt-get update
sudo apt-get install -y build-essential python3
```

## 3. 本地启动

```bash
cd ai-work-hub
npm install
npm run typecheck
npm run build
npm run dev
```

浏览器访问：

```text
http://localhost:3000
```

## 4. 指定数据目录启动

```bash
AI_WORK_HUB_DATA_DIR=/srv/ai-work-hub npm run dev
```

生产启动：

```bash
AI_WORK_HUB_DATA_DIR=/srv/ai-work-hub npm run build
AI_WORK_HUB_DATA_DIR=/srv/ai-work-hub npm run start
```

## 5. 健康检查

访问：

```text
http://localhost:3000/api/health
```

未初始化时：

```json
{
  "ok": true,
  "initialized": false
}
```

初始化后：

```json
{
  "ok": true,
  "initialized": true
}
```

## 6. 初始化

访问：

```text
http://localhost:3000/onboarding
```

填写：

```text
Workspace 名称：我的工作台
数据目录：可留空
```

点击：

```text
初始化 / 修复默认模板
```

成功后返回首页。

## 7. 跑通第一个 Demo

### Step 1：创建任务

首页点击：

```text
做需求调研
```

填写：

```text
任务标题：调研 AI 工作流工具
任务目标：了解适合产品经理和运营使用的 AI 工作流工具，并给出是否自研的建议。
预期输出：调研结论和下一步建议。
资料标题：背景资料
初始资料：我希望做一个产品/运营使用的 AI 工作台，可以管理任务、资料、助手、流程和输出。
```

点击：

```text
创建任务
```

### Step 2：生成 Prompt

在任务详情页点击：

```text
继续生成
```

系统会出现：

```text
等待回填的助手运行
```

点击：

```text
复制 Prompt
```

### Step 3：外部 AI 执行

把 Prompt 粘贴到任意 AI 工具中。

拿到结果后，回到任务详情页。

### Step 4：回填结果

在“粘贴外部 AI 输出”输入框中粘贴结果。

点击：

```text
保存为输出
```

### Step 5：编辑和定稿

在输出区域：

```text
编辑内容
保存编辑
另存为新版本
标记最终版
转为任务资料
```

### Step 6：查看输出

访问：

```text
/outputs
```

确认输出已出现。

### Step 7：搜索

访问：

```text
/search
```

搜索：

```text
AI 工作流
```

确认可以搜到任务、资料或输出。

## 8. 验收标准

必须满足：

```text
可以初始化
可以创建任务
可以添加资料
可以生成 Prompt
可以复制 Prompt
可以回填输出
可以创建 Output
可以编辑 Output
可以标记最终版
可以转为资料
可以搜索历史内容
```

## 9. 常见问题

### 9.1 npm install 失败

优先检查 Node.js 版本和编译依赖。

### 9.2 /api/health 返回 500

检查：

```text
数据目录是否有权限
better-sqlite3 是否安装成功
AI_WORK_HUB_DATA_DIR 是否可写
```

### 9.3 build 时读取 SQLite 报错

页面已设置：

```text
force-dynamic
```

如果仍报错，检查是否新增了静态页面直接读取数据库。

### 9.4 公司电脑和个人电脑看不到同一数据

确认两台电脑访问的是同一个服务器实例，并且服务使用同一个：

```text
AI_WORK_HUB_DATA_DIR
```

## 10. 生产使用提醒

当前版本没有登录系统。

不要公网裸露。

建议使用：

```text
SSH Tunnel
VPN
Tailscale
Cloudflare Zero Trust
```
