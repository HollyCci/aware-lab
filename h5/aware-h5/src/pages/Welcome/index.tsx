import { useNavigate } from 'react-router-dom';
import { getIcon } from '@/lib/icons';
import { markWelcomed } from '@/lib/welcome';

const orbitItems = [
  // 7 个真实物品 sticker，按视频里的位置（中心吉祥物周围环绕）
  { iconName: '3d_video', angle: -90, radius: 110, size: 56 },     // 顶部：相机
  { iconName: '3d_handphone', angle: -45, radius: 130, size: 64 }, // 右上：手机
  { iconName: '3d_headphone', angle: 20, radius: 140, size: 56 },  // 右：耳机
  { iconName: '3d_joystick', angle: 80, radius: 120, size: 48 },   // 右下：游戏机
  { iconName: 'Camera_icon', angle: 140, radius: 130, size: 60 },  // 左下：相机
  { iconName: 'AppIcon', angle: 200, radius: 140, size: 56 },      // 左：（主图标）
  { iconName: '3d_printer', angle: 250, radius: 110, size: 52 },   // 左上：打印机
];

export function WelcomePage() {
  const nav = useNavigate();

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-bg)] flex flex-col">
      {/* 中央：吉祥物 + 环绕物品 */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* 两层环形光晕 */}
        <div className="absolute w-[300px] h-[300px] rounded-full border border-[var(--color-stroke)]/60" />
        <div className="absolute w-[230px] h-[230px] rounded-full border border-[var(--color-stroke)]/40" />

        {/* 中央吉祥物 */}
        <div className="relative z-10 w-[110px] h-[110px]">
          <Mascot />
        </div>

        {/* 周围环绕的产品 sticker */}
        {orbitItems.map((it, i) => {
          const rad = (it.angle * Math.PI) / 180;
          const x = Math.cos(rad) * it.radius;
          const y = Math.sin(rad) * it.radius;
          return (
            <div
              key={i}
              className="absolute"
              style={{
                width: it.size,
                height: it.size,
                transform: `translate(${x}px, ${y}px)`,
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))',
              }}
            >
              <img src={getIcon(it.iconName)} alt="" className="w-full h-full object-contain" />
            </div>
          );
        })}
      </div>

      {/* 标题 + CTA */}
      <div className="px-8 pb-safe pb-12">
        <h1 className="font-display text-[32px] text-center leading-tight">欢迎使用有数</h1>
        <p className="text-center text-[14px] text-[var(--color-text-secondary)] mt-2">
          拥抱长期主义，让消费心中有数
        </p>
        <button
          onClick={() => {
            // 先写 localStorage 标记已看过，再用 microtask 推迟 nav 一帧，
            // 避免和 RootLayout 的 useFirstVisitRedirect 在 React 批量更新里抢路由
            markWelcomed();
            queueMicrotask(() => nav('/onboarding'));
          }}
          className="
            mt-7 w-full h-[52px] rounded-full
            bg-[var(--color-btn-dark)] text-[var(--color-brand)]
            font-display text-[16px]
            flex items-center justify-center
            active:scale-[0.98] transition
          "
        >
          开始探索
        </button>
        <p className="text-center text-[11px] text-[var(--color-text-tertiary)] mt-3 leading-relaxed">
          点击上方按钮，即代表您同意我们的{' '}
          <span className="text-[var(--color-text)]">隐私政策</span>{' '}和{' '}
          <span className="text-[var(--color-text)]">使用条款</span>
        </p>
      </div>
    </div>
  );
}

function Mascot() {
  return (
    <svg viewBox="0 0 120 120" fill="none" className="w-full h-full" aria-hidden>
      {/* 白色 sticker 描边 */}
      <ellipse cx="60" cy="74" rx="46" ry="36" fill="white" />
      {/* 圆胖身体（橙黄色） */}
      <ellipse cx="60" cy="74" rx="42" ry="32" fill="#ffd84a" />
      {/* 黑眼镜横条 */}
      <rect x="22" y="44" width="76" height="14" rx="2" fill="#1a1a1a" />
      {/* 黑色眼镜框 */}
      <circle cx="42" cy="68" r="10" fill="#1a1a1a" />
      <circle cx="78" cy="68" r="10" fill="#1a1a1a" />
      {/* 高光 */}
      <circle cx="42" cy="65" r="3.5" fill="#fff" opacity="0.85" />
      <circle cx="78" cy="65" r="3.5" fill="#fff" opacity="0.85" />
      {/* 嘴 */}
      <path d="M53 88 q7 5 14 0" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
