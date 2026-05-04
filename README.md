# aware-lab

> 「有数 / Aware」iOS App 的个人实验室：包含**自家 App** 的逆向分析笔记、运行时补丁源码，以及一份 **H5 复刻**（React + TypeScript + Tailwind v4）。

## 重要声明

本仓库的所有内容都**只针对作者本人开发的 iOS App 「有数 / Aware」**：

- App 完全是作者自己开发并发布
- 所有逆向分析、补丁、资产解析都是在自己的代码上做的（属于对自己产品的内部测试与跨端复刻）
- 所有代码、文档、笔记全部由作者本人编写

**本仓库不包含**任何第三方资产或二进制：

- 不上传任何 IPA 包（`.ipa`、`.ip.i` 全部 gitignore）
- 不上传 App 解包后的内容（`extracted/` gitignore）
- 不上传第三方开源框架的编译产物（RxSwift / Alamofire / Realm / Lottie / DGCharts 等的 framework binary 全部 gitignore）
- 不上传 `Assets.car`、加密的 Lottie `.dat` 等原始资源
- 不上传字体文件之外的资源（用于 H5 还原的 PNG 图标也不进仓库 —— 它们在源 App 的 Asset Catalog 内）

## 目录结构

```
aware-lab/
├── h5/aware-h5/              # H5 复刻：React 19 + Vite + Tailwind v4
│   ├── src/
│   │   ├── pages/            # 9 个页面（Welcome / Onboarding / Home / Wish /
│   │   │                     #          Trend / Settings / Add / ItemDetail / Subscribe）
│   │   ├── components/       # TabBar / IconPicker / icons
│   │   ├── db/               # zustand store + IndexedDB 持久化
│   │   ├── lib/              # 计算 / 主题 / 图标目录
│   │   └── types/
│   ├── public/fonts/         # 仅字体（自家 App 使用的 Alimama_ShuHeiTi、WeChatSans）
│   └── ...
└── ios/有数_26-05-03/
    └── dylib_src/
        └── AwarePatch.m      # 运行时 patch 源码（去除 VPN/代理检测，TrollStore 测试用）
```

## H5 复刻

### 技术栈

- React 19 + TypeScript + Vite 7（SWC）
- Tailwind CSS v4（`@theme` design tokens + `data-theme` 主题切换）
- React Router v7
- zustand + idb-keyval（IndexedDB 持久化，无需后端）
- framer-motion（FAB / TabBar / 卡片微动效）
- lucide-react（线性图标）

### 已实现的核心功能

- 9 个完整页面：欢迎页、4 步引导、首页、心愿单、趋势/洞悉、添加/编辑、物品详情、订阅页、设置
- 完整的浅色 + 暗色主题（设置内可切换，包含 `system / light / dark` 三档）
- IconPicker bottom sheet：3 tab（相册 / Emoji / 3D 图标）+ 10 类 + 搜索
- 数据持久化：所有物品 / 心愿 / 设置存 IndexedDB，刷新不丢
- 微动效：FAB tap 弹性、TabBar 选中态 layoutId 滑动、物品卡片 tap 缩放
- 首次访问引导链路：自动跳 `/welcome` → 4 步引导 → 进首页

### 运行

```bash
cd h5/aware-h5
pnpm install
pnpm dev
# 默认 http://localhost:5173
```

### 构建

```bash
cd h5/aware-h5
pnpm build       # 输出到 dist/
pnpm preview     # 本地预览构建产物
```

## iOS 部分（仅自家 App 内部测试）

`ios/有数_26-05-03/dylib_src/AwarePatch.m` 是为 TrollStore 环境写的运行时补丁源码：

- Hook 自家 App 的 `NetworkSecurityChecker`，绕过 VPN / HTTP 代理 / SOCKS 代理 / 网络接口检测
- 用途：用 Proxyman 抓包测试自己 App 的网络请求

不带任何 IPA、二进制产物或解包资源 —— 只放源码。

## 协议

MIT License — 仅适用于本仓库内**作者自己编写的代码**（H5 项目源码 + AwarePatch.m）。
