# Workflow Run Rules 流程运行规则

## 1. 目标

Workflow 是任务流程。

MVP 必须支持流程暂停、继续、取消和恢复，避免用户中途离开后任务断掉。

## 2. Workflow Run 状态

```text
pending
running
waiting_user
success
failed
cancelled
```

## 3. Step 状态

```text
pending
running
waiting_user
success
failed
skipped
```

## 4. Step 类型

MVP 支持：

```text
manual_input
add_material
context_build
assistant_run
review_prompt
output_build
```

## 5. 执行规则

Workflow 按线性顺序执行。

```text
Step 1 → Step 2 → Step 3
```

MVP 不支持：

```text
条件分支
并行步骤
循环
DAG
```

## 6. waiting_user 规则

以下情况进入 waiting_user：

```text
manual_input 等待用户输入
add_material 等待用户添加资料
Manual Assistant 等待用户回填外部 AI 输出
用户手动暂停流程
```

## 7. 暂停和继续

Workflow Run 必须支持：

```text
暂停
继续
取消
```

用户可以在任务详情页看到：

```text
当前流程暂停在第 N 步
下一步需要你做什么
```

## 8. 恢复机制

系统必须保存：

```text
workflow_run_id
task_id
current_step_id
step_states
step_outputs
waiting_reason
created_at
updated_at
```

用户关闭页面后重新进入任务，必须能看到未完成流程。

## 9. Step 输出

每个 Step 可以产生：

```text
Material
Run
Output
Note
```

Step 输出必须关联 workflow_run_id 和 step_id。

## 10. 失败处理

Step 失败时，Workflow Run 状态为 failed。

用户可以：

```text
重试当前步骤
跳过当前步骤
取消流程
```

MVP 可先支持取消和重试。

## 11. 运行中添加资料

如果流程中途发现资料不足，用户可以添加资料后继续。

新资料进入当前任务 Material 列表。

后续步骤可以使用新资料。

## 12. 验收

必须满足：

1. 用户可以运行线性流程。
2. 流程可以暂停。
3. 流程可以继续。
4. Manual Assistant Step 可以等待用户回填。
5. 用户关闭页面后可以恢复未完成流程。
6. 流程失败后可以取消或重试。
7. 流程结束后能生成 Output。
