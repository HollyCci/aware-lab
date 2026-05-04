import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '@/db/store';
import { computeMetrics, formatPrice, totalAssets, totalDailyCost } from '@/lib/calc';
import { getIcon } from '@/lib/icons';

type SubTab = 'trend' | 'insight';

export function TrendPage() {
  const items = useStore(s => s.items);
  const settings = useStore(s => s.settings);
  const nav = useNavigate();
  const [tab, setTab] = useState<SubTab>('insight');

  const fmt = (n: number, dec: 0 | 1 | 2 = settings.decimalPlaces) =>
    formatPrice(n, { symbol: settings.currencySymbol, decimals: dec });

  const categories = useStore(s => s.categories);
  const stats = useMemo(() => {
    const ranked = [...items]
      .filter(i => i.status === 'inUse' || i.status === 'idle')
      .sort((a, b) => computeMetrics(b).dailyCost - computeMetrics(a).dailyCost);
    const longestHeld = [...items].sort(
      (a, b) => computeMetrics(b).daysOwned - computeMetrics(a).daysOwned,
    )[0];
    const cats = new Map<string, number>();
    items.forEach(i => cats.set(i.categoryId, (cats.get(i.categoryId) || 0) + i.price));
    const topCatId = [...cats.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
    const topCat = categories.find(c => c.id === topCatId)?.name ?? '-';
    return {
      total: totalAssets(items),
      daily: totalDailyCost(items),
      highest: ranked[0],
      lowest: ranked[ranked.length - 1],
      longestHeld,
      topCat,
    };
  }, [items, categories]);

  return (
    <div className="min-h-full">
      <header className="pt-safe relative">
        <div className="px-4 pt-3 pb-3 flex items-end justify-between">
          <h1 className="font-display text-[34px] leading-none flex items-center gap-3">
            <SubTabBtn active={tab === 'trend'} onClick={() => setTab('trend')}>趋势</SubTabBtn>
            <SubTabBtn active={tab === 'insight'} onClick={() => setTab('insight')}>洞悉</SubTabBtn>
          </h1>
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-text)]">
            <Edit3 size={20} />
          </button>
        </div>
      </header>

      {/* 顶部"演示卡片"——iPhone mock 显示资产分布 */}
      <section className="px-4">
        <div className="rounded-[28px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[13px] font-bold">资产类型分布</div>
            <div className="text-[11px] text-[var(--color-text-secondary)]">总价值 {fmt(stats.total)}</div>
          </div>
          <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-[var(--color-bg-elev-3)]">
            {['#a0f030', '#ffd84a', '#5ac8fa', '#ff9500', '#af52de', '#ff3b30'].map((c, i) => (
              <div key={i} className="h-full" style={{ background: c, width: `${[45, 16, 13, 12, 7.5, 6.5][i]}%` }} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-3 mt-3 text-[12px]">
            {[
              ['#a0f030', '不动产', '45%', fmt(1116270)],
              ['#ffd84a', '交通工具', '16%', fmt(372090)],
              ['#5ac8fa', '摆件珍藏', '13%', fmt(322478)],
              ['#ff9500', '收藏品', '12%', fmt(297672)],
              ['#af52de', '电子产品', '7.5%', fmt(186045)],
              ['#ff3b30', '杂物', '7.5%', fmt(186045)],
            ].map(([c, name, pct, val]) => (
              <div key={name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                <span className="font-medium">{name} {pct}</span>
                <span className="ml-auto text-[var(--color-text-secondary)]">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 解锁有数会员卡片 */}
      <section className="px-4 mt-4">
        <div className="rounded-[24px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] p-5">
          <h2 className="font-display text-[22px] text-center text-[var(--color-brand-deep)]">
            解锁有数会员
          </h2>
          <p className="font-display text-[22px] text-center mt-0.5">洞悉资产动向</p>
          <div className="grid grid-cols-2 gap-y-4 mt-5">
            {[
              { emoji: '📦', label: 'AI 智能洞悉' },
              { emoji: '📊', label: '日均成本排行' },
              { emoji: '✅', label: '目标进度总览' },
              { emoji: '🥧', label: '资产类型分布' },
              { emoji: '⏱', label: '资产持有时长' },
              { emoji: '📈', label: '资产保值率' },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-md bg-[var(--color-brand-bg)] flex items-center justify-center text-[14px]">{f.emoji}</span>
                <span className="text-[13px]">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 智能发现卡片 */}
      <section className="px-4 mt-4">
        <div className="rounded-[24px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-divider)]">
            <div className="flex items-center gap-2 text-[14px] font-bold">
              <span>✨</span>智能发现
              <span className="ml-1 px-2 py-0.5 rounded-full bg-[var(--color-bg-elev-3)] text-[10px] text-[var(--color-text-secondary)] font-normal">演示数据</span>
            </div>
            <button><ChevronDown size={16} /></button>
          </div>
          <ul className="divide-y divide-[var(--color-divider)]">
            <DiscoverRow emoji="🛍" label="购入同比上月" value="增长 27%" />
            <DiscoverRow emoji="💎" label="最高日均成本" value={stats.highest?.name ?? '-'} />
            <DiscoverRow emoji="👍" label="最低日均成本" value={stats.lowest?.name ?? '-'} />
            <DiscoverRow emoji="⏳" label="持有最久" value={stats.longestHeld?.name ?? '-'} />
            <DiscoverRow emoji="📊" label="占比最高分类" value={stats.topCat} />
          </ul>
          <div className="px-4 py-3">
            <button
              onClick={() => nav('/subscribe')}
              className="w-full h-12 rounded-full bg-[var(--color-brand)] text-[var(--color-text-on-brand)] font-bold"
            >
              解锁会员
            </button>
          </div>
        </div>
      </section>

      {/* 日均成本排行 */}
      <RankSection items={items} fmt={fmt} />
    </div>
  );
}

function SubTabBtn({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="relative">
      <span className={active ? 'text-[var(--color-text)]' : 'text-[var(--color-text-tertiary)]'}>
        {children}
      </span>
      {active && (
        <span
          className="absolute left-1 right-1 -bottom-0.5 h-2 rounded-full -z-10"
          style={{ background: 'var(--color-brand)' }}
        />
      )}
    </button>
  );
}

function DiscoverRow({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3.5">
      <span className="w-7 h-7 rounded-md flex items-center justify-center text-[14px]" style={{ background: '#fff5d6' }}>{emoji}</span>
      <span className="text-[13px]">{label}</span>
      <span className="ml-auto text-[13px] text-[var(--color-text-secondary)]">{value}</span>
      <ChevronRight size={14} className="text-[var(--color-text-tertiary)]" />
    </li>
  );
}

function RankSection({ items, fmt }: { items: ReturnType<typeof useStore>['items'] extends infer T ? T : never; fmt: (n: number, d?: 0 | 1 | 2) => string }) {
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');
  const ranked = useMemo(() => {
    const list = (items as ReturnType<typeof useStore>['items'])
      .filter(i => i.status === 'inUse' || i.status === 'idle')
      .sort((a, b) => {
        const da = computeMetrics(a).dailyCost;
        const db = computeMetrics(b).dailyCost;
        return order === 'desc' ? db - da : da - db;
      })
      .slice(0, 5);
    return list;
  }, [items, order]);

  return (
    <section className="px-4 mt-4 pb-4">
      <div className="rounded-[24px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-divider)]">
          <div className="flex items-center gap-2 text-[14px] font-bold">
            日均成本排行
            <span className="px-2 py-0.5 rounded-full bg-[var(--color-bg-elev-3)] text-[10px] font-normal text-[var(--color-text-secondary)]">演示数据</span>
          </div>
          <div className="inline-flex items-center bg-[var(--color-bg-elev-3)] rounded-full p-0.5 text-[11px]">
            {(['desc', 'asc'] as const).map(o => (
              <button
                key={o}
                onClick={() => setOrder(o)}
                className={clsx('px-3 py-1 rounded-full font-medium',
                  order === o ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] text-[#1a1a1a]' : 'text-[var(--color-text-secondary)]')}
              >
                {o === 'desc' ? '最高' : '最低'}
              </button>
            ))}
          </div>
        </div>
        <ul>
          {ranked.map((it, i) => {
            const m = computeMetrics(it);
            return (
              <li key={it.id} className="flex items-center gap-3 px-4 py-3">
                <span className="w-5 text-[14px] font-bold text-[var(--color-text-secondary)]">{i + 1}</span>
                <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-elev-2)] flex items-center justify-center overflow-hidden">
                  {it.iconName && <img src={getIcon(it.iconName)} alt="" className="w-full h-full object-contain" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold truncate">{it.name}</div>
                  <div className="text-[10px] text-[var(--color-text-tertiary)]">已服役 {m.daysOwned} 天</div>
                </div>
                <div className="font-display text-[14px]">
                  {fmt(m.dailyCost, 2)}<span className="text-[10px] text-[var(--color-text-secondary)]">/天</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
