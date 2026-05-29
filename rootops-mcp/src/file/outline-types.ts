export interface FileOutlineItem {
  kind: 'class' | 'interface' | 'type' | 'function' | 'method' | 'const' | 'import' | 'export' | 'todo' | 'module' | 'struct' | 'enum' | 'trait' | 'impl';
  name: string;
  line: number;
  text: string;
}

export interface FileOutline {
  path: string;
  language: string;
  backend: 'regex' | 'tree_sitter';
  items: FileOutlineItem[];
  truncated: boolean;
  diagnostics?: string[];
}

export type OutlineBackend = 'auto' | 'regex' | 'tree_sitter';
