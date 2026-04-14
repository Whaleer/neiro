# GuitarBoard — AGENTS.md

吉他指板音名记忆训练工具。单页 React 应用，纯前端无后端。

## 命令

```bash
npm run dev          # Vite 开发服务器 (HMR)
npm run build        # tsc -b && vite build（类型检查 + 构建）
npm run lint         # eslint .
npm run test         # vitest run（单次）
npm run test:watch   # vitest --watch
```

验证顺序：`lint → build → test`

## 架构

- **单一状态组件**：`App.tsx` 持有全部游戏状态，无路由、无全局状态库
- **纯函数层**：`src/lib/` 下为无副作用的业务逻辑（music、audio、i18n）
- **UI 组件**：`src/components/` 为展示型组件，通过 props 接收数据和回调
- **类型**：`src/types.ts` 集中定义所有共享类型
- **样式**：纯 CSS（`index.css` 变量 + `App.css` 布局），无 CSS 框架

## 关键约定

- 音名使用降号表示：`bD, bE, bG, bA, bB`（不是 C#, D# 等）
- 标准定弦 `STANDARD_TUNING`：`['E', 'B', 'G', 'D', 'A', 'E']`（索引 0 = 第 1 弦）
- 练习范围：6 弦 × 1-12 品 = 72 个位置（不含 0 品空弦）
- 两种练习模式：`identify-note-name`（认音名）、`find-all-note-positions`（找位置）
- 国际化：自研轻量方案 `src/lib/i18n.ts`，中文为默认语言，非第三方库
- 音频文件路径：`/sounds/notes/string-{1-6}-fret-{1-12}.mp3`

## 测试

- 测试框架：Vitest + jsdom + @testing-library/react + @testing-library/user-event
- Setup：`src/test/setup.ts` 用 `MockAudio` 替换全局 `Audio`，`afterEach` 清理状态
- 测试文件与源文件同目录：`music.test.ts`、`audio.test.ts`、`App.test.tsx`
- 集成测试中常用 `vi.spyOn` mock `createPracticeQuestions` / `createCircleOfFifthsRounds` 来缩短流程

## TypeScript 配置

- 项目引用模式：`tsconfig.json` → `tsconfig.app.json`（src）+ `tsconfig.node.json`（vite 配置）
- 开启 `noUnusedLocals`、`noUnusedParameters`、`erasableSyntaxOnly`、`verbatimModuleSyntax`

## 开发调试

- 设置环境变量 `VITE_DEBUG_COMPLETE=true` 可跳过练习直接进入完成状态
- 音效开关持久化在 `localStorage`，key 为 `guitarboard:sound-enabled`
