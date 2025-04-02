import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { MarkdownParser } from "../utils/markdownParser";
import { MindMapExporter } from "../utils/exporter";
import MindMapRenderer from "./MindMapRenderer";
import { MindMapNode } from "../types";

import "../styles/markdownMind.css";

export interface MarkdownMindProps {
  markdown: string;
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  className?: string;
  onReady?: () => void;
  onChange?: (markdown: string) => void;
}

const MarkdownMind: React.FC<MarkdownMindProps> = ({
  markdown,
  width = 800,
  height = 600,
  theme = "light",
  className = "",
  onReady,
  onChange,
}) => {
  const [mindMap, setMindMap] = useState<MindMapNode | null>(null);
  const [markdownContent, setMarkdownContent] = useState(markdown);
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState("");
  const [nodeEditPosition, setNodeEditPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // 当源markdown改变时更新内部状态
  useEffect(() => {
    setMarkdownContent(markdown);
  }, [markdown]);

  // 解析markdown为思维导图数据
  useEffect(() => {
    try {
      const parser = new MarkdownParser();
      const parsedData = parser.parse(markdownContent);
      setMindMap(parsedData);
      setError(null);
      if (onReady) onReady();
    } catch (err) {
      setError(
        `解析Markdown时出错: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }, [markdownContent, onReady]);

  // 处理导出
  const handleExport = async (format: "markdown" | "html" | "png") => {
    if (!mindMap || !containerRef.current) return;

    const exporter = new MindMapExporter();

    try {
      switch (format) {
        case "markdown":
          return await exporter.exportMarkdown(mindMap);
        case "html":
          return await exporter.exportHtml(mindMap);
        case "png":
          return await exporter.exportPng(containerRef.current);
        default:
          throw new Error(`不支持的导出格式: ${format}`);
      }
    } catch (err) {
      setError(
        `导出思维导图时出错: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      return null;
    }
  };

  // 处理节点选择
  const handleNodeSelect = useCallback((node: MindMapNode) => {
    setSelectedNode(node);
  }, []);

  // 处理节点添加
  const handleAddNode = useCallback(
    (parentId: string, text: string) => {
      const parser = new MarkdownParser();
      const updatedMarkdown = parser.addNode(markdownContent, parentId, text);
      setMarkdownContent(updatedMarkdown);
      if (onChange) onChange(updatedMarkdown);
    },
    [markdownContent, onChange]
  );

  // 处理节点编辑
  const handleEditNode = useCallback(
    (nodeId: string, newText: string) => {
      const parser = new MarkdownParser();
      const updatedMarkdown = parser.updateNode(
        markdownContent,
        nodeId,
        newText
      );
      setMarkdownContent(updatedMarkdown);
      if (onChange) onChange(updatedMarkdown);
      setIsEditing(false);
    },
    [markdownContent, onChange]
  );

  // 处理节点删除
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      if (!selectedNode || nodeId === mindMap?.id) return; // 不允许删除根节点

      const parser = new MarkdownParser();
      const updatedMarkdown = parser.deleteNode(markdownContent, nodeId);
      setMarkdownContent(updatedMarkdown);
      if (onChange) onChange(updatedMarkdown);
      setSelectedNode(null);
    },
    [markdownContent, onChange, selectedNode, mindMap]
  );

  // 添加快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果正在编辑，则不处理全局快捷键
      if (isEditing) {
        // 编辑状态下的快捷键
        if (e.key === "Escape") {
          e.preventDefault();
          setIsEditing(false);
          return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          if (selectedNode && editingText.trim()) {
            handleEditNode(selectedNode.id, editingText);
          } else {
            setIsEditing(false);
          }
          return;
        }

        return;
      }

      // 仅在选中节点时处理快捷键
      if (selectedNode) {
        // Tab 键添加子节点
        if (e.key === "Tab") {
          e.preventDefault();
          handleAddNode(selectedNode.id, "新节点");
          return;
        }

        // Enter 键进入编辑模式
        if (e.key === "Enter") {
          e.preventDefault();
          startEditing(selectedNode);
          return;
        }

        // Delete 键删除节点
        if (e.key === "Delete" || e.key === "Backspace") {
          if (selectedNode.id !== mindMap?.id) {
            // 防止删除根节点
            e.preventDefault();
            handleDeleteNode(selectedNode.id);
            return;
          }
        }

        // Insert 键添加同级节点（同父节点下的兄弟节点）
        if (e.key === "Insert") {
          e.preventDefault();
          if (selectedNode.id !== mindMap?.id && selectedNode.level > 0) {
            // 寻找父节点
            const findParent = (
              node: MindMapNode,
              childId: string
            ): MindMapNode | null => {
              if (!node.children) return null;
              for (const child of node.children) {
                if (child.id === childId) return node;
                const result = findParent(child, childId);
                if (result) return result;
              }
              return null;
            };

            const parentNode = findParent(mindMap!, selectedNode.id);
            if (parentNode) {
              handleAddNode(parentNode.id, "新节点");
            }
          }
          return;
        }
      }

      // ? 键显示/隐藏帮助
      if (e.key === "?") {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectedNode,
    isEditing,
    handleAddNode,
    handleDeleteNode,
    mindMap,
    editingText,
  ]);

  // 自动聚焦编辑框
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  // 开始编辑节点
  const startEditing = useCallback(
    (
      node: MindMapNode,
      position?: { x: number; y: number; width: number; domElement: Element }
    ) => {
      setSelectedNode(node);
      setEditingText(node.text || "");
      if (position) {
        setNodeEditPosition({
          x: position.x,
          y: position.y,
          width: position.width,
        });
      }
      setIsEditing(true);
    },
    []
  );

  // 双击节点进入编辑模式
  const handleNodeDoubleClick = useCallback(
    (
      node: MindMapNode,
      position: { x: number; y: number; width: number; domElement: Element }
    ) => {
      startEditing(node, position);
    },
    [startEditing]
  );

  // 取消编辑
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  // 保存编辑内容
  const handleSaveEdit = useCallback(() => {
    if (selectedNode && editingText.trim()) {
      handleEditNode(selectedNode.id, editingText);
    } else {
      setIsEditing(false);
    }
  }, [selectedNode, editingText, handleEditNode]);

  return (
    <div
      ref={containerRef}
      className={`markdown-mind ${theme} ${className}`}
      style={{ width, height, position: "relative" }}
    >
      {error ? (
        <div className="markdown-mind-error">{error}</div>
      ) : mindMap ? (
        <>
          <MindMapRenderer
            data={mindMap}
            width={width}
            height={height}
            theme={theme}
            onNodeSelect={handleNodeSelect}
            onNodeDoubleClick={handleNodeDoubleClick}
          />

          {isEditing &&
            selectedNode &&
            createPortal(
              <div
                className="inline-editor-wrapper"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 999,
                  pointerEvents: "none"
                }}
              >
                <div
                  className="inline-editor-container animate-editor-in"
                  style={{
                    position: "fixed",
                    top: nodeEditPosition.y - 19,
                    left: nodeEditPosition.x - nodeEditPosition.width / 2,
                    width: nodeEditPosition.width,
                    zIndex: 1000,
                    pointerEvents: "auto"
                  }}
                >
                  <textarea
                    ref={editInputRef}
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className={`inline-editor-textarea ${theme}`}
                    placeholder="输入节点内容..."
                    title="节点内容"
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault();
                        handleCancelEdit();
                      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                        e.preventDefault();
                        handleSaveEdit();
                      }
                    }}
                    onBlur={() => {
                      // 确保失焦时保存内容
                      if (selectedNode && editingText.trim()) {
                        handleEditNode(selectedNode.id, editingText);
                      } else {
                        setIsEditing(false);
                      }
                    }}
                    rows={Math.min(2, Math.max(1, editingText.split('\n').length))}
                    style={{ 
                      height: "auto",
                      maxHeight: "120px"
                    }}
                    autoFocus
                  />
                </div>
              </div>,
              document.body
            )}

          {showHelp && (
            <div className={`keyboard-shortcuts-help ${theme}`}>
              <h3>键盘快捷键</h3>
              <ul>
                <li>
                  <kbd>Tab</kbd> - 添加子节点
                </li>
                <li>
                  <kbd>Enter</kbd> - 编辑节点
                </li>
                <li>
                  <kbd>Delete</kbd> - 删除节点
                </li>
                <li>
                  <kbd>Insert</kbd> - 添加同级节点
                </li>
                <li>
                  <kbd>?</kbd> - 显示/隐藏帮助
                </li>
              </ul>
              <p>提示: 双击节点也可以进入编辑模式</p>
              <button onClick={() => setShowHelp(false)}>关闭</button>
            </div>
          )}
        </>
      ) : (
        <div className="markdown-mind-loading">加载中...</div>
      )}

      <div
        className="keyboard-help-button"
        onClick={() => setShowHelp((prev) => !prev)}
      >
        ?
      </div>
    </div>
  );
};

export default MarkdownMind;
