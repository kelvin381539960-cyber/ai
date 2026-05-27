# RootOps MCP 任务交接

## 任务目标

构建一个高权限、低打扰、可回滚、适合个人使用的 AI RootOps MCP，用于让 GPT/Claude/Cursor 等 AI 工具高速、稳定地控制云服务器、读取/搜索/编辑大量文件和大文件，并支持后续换 AI 工具继续执行。

## 当前结论

不要只 fork 一个开源 MCP，也不要简单拼接。最佳方案是融合式重构：

- Desktop Commander MCP：借鉴文件系统、终端、进程、搜索、编辑、分页输出、审计、文档解析等能力。
- mcp-ssh-manager：借鉴 SSH、rsync、多服务器、持久 session、tunnel、监控、备份、部署、sudo 等远程运维能力。
- 官方 filesystem MCP：借鉴 allowed roots、Roots、tool annotations、readOnly/destructive/idempotent、安全边界等规范。
- 本地大模型 Sidecar：借鉴/接入 Ollama、llama.cpp、vLLM、SGLang 等本地模型运行方案，用于 embedding、rerank、大文件摘要、日志压缩、风险预检、上下文压缩。
- 现有 AIX bridge：保留 Git、snapshot、rollback、project overview、file outline、related files、edit loop、audit、approval 等工程治理思路。

目标不是 85 分可用方案，而是平均 90+，目标 97 左右的个人高权限 AI 运维/代码操作系统。

## 推荐项目定位

项目名建议：AIX RootOps MCP

定位：高权限个人 AI 运维与代码操作系统。

核心原则：

- 底层权限最大。
- GPT/Claude/Cursor 等主模型负责决策、架构判断、复杂任务规划和高风险动作裁决。
- 本地大模型负责加速、压缩、索引、摘要、rerank、风险预检，不直接作为最高权限主脑。
- GPT 默认自主完成低风险操作。
- 高风险操作合并授权，尽量少让用户点击。
- 所有写操作自动 snapshot。
- 所有修改可 diff、可 verify、可 rollback。
- 所有工具调用可审计。
- 适配多 AI 工具继续执行。

## 目标架构

```text
GPT / Claude / Cursor / Agent 主模型
  ↓
MCP Gateway
  ↓
Risk-Based Authorization Engine
  ↓
Task Session / Tool Profile / Audit
  ↓
Local Intelligence Layer / Local Model Sidecar
  ↓
File Intelligence Engine
  ↓
Patch Transaction Engine
  ↓
Remote Ops Engine
  ↓
Local FS / SSH / Rsync / Git / Build / DB / Logs
```

本地大模型不是替代 GPT，而是作为 Sidecar：

```text
GPT 是主脑
Local Model 是加速器
MCP 是手脚
Policy Engine 是刹车
Snapshot / Rollback 是保险
Audit 是黑匣子
```

## 目标评分

| 维度 | 目标分 |
|---|---:|
| 文件读取速度 | 97 |
| 大文件处理 | 98 |
| 多文件搜索 | 98 |
| 代码理解 | 98 |
| 精准编辑 | 97 |
| 多文件批量修改 | 96 |
| Git / branch / diff / rollback | 96 |
| SSH / 云服务器控制 | 95 |
| rsync / 大文件传输 | 95 |
| GPT 授权摩擦 | 95 |
| GPT token 成本控制 | 97 |
| 本地隐私与数据控制 | 97 |
| 快照 / 回滚 / 灾难恢复 | 96 |
| 审计 / 可追踪 | 93 |
| 单人高权限可控性 | 91 |

平均目标：97 左右。

## 授权模型

用户明确要求：权限要最大，因为只有自己使用；同时 GPT 授权要平衡，尽量少点击授权。

推荐 5 档风险授权：

| 风险 | 操作 | 授权策略 |
|---|---|---|
| R0 | read/list/search/diff/log/status | 永不询问 |
| R1 | 单文件 patch、创建文件、snapshot | 自动允许 |
| R2 | 多文件 patch、运行测试、创建分支 | 自动允许，有阈值 |
| R3 | commit、push、部署、重启服务、改 env | 合并授权 |
| R4 | sudo、rm 大目录、reset hard、生产 DB 写、权限策略修改 | 必须确认 |

关键不是低权限，而是：

```text
系统权限最大
GPT 授权按风险自动放行
本地模型只做辅助判断，不直接绕过授权引擎
```

## 任务级授权示例

```json
{
  "task_id": "task_xxx",
  "allowed_roots": ["/opt/AIX代码"],
  "expires_in_minutes": 60,
  "auto_allow": [
    "file.read",
    "file.search",
    "file.patch",
    "file.write",
    "snapshot.create",
    "git.diff",
    "build.run",
    "local.embed",
    "local.rerank",
    "local.summarize",
    "local.patch_risk"
  ],
  "requires_confirm": [
    "git.push",
    "file.delete.large",
    "sudo",
    "systemctl",
    "database.write",
    "policy.manage"
  ],
  "limits": {
    "max_files_changed": 30,
    "max_lines_changed": 8000,
    "max_command_seconds": 300,
    "max_local_model_batch_tokens": 200000
  }
}
```

## 必做模块

### 1. MCP Gateway

职责：

```text
统一暴露 MCP 工具
适配 GPT / Claude / Cursor / 其他 Agent
根据 Tool Profile 动态启用工具
统一处理 tool call 日志、错误、分页和结果压缩
```

### 2. Risk-Based Authorization Engine

职责：

```text
按风险自动放行或合并授权
限制高风险动作
记录每次授权范围
防止本地模型或远程 agent 绕过主授权链路
```

禁止策略：

```text
本地模型不得直接调用 sudo / git push / db write / policy.manage
本地模型不得自己给自己授权
approval.bypass 不应暴露给模型自动调用
```

### 3. Local Intelligence Layer / 本地大模型 Sidecar

推荐纳入最终方案。它对整体有明显提升，尤其是效率、成本、隐私、检索质量和授权降噪。

定位：

```text
主模型：GPT / Claude / Cursor，负责决策和最终执行规划
本地模型：Ollama / llama.cpp / vLLM / SGLang，负责预处理、压缩、索引、摘要、rerank、风险预检
```

核心职责：

```text
embedding_index
semantic_search
rerank_results
summarize_large_file
summarize_logs
classify_patch_risk
extract_symbols
generate_search_queries
compress_context
local_context_pack
```

推荐接口：

```text
local_embed(texts)
local_rerank(query, candidates)
local_summarize_file(path, chunks)
local_summarize_log(path, time_range)
local_patch_risk(diff)
local_query_rewrite(task)
local_context_pack(task_id)
local_extract_symbols(path)
local_classify_file(path)
```

适合本地模型做的事：

```text
代码库语义索引
搜索结果 rerank
大文件摘要
日志压缩
diff 风险预检
工具参数草稿生成
上下文压缩
相似文件推荐
需求到代码的候选定位
```

不适合本地模型直接做的事：

```text
直接当主 Agent
直接决定是否 sudo
直接 git push / deploy
直接改生产数据库
直接删除目录
直接修改权限策略
独立处理复杂跨仓库架构决策
```

推荐实现栈：

```text
第一阶段：Ollama + embedding + summary + rerank
第二阶段：llama.cpp server 做低资源高可控部署
第三阶段：有 GPU 后接 vLLM / SGLang 做高并发和较大模型
第四阶段：远程 agent 内置 local model client
```

建议模型职责拆分：

```text
Embedding 模型：代码/文档向量化
Small Instruct 模型：摘要、日志压缩、query rewrite
Reranker 模型：搜索结果重排
主模型 GPT/Claude：最终计划、复杂推理、执行决策
```

加入本地模型后的收益：

| 维度 | 不加本地模型 | 加本地模型 Sidecar |
|---|---:|---:|
| 大文件处理 | 95 | 98 |
| 多文件搜索 | 96 | 98 |
| 代码理解 | 95 | 98 |
| 授权摩擦 | 93 | 95 |
| GPT token 成本 | 88 | 97 |
| 隐私 | 90 | 97 |
| 整体分 | 96-97 | 97-98 |

### 4. 文件智能引擎

必需能力：

```text
read_lines(path, start, limit)
read_bytes(path, offset, length)
read_tail(path, lines)
read_many(items, max_total_bytes)
stat(path)
hash(path)
outline(path)
related_files(path)
semantic_search(query, roots)
context_pack(task_id)
```

底层建议：

```text
ripgrep：实时搜索
SQLite FTS5：全文索引
tree-sitter：代码结构
LSP：定义/引用/诊断
xxhash + sha256：变更检测
LRU cache：热文件缓存
Local Model Embedding：语义索引
Local Reranker：候选重排
```

### 5. 大文件策略

```text
小文件：直接读
中等文件：分页读
大文件：chunk 读 + local summarize
日志文件：tail + search window + local log summary
代码文件：outline + symbol search + semantic search
二进制/Office/PDF：专用 parser + local summary
```

关键原则：

```text
不要把大文件整段塞给 GPT
先本地分块、摘要、索引、rerank
GPT 只拿必要片段、结构化摘要和风险提示
```

### 6. 编辑事务引擎

不能只做 oldText -> newText。目标流程：

```text
edit_plan
dry_run
local_patch_risk
snapshot
apply_patch(expected_hash)
verify
git_diff
rollback
```

每个 patch 应携带：

```json
{
  "path": "src/a.java",
  "expected_hash": "xxx",
  "operation": "replace_block",
  "old_text": "...",
  "new_text": "...",
  "risk": "R1",
  "local_risk_hint": "auth_logic_changed",
  "dry_run_required": true,
  "auto_snapshot": true
}
```

### 7. 远程运维引擎

必需能力：

```text
ssh_exec
ssh_exec_stream
ssh_session_open
ssh_session_send
ssh_session_close
ssh_upload
ssh_download
rsync_push
rsync_pull
server_group_exec
ssh_tunnel_open
health_check
service_status
log_tail
deploy_plan
deploy_apply
deploy_rollback
```

建议增加 remote-agent 模式：

```text
GPT
 ↓
MCP Gateway
 ↓
SSH bootstrap
 ↓
远程轻量 agent
 ↓
本机文件索引 / patch / git / logs / local model client
```

频繁读写远程大文件时，不要每次通过 SSH 往返传输；远程 agent 在服务器本地做搜索、索引、diff、patch，只返回必要摘要和片段。

如果远程服务器资源允许，可以在远程 agent 旁边部署本地模型或 embedding 服务；如果资源有限，则远程 agent 只做 chunk/grep/hash，把数据回传给中心 Local Intelligence Layer 处理。

### 8. Tool Profile

避免暴露太多工具污染上下文。

```text
profile: read_only
profile: code_edit
profile: server_ops
profile: deploy
profile: database
profile: emergency
profile: admin
profile: local_intelligence
```

当前任务只激活需要的工具。

## 当前 AIX bridge 状态记录

之前检查到的能力：

- 已有 file.read、file.list、file.search、git.status、git.diff、git.log、diff.preview、audit.query、build.read、policy.read。
- 已有 file.write、file.patch、worktree.create、snapshot.create、cursor.ask、cursor.edit、build.run、git.branch.create、approval.request、gpt.task.submit、crawl.submit、file.delete、git.commit、git.push、git.rollback、rollback.file、approval.bypass 等。
- 文件读取支持 offsetLine、limitLines、maxBytes、withLineNumbers。
- 搜索支持 regex、fileGlob、cursorPagination、contextLines、dedupeByFile、maxHitsPerFile。
- 有 projectOverview、fileOutline、relatedFiles、diffContext。
- 有 patchBatch、editPlan、editApply、editVerify。

已发现问题：

- 当前 actor 是 root，role 是 admin。
- approvalRequired 为空。
- 有 approval.bypass。
- integrity drift：missing=24、changed=14、unexpected=4。
- Cursor CLI 有，但 hasApiKey=false。

处理建议：

- 保留 AIX bridge 的 Git / snapshot / project intelligence 思路。
- 重写 policy / authorization / file engine / remote engine。
- 新增 Local Intelligence Layer，不要让本地模型绕过 policy。
- 不要继续简单堆功能。

## 开源项目与组件借鉴评分

| 项目/组件 | 原样使用 | 作为组件借鉴 |
|---|---:|---:|
| Desktop Commander MCP | 88 | 96 |
| mcp-ssh-manager | 86 | 95 |
| 官方 filesystem MCP | 72 | 93 |
| 本地大模型 Sidecar | 不建议单独当主系统 | 96 |

最终方案评分：

| 方案 | 分数 |
|---|---:|
| 三者简单拼接 | 89 |
| Desktop Commander 文件内核 + mcp-ssh-manager 远程层 | 91 |
| 上面 + 官方 filesystem 权限语义 | 93 |
| 上面 + 现有 AIX bridge Git/snapshot/project intelligence | 95 |
| 上面 + 自研索引/LSP/远程 agent/任务级授权 | 96-97 |
| 上面 + 本地大模型 Sidecar | 97-98 |

## 下一步建议

1. 新建 AIX RootOps MCP 项目骨架。
2. 先实现 MCP Gateway + Tool Profile。
3. 实现 Risk-Based Authorization Engine。
4. 实现 Local Intelligence Layer，先接 Ollama embedding、summary、rerank。
5. 实现 File Intelligence Engine，先接 ripgrep + read_lines + read_bytes + read_many。
6. 实现 semantic_search 和 context_pack，避免 GPT 直接读大量文件。
7. 实现 Patch Transaction Engine，必须支持 expected_hash、dry_run、local_patch_risk、snapshot、verify、rollback。
8. 接入 Git/status/diff/branch/worktree/commit/push/rollback。
9. 接入 SSH/rsync/session/server group。
10. 补 remote-agent 模式。
11. 补审计日志和任务交接文件自动生成。
12. 后续再优化 llama.cpp / vLLM / SGLang 部署。

## 后续 AI 执行注意

- 用户偏好：不要省事，要最好。
- 用户偏好：权限最大，但 GPT 授权尽量少打扰。
- 用户偏好：平均评分必须 90+，目标 97 左右。
- 用户偏好：本地大模型应该纳入方案，但只能作为效率增强和智能 sidecar，不应替代主模型做高风险决策。
- 不要建议低权限阉割版。
- 不要只推荐现成项目原样使用。
- 不要把本地模型直接设计成 root 主控 agent。
- 所有设计都应围绕高权限、低摩擦、可回滚、可审计、可换 AI 工具继续执行、本地智能加速。
