export const taskTypeDefaults: Record<string, { assistantName: string; workflowName: string; outputType: string; contextScope: 'light' | 'standard' | 'full' }> = {
  research: { assistantName: '调研助手', workflowName: '需求调研流程', outputType: 'research_report', contextScope: 'standard' },
  prd: { assistantName: 'PRD 助手', workflowName: 'PRD 生成流程', outputType: 'prd_draft', contextScope: 'standard' },
  competitive_analysis: { assistantName: '竞品分析助手', workflowName: '竞品分析流程', outputType: 'competitive_analysis', contextScope: 'standard' },
  ops_plan: { assistantName: '运营方案助手', workflowName: '运营活动流程', outputType: 'ops_plan', contextScope: 'standard' },
  meeting_summary: { assistantName: '会议纪要助手', workflowName: '会议纪要流程', outputType: 'meeting_summary', contextScope: 'full' },
  review: { assistantName: '评审助手', workflowName: '评审流程', outputType: 'review_result', contextScope: 'standard' }
};

export const seedAssistants = [
  {
    name: '调研助手',
    applicableTaskTypes: ['research', 'competitive_analysis'],
    capabilities: ['research', 'summarize'],
    defaultContextScope: 'standard',
    promptTemplate: `你是调研助手。请基于任务目标和资料输出调研结论。要求：结论先行；区分事实、推测、建议；列出信息缺口；给出下一步建议。`
  },
  {
    name: 'PRD 助手',
    applicableTaskTypes: ['prd'],
    capabilities: ['prd', 'product_design'],
    defaultContextScope: 'standard',
    promptTemplate: `你是 PRD 助手。请把输入资料整理成结构化 PRD，包含背景、目标、用户故事、范围、非目标、流程、验收标准和待确认问题。`
  },
  {
    name: '竞品分析助手',
    applicableTaskTypes: ['competitive_analysis'],
    capabilities: ['competitive_analysis'],
    defaultContextScope: 'standard',
    promptTemplate: `你是竞品分析助手。请输出分析维度、竞品做法、差异点、可借鉴点、风险点和建议。`
  },
  {
    name: '运营方案助手',
    applicableTaskTypes: ['ops_plan'],
    capabilities: ['ops_plan'],
    defaultContextScope: 'standard',
    promptTemplate: `你是运营方案助手。请输出目标、目标用户、策略、活动节奏、执行清单、指标和风险预案。`
  },
  {
    name: '会议纪要助手',
    applicableTaskTypes: ['meeting_summary'],
    capabilities: ['meeting_summary'],
    defaultContextScope: 'full',
    promptTemplate: `你是会议纪要助手。请输出会议摘要、关键决策、行动项、负责人、截止时间和待确认问题。`
  },
  {
    name: '评审助手',
    applicableTaskTypes: ['review', 'prd', 'ops_plan'],
    capabilities: ['review'],
    defaultContextScope: 'standard',
    promptTemplate: `你是评审助手。请只指出关键问题，包括高风险问题、遗漏点、影响、修改建议和是否阻塞。`
  }
];

export const seedWorkflows = [
  { name: '需求调研流程', applicableTaskTypes: ['research'], steps: ['确认调研问题', '添加调研资料', '调研助手生成初稿', '评审助手检查遗漏', '生成最终调研结论'] },
  { name: 'PRD 生成流程', applicableTaskTypes: ['prd'], steps: ['确认需求目标', '添加背景资料', 'PRD 助手生成草稿', '评审助手检查问题', '生成 PRD 最终草稿'] },
  { name: '竞品分析流程', applicableTaskTypes: ['competitive_analysis'], steps: ['确认竞品和维度', '添加竞品资料', '竞品分析助手生成对比', '评审助手检查结论', '生成跟进建议'] },
  { name: '运营活动流程', applicableTaskTypes: ['ops_plan'], steps: ['确认运营目标', '添加历史数据和限制', '运营方案助手生成方案', '评审助手检查风险', '生成执行清单'] },
  { name: '会议纪要流程', applicableTaskTypes: ['meeting_summary'], steps: ['添加会议记录', '会议纪要助手生成纪要', '用户确认行动项', '生成最终纪要'] },
  { name: '评审流程', applicableTaskTypes: ['review'], steps: ['添加待评审内容', '确认评审重点', '评审助手生成问题清单', '生成最终评审结论'] }
];
