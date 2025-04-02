# 开发指南

## 项目结构

```
markdown-mind/
├── src/                      # 源代码
│   ├── components/           # React组件
│   │   ├── MarkdownMind.tsx  # 主组件
│   │   └── MindMapRenderer.tsx  # 思维导图渲染组件
│   ├── hooks/                # React钩子
│   │   └── useResizeObserver.ts  # 响应式尺寸监听钩子
│   ├── utils/                # 工具函数
│   │   ├── markdownParser.ts # Markdown解析工具
│   │   └── exporter.ts       # 导出工具
│   ├── types/                # 类型定义
│   │   └── index.ts          # 类型声明文件
│   ├── styles/               # 样式文件
│   │   └── markdownMind.css  # 主样式文件
│   └── index.ts              # 入口文件
├── example/                  # 示例代码
│   ├── index.html            # 示例HTML
│   └── main.tsx              # 示例入口
├── dist/                     # 构建输出（不提交到git）
├── node_modules/             # 依赖包（不提交到git）
├── package.json              # 包信息
├── tsconfig.json             # TypeScript配置
├── vite.config.ts            # Vite配置
├── README.md                 # 文档
└── DEVELOPMENT.md            # 开发指南
```

## 开发流程

1. **安装依赖**
   ```bash
   pnpm install
   ```

2. **启动开发服务器**
   ```bash
   pnpm dev
   ```
   这将启动一个开发服务器，访问示例页面进行开发和测试。

3. **构建库**
   ```bash
   pnpm build
   ```
   构建将输出到`dist`目录，包含以下文件：
   - `index.es.js` - ES Module格式
   - `index.umd.js` - UMD格式
   - `index.d.ts` - TypeScript类型声明
   - `style.css` - 样式文件

## 核心功能开发指南

### 1. Markdown解析

`markdownParser.ts`负责将Markdown文本解析为思维导图数据结构。主要功能：
- 解析Markdown标题层级
- 构建层级节点结构
- 处理特殊Markdown语法

### 2. 思维导图渲染

`MindMapRenderer.tsx`使用D3.js库将数据结构渲染为可视化思维导图。关键功能：
- 创建树形布局
- 绘制节点和连接线
- 响应式调整布局

### 3. 导出功能

`exporter.ts`提供多种格式的导出功能：
- **Markdown导出**：从思维导图数据重建Markdown文本
- **HTML导出**：生成包含思维导图的HTML文档
- **PNG导出**：使用DOM-to-Image技术将思维导图渲染为图片

## 贡献指南

1. Fork项目并克隆到本地
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 发布流程

1. 更新版本号（package.json中的version字段）
2. 更新CHANGELOG.md
3. 构建项目 (`pnpm build`)
4. 发布到npm (`npm publish`) 