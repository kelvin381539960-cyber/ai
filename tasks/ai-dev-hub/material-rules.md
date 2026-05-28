# Material Rules 资料规则

## 1. 目标

Material 是产品/运营任务的核心输入。

MVP 必须确保：

- 用户能添加资料。
- 用户知道本次运行用了哪些资料。
- 用户能控制资料是否参与上下文。
- 资料能被输出和任务复用。

## 2. Material 类型

MVP 支持：

```text
text
url
file
image
meeting_note
user_feedback
competitor_info
ai_output
custom
```

## 3. Material 字段

```text
id
task_id
type
title
content
file_path
source_url
usage_status
is_key
created_at
updated_at
```

## 4. 资料使用状态

每条资料有使用状态：

```text
active       默认参与上下文
key          重点资料，优先参与上下文
excluded     暂不参与上下文
archived     归档资料
```

UI 表达：

```text
普通资料
重点资料
暂不使用
已归档
```

## 5. 添加资料规则

用户可以在任务详情页添加资料。

添加方式：

```text
粘贴文本
添加链接
上传文件
上传图片
从 Output 转入
```

MVP 文件上传可以先只保存文件，不做复杂解析。

## 6. 运行前资料确认

每次运行助手或流程前，必须显示本次使用资料。

选项：

```text
使用标准资料：重点资料 + 普通资料摘要
只使用重点资料
手动选择资料
不使用资料，仅使用任务目标
```

默认：

```text
使用标准资料
```

## 7. 资料范围映射

### 简洁

使用：

```text
任务目标
最新最终输出
本次用户输入
```

### 标准

使用：

```text
重点资料全文或摘要
普通资料摘要
最近输出
```

### 完整

使用：

```text
所有 active/key 资料
历史输出
关键执行记录
```

## 8. 资料引用展示

Run 详情中必须记录：

```text
本次使用了哪些资料
每条资料是全文还是摘要
```

Output 详情中显示：

```text
来源资料
```

## 9. 隐私提示

Manual Assistant 复制 Prompt 前必须提示：

```text
本次 Prompt 将包含以下资料，请确认可以发送给外部 AI。
```

## 10. 验收

必须满足：

1. 用户可以添加资料。
2. 用户可以标记重点资料。
3. 用户可以把资料设为暂不使用。
4. 每次运行前能确认使用哪些资料。
5. Run 记录能追踪资料引用。
6. Output 能显示来源资料。
