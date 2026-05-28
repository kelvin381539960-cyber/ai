# Manual Assistant Run Flow 手动助手运行流程

## 1. 目标

Manual Assistant 是 MVP 的关键能力。

它允许用户把系统生成的 prompt 复制给外部 AI 工具，再把结果粘贴回来。

必须保证这个流程完整、可恢复、可记录。

## 2. 状态流转

```text
created → prompt_ready → waiting_user → completed
                         ↘ cancelled
```

失败状态：

```text
failed
```

## 3. 运行流程

### Step 1：生成 Prompt

系统基于以下内容生成 prompt：

```text
任务目标
任务资料
资料范围
当前输出
当前流程步骤
助手模板
用户本次补充指令
```

### Step 2：展示 Prompt

页面必须显示：

```text
Prompt 内容
本次使用资料
资料范围
复制按钮
敏感信息提示
```

按钮：

```text
复制 Prompt
重新生成 Prompt
取消本次运行
```

### Step 3：等待用户外部执行

Run 状态：

```text
waiting_user
```

页面提示：

```text
请将 Prompt 复制到你选择的 AI 工具中，完成后把结果粘贴回来。
```

### Step 4：用户回填结果

用户粘贴：

```text
外部 AI 输出
补充备注，可选
```

操作：

```text
保存为输出
保存并继续流程
仅保存执行记录
```

### Step 5：生成 Output

默认把回填内容保存为 Output。

Output 类型由任务类型和当前步骤决定。

## 4. 页面要求

Manual Run 页面必须有：

```text
任务标题
助手名称
当前流程步骤
Prompt 区
复制按钮
结果粘贴区
保存按钮
取消按钮
```

## 5. 恢复机制

如果用户关闭页面，系统必须保留：

```text
run_id
prompt
状态 waiting_user
任务关联
流程步骤关联
```

用户重新打开任务时，显示：

```text
有一个等待回填的助手运行
```

按钮：

```text
继续回填
取消运行
```

## 6. 敏感信息提示

复制 prompt 前必须提示：

```text
请确认 Prompt 中不包含不应发送给外部 AI 的敏感信息。
```

MVP 不做自动脱敏，但必须有提示。

## 7. 验收

必须满足：

1. 用户能复制 Prompt 到外部 AI。
2. 用户能粘贴结果回来。
3. 结果能保存为 Output。
4. 如果属于 Workflow Step，保存后能继续下一步。
5. 页面关闭后 waiting_user 状态能恢复。
6. 用户可以取消 waiting_user Run。
