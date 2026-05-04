import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, Check } from 'lucide-react';
import clsx from 'clsx';
import { DiamondIcon } from '@/components/icons';

type Group = 'personal' | 'family';
type Plan = 'life' | 'year' | 'week';

const PLANS = {
  personal: [
    { id: 'life' as Plan, name: '终身会员', price: 88, original: 198, sub: '一次费用，永久享用', highlight: '限时优惠' },
    { id: 'year' as Plan, name: '年会员', price: 58, sub: '低至 ¥0.16/天' },
    { id: 'week' as Plan, name: '周会员', price: 18, sub: '低至 ¥2.5/天' },
  ],
  family: [
    { id: 'life' as Plan, name: '家庭终身', price: 198, original: 388, sub: '家庭共享，永久享用', highlight: '限时优惠' },
    { id: 'year' as Plan, name: '家庭年会员', price: 128, sub: '家庭共享' },
    { id: 'week' as Plan, name: '家庭周会员', price: 28, sub: '家庭共享' },
  ],
};

const FEATURES = [
  { emoji: '📊', label: '多维度数据分析' },
  { emoji: '🎨', label: '趣味贴纸模式' },
  { emoji: '🔺', label: '分类个数无限制' },
  { emoji: '🏷️', label: '自定义标签关联资产' },
  { emoji: '☁️', label: '会员&数据多设备同步使用（仅 iOS）' },
  { emoji: '✅', label: '纯净无广告' },
  { emoji: '✨', label: '后续新功能自动获得' },
];

export function SubscribePage() {
  const nav = useNavigate();
  const [group, setGroup] = useState<Group>('personal');
  const [plan, setPlan] = useState<Plan>('life');

  const sku = PLANS[group].find(p => p.id === plan)!;

  return (
    <div className="min-h-full pb-[140px] relative">
      {/* lime green 顶部背景区 */}
      <div
        className="absolute inset-x-0 top-0 h-[260px] -z-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, #b8f23d 0%, #a0f030 35%, transparent 100%)',
        }}
      />

      {/* 顶部 X（不带"资产/心愿"切换，那是 Add 页面残留视觉） */}
      <header className="relative pt-safe">
        <div className="px-4 pt-3">
          <button onClick={() => nav(-1)} className="w-9 h-9 flex items-center justify-center -ml-1.5">
            <X size={26} strokeWidth={2.6} />
          </button>
        </div>
      </header>

      {/* 个人版 / 家庭版 切换：tab + 下方圆角内容卡 */}
      <section className="relative px-6 mt-1">
        <div className="flex items-end gap-2">
          {(['personal', 'family'] as Group[]).map(g => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={clsx(
                'flex-1 h-11 rounded-t-2xl flex items-center justify-center gap-1.5 text-[14px] font-bold transition',
                group === g
                  ? 'bg-[var(--color-bg)] text-[var(--color-text)]'
                  : 'bg-[#a0f030]/60 text-[var(--color-text)]/70',
              )}
            >
              <DiamondIcon size={14} />
              {g === 'personal' ? '个人版' : '家庭版'}
            </button>
          ))}
        </div>

        {/* 内容卡片 */}
        <div className="bg-[var(--color-bg)] rounded-b-[28px] -mt-px pt-6 pb-2 px-4">
          {/* 标题 + 麦穗 */}
          <div className="flex items-center justify-center gap-3">
            <Wheat side="left" />
            <h1 className="font-display text-[24px] text-center text-[var(--color-text)]">解锁有数专业版</h1>
            <Wheat side="right" />
          </div>
          <p className="text-center text-[12px] text-[var(--color-text-secondary)] mt-1">
            告别冲动消费 · 拥抱长期主义
          </p>

          {/* 套餐横滑 */}
          <div className="mt-5 -mx-4 px-4 flex gap-3 overflow-x-auto no-scrollbar">
            {PLANS[group].map(p => (
              <PlanCard
                key={p.id}
                plan={p}
                selected={plan === p.id}
                onClick={() => setPlan(p.id)}
              />
            ))}
          </div>

          {/* 已付费但未生效 */}
          <button className="mt-4 flex items-center gap-1 text-[12px] text-[var(--color-text-secondary)]">
            已付费但未生效，<span className="text-[var(--color-text)] font-bold">请恢复购买</span>
            <ChevronRight size={12} />
          </button>
        </div>
      </section>

      {/* 超多 PRO 功能 */}
      <section className="relative px-4 mt-6">
        <h2 className="text-[15px] font-bold mb-3 px-1">超多 PRO 功能</h2>
        <div className="rounded-[24px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] p-1.5">
          {FEATURES.map(f => (
            <div key={f.label} className="flex items-center gap-3 px-3 py-3">
              <span
                className="w-7 h-7 rounded-md flex items-center justify-center text-[14px]"
                style={{ background: 'var(--color-brand-bg)' }}
              >
                {f.emoji}
              </span>
              <div className="flex-1 text-[14px]">{f.label}</div>
              <Check size={18} className="text-[var(--color-brand-deep)]" />
            </div>
          ))}
        </div>
      </section>

      {/* 底部 CTA */}
      <div className="fixed bottom-0 inset-x-0 pb-safe bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/95 to-transparent pt-6 px-4">
        <button
          onClick={() => window.alert(
            `H5 演示版无支付能力（也不会有，这是个人 lab 项目）。\n\n` +
            `选中套餐：${sku.name} ¥${sku.price}\n` +
            `如果你想体验付费版，请去 iOS 「有数 / Aware」App Store 下载。`,
          )}
          className="
            w-full h-[52px] rounded-full bg-[var(--color-brand)] text-[#1a1a1a]
            font-bold text-[16px] flex items-center justify-center gap-2
            active:scale-[0.98] transition
          "
        >
          立即解锁
        </button>
        <p className="text-[10px] text-center text-[var(--color-text-tertiary)] mt-2">
          H5 演示版本 · 不接入支付
        </p>
      </div>
    </div>
  );
}

function PlanCard({
  plan, selected, onClick,
}: {
  plan: { id: Plan; name: string; price: number; original?: number; sub: string; highlight?: string };
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'shrink-0 w-[140px] text-left rounded-2xl p-3.5 relative transition border-2',
        selected
          ? 'border-[var(--color-brand)] bg-[var(--color-brand-bg)]/30'
          : 'border-transparent bg-[var(--color-bg-elev-1)]',
      )}
    >
      {plan.highlight && (
        <span
          className="absolute -top-2 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
          style={{ background: '#ff8a00' }}
        >
          {plan.highlight}
        </span>
      )}
      <div className="text-[14px] font-bold">{plan.name}</div>
      <div className="text-[11px] text-[var(--color-text-secondary)] mt-1 leading-tight">{plan.sub}</div>
      <div className="font-display text-[22px] mt-2 flex items-baseline gap-1">
        ¥{plan.price}
        {plan.original && (
          <span className="text-[11px] text-[var(--color-text-tertiary)] line-through font-medium">¥{plan.original}.00</span>
        )}
      </div>
    </button>
  );
}

function Wheat({ side }: { side: 'left' | 'right' }) {
  // 视频里左右对称的麦穗装饰（lime green）
  const transform = side === 'right' ? 'scaleX(-1)' : '';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ transform }}>
      <path d="M12 22 V8" stroke="#8cd824" strokeWidth="1.5" strokeLinecap="round" />
      {[0, 1, 2, 3].map(i => (
        <ellipse key={i} cx={9 - i * 0.4} cy={10 + i * 3} rx="2.5" ry="1.4" fill="#a0f030" transform={`rotate(-30 ${9 - i * 0.4} ${10 + i * 3})`} />
      ))}
    </svg>
  );
}
