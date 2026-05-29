import type { FileOutline, FileOutlineItem } from './outline-types.js';
import { buildRegexFileOutline, inferLanguage, normalizeName } from './outline.js';

type ParserLike = {
  setLanguage(language: unknown): void;
  parse(text: string): { rootNode: TreeNodeLike };
};

type TreeNodeLike = {
  type: string;
  text: string;
  startPosition: { row: number; column: number };
  namedChildCount: number;
  namedChild(index: number): TreeNodeLike | null;
  childForFieldName?(fieldName: string): TreeNodeLike | null;
};

const NODE_KIND_MAP: Record<string, FileOutlineItem['kind']> = {
  class_declaration: 'class',
  abstract_class_declaration: 'class',
  interface_declaration: 'interface',
  type_alias_declaration: 'type',
  function_declaration: 'function',
  method_definition: 'method',
  public_method_definition: 'method',
  lexical_declaration: 'const',
  variable_declaration: 'const',
  import_statement: 'import',
  export_statement: 'export',
  function_definition: 'function',
  class_definition: 'class',
  decorated_definition: 'function',
  func_literal: 'function',
  method_declaration: 'method',
  type_declaration: 'type',
  struct_item: 'struct',
  enum_item: 'enum',
  trait_item: 'trait',
  impl_item: 'impl',
  function_item: 'function'
};

export async function buildTreeSitterOutline(filePath: string, text: string, maxItems = 300): Promise<FileOutline> {
  const diagnostics: string[] = [];
  try {
    const parserModule = await import('tree-sitter');
    const ParserCtor = (parserModule as unknown as { default?: new () => ParserLike })?.default ?? (parserModule as unknown as new () => ParserLike);
    const language = await loadLanguage(filePath);
    const parser = new ParserCtor();
    parser.setLanguage(language);
    const tree = parser.parse(text);
    const items: FileOutlineItem[] = [];
    walk(tree.rootNode, items, maxItems);
    return { path: filePath, language: inferLanguage(filePath), backend: 'tree_sitter', items, truncated: items.length >= maxItems, diagnostics };
  } catch (error) {
    diagnostics.push(`tree-sitter unavailable: ${error instanceof Error ? error.message : String(error)}`);
    return buildRegexFileOutline(filePath, text, maxItems, diagnostics);
  }
}

async function loadLanguage(filePath: string): Promise<unknown> {
  const language = inferLanguage(filePath);
  if (language.startsWith('typescript')) {
    const mod = await import('tree-sitter-typescript');
    return language === 'typescript-react' ? (mod as any).tsx : (mod as any).typescript;
  }
  if (language.startsWith('javascript')) {
    const mod = await import('tree-sitter-javascript');
    return (mod as any).default ?? mod;
  }
  if (language === 'python') {
    const mod = await import('tree-sitter-python');
    return (mod as any).default ?? mod;
  }
  if (language === 'go') {
    const mod = await import('tree-sitter-go');
    return (mod as any).default ?? mod;
  }
  if (language === 'rust') {
    const mod = await import('tree-sitter-rust');
    return (mod as any).default ?? mod;
  }
  throw new Error(`unsupported tree-sitter language: ${language}`);
}

function walk(node: TreeNodeLike, items: FileOutlineItem[], maxItems: number): void {
  if (items.length >= maxItems) return;
  const kind = NODE_KIND_MAP[node.type];
  if (kind) {
    items.push({ kind, name: extractName(node), line: node.startPosition.row + 1, text: firstLine(node.text) });
  }
  for (let i = 0; i < node.namedChildCount && items.length < maxItems; i += 1) {
    const child = node.namedChild(i);
    if (child) walk(child, items, maxItems);
  }
}

function extractName(node: TreeNodeLike): string {
  const fieldName = node.childForFieldName?.('name');
  if (fieldName?.text) return normalizeName(fieldName.text);
  const firstIdentifier = findFirstIdentifier(node);
  return normalizeName(firstIdentifier ?? firstLine(node.text));
}

function findFirstIdentifier(node: TreeNodeLike): string | undefined {
  if (node.type === 'identifier' || node.type === 'property_identifier' || node.type === 'type_identifier') return node.text;
  for (let i = 0; i < node.namedChildCount; i += 1) {
    const child = node.namedChild(i);
    if (!child) continue;
    const found = findFirstIdentifier(child);
    if (found) return found;
  }
  return undefined;
}

function firstLine(value: string): string {
  return value.split(/\r?\n/)[0].trim().slice(0, 300);
}
