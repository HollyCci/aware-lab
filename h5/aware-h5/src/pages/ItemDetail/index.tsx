import { useNavigate, useParams } from 'react-router-dom';
import { X, Edit3, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import { useStore } from '@/db/store';
import { computeMetrics, formatPrice } from '@/lib/calc';
import { getIcon } from '@/lib/icons';

export function ItemDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const item = useStore(s => s.items.find(i => i.id === id));
  const settings = useStore(s => s.settings);
  const removeItem = useStore(s => s.removeItem);

  if (!item) {
    return (
      <div className="pt-20 text-center text-[var(--color-text-tertiary)]">
        物品不存在
        <button onClick={() => nav('/')} className="text-[var(--color-text)] ml-2 underline">返回</button>
      </div>
    );
  }

  const m = computeMetrics(item);
  const fmt = (n: number, dec: 0 | 1 | 2 = settings.decimalPlaces) =>
    formatPrice(n, { symbol: settings.currencySymbol, decimals: dec });
  const cat = useStore.getState().categories.find(c => c.id === item.categoryId);

  return (
    <div className="min-h-full pb-24 relative">
      {/* lime green 顶部背景 */}
      <div
        className="absolute inset-x-0 top-0 h-[100px] -z-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, #b8f23d 0%, transparent 100%)' }}
      />

      <header className="relative pt-safe">
        <div className="px-4 pt-3 flex items-center justify-between">
          <button onClick={() => nav(-1)} className="w-9 h-9 flex items-center justify-center -ml-1.5">
            <X size={26} strokeWidth={2.6} />
          </button>
          <button
            onClick={() => nav(`/add/${item.id}`)}
            className="w-9 h-9 flex items-center justify-center text-[var(--color-text)]"
            aria-label="编辑"
          >
            <Edit3 size={20} />
          </button>
        </div>
      </header>

      {/* Hero：图标 + 名字 + 大日均 */}
      <section className="relative pt-2 pb-6 flex flex-col items-center">
        <div className="w-24 h-24 flex items-center justify-center">
          {item.iconName && <img src={getIcon(item.iconName)} alt="" className="w-full h-full object-contain" />}
        </div>
        <h1 className="font-display text-[24px] mt-3">{item.name}</h1>
        <div className="font-display text-[28px] mt-1">
          {fmt(m.dailyCost, 2)}<span className="text-[14px] text-[var(--color-text-secondary)]">/天</span>
        </div>
        <div className="text-[12px] text-[var(--color-text-secondary)] mt-1">
          总价：{fmt(item.price, 2)} · 已使用 {m.daysOwned} 天
        </div>
      </section>

      {/* 日均成本走势 */}
      <section className="px-4">
        <div className="rounded-[24px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] p-4">
          <div className="text-[14px] font-bold mb-3">日均成本</div>
          <CostLineChart item={item} />
        </div>
      </section>

      {/* 目标日均成本 */}
      {item.targetDailyCost != null && (
        <section className="px-4 mt-4">
          <div className="rounded-[24px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] p-4">
            <div className="text-[14px] font-bold mb-4">目标日均成本</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[11px] text-[var(--color-text-secondary)]">当前成本</div>
                <div className="font-display text-[18px] mt-1">{fmt(m.dailyCost, 2)}<span className="text-[11px] text-[var(--color-text-secondary)]">/天</span></div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--color-text-secondary)]">进度</div>
                <div className="font-display text-[18px] mt-1">{Math.min(100, Math.round((item.targetDailyCost / Math.max(m.dailyCost, item.targetDailyCost)) * 100))}.00%</div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--color-text-secondary)]">目标日均成本</div>
                <div className="font-display text-[18px] mt-1">{fmt(item.targetDailyCost, 2)}<span className="text-[11px] text-[var(--color-text-secondary)]">/天</span></div>
              </div>
            </div>
            <div className="mt-3 relative h-2 rounded-full bg-[var(--color-bg-elev-3)] overflow-hidden">
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, (item.targetDailyCost / Math.max(m.dailyCost, item.targetDailyCost)) * 100)}%`, background: 'var(--color-brand)' }} />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-[var(--color-text-secondary)]">
              <span>达成日期：{dayjs(item.purchaseDate).add(item.targetDailyCost ? Math.ceil(item.price / item.targetDailyCost) : 0, 'day').format('YYYY 年 M 月 D 日')}</span>
              <span className={m.isAchievedCost ? 'text-[var(--color-text)] font-bold' : ''}>
                {m.isAchievedCost ? '已达成目标' : '进行中'}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 价格信息 */}
      <section className="px-4 mt-4">
        <div className="rounded-[24px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] divide-y divide-[var(--color-divider)]">
          <Row label="价格" value={fmt(item.price, 2)} />
          <Row label="类别" value={cat?.name ?? '其他'} />
          <Row label="购买日期" value={dayjs(item.purchaseDate).format('YYYY 年 M 月 D 日')} />
          {item.notes && <Row label="备注" value={item.notes} />}
        </div>
      </section>

      {/* 删除 */}
      <section className="px-4 mt-4">
        <button
          onClick={() => { removeItem(item.id); nav(-1); }}
          className="w-full h-12 rounded-[24px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] flex items-center justify-center gap-2 text-[var(--color-error)] font-bold"
        >
          <Trash2 size={18} />
          删除
        </button>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-[13px] text-[var(--color-text-secondary)]">{label}</span>
      <span className="text-[13px] text-[var(--color-text)] font-medium">{value}</span>
    </div>
  );
}

/**
 * 简易日均成本曲线：从 purchaseDate 起按虚拟点采样 10 个时间点，
 * 计算每个时间点对应的"假设到那天为止"日均成本，展示成 SVG 折线 + 渐变填充。
 */
function CostLineChart({ item }: { item: ReturnType<typeof useStore.getState>['items'][number] }) {
  const W = 320, H = 140, PAD = 32;
  const m = computeMetrics(item);
  const totalDays = m.daysOwned;
  const points: { x: number; y: number; label: string; value: number }[] = [];
  const samples = 10;
  for (let i = 1; i <= samples; i++) {
    const days = Math.max(1, Math.round((totalDays / samples) * i));
    const cost = item.price / days;
    const date = dayjs(item.purchaseDate).add(days, 'day');
    points.push({ x: 0, y: 0, label: date.format('M.DD'), value: cost });
  }
  const max = Math.max(...points.map(p => p.value));
  const min = Math.min(...points.map(p => p.value));
  points.forEach((p, i) => {
    p.x = PAD + ((W - PAD * 2) * i) / (points.length - 1);
    p.y = PAD + (H - PAD * 2) * (1 - (p.value - min) / Math.max(max - min, 1));
  });

  const path = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  const fill = `${path} L ${points[points.length - 1].x} ${H - 12} L ${points[0].x} ${H - 12} Z`;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a0f030" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#a0f030" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <line key={i} x1={PAD} x2={W - PAD} y1={PAD + ((H - PAD * 2) / 6) * i} y2={PAD + ((H - PAD * 2) / 6) * i} stroke="#efeee8" strokeDasharray="2 3" />
        ))}
        <path d={fill} fill="url(#costGrad)" />
        <path d={path} stroke="#a0f030" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* 目标线 */}
        {item.targetDailyCost != null && item.targetDailyCost <= max && (
          <line
            x1={PAD} x2={W - PAD}
            y1={PAD + (H - PAD * 2) * (1 - (item.targetDailyCost - min) / Math.max(max - min, 1))}
            y2={PAD + (H - PAD * 2) * (1 - (item.targetDailyCost - min) / Math.max(max - min, 1))}
            stroke="#a0f030" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.7"
          />
        )}
      </svg>
      <div className="flex justify-between mt-1 text-[10px] text-[var(--color-text-tertiary)] px-1">
        {[points[0], points[2], points[4], points[6], points[8], points[points.length - 1]].map((p, i) => (
          <span key={i}>{p.label}</span>
        ))}
      </div>
    </div>
  );
}
