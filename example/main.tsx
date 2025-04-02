import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import MarkdownMind from '../src/components/MarkdownMind';
import '../src/styles/markdownMind.css';

const App = () => {
  const [markdown, setMarkdown] = useState(`# Markdown思维导图示例

## 项目介绍
### 核心功能
#### Markdown解析
#### 思维导图渲染
#### 多格式导出

## 技术栈
### React
### TypeScript
### Tailwind CSS
### D3.js

## 使用方法
### 安装
### 基本使用
### 高级配置`);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Markdown Mind Demo</h1>
      
      <div className="mb-4 flex justify-between">
        <div>
          <label htmlFor="theme-select" className="block text-sm font-medium text-gray-700 mb-1">
            切换主题
          </label>
          <select 
            id="theme-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
            className="border border-gray-300 rounded px-3 py-1"
            aria-label="选择主题"
          >
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="markdown-input" className="block text-sm font-medium text-gray-700 mb-1">
            Markdown内容
          </label>
          <textarea
            id="markdown-input"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="w-full h-96 border border-gray-300 rounded p-2 font-mono"
            aria-label="Markdown编辑器"
            placeholder="输入Markdown内容"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            思维导图预览
          </label>
          <div className="border border-gray-300 rounded">
            <MarkdownMind 
              markdown={markdown} 
              width={600} 
              height={600}
              theme={theme}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 