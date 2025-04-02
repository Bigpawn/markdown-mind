export interface MindMapNode {
  id: string;
  text: string;
  level: number;
  children?: MindMapNode[];
}

export type ExportFormat = 'markdown' | 'html' | 'png'; 