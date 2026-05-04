import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpDown, Filter, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useStore } from '@/db/store';
import { computeMetrics, formatPrice, totalAssets, totalDailyCost } from '@/lib/calc';
import { getIcon } from '@/lib/icons';
import { DiamondIcon } from '@/components/icons';
import type { Item, ItemStatus } from '@/types';

type Filter = 'all' | ItemStatus;

const filterTabs: { id: Filter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'inUse', label: '服役中' },
  { id: 'discarded', label: '已退役' },
  { id: 'sold', label: '已卖出' },
];

export function HomePage() {
  const items = useStore(s => s.items);
  const settings = useStore(s => s.settings);
  const nav = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');

  const stats = useMemo(() => {
    const inUseCount = items.filter(i => i.status === 'inUse').length;
    const discardedCount = items.filter(i => i.status === 'discarded' || i.status === 'lost').length;
    const soldCount = items.filter(i => i.status === 'sold').length;
    return {
      total: totalAssets(items),
      dailyCost: totalDailyCost(items),
      inUseCount,
      discardedCount,
      soldCount,
      grandTotal: items.length || 1,
    };
  }, [items]);

  const display = useMemo(() => {
    const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);
    return [...filtered].sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
  }, [items, filter]);

  const fmt = (n: number, dec: 0 | 1 | 2 = settings.decimalPlaces) =>
    formatPrice(n, { symbol: settings.currencySymbol, decimals: dec });

  return (
    <div className="min-h-full">
      {/* 顶部 lime 渐变 banner */}
      <div
        className="absolute inset-x-0 top-0 h-[180px] -z-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, var(--color-brand-soft) 0%, var(--color-brand-bg) 35%, transparent 100%)',
        }}
      />

      <header className="relative pt-safe">
        {/* lime green 渐变是浅色背景，无论 light/dark 主题都用黑色文字图标 */}
        <div className="px-4 pt-3 pb-4 flex items-center justify-between">
          <h1 className="font-display text-[34px] leading-none text-[#1a1a1a]">有数</h1>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-[#1a1a1a]">
              <Search size={22} strokeWidth={2.4} />
            </button>
            <button
              onClick={() => nav('/subscribe')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#1a1a1a]"
            >
              <DiamondIcon size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* 资产总览卡片 */}
      <section className="relative px-4">
        <div className="rounded-[24px] bg-[var(--color-bg-elev-1)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-[15px] font-bold">资产总览</h2>
            <span className="px-2 py-0.5 rounded-full bg-[var(--color-bg-elev-3)] text-[11px] text-[var(--color-text-secondary)]">
              {stats.inUseCount + stats.discardedCount + stats.soldCount}/{stats.grandTotal}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] text-[var(--color-text-secondary)] mb-1">总资产</div>
              <div className="font-display text-[28px] tracking-tight">
                {fmt(stats.total, 2)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[var(--color-text-secondary)] mb-1">日均成本</div>
              <div className="font-display text-[28px] tracking-tight">
                {fmt(stats.dailyCost, 2)}
              </div>
            </div>
          </div>
          <ProgressBars
            data={[
              { label: '服役中', value: stats.inUseCount, color: 'var(--color-brand)' },
              { label: '已退役', value: stats.discardedCount, color: 'var(--color-text-tertiary)' },
              { label: '已卖出', value: stats.soldCount, color: 'var(--color-text-tertiary)' },
            ]}
          />
        </div>
      </section>

      {/* 筛选 chips + 工具按钮 */}
      <section className="px-4 mt-4 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {filterTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={clsx(
                'h-9 px-4 rounded-full text-[13px] font-bold whitespace-nowrap transition',
                filter === t.id
                  ? 'bg-[var(--color-btn-dark)] text-[var(--color-text-on-dark)]'
                  : 'bg-[var(--color-bg-elev-1)] text-[var(--color-text-secondary)]',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <ToolBtn icon={ArrowUpDown} />
        <ToolBtn icon={Filter} />
        <ToolBtn icon={CheckSquare} />
      </section>

      {/* 物品单列卡片 */}
      <section className="px-4 mt-3 space-y-3 pb-4">
        {display.map(item => <ItemCard key={item.id} item={item} fmt={fmt} onClick={() => nav(`/item/${item.id}`)} />)}
        {display.length === 0 && (
          <div className="text-center py-20 text-[var(--color-text-tertiary)] text-sm">暂无物品</div>
        )}
      </section>
    </div>
  );
}

function ToolBtn({ icon: Icon }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }) {
  return (
    <button className="w-9 h-9 rounded-full bg-[var(--color-bg-elev-1)] text-[var(--color-text)] flex items-center justify-center">
      <Icon size={16} strokeWidth={2.2} />
    </button>
  );
}

function ProgressBars({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="mt-4 grid grid-cols-3 gap-3">
      {data.map(d => (
        <div key={d.label}>
          <div className="text-[11px] text-[var(--color-text-secondary)] mb-1.5">
            {d.label} <span className="text-[var(--color-text)] font-bold">{d.value}</span>
          </div>
          <div className="h-1 rounded-full bg-[var(--color-bg-elev-3)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(d.value / total) * 100}%`, background: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ItemCard({ item, fmt, onClick }: { item: Item; fmt: (n: number, d?: 0 | 1 | 2) => string; onClick: () => void }) {
  const m = computeMetrics(item);
  const statusLabel = item.status === 'inUse' ? '服役中' : item.status === 'idle' ? '闲置' : item.status === 'sold' ? '已卖出' : item.status === 'discarded' ? '已退役' : '丢失';
  const isInUse = item.status === 'inUse' || item.status === 'idle';
  const progress = item.targetDailyCost
    ? Math.min(100, (item.targetDailyCost / Math.max(m.dailyCost, item.targetDailyCost)) * 100)
    : 0;

  return (
    <motion.article
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      className="
        rounded-[24px] bg-[var(--color-bg-elev-1)] p-4
        shadow-[var(--shadow-card)]
        cursor-pointer
      "
    >
      {/* 顶部：图标 + 状态 pill */}
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-elev-2)] flex items-center justify-center overflow-hidden shrink-0">
          {item.iconName && <img src={getIcon(item.iconName)} alt="" className="w-full h-full object-contain" />}
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[15px] font-bold truncate">{item.name}</div>
            <span
              className={clsx(
                'shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium',
                isInUse
                  ? 'text-[#1a1a1a] bg-[#ecfacc]'  /* lime 浅底 + 固定黑字，两主题通用 */
                  : 'text-[var(--color-text-secondary)] bg-[var(--color-bg-elev-3)]',
              )}
            >
              <span className={clsx('w-1.5 h-1.5 rounded-full', isInUse ? 'bg-[var(--color-brand-deep)]' : 'bg-[var(--color-text-tertiary)]')} />
              {statusLabel}
            </span>
          </div>
          <div className="text-[12px] text-[var(--color-text-secondary)] mt-1">
            {fmt(item.price)} · 已使用 {item.usageCount}
          </div>
          <div className="font-display text-[20px] mt-1.5">
            {fmt(m.dailyCost, 2)}<span className="text-[12px] font-medium text-[var(--color-text-secondary)]">/天</span>
          </div>
        </div>
      </div>

      {/* 进度条（如有目标） */}
      {item.targetDailyCost != null && (
        <div className="mt-3">
          <div className="relative h-2 rounded-full bg-[var(--color-bg-elev-3)] overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all"
              style={{ width: `${progress}%`, background: 'var(--color-brand)' }}
            />
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mt-1">
            {m.isAchievedCost ? '已达成目标' : `目标 ${fmt(item.targetDailyCost, 2)}/天`}
          </div>
        </div>
      )}
    </motion.article>
  );
}
