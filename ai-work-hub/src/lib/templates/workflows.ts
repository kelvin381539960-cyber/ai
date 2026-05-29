import type { WorkflowDefinition, WorkflowStepType } from "@/lib/types";

type WorkflowTemplate = {
  id: string;
  name: string;
  scenario: string;
  description: string;
  steps: Array<{
    type: WorkflowStepType;
    title: string;
    description: string;
  }>;
};

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "prd",
    name: "PRD 自动化输出",
    scenario: "prd",
    description: "把目标、资料和规则整理成可编辑的 PRD 初稿。",
    steps: [
      { type: "input", title: "输入产品目标", description: "定义用户、问题、目标和边界。" },
      { type: "collect_context", title: "选择项目资料", description: "读取项目知识、历史输出和相关资料。" },
      { type: "apply_rules", title: "应用 PRD 规则", description: "注入 PRD 结构、验收和质量规则。" },
      { type: "select_agent", title: "推荐执行 Agent", description: "按能力选择 Cursor、Codex、Claude 或 Manual。" },
      { type: "run_agent", title: "生成 PRD 草稿", description: "执行 Agent 并记录完整过程。" },
      { type: "review_output", title: "人工确认", description: "检查草稿并补充要求。" },
      { type: "save_output", title: "保存 Output", description: "保存 Markdown 输出并进入版本管理。" },
      { type: "update_knowledge", title: "沉淀项目知识", description: "最终版可回写知识库。" },
    ],
  },
  {
    id: "research",
    name: "需求调研",
    scenario: "research",
    description: "围绕问题生成调研结论、证据和下一步建议。",
    steps: [
      { type: "input", title: "输入调研问题", description: "明确调研目标和决策用途。" },
      { type: "collect_context", title: "收集背景资料", description: "匹配项目知识和历史调研。" },
      { type: "apply_rules", title: "应用调研规则", description: "要求结论、证据、风险和建议。" },
      { type: "select_agent", title: "选择调研 Agent", description: "选择适合分析和总结的 Agent。" },
      { type: "run_agent", title: "生成调研结论", description: "执行并保存过程。" },
      { type: "save_output", title: "保存调研输出", description: "沉淀为可复用 Output。" },
    ],
  },
  {
    id: "competitive",
    name: "竞品分析",
    scenario: "competitive_analysis",
    description: "比较竞品定位、能力、差异和机会点。",
    steps: [
      { type: "input", title: "输入竞品范围", description: "列出竞品和分析目标。" },
      { type: "collect_context", title: "读取资料", description: "引用已有资料和历史分析。" },
      { type: "apply_rules", title: "应用竞品分析规则", description: "限定比较维度和输出结构。" },
      { type: "run_agent", title: "生成分析", description: "调用 Agent 输出对比结论。" },
      { type: "review_output", title: "人工校准", description: "补充真实观察和判断。" },
      { type: "save_output", title: "保存结果", description: "保存 Markdown 版本。" },
    ],
  },
  {
    id: "proposal",
    name: "方案撰写",
    scenario: "proposal",
    description: "把目标、约束和资料整理成方案文档。",
    steps: [
      { type: "input", title: "输入方案目标", description: "明确问题、对象和约束。" },
      { type: "collect_context", title: "组织上下文", description: "选择知识库资料和决策记录。" },
      { type: "apply_rules", title: "应用方案规则", description: "注入结构、取舍和风险规则。" },
      { type: "run_agent", title: "生成方案", description: "执行 Agent 生成草稿。" },
      { type: "save_output", title: "保存方案", description: "进入 Output Library。" },
    ],
  },
  {
    id: "retro",
    name: "项目复盘",
    scenario: "retro",
    description: "沉淀结果、问题、经验和后续动作。",
    steps: [
      { type: "input", title: "输入复盘范围", description: "说明阶段、目标和结果。" },
      { type: "collect_context", title: "读取历史输出", description: "引用任务记录、输出和决策。" },
      { type: "apply_rules", title: "应用复盘规则", description: "要求事实、原因、行动项。" },
      { type: "run_agent", title: "生成复盘", description: "生成结构化复盘文档。" },
      { type: "update_knowledge", title: "沉淀经验", description: "将最终版写回知识库。" },
    ],
  },
];

export function buildLinearDefinition(template: WorkflowTemplate): WorkflowDefinition {
  const nodes = template.steps.map((step, index) => ({
    id: `step_${index + 1}`,
    type: step.type,
    title: step.title,
    description: step.description,
    x: index * 240,
    y: index % 2 === 0 ? 80 : 210,
  }));

  const edges = nodes.slice(0, -1).map((node, index) => ({
    id: `edge_${index + 1}`,
    source: node.id,
    target: nodes[index + 1].id,
  }));

  return { nodes, edges };
}
