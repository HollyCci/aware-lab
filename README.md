# aware-lab

自己开发的 iOS App「有数 / Aware」的个人小工坊。两件事：

一是给自家的 App 写了个运行时补丁，方便上线前用 Proxyman 在 TrollStore 环境抓包测自己的网络层（原 App 自带 VPN/代理检测，没补丁的话开了代理就直接报错）。

二是把整套 UI 用 React + Tailwind 重新撸了一遍 H5 版，做的时候没看任何源码，纯靠拿 IPA 解出来的字体、图标、`Localizable.strings` 当参考，加上自己录的一段操作视频抽帧对着画。最后做出来跟原 App 视觉差不多 7 成像，主流程能打通——添加物品、看日均成本、定回本目标、订阅页、暗色模式什么的都跑得起来，所有数据走 IndexedDB，刷新也不丢。

## 跑起来

```bash
cd h5/aware-h5
pnpm install
pnpm dev
```

默认 `http://localhost:5173`，第一次进会自动走欢迎页 + 4 步引导。想跳过引导直接看主界面，加个 `?skip=1`。

构建：

```bash
pnpm build && pnpm preview
```

## 目录里有什么

```
h5/aware-h5/                React 19 + Vite + Tailwind v4 的 H5 项目
└── src/
    ├── pages/              9 个页面：Welcome / Onboarding / Home / Wish /
    │                       Trend / Settings / Add / ItemDetail / Subscribe
    ├── components/         TabBar / IconPicker / icons
    ├── db/                 zustand store，写到 IndexedDB
    ├── lib/                日均成本/达标进度等业务计算 + 主题切换
    └── assets/icons/       直接复用原 App 的 PNG 图标

ios/有数_26-05-03/dylib_src/
└── AwarePatch.m            TrollStore 用的运行时补丁源码
                            hook 自家的 NetworkSecurityChecker，
                            把 VPN/HTTP 代理/SOCKS/网卡名 4 个检测都返回 false
```

## 仓库里 *没有* 什么

不是没做，是有意没传：

- **任何 `.ipa` 文件**——4 个 patched 版本（dev/release/pro 等）每个都 32MB，没必要扔到 git 上
- **解包后的 `extracted/` 整个目录**——里头有 RxSwift / Alamofire / RealmSwift / Lottie 这些第三方框架的编译产物，扔 public 仓库不合适。Assets.car（14M）和加密的 `3D_emoji.dat` 也在这层
- **`AwarePatch.dylib` 编译产物**——留 `.m` 源码就够了，需要的话本地 `clang` 一下就能出
- **`node_modules/`、`dist/`、`.idea/`、`.DS_Store`** 这些标准忽略

如果克隆下来想完整跑 iOS 那部分，需要自己有原 IPA 才能解包 + 重打包。

## 关于 H5 复刻的完成度

视觉做到 90% 多，主流程贯通，但很多设置二级页（分类管理、标签管理、备份与恢复、密码与安全等）目前只有入口的卡片和 `>` 箭头，点进去是空的——视频里没演示这些页面的内部，做不出 1:1，留着以后慢慢补。

iOS 原生的能力（iCloud 同步、应用图标切换、相机、震动反馈）H5 天然做不了，跳过。

真彩色的 Lottie sticker（视频里那个特别精致的 iPhone15 蓝屏贴纸）是从加密的 `3D_emoji.dat` 解的，没解出来，临时用了 Asset Catalog 里的 PNG 顶替——视觉上稍微逊一点。

## 一些声明

App 是自己开发的，所有逆向和补丁都只动自己的代码、只在自己的设备上测。仓库里所有 H5 代码都是自己写的（含 AI 协助写的部分），原 App 的 PNG 图标和字体是项目当时购买/授权的素材，自己拥有再分发的权利。

第三方开源框架（RxSwift / Alamofire 等）的编译产物虽然许可证（MIT/Apache）允许转发，但按惯例不放进这个仓库。

许可证 MIT，仅适用于本仓库内自己写的代码。
