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

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- IndexedDB

## 说明

仓库只用于个人开发和测试。

部分本地构建产物、大体积文件和临时文件不会提交到仓库，具体规则见 `.gitignore`。
