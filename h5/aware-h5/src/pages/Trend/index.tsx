import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useStore } from '@/db/store';
import { computeMetrics, formatPrice, totalAssets, totalDailyCost } from '@/lib/calc';
import { getIcon } from '@/lib/icons';
import type { Item } from '@/types';

type SubTab = 'trend' | 'insight';

// 6 个调色板色，用于分类分布
const PALETTE = ['#a0f030', '#5ac8fa', '#ffd84a', '#ff9500', '#af52de', '#ff3b30', '#34c759', '#8e8e93'];

export function TrendPage() {
  const items = useStore(s => s.items);
  const settings = useStore(s => s.settings);
  const categories = useStore(s => s.categories);
  const nav = useNavigate();
  const [tab, setTab] = useState<SubTab>('insight');

  const fmt = (n: number, dec: 0 | 1 | 2 = settings.decimalPlaces) =>
    formatPrice(n, { symbol: settings.currencySymbol, decimals: dec, thousands: settings.thousandsSeparator });

  // ============ 真实统计：分类分布 ============
  const categoryDist = useMemo(() => {
    const inUseItems = items.filter(i => i.status === 'inUse' || i.status === 'idle');
    const sumByCat = new Map<string, number>();
    inUseItems.forEach(i => sumByCat.set(i.categoryId, (sumByCat.get(i.categoryId) || 0) + i.price));
    const total = [...sumByCat.values()].reduce((a, b) => a + b, 0) || 1;
    return [...sumByCat.entries()]
      .map(([catId, value]) => {
        const cat = categories.find(c => c.id === catId);
        return {
          id: catId,
          name: cat?.name ?? catId,
          value,
          pct: (value / total) * 100,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [items, categories]);

  // ============ 真实统计：月度新增 ============
  const monthlyAdded = useMemo(() => {
    // 最近 12 个月
    const months: { label: string; key: string; count: number; value: number }[] = [];
    const now = dayjs();
    for (let i = 11; i >= 0; i--) {
      const m = now.subtract(i, 'month');
      months.push({ label: m.format('M月'), key: m.format('YYYY-MM'), count: 0, value: 0 });
    }
    items.forEach(item => {
      const k = dayjs(item.purchaseDate).format('YYYY-MM');
      const slot = months.find(m => m.key === k);
      if (slot) {
        slot.count += 1;
        slot.value += item.price;
      }
    });
    return months;
  }, [items]);

  // ============ 真实统计：洞察数据 ============
  const insights = useMemo(() => {
    const inUseItems = items.filter(i => i.status === 'inUse' || i.status === 'idle');
    const ranked = [...inUseItems].sort((a, b) => computeMetrics(b).dailyCost - computeMetrics(a).dailyCost);
    const longestHeld = [...items].sort((a, b) => computeMetrics(b).daysOwned - computeMetrics(a).daysOwned)[0];
    // 闲置最久（status === 'idle' 且持有最长）
    const longestIdle = [...items]
      .filter(i => i.status === 'idle')
      .sort((a, b) => computeMetrics(b).daysOwned - computeMetrics(a).daysOwned)[0];

    // 本月 vs 上月新增物品数
    const thisMonth = monthlyAdded[monthlyAdded.length - 1].count;
    const lastMonth = monthlyAdded[monthlyAdded.length - 2]?.count ?? 0;
    const growthPct = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;

    // 平均日均
    const avgDaily = inUseItems.length > 0 ? totalDailyCost(items) / inUseItems.length : 0;

    return {
      total: totalAssets(items),
      daily: totalDailyCost(items),
      avgDaily,
      highest: ranked[0],
      lowest: ranked[ranked.length - 1],
      longestHeld,
      longestIdle,
      topCat: categoryDist[0]?.name ?? '-',
      thisMonth,
      lastMonth,
      growthPct,
    };
  }, [items, monthlyAdded, categoryDist]);

  return (
    <div className="min-h-full pb-4">
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

      {/* 总览数字卡片 */}
      <section className="px-4">
        <div className="rounded-[24px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] p-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <SummaryCell label="总资产" value={fmt(insights.total)} />
            <SummaryCell label="总日均" value={fmt(insights.daily, 2)} />
            <SummaryCell label="平均日均" value={fmt(insights.avgDaily, 2)} />
          </div>
        </div>
      </section>

      {/* 资产类型分布 — 真实数据 + Donut */}
      <section className="px-4 mt-4">
        <div className="rounded-[28px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[14px] font-bold">资产类型分布</div>
            <div className="text-[11px] text-[var(--color-text-secondary)]">总价值 {fmt(insights.total)}</div>
          </div>

          {categoryDist.length === 0 ? (
            <div className="text-center text-[13px] text-[var(--color-text-tertiary)] py-8">暂无在用物品</div>
          ) : (
            <div className="flex items-center gap-5">
              <DonutChart data={categoryDist.map((c, i) => ({ ...c, color: PALETTE[i % PALETTE.length] }))} />
              <div className="flex-1 space-y-2 min-w-0">
                {categoryDist.slice(0, 6).map((c, i) => (
                  <div key={c.id} className="flex items-center gap-2 text-[12px]">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
                    <span className="truncate font-medium">{c.name}</span>
                    <span className="ml-auto text-[var(--color-text-secondary)] tabular-nums">{c.pct.toFixed(0)}%</span>
                  </div>
                ))}
                {categoryDist.length > 6 && (
                  <div className="text-[11px] text-[var(--color-text-tertiary)]">+ {categoryDist.length - 6} 个分类</div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 月度新增柱图 — 最近 12 月 */}
      <section className="px-4 mt-4">
        <div className="rounded-[24px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[14px] font-bold">月度新增</div>
            <div className="text-[11px] text-[var(--color-text-secondary)]">最近 12 个月</div>
          </div>
          <div className="text-[11px] text-[var(--color-text-tertiary)] mb-3">
            本月 {insights.thisMonth} 件
            {insights.growthPct != null && (
              <span className={clsx('ml-2 font-medium', insights.growthPct >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]')}>
                {insights.growthPct >= 0 ? '↑' : '↓'} {Math.abs(insights.growthPct)}%
              </span>
            )}
          </div>
          <MonthlyBarChart data={monthlyAdded} />
        </div>
      </section>

      {/* 智能发现 — 全用真实数据 */}
      <section className="px-4 mt-4">
        <div className="rounded-[24px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-divider)]">
            <div className="flex items-center gap-2 text-[14px] font-bold">
              <span>✨</span>智能发现
            </div>
            <button><ChevronDown size={16} /></button>
          </div>
          <ul className="divide-y divide-[var(--color-divider)]">
            <DiscoverRow emoji="💎" label="日均最高" value={insights.highest?.name ?? '-'} sub={insights.highest ? fmt(computeMetrics(insights.highest).dailyCost, 2) + '/天' : ''} />
            <DiscoverRow emoji="👍" label="日均最低" value={insights.lowest?.name ?? '-'} sub={insights.lowest ? fmt(computeMetrics(insights.lowest).dailyCost, 2) + '/天' : ''} />
            <DiscoverRow emoji="⏳" label="持有最久" value={insights.longestHeld?.name ?? '-'} sub={insights.longestHeld ? `${computeMetrics(insights.longestHeld).daysOwned} 天` : ''} />
            <DiscoverRow emoji="💤" label="闲置最久" value={insights.longestIdle?.name ?? '— 暂无'} sub={insights.longestIdle ? `${computeMetrics(insights.longestIdle).daysOwned} 天` : ''} />
            <DiscoverRow emoji="📊" label="占比最高分类" value={insights.topCat} />
            <DiscoverRow
              emoji="🛍"
              label="本月新增"
              value={`${insights.thisMonth} 件`}
              sub={insights.growthPct != null ? `vs 上月 ${insights.growthPct >= 0 ? '+' : ''}${insights.growthPct}%` : '上月无数据'}
            />
          </ul>
        </div>
      </section>

      {/* 解锁有数会员 — 仅 demo 展示 */}
      <section className="px-4 mt-4">
        <div className="rounded-[24px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] p-5">
          <h2 className="font-display text-[20px] text-center text-[var(--color-brand-deep)]">
            解锁有数会员
          </h2>
          <p className="font-display text-[20px] text-center mt-0.5">洞悉资产动向</p>
          <div className="grid grid-cols-2 gap-y-3 mt-4">
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
          <button
            onClick={() => nav('/subscribe')}
            className="mt-5 w-full h-12 rounded-full bg-[var(--color-brand)] text-[#1a1a1a] font-bold"
          >
            解锁会员
          </button>
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

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-[var(--color-text-secondary)]">{label}</div>
      <div className="font-display text-[18px] mt-1 truncate">{value}</div>
    </div>
  );
}

function DiscoverRow({ emoji, label, value, sub }: { emoji: string; label: string; value: string; sub?: string }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="w-7 h-7 rounded-md flex items-center justify-center text-[14px] shrink-0" style={{ background: '#fff5d6' }}>{emoji}</span>
      <span className="text-[13px] shrink-0">{label}</span>
      <div className="ml-auto text-right min-w-0">
        <div className="text-[13px] truncate">{value}</div>
        {sub && <div className="text-[10px] text-[var(--color-text-tertiary)] truncate">{sub}</div>}
      </div>
      <ChevronRight size={14} className="text-[var(--color-text-tertiary)] shrink-0" />
    </li>
  );
}

// ============ Donut SVG (真实分类数据) ============
function DonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const SIZE = 110;
  const STROKE = 18;
  const R = (SIZE - STROKE) / 2;
  const C = 2 * Math.PI * R;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  let cumulative = 0;
  const segs = data.map(d => {
    const len = (d.value / total) * C;
    const seg = { ...d, len, offset: cumulative };
    cumulative += len;
    return seg;
  });

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="var(--color-bg-elev-3)"
          strokeWidth={STROKE}
        />
        {segs.map((s, i) => (
          <circle
            key={i}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={s.color}
            strokeWidth={STROKE}
            strokeDasharray={`${s.len} ${C}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      {/* 中心文字 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-[13px] leading-none">{data.length}</div>
        <div className="text-[9px] text-[var(--color-text-tertiary)] mt-0.5">分类</div>
      </div>
    </div>
  );
}

// ============ Monthly Bar SVG ============
function MonthlyBarChart({ data }: { data: { label: string; count: number; value: number }[] }) {
  const W = 320, H = 110, PAD_X = 8, PAD_TOP = 6, PAD_BOTTOM = 18;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOTTOM;
  const barW = innerW / data.length * 0.6;
  const gap = innerW / data.length * 0.4;
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* 0 基线 */}
        <line x1={PAD_X} x2={W - PAD_X} y1={PAD_TOP + innerH} y2={PAD_TOP + innerH} stroke="var(--color-bg-elev-3)" strokeWidth="1" />
        {data.map((d, i) => {
          const h = (d.count / maxCount) * innerH;
          const x = PAD_X + (innerW / data.length) * i + gap / 2;
          const y = PAD_TOP + innerH - h;
          const isLast = i === data.length - 1;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(2, h)}
                rx={Math.min(3, barW / 2)}
                fill={isLast ? '#a0f030' : 'var(--color-bg-elev-3)'}
              />
              {/* 数字标签：只在 count > 0 时显示 */}
              {d.count > 0 && (
                <text
                  x={x + barW / 2}
                  y={y - 2}
                  textAnchor="middle"
                  fontSize="8"
                  fill="var(--color-text-secondary)"
                  fontWeight="bold"
                >
                  {d.count}
                </text>
              )}
              {/* X 轴月份标签：每隔一个显示，避免拥挤 */}
              {(i % 2 === 0 || isLast) && (
                <text
                  x={x + barW / 2}
                  y={H - 4}
                  textAnchor="middle"
                  fontSize="9"
                  fill="var(--color-text-tertiary)"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ============ 日均成本排行 ============
function RankSection({ items, fmt }: { items: Item[]; fmt: (n: number, d?: 0 | 1 | 2) => string }) {
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');
  const ranked = useMemo(() => {
    return [...items]
      .filter(i => i.status === 'inUse' || i.status === 'idle')
      .sort((a, b) => {
        const da = computeMetrics(a).dailyCost;
        const db = computeMetrics(b).dailyCost;
        return order === 'desc' ? db - da : da - db;
      })
      .slice(0, 5);
  }, [items, order]);

  return (
    <section className="px-4 mt-4">
      <div className="rounded-[24px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-divider)]">
          <div className="flex items-center gap-2 text-[14px] font-bold">
            日均成本排行
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
        {ranked.length === 0 ? (
          <div className="text-center text-[13px] text-[var(--color-text-tertiary)] py-8">暂无在用物品</div>
        ) : (
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
        )}
      </div>
    </section>
  );
}
