import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeftRight, Plus, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useStore } from '@/db/store';
import { ProTag } from '@/components/icons';
import { IconPicker } from '@/components/IconPicker';
import type { Item, WishItem } from '@/types';
import { getIcon } from '@/lib/icons';

type Mode = 'asset' | 'wish';
type TargetMode = 'none' | 'price' | 'period' | 'custom';

export function AddPage() {
  const nav = useNavigate();
  const addItem = useStore(s => s.addItem);
  const addWish = useStore(s => s.addWish);
  const categories = useStore(s => s.categories);
  const [mode, setMode] = useState<Mode>('asset');

  const [name, setName] = useState('iPhone15,2 128GB');
  const [iconName, setIconName] = useState('3d_handphone');
  const [iconEmoji, setIconEmoji] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [purchaseDate] = useState(new Date());
  const [categoryId] = useState(categories[0]?.id ?? 'others');
  const [notes, setNotes] = useState('');

  const [targetMode, setTargetMode] = useState<TargetMode>('price');
  const [targetCost, setTargetCost] = useState('');

  const [retired, setRetired] = useState(false);
  const [sold, setSold] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [excludeTotal, setExcludeTotal] = useState(false);
  const [excludeDaily, setExcludeDaily] = useState(false);

  const submit = () => {
    const now = new Date().toISOString();
    if (mode === 'asset') {
      const it: Item = {
        id: crypto.randomUUID(),
        name: name.trim() || '未命名物品',
        iconName,
        categoryId,
        tagIds: [],
        price: Number(price) || 0,
        currency: 'CNY',
        purchaseDate: purchaseDate.toISOString(),
        targetDailyCost: targetCost ? Number(targetCost) : undefined,
        usageCount: 0,
        status: sold ? 'sold' : retired ? 'discarded' : 'inUse',
        isFavorite: false,
        isPinned: pinned,
        notes: notes.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      };
      addItem(it);
    } else {
      const w: WishItem = {
        id: crypto.randomUUID(),
        name: name.trim() || '心愿物品',
        iconName,
        price: Number(price) || 0,
        notes: notes.trim() || undefined,
        createdAt: now,
      };
      addWish(w);
    }
    nav(-1);
  };

  const cat = categories.find(c => c.id === categoryId);

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-bg)] overflow-auto no-scrollbar">
      {/* 顶栏 */}
      <header className="pt-safe sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur-lg">
        <div className="px-4 pt-3 pb-3 grid grid-cols-3 items-center">
          <button onClick={() => nav(-1)} className="-ml-1.5 w-9 h-9 flex items-center justify-center">
            <X size={26} strokeWidth={2.6} />
          </button>
          <div className="flex items-center justify-center gap-5">
            {(['asset', 'wish'] as Mode[]).map(m => (
              <button key={m} onClick={() => setMode(m)} className="relative font-display text-[18px] px-1">
                {/* lime green 下划线高亮（永远是浅色，所以选中态文字固定黑色保证对比） */}
                {mode === m && (
                  <span
                    className="absolute left-0 right-0 -bottom-0.5 h-2 rounded-full -z-10"
                    style={{ background: 'var(--color-brand)' }}
                  />
                )}
                <span className={mode === m ? 'text-[#1a1a1a]' : 'text-[var(--color-text-tertiary)]'}>
                  {m === 'asset' ? '资产' : '心愿'}
                </span>
              </button>
            ))}
          </div>
          <div />
        </div>
      </header>

      {/* 物品图标 + 名字 */}
      <section className="flex flex-col items-center pt-1 pb-5">
        <motion.button
          onClick={() => setPickerOpen(true)}
          whileTap={{ scale: 0.92 }}
          className="relative"
        >
          <div className="w-24 h-24 flex items-center justify-center">
            {iconEmoji ? (
              <span className="text-[68px] leading-none">{iconEmoji}</span>
            ) : (
              <img src={getIcon(iconName)} alt="" className="w-full h-full object-contain" />
            )}
          </div>
          <span className="absolute -right-2 bottom-2 w-6 h-6 rounded-full bg-[var(--color-bg-elev-1)] border border-[var(--color-stroke)] flex items-center justify-center shadow-[var(--shadow-card)]">
            <ArrowLeftRight size={12} />
          </span>
        </motion.button>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="点击输入名称"
          className="mt-2.5 text-center font-display text-[20px] bg-transparent outline-none placeholder:text-[var(--color-text-tertiary)] w-full"
        />
      </section>

      {/* 图标选择器 bottom sheet */}
      <IconPicker
        open={pickerOpen}
        selected={iconEmoji ? undefined : iconName}
        onClose={() => setPickerOpen(false)}
        onSelect={(n) => { setIconName(n); setIconEmoji(null); }}
        onSelectEmoji={(e) => { setIconEmoji(e); }}
      />

      {/* 价格行（圆角胶囊） */}
      <section className="px-4">
        <PillField icon="💰" label="价格" right={
          <input
            value={price}
            onChange={e => setPrice(e.target.value.replace(/[^\d.]/g, ''))}
            inputMode="decimal"
            placeholder="0.00"
            className="text-right font-display text-[18px] bg-transparent outline-none w-32 placeholder:text-[var(--color-text-tertiary)]"
          />
        } />
      </section>

      {/* 购买日期 / 类别 / 标签（3 行卡片） */}
      <section className="px-4 mt-3">
        <div className="rounded-[20px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] divide-y divide-[var(--color-divider)]">
          <NavRow icon="📅" label="购买日期" value={dayjs(purchaseDate).format('YYYY 年 M 月 D 日')} />
          <NavRow icon="🗂" label="类别" value={cat?.name ?? '-'} />
          <NavRow icon="🏷" label="标签" pro value="" />
        </div>
      </section>

      {/* 目标日均成本（4 tab） */}
      {mode === 'asset' && (
        <section className="px-4 mt-3">
          <div className="rounded-[20px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] p-4">
            <div className="flex items-center gap-1.5 text-[14px] font-bold mb-3">
              🎯 目标日均成本 <ProTag size={16} />
            </div>
            <div className="inline-flex w-full bg-[var(--color-bg-elev-3)] rounded-full p-0.5 text-[12px]">
              {(['none', 'price', 'period', 'custom'] as TargetMode[]).map(t => (
                <button key={t} onClick={() => setTargetMode(t)} className={clsx(
                  'flex-1 h-8 rounded-full font-medium transition',
                  targetMode === t ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] text-[#1a1a1a]' : 'text-[var(--color-text-secondary)]',
                )}>
                  {{ none: '不设定', price: '按价格', period: '按周期', custom: '自定义' }[t]}
                </button>
              ))}
            </div>
            {targetMode !== 'none' && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[13px] text-[var(--color-text-secondary)]">目标日均成本</span>
                <input
                  value={targetCost}
                  onChange={e => setTargetCost(e.target.value.replace(/[^\d.]/g, ''))}
                  inputMode="decimal"
                  placeholder="0.00"
                  className="text-right font-display text-[18px] bg-transparent outline-none w-24 placeholder:text-[var(--color-text-tertiary)]"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* 备注 + 封面图 + 保存按钮（视频里同一行） */}
      <section className="px-4 mt-3">
        <div className="rounded-[20px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] p-4">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="输入备注"
            rows={2}
            className="w-full text-[14px] bg-transparent outline-none resize-none placeholder:text-[var(--color-text-tertiary)]"
          />
          <div className="flex items-end gap-3 mt-2">
            <button className="w-16 h-16 rounded-2xl bg-[var(--color-bg-elev-2)] flex items-center justify-center relative shrink-0">
              <ImageIcon size={22} className="text-[var(--color-text-secondary)]" />
              <span className="absolute -top-1 -right-1"><ProTag size={18} /></span>
            </button>
            <button
              onClick={submit}
              className="flex-1 h-12 rounded-full bg-[var(--color-btn-dark)] text-[var(--color-text-on-dark)] font-bold text-[15px] active:scale-[0.98]"
            >
              保存
            </button>
          </div>
        </div>
      </section>

      {/* 附加项 */}
      {mode === 'asset' && (
        <section className="px-4 mt-3">
          <div className="rounded-[20px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] p-4">
            <div className="flex items-center gap-1.5 text-[14px] font-bold">
              📎 附加项 <ProTag size={16} />
            </div>
            <button className="mt-3 w-full h-12 rounded-full bg-[var(--color-bg-elev-2)] flex items-center justify-center gap-1 text-[14px] text-[var(--color-text-secondary)]">
              <Plus size={16} />
              添加物品
            </button>
          </div>
        </section>
      )}

      {/* 状态切换 */}
      {mode === 'asset' && (
        <>
          <section className="px-4 mt-3">
            <div className="rounded-[20px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] divide-y divide-[var(--color-divider)]">
              <ToggleRow icon="📦" label="已退役" value={retired} onChange={setRetired} />
              <ToggleRow icon="📤" label="卖出的" value={sold} onChange={setSold} />
            </div>
          </section>

          <section className="px-4 mt-3">
            <div className="rounded-[20px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] divide-y divide-[var(--color-divider)]">
              <ToggleRow icon="📌" label="置顶" pro value={pinned} onChange={setPinned} />
              <ToggleRow icon="🚫" label="不计入总资产" pro value={excludeTotal} onChange={setExcludeTotal} />
              <ToggleRow icon="📊" label="不计入日均" pro value={excludeDaily} onChange={setExcludeDaily} />
            </div>
          </section>
        </>
      )}

      <p className="text-center text-[11px] text-[var(--color-text-tertiary)] mt-6 px-6 pb-safe pb-12">
        数据存储于本地数据库，通过 iCloud 跨设备同步
      </p>
    </div>
  );
}

function PillField({ icon, label, right }: { icon: string; label: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 h-14 rounded-full bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)]">
      <span className="text-[16px]">{icon}</span>
      <span className="text-[14px] flex-1">{label}</span>
      {right}
    </div>
  );
}

function NavRow({ icon, label, value, pro }: { icon: string; label: string; value: string; pro?: boolean }) {
  return (
    <button className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-black/[0.02]">
      <span className="text-[16px]">{icon}</span>
      <span className="text-[14px] flex-1 flex items-center gap-1.5 text-left">
        {label} {pro && <ProTag size={16} />}
      </span>
      <span className="text-[13px] text-[var(--color-text-tertiary)]">{value}</span>
      <ChevronRight size={16} className="text-[var(--color-text-tertiary)]" />
    </button>
  );
}

function ToggleRow({ icon, label, pro, value, onChange }: {
  icon: string; label: string; pro?: boolean; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="text-[16px]">{icon}</span>
      <span className="text-[14px] flex-1 flex items-center gap-1.5">
        {label} {pro && <ProTag size={16} />}
      </span>
      <button
        onClick={() => onChange(!value)}
        className={clsx(
          'w-11 h-[26px] rounded-full relative transition-colors shrink-0',
          value ? 'bg-[var(--color-brand-deep)]' : 'bg-[var(--color-bg-elev-3)]',
        )}
      >
        <span className={clsx('absolute top-0.5 w-[22px] h-[22px] rounded-full bg-white shadow transition-all', value ? 'left-[21px]' : 'left-0.5')} />
      </button>
    </div>
  );
}
