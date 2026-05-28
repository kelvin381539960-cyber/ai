# AI Work Hub

产品经理 / 运营的 AI 工作台。

## 当前实现范围

第一批只实现真实用户闭环：

```text
初始化系统 → 首页任务类型入口 → 创建需求调研任务 → 添加资料 → Manual Assistant 生成 Prompt → 回填外部 AI 输出 → 创建 Output → 编辑 Output → 标记最终版
```

暂不实现：Workflow Runtime、CLI Assistant、MCP、ChatGPT Action、多用户权限、复杂 DAG。

## 启动

```bash
cd ai-work-hub
npm install
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

## 主要入口

- `/` 首页任务类型入口
- `/onboarding` 初始化
- `/tasks/new?type=research` 创建任务
- `/tasks/[id]` 任务详情
