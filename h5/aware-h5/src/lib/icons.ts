/**
 * 把 Asset Catalog 里导出的所有 PNG 通过 Vite 的 import.meta.glob 一次性 eager 加载，
 * 形成一个 { iconName -> resolvedURL } 的映射表，运行时按 name 取图标。
 *
 * 文件名格式：`<name>@<scale>x.png`，name 已经在导出时把 / 和空格替换成了 _。
 */
const modules = import.meta.glob('@/assets/icons/*.png', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>;

export const iconMap: Record<string, string> = {};

for (const [path, url] of Object.entries(modules)) {
  // path: /src/assets/icons/icon_tab_home_s@3x.png
  const file = path.split('/').pop()!;
  const m = /^(.+?)@(\d+)x\.png$/.exec(file);
  if (!m) continue;
  const name = m[1];
  // 同名取最高 @3x；如果只有 @1x 也保留
  if (!iconMap[name] || /3x/.test(path)) {
    iconMap[name] = url;
  }
}

export function getIcon(name: string | undefined): string | undefined {
  if (!name) return undefined;
  return iconMap[name];
}
