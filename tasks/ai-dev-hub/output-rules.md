# Output Rules 输出规则

## 1. 目标

Output 是用户真正关心的产物。

MVP 必须支持输出的查看、编辑、版本、复制和复用。

## 2. Output 类型

内置类型：

```text
research_report          调研结论
prd_draft                PRD 草稿
competitive_analysis     竞品分析
ops_plan                 运营方案
meeting_summary          会议纪要
data_review              数据复盘
review_result            评审意见
action_items             行动项
handoff                  交接说明
custom                   自定义
```

## 3. Output 字段

```text
id
task_id
type
title
content
version
is_final
source_run_ids
source_material_ids
created_at
updated_at
```

## 4. 版本规则

1. 每次助手生成新内容，创建一个新 Output 版本。
2. 用户编辑已有 Output 时，可以：
   - 覆盖保存。
   - 另存为新版本。
3. 每个任务每类输出可以有多个版本。
4. 用户可以标记一个版本为最终版。
5. 标记最终版不会删除旧版本。

## 5. 编辑规则

Output 详情页必须支持：

```text
编辑内容
保存
另存为新版本
标记最终版
取消编辑
```

编辑器 MVP 可以是 Markdown 文本编辑器。

## 6. 复制和导出

MVP 必须支持：

```text
复制 Markdown
复制纯文本
```

可以延后：

```text
导出 .md
导出 .docx
导出 PDF
```

## 7. Output 转 Material

用户可以把 Output 转为 Material。

用途：

```text
调研结论 → PRD 任务资料
PRD 草稿 → 评审任务资料
会议纪要 → 行动项任务资料
```

操作：

```text
转为当前任务资料
转为新任务资料
```

## 8. 基于 Output 创建新任务

Output 详情页支持：

```text
基于该输出创建新任务
```

创建时：

- Output 自动作为新任务 Material。
- 用户选择新任务类型。
- 系统推荐助手和流程。

## 9. 最终版规则

任务完成前建议至少有一个最终 Output。

完成任务时，如果没有最终版，系统提示：

```text
当前任务还没有最终输出，是否继续完成？
```

## 10. 验收

必须满足：

1. 用户可以查看 Output。
2. 用户可以编辑 Output。
3. 用户可以保存新版本。
4. 用户可以标记最终版。
5. 用户可以复制 Markdown。
6. 用户可以把 Output 转为 Material。
7. 用户可以基于 Output 创建新任务。
