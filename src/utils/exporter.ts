import { toPng } from 'html-to-image';
import { MindMapNode } from '../types';

export class MindMapExporter {
  // 导出为Markdown
  public async exportMarkdown(data: MindMapNode): Promise<string> {
    return this.nodeToMarkdown(data, 0);
  }

  private nodeToMarkdown(node: MindMapNode, level: number): string {
    if (!node) return '';

    let markdown = '';
    
    // 根节点不输出
    if (level > 0) {
      const prefix = '#'.repeat(level);
      markdown += `${prefix} ${node.text}\n\n`;
    }
    
    // 处理子节点
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        markdown += this.nodeToMarkdown(child, level + 1);
      }
    }
    
    return markdown;
  }

  // 导出为HTML
  public async exportHtml(data: MindMapNode): Promise<string> {
    const markdown = await this.exportMarkdown(data);
    
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>思维导图</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    h1 { font-size: 2em; color: #2563eb; }
    h2 { font-size: 1.8em; color: #3b82f6; }
    h3 { font-size: 1.6em; color: #60a5fa; }
    h4 { font-size: 1.4em; color: #93c5fd; }
    h5 { font-size: 1.2em; color: #bfdbfe; }
    h6 { font-size: 1em; color: #dbeafe; }
  </style>
</head>
<body>
  <div class="content">
    ${this.markdownToHtml(markdown)}
  </div>
</body>
</html>`;
    
    return html;
  }

  private markdownToHtml(markdown: string): string {
    // 简单的Markdown转HTML实现
    let html = markdown;
    
    // 转换标题
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
    
    // 将换行符转换为<br>
    html = html.replace(/\n/g, '<br>');
    
    return html;
  }

  // 导出为PNG
  public async exportPng(element: HTMLElement): Promise<string> {
    try {
      const dataUrl = await toPng(element, { quality: 0.95 });
      return dataUrl;
    } catch (error) {
      console.error('导出PNG时出错', error);
      throw new Error('导出PNG失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
} 