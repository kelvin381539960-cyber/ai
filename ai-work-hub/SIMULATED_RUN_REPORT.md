# AI Work Hub Simulated Run Report

## 1. 结论

本次在受限环境中尝试模拟运行 AI Work Hub。

结果：

```text
未能完成真实 npm install / typecheck / build / dev 运行。
```

原因：当前环境无法解析并访问 `github.com`，无法从远端拉取仓库代码；也不能确认 npm 依赖可被正常安装。

因此，本报告只代表：

```text
静态模拟检查结果
```

不代表：

```text
真实构建通过
真实运行通过
真实 Demo 通过
```

## 2. 环境检查

当前运行环境具备：

```text
Node.js v22.16.0
npm 10.9.2
```

Node 版本满足项目建议的 Node.js 20+ 要求。

## 3. 无法执行的真实命令

由于无法拉取仓库，以下命令未能真实执行：

```bash
cd ai-work-hub
npm install
npm run typecheck
npm run build
npm run dev
npm run smoke
```

这些命令仍必须在真实服务器或本地环境执行。

## 4. 静态模拟检查结果

基于当前已提交代码结构，整体实现方向可继续。

已具备：

```text
Next.js 应用骨架
SQLite 初始化
默认模板
任务创建
资料管理
Manual Assistant Run
Output 管理
搜索
基础 Workflow Runtime
验证脚本
运行手册
```

但仍有以下风险需要真实运行确认。

## 5. 高优先级风险

### 5.1 better-sqlite3 原生依赖风险

`better-sqlite3` 需要原生模块。

真实服务器如果缺少编译环境，`npm install` 可能失败。

Ubuntu 建议先安装：

```bash
sudo apt-get update
sudo apt-get install -y build-essential python3
```

### 5.2 Next.js 构建期访问 SQLite 风险

代码已为涉及 SQLite 的页面添加：

```ts
export const dynamic = 'force-dynamic'
```

但仍必须通过：

```bash
npm run build
```

确认没有构建期访问数据库导致失败。

### 5.3 自定义 dataDir 表单输入未真正切换运行时目录

当前 `onboarding` 页面允许输入数据目录，但运行时代码主要通过：

```text
AI_WORK_HUB_DATA_DIR
```

或默认：

```text
./data
```

决定真实数据目录。

因此实际部署时应优先使用环境变量：

```bash
AI_WORK_HUB_DATA_DIR=/srv/ai-work-hub npm run dev
```

后续建议把 onboarding 中的数据目录输入改成说明性提示，或改造为真正影响 runtime config。

### 5.4 Workflow Runtime 仍是基础版

已实现：

```text
启动推荐流程
waiting_user
继续流程
取消流程
assistant_run 生成 Manual Run
```

但未实现：

```text
复杂重试
条件分支
并行步骤
流程输出汇总
流程级最终结论生成
```

这不阻塞首个 Demo，但不应误认为是完整 Workflow 产品。

## 6. 建议真实验证步骤

在腾讯云服务器或本地执行：

```bash
git pull
cd ai-work-hub
npm install
npm run check
npm run dev
```

新开终端：

```bash
cd ai-work-hub
npm run smoke
```

然后手动访问：

```text
/onboarding
/
/tasks/new?type=research
/outputs
/search
/api/health
```

## 7. 通过标准

必须全部通过：

```text
npm install 成功
npm run typecheck 成功
npm run build 成功
npm run dev 成功
npm run smoke 成功
需求调研 Demo 手动跑通
Workflow 基础流程可启动、继续、取消
```

## 8. 当前判断

当前代码已经达到：

```text
可交给真实环境进行首轮运行验证
```

但还没有达到：

```text
已确认可运行
已确认可部署
已确认 Demo 真实通过
```

下一步应在真实服务器执行验证命令，并根据实际报错继续修复。
