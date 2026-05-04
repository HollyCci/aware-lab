/**
 * 自绘 SVG 图标，1:1 复刻原 App tab bar / 顶部图标的几何感。
 * 全部用 fill="currentColor"，方便着色。
 */

export function HomeIcon({ filled = false, size = 22 }: { filled?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" fill={filled ? 'currentColor' : 'none'} />
    </svg>
  );
}

// 心愿（罐子带星星，参考视频里的 lime green 罐子图标）
export function WishIcon({ filled = false, size = 22 }: { filled?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6v3H9z" fill={filled ? 'currentColor' : 'none'} />
      <path d="M7 8c0-1 1-2 2-2h6c1 0 2 1 2 2v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" fill={filled ? 'currentColor' : 'none'} />
      <path d="M12 12.5l1.2 1.4 1.8.3-1.3 1.3.3 1.8-1.6-.9-1.6.9.3-1.8L9.8 14.2l1.8-.3z" fill={filled ? 'white' : 'currentColor'} stroke={filled ? 'white' : 'currentColor'} />
    </svg>
  );
}

// 趋势（柱状图）
export function TrendIcon({ filled = false, size = 22 }: { filled?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="14" width="4" height="7" rx="1" fill={filled ? 'currentColor' : 'none'} />
      <rect x="10" y="9" width="4" height="12" rx="1" fill={filled ? 'currentColor' : 'none'} />
      <rect x="17" y="4" width="4" height="17" rx="1" fill={filled ? 'currentColor' : 'none'} />
    </svg>
  );
}

// 设置（六边形带齿轮，呼应原 App 设置图标）
export function SettingsIcon({ filled = false, size = 22 }: { filled?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5l8.5 4.9v9.2L12 21.5 3.5 16.6V7.4z" fill={filled ? 'currentColor' : 'none'} />
      <circle cx="12" cy="12" r="3" fill={filled ? 'white' : 'none'} stroke={filled ? 'white' : 'currentColor'} />
    </svg>
  );
}

// Pro / 钻石标
export function DiamondIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 9l4-5h6l4 5-7 11z" />
    </svg>
  );
}

// 心形 Pro 标记（lime green 圆角方块里，固定黑字）
export function ProTag({ size = 18 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-md text-[#1a1a1a]"
      style={{ width: size, height: size, background: 'var(--color-brand)' }}
    >
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21s-7.5-4.7-7.5-11A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7.5 3c0 6.3-7.5 11-7.5 11z" />
      </svg>
    </span>
  );
}
