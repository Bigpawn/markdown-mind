# Markdown Mind

一个将Markdown文档转换为思维导图的React组件库，支持多种格式导出。

## 功能特点

- 🔄 将Markdown转换为可视化思维导图
- 🎨 支持亮色和暗色主题
- 📤 支持导出为Markdown、HTML和PNG格式
- 📱 响应式设计，适应不同屏幕尺寸
- 🧩 易于集成到现有React项目中
- ⚡ 使用最新的Tailwind CSS 4.x进行样式设计

## 技术栈

- React 18
- TypeScript
- Tailwind CSS 4.x (使用@tailwindcss/vite插件)
- D3.js
- Vite

## 安装

```bash
npm install markdown-mind
# 或
yarn add markdown-mind
# 或
pnpm add markdown-mind
```

## 快速开始

```jsx
import React from 'react';
import { MarkdownMind } from 'markdown-mind';

// 导入样式（如果使用CSS模块请按需调整）
import 'markdown-mind/dist/style.css';

const App = () => {
  const markdown = `# 我的思维导图
  
## 第一章
### 小节1
### 小节2
#### 更深层级

## 第二章
### 小节A
### 小节B`;

  return (
    <div>
      <h1>Markdown思维导图示例</h1>
      <MarkdownMind 
        markdown={markdown} 
        width={800} 
        height={600}
        theme="light"
      />
    </div>
  );
};

export default App;
```

## 在已有项目中集成Tailwind CSS 4.x

Tailwind CSS 4.x不再需要单独的配置文件，所有配置都在vite.config.ts中完成。

1. 安装所需依赖
```bash
npm install tailwindcss @tailwindcss/vite
```

2. 在vite.config.ts中添加并配置插件
```js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss({
      // Tailwind CSS配置选项直接写在这里
      content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
      theme: {
        extend: {},
      },
      darkMode: 'class',
      future: {
        hoverOnlyWhenSupported: true,
      }
    }),
    // 其他插件...
  ],
})
```

3. 在CSS文件中导入Tailwind
```css
@import "tailwindcss";

/* 你的自定义样式可以在这里添加 */
@layer components {
  .custom-button {
    @apply px-4 py-2 bg-blue-500 text-white rounded-md;
  }
}
```

## API参考

### MarkdownMind组件

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `markdown` | string | - | 要转换的Markdown内容（必需） |
| `width` | number | 800 | 思维导图容器宽度 |
| `height` | number | 600 | 思维导图容器高度 |
| `theme` | 'light' \| 'dark' | 'light' | 主题选择 |
| `className` | string | - | 添加自定义CSS类 |
| `onReady` | () => void | - | 思维导图渲染完成时的回调函数 |

### 导出API

```jsx
// 导入导出工具
import { MindMapExporter } from 'markdown-mind';

// 创建导出实例
const exporter = new MindMapExporter();

// 导出为Markdown
const markdownText = await exporter.exportMarkdown(mindMapData);

// 导出为HTML
const htmlContent = await exporter.exportHtml(mindMapData);

// 导出为PNG
const pngDataUrl = await exporter.exportPng(domElement);
```

## 开发

查看 [DEVELOPMENT.md](./DEVELOPMENT.md) 获取开发指南。

对于Tailwind CSS 4.x的配置和使用，请参考 [TAILWIND_SETUP.md](./TAILWIND_SETUP.md)。

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 运行测试
pnpm test
```

## 许可证

MIT