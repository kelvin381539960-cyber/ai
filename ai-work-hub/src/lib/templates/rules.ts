export const defaultRules = [
  {
    id: "rule_prd",
    type: "output",
    name: "PRD 输出规则",
    content:
      "PRD 必须包含：背景、目标用户、问题定义、目标与非目标、用户场景、功能范围、验收标准、风险与下一步。避免空泛描述。",
  },
  {
    id: "rule_research",
    type: "output",
    name: "调研输出规则",
    content:
      "调研必须给出结论、证据、判断依据、未知项、风险和下一步建议。没有证据的内容要标记为假设。",
  },
  {
    id: "rule_competitive",
    type: "output",
    name: "竞品分析规则",
    content:
      "竞品分析必须包含定位、目标用户、核心流程、差异点、可借鉴点、不可照搬点和机会判断。",
  },
  {
    id: "rule_proposal",
    type: "output",
    name: "方案撰写规则",
    content:
      "方案必须说明目标、现状、推荐方案、备选方案、取舍理由、实施步骤、风险和验收方式。",
  },
  {
    id: "rule_retro",
    type: "quality",
    name: "复盘规则",
    content:
      "复盘必须区分事实、判断和行动项。行动项需要负责人、目标、截止时间和可验证结果。",
  },
];
