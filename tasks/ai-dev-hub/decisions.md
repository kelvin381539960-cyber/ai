# AI Dev Hub 决策记录

## Decision 001：不自研完整 IDE

状态：已决定。

原因：

- IDE 成本过高，包括编辑器、LSP、Git、终端、调试、插件生态、跨平台等。
- 当前核心痛点不是编辑器，而是任务、上下文、交接和工具切换。
- 第一版应避免陷入 UI 和编辑器 API 细节。

结论：

- 不做完整 IDE。
- 做 AI 开发任务中台。

## Decision 002：不绑定单一 AI 工具

状态：已决定。

原因：

- 产品目标是统一工作流，不是替代或绑定某个工具。
- 用户未来可能切换 Cursor、Codex、Claude、公司 API 或其他工具。
- 如果早期写死某个工具，会限制扩展性。

结论：

- 系统核心只定义能力、任务、上下文、日志和交接协议。
- 具体工具通过 Adapter 接入。
- Cursor CLI、Codex CLI、Claude Code、公司 API 都只是可选 Adapter。

## Decision 003：采用能力模型

状态：已决定。

原因：

- 不同 AI 工具能力不同。
- 系统应该根据任务需要选择能力，而不是根据工具名写流程。
- 能力模型便于后续做路由、成本控制、成功率统计。

结论：

- Task 声明 required_capabilities。
- Agent 声明 capabilities。
- Capability Router 负责匹配。

## Decision 004：部署在私有服务器

状态：已决定。

原因：

- 用户上班用公司电脑，下班用个人电脑。
- 私有服务器可以作为统一 AI 工作现场。
- 代码、任务、日志、上下文集中保存。

结论：

- AI Dev Hub 第一部署目标是腾讯云服务器或其他私有服务器。
- 公司电脑和个人电脑只作为访问终端。

## Decision 005：第一阶段先做 CLI，不做 UI

状态：建议。

原因：

- CLI 能最快验证核心流程。
- UI 过早会增加实现成本。
- 先把任务、上下文、Agent 注册、日志、handoff 跑通。

结论：

- 阶段 1 实现 CLI 原型。
- 阶段 3 再做 Web UI。

## Decision 006：MVP 至少支持 Generic CLI Adapter 和 Manual Adapter

状态：建议。

原因：

- Generic CLI Adapter 可以接入多数命令行工具。
- Manual Adapter 可以覆盖无法 API/CLI 化的工具。
- 两者组合可避免系统早期绑定具体工具。

结论：

- 第一版不要写死某个工具 Adapter。
- 先实现通用接入能力。

## Decision 007：Web UI 不直接公网暴露

状态：建议。

原因：

- 中台会访问代码、密钥、执行命令。
- 公网裸露风险高。

结论：

- 通过 SSH tunnel、VPN、Tailscale、WireGuard 或 Cloudflare Zero Trust 访问。

## Decision 008：记忆系统必须可控

状态：建议。

原因：

- 系统可以越用越懂用户，但不能黑盒记忆。
- 用户需要能查看、编辑、删除记忆。

结论：

- 重要记忆必须用户确认后写入。
- 用户偏好、项目规则、技术决策分开管理。
