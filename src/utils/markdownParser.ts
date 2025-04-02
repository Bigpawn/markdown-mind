import { marked } from 'marked';
import { MindMapNode } from '../types';

// 定义Heading类型，与marked.js兼容
interface HeadingToken {
  type: 'heading';
  depth: number;
  text: string;
}

export class MarkdownParser {
  private generateId(): string {
    return Math.random().toString(36).substring(2, 10);
  }
  
  public parse(markdown: string): MindMapNode {
    const tokens = marked.lexer(markdown);
    
    // 查找第一个标题作为根节点
    const firstHeading = tokens.find(token => token.type === 'heading') as HeadingToken | undefined;
    
    // 如果没有找到标题，则创建一个空的根节点
    if (!firstHeading) {
      return {
        id: this.generateId(),
        text: '空文档',
        level: 0,
        children: []
      };
    }

    // 使用第一个标题作为根节点
    const rootNode: MindMapNode = {
      id: this.generateId(),
      text: firstHeading.text,
      level: 0,
      children: []
    };
    
    let currentNode = rootNode;
    let nodeStack: MindMapNode[] = [rootNode];
    let lastLevel = firstHeading.depth;
    let isFirstHeading = true;
    
    for (const token of tokens) {
      if (token.type === 'heading') {
        // 跳过第一个标题，因为已经用作根节点
        if (isFirstHeading) {
          isFirstHeading = false;
          continue;
        }
        
        const headingToken = token as HeadingToken;
        const level = headingToken.depth;
        const text = headingToken.text;
        
        const newNode: MindMapNode = {
          id: this.generateId(),
          text,
          level,
          children: []
        };
        
        // 找到合适的父节点
        if (level > lastLevel) {
          // 层级加深，将上一个节点作为父节点
          currentNode.children = currentNode.children || [];
          currentNode.children.push(newNode);
          nodeStack.push(currentNode);
        } else if (level === lastLevel) {
          // 同级，添加到相同父节点下
          const parentNode = nodeStack[nodeStack.length - 1];
          parentNode.children = parentNode.children || [];
          parentNode.children.push(newNode);
        } else {
          // 层级减少，需要回溯找到合适的父节点
          while (nodeStack.length > 1 && nodeStack[nodeStack.length - 1].level >= level) {
            nodeStack.pop();
          }
          const parentNode = nodeStack[nodeStack.length - 1];
          parentNode.children = parentNode.children || [];
          parentNode.children.push(newNode);
        }
        
        currentNode = newNode;
        lastLevel = level;
      }
    }
    
    return rootNode;
  }

  // 根据节点ID找到对应的Markdown标题行的索引和层级
  private findNodePositionInMarkdown(markdown: string, nodeId: string): { index: number, level: number } | null {
    const lines = markdown.split('\n');
    const tree = this.parse(markdown);
    
    // 递归寻找节点
    const findNodePosition = (node: MindMapNode, lineIndex: number = 0): { lineIndex: number, node: MindMapNode } | null => {
      if (node.id === nodeId) {
        return { lineIndex, node };
      }
      
      if (node.children) {
        for (const child of node.children) {
          // 递归在每个子节点中寻找
          // 首先定位到子节点的标题行
          for (let i = lineIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('#') && line.substring(line.lastIndexOf('#') + 1).trim() === child.text) {
              const result = findNodePosition(child, i);
              if (result) {
                return result;
              }
              break; // 已经处理过这个子节点，继续下一个
            }
          }
        }
      }
      
      return null;
    };
    
    // 从根节点开始搜索（忽略索引0）
    if (tree.children) {
      for (const child of tree.children) {
        // 首先定位到子节点的标题行
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith('#') && line.substring(line.lastIndexOf('#') + 1).trim() === child.text) {
            const result = findNodePosition(child, i);
            if (result) {
              // 计算节点的Markdown层级（#的数量）
              const level = lines[result.lineIndex].trim().split(' ')[0].length;
              return { index: result.lineIndex, level };
            }
            break; // 已经处理过这个子节点，继续下一个
          }
        }
      }
    }
    
    return null;
  }

  // 添加节点
  public addNode(markdown: string, parentId: string, newText: string): string {
    const position = this.findNodePositionInMarkdown(markdown, parentId);
    if (!position) return markdown;
    
    const lines = markdown.split('\n');
    const parentLevel = position.level;
    const childLevel = parentLevel + 1;
    const childPrefix = '#'.repeat(childLevel) + ' ';
    
    // 寻找合适的插入位置（在父节点的子节点之后）
    let insertPosition = position.index + 1;
    while (insertPosition < lines.length) {
      const line = lines[insertPosition].trim();
      if (line.startsWith('#')) {
        const currentLevel = line.split(' ')[0].length;
        if (currentLevel <= parentLevel) {
          break; // 如果遇到同级或更高级别的标题，则在此处插入
        }
      }
      insertPosition++;
    }
    
    // 插入新节点
    lines.splice(insertPosition, 0, childPrefix + newText);
    
    return lines.join('\n');
  }

  // 更新节点
  public updateNode(markdown: string, nodeId: string, newText: string): string {
    const position = this.findNodePositionInMarkdown(markdown, nodeId);
    if (!position) return markdown;
    
    const lines = markdown.split('\n');
    const line = lines[position.index];
    const prefix = line.substring(0, line.indexOf(' ') + 1);
    
    // 更新节点文本
    lines[position.index] = prefix + newText;
    
    return lines.join('\n');
  }

  // 删除节点及其所有子节点
  public deleteNode(markdown: string, nodeId: string): string {
    const position = this.findNodePositionInMarkdown(markdown, nodeId);
    if (!position) return markdown;
    
    const lines = markdown.split('\n');
    const nodeLevel = position.level;
    
    // 需要删除的行范围
    let endDeleteIndex = position.index + 1;
    while (endDeleteIndex < lines.length) {
      const line = lines[endDeleteIndex].trim();
      if (line.startsWith('#')) {
        const currentLevel = line.split(' ')[0].length;
        if (currentLevel <= nodeLevel) {
          break; // 如果遇到同级或更高级别的标题，则停止删除
        }
      }
      endDeleteIndex++;
    }
    
    // 删除节点及其子节点
    lines.splice(position.index, endDeleteIndex - position.index);
    
    return lines.join('\n');
  }
} 