import { useNavigate } from 'react-router-dom';
import { useStore } from '@/db/store';
import { formatPrice } from '@/lib/calc';
import { getIcon } from '@/lib/icons';

export function WishPage() {
  const wishlist = useStore(s => s.wishlist);
  const settings = useStore(s => s.settings);
  const nav = useNavigate();

  const total = wishlist.reduce((s, w) => s + w.price, 0);
  const fmt = (n: number) =>
    formatPrice(n, { symbol: settings.currencySymbol, decimals: settings.decimalPlaces });

  return (
    <div className="min-h-full">
      <header className="pt-safe px-4 pt-3 pb-4">
        <h1 className="font-display text-[34px] leading-none">心愿</h1>
      </header>

      {/* 心愿总值卡片 */}
      <section className="px-4">
        <div className="rounded-[24px] bg-[var(--color-bg-elev-1)] p-5 shadow-[var(--shadow-card)] flex items-center">
          <div className="flex-1">
            <div className="text-[14px] font-bold">心愿总值</div>
            <div className="font-display text-[28px] mt-1">{fmt(total)}</div>
            <div className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">心愿数量：{wishlist.length}</div>
          </div>
          {/* lime green 罐子图标 */}
          <WishJarIllustration />
        </div>
      </section>

      {/* 列表 / 空状态 */}
      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center pt-16 text-center">
          <MascotEmpty />
          <div className="font-display text-[20px] mt-4">空空如也</div>
          <div className="text-[13px] text-[var(--color-text-tertiary)] mt-1.5">
            点击 <span className="inline-flex items-center justify-center w-4 h-4 mx-0.5 rounded-full bg-[var(--color-text)] text-white text-[10px]">+</span> 添加资产
          </div>
        </div>
      ) : (
        <ul className="px-4 mt-3 space-y-3 pb-4">
          {wishlist.map(w => (
            <li
              key={w.id}
              onClick={() => nav(`/add/${w.id}`)}
              className="rounded-[24px] bg-[var(--color-bg-elev-1)] p-4 shadow-[var(--shadow-card)] flex items-center gap-3 active:scale-[0.99] transition cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-bg-elev-2)] flex items-center justify-center overflow-hidden shrink-0">
                {w.iconName && <img src={getIcon(w.iconName)} alt="" className="w-full h-full object-contain" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-bold truncate">{w.name}</div>
                {w.notes && <div className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5 truncate">{w.notes}</div>}
              </div>
              <div className="font-display text-[18px]">{fmt(w.price)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function WishJarIllustration() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
      <rect x="22" y="6" width="20" height="6" rx="1.5" fill="#1a1a1a" />
      <path d="M16 16 c0-2 2-4 4-4 h24 c2 0 4 2 4 4 v36 a4 4 0 0 1-4 4 H20 a4 4 0 0 1-4-4 z" fill="#a0f030" stroke="#1a1a1a" strokeWidth="2.5" />
      {/* star */}
      <path d="M32 28 l3 5.5 6 1 -4.5 4.3 1 6.2 -5.5-3-5.5 3 1-6.2 -4.5-4.3 6-1z" fill="#fff" stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function MascotEmpty() {
  // 视频里的"空空如也"吉祥物（戴眼镜的圆圆角色，灰色版）
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <ellipse cx="60" cy="78" rx="44" ry="36" fill="#dcdbd2" />
      <rect x="22" y="44" width="76" height="14" rx="2" fill="#1a1a1a" />
      <circle cx="42" cy="68" r="10" fill="#1a1a1a" />
      <circle cx="78" cy="68" r="10" fill="#1a1a1a" />
      <circle cx="42" cy="68" r="3" fill="#fff" />
      <circle cx="78" cy="68" r="3" fill="#fff" />
    </svg>
  );
}
