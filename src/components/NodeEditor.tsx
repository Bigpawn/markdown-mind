import React, { useState, useEffect, useRef } from 'react';
import { MindMapNode } from '../types';

interface NodeEditorProps {
  node: MindMapNode;
  onSave: (nodeId: string, newText: string) => void;
  onCancel: () => void;
  theme: 'light' | 'dark';
}

const NodeEditor: React.FC<NodeEditorProps> = ({ node, onSave, onCancel, theme }) => {
  const [text, setText] = useState(node.text);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // 自动聚焦输入框
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      editorRef.current.select();
    }
  }, []);

  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escape键取消编辑
    if (e.key === 'Escape') {
      onCancel();
    }
    // Ctrl+Enter或Command+Enter保存
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSave();
    }
  };

  const handleSave = () => {
    if (text.trim()) {
      onSave(node.id, text);
    } else {
      onCancel();
    }
  };

  return (
    <div className={`node-editor-overlay ${theme}`}>
      <div className="node-editor-container">
        <h3 className="node-editor-title">编辑节点</h3>
        <textarea
          ref={editorRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="node-editor-textarea"
          placeholder="输入节点内容..."
        />
        <div className="node-editor-buttons">
          <button onClick={onCancel} className="node-editor-button cancel-button">
            取消
          </button>
          <button onClick={handleSave} className="node-editor-button save-button">
            保存
          </button>
        </div>
        <div className="node-editor-help">
          提示: 按 <kbd>Ctrl+Enter</kbd> 保存, <kbd>Esc</kbd> 取消
        </div>
      </div>
    </div>
  );
};

export default NodeEditor; 