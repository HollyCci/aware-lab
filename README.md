# aware-lab

一个自用的实验项目。

目前主要包含一份移动端 H5 原型，用来验证产品界面、交互流程和本地数据逻辑。项目没有接真实后端，数据保存在浏览器本地，适合快速预览和迭代。

## 运行

```bash
cd h5/aware-h5
pnpm install
pnpm dev
```

默认访问：

```text
http://localhost:5173
```

构建：

```bash
pnpm build
pnpm preview
```

## 目录

```text
h5/aware-h5/      H5 项目
ios/              iOS 相关的本地实验代码
```

## 技术栈

- **React 19**：页面和组件开发
- **TypeScript**：类型约束和业务模型定义
- **Vite**：本地开发、构建和预览
- **Tailwind CSS v4**：样式系统、主题变量和响应式布局
- **React Router**：页面路由
- **Zustand**：轻量状态管理
- **IndexedDB**：浏览器本地持久化
- **Framer Motion**：页面和组件微动效
- **Lucide React**：基础图标
- **pnpm**：包管理

主要实现方向：

- 移动端 H5 布局
- 浅色 / 深色主题
- 本地数据读写
- 表单与列表交互
- 订阅页、设置页、详情页等常见产品页面

## 说明

仓库只用于个人开发和测试。

部分本地构建产物、大体积文件和临时文件不会提交到仓库，具体规则见 `.gitignore`。
