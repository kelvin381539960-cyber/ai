# AI Work Hub QA Checklist

## 1. 启动检查

```bash
cd ai-work-hub
npm install
npm run typecheck
npm run build
npm run dev
```

健康检查：

```text
GET /api/health
```

期望：

```json
{
  "ok": true,
  "initialized": false
}
```

或初始化后：

```json
{
  "ok": true,
  "initialized": true
}
```

## 2. 首次初始化

访问：

```text
/onboarding
```

操作：

```text
填写 Workspace 名称
点击初始化
```

验收：

```text
跳转首页
首页显示任务类型卡片
默认助手已安装
默认流程已安装
```

## 3. 需求调研 Demo

步骤：

1. 首页点击“做需求调研”。
2. 创建任务：调研 AI 工作流工具。
3. 添加一条初始资料。
4. 进入任务详情。
5. 点击“继续生成”。
6. 出现 waiting_user 区块。
7. 点击“复制 Prompt”。
8. 将外部 AI 输出粘贴回来。
9. 点击“保存为输出”。
10. 页面出现 Output。
11. 编辑 Output。
12. 点击“另存为新版本”。
13. 点击“标记最终版”。
14. 点击“转为任务资料”。
15. 访问 `/outputs` 查看输出列表。
16. 基于某个输出创建新任务。
17. 访问 `/search` 搜索任务、资料、输出。

## 4. 必须通过的验收

```text
无需先创建助手
无需先创建流程
可以创建任务
可以添加资料
可以生成 prompt
可以复制 prompt
可以回填结果
可以生成 Output
可以编辑 Output
可以另存为新版本
可以标记最终版
可以转为资料
可以基于输出创建新任务
可以搜索历史内容
```

## 5. 构建风险检查

必须通过：

```bash
npm run typecheck
npm run build
```

如果失败，优先检查：

```text
Next.js params/searchParams 类型
better-sqlite3 原生依赖
@/* 路径别名 baseUrl
涉及 SQLite 的页面是否 force-dynamic
```

## 6. 暂不验收

```text
Workflow Runtime 完整执行
CLI Assistant
MCP
ChatGPT Action
多用户权限
复杂 DAG
成本统计
```
