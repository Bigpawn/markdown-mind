# Tailwind CSS 4.x 安装与配置指南

本项目使用 Tailwind CSS 4.x 版本进行样式开发。以下是基于官方文档的安装和配置步骤。

## 安装依赖

```bash
# 安装tailwindcss和vite插件
npm install tailwindcss @tailwindcss/vite

# 使用yarn
yarn add tailwindcss @tailwindcss/vite

# 使用pnpm
pnpm add tailwindcss @tailwindcss/vite
```

## 配置Vite插件

在vite.config.ts中添加和配置Tailwind CSS插件：

```js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss({
      // Tailwind CSS配置选项直接写在这里，不再需要tailwind.config.js
      content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
      theme: {
        extend: {},
      },
      darkMode: 'class',
      future: {
        hoverOnlyWhenSupported: true,
      }
    }),
  ],
})
```

## CSS文件设置

在你的主CSS文件中使用新的导入语法：

```css
@import "tailwindcss";

@layer components {
  /* 在这里添加你的组件样式 */
  .my-component {
    @apply bg-blue-500 text-white p-4 rounded;
  }
}
```

## 启动开发服务器

```bash
npm run dev
```

## Tailwind CSS 4.x 的主要变更

1. **新的引入方式**：使用`@import "tailwindcss";`代替旧版的三个`@tailwind`指令
2. **Vite插件**：现在使用`@tailwindcss/vite`插件来简化集成
3. **无需配置文件**：不再需要单独的tailwind.config.js文件，配置直接在Vite插件中指定
4. **性能优化**：构建速度显著提升，开发体验更加流畅
5. **新的暗黑模式**：使用`darkMode: 'class'`可以更精细地控制暗色主题
6. **层系统改进**：通过`@layer`更好地组织和优先级控制
7. **更丰富的设计组件**：提供了更多开箱即用的设计组件

## 迁移指南

如果从Tailwind CSS 3.x迁移到4.x，需要进行以下更改：

1. 安装`@tailwindcss/vite`插件
2. 移除旧的`tailwind.config.js`和`postcss.config.js`文件
3. 在vite.config.ts中添加tailwindcss插件并直接指定配置项
4. 修改CSS导入语法，使用`@import "tailwindcss";`
5. 将组件样式放在`@layer components`中，以获得更好的优先级控制
6. 利用新的暗黑模式和future配置项优化用户体验

## 官方参考资源

- [Tailwind CSS官方文档](https://tailwindcss.com/docs)
- [使用Vite安装Tailwind CSS](https://tailwindcss.com/docs/installation/using-vite)
- [Tailwind CSS GitHub](https://github.com/tailwindlabs/tailwindcss) 