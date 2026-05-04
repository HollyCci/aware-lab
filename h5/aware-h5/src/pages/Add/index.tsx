import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, ArrowLeftRight, Plus, ChevronRight, Image as ImageIcon, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useStore } from '@/db/store';
import { ProTag } from '@/components/icons';
import { IconPicker } from '@/components/IconPicker';
import type { Item, WishItem, Attachment } from '@/types';
import { getIcon } from '@/lib/icons';

type Mode = 'asset' | 'wish';
type TargetMode = 'none' | 'price' | 'period' | 'custom';

export function AddPage() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const addItem = useStore(s => s.addItem);
  const updateItem = useStore(s => s.updateItem);
  const removeItem = useStore(s => s.removeItem);
  const addWish = useStore(s => s.addWish);
  const updateWish = useStore(s => s.updateWish);
  const removeWish = useStore(s => s.removeWish);
  const categories = useStore(s => s.categories);
  const allTags = useStore(s => s.tags);

  // 通过 id 查找现有 item / wish 决定是否编辑模式
  const editingItem = useStore(s => id ? s.items.find(i => i.id === id) : undefined);
  const editingWish = useStore(s => id ? s.wishlist.find(w => w.id === id) : undefined);
  const isEdit = !!(editingItem || editingWish);
  const isWishEdit = !!editingWish && !editingItem;

  const [mode, setMode] = useState<Mode>(isWishEdit ? 'wish' : 'asset');
  const [name, setName] = useState('');
  const [iconName, setIconName] = useState('3d_handphone');
  const [iconEmoji, setIconEmoji] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? 'others');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [targetMode, setTargetMode] = useState<TargetMode>('price');
  const [targetCost, setTargetCost] = useState('');

  const [retired, setRetired] = useState(false);
  const [sold, setSold] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [excludeTotal, setExcludeTotal] = useState(false);
  const [excludeDaily, setExcludeDaily] = useState(false);

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [catPickerOpen, setCatPickerOpen] = useState(false);
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const [attachSheetOpen, setAttachSheetOpen] = useState(false);

  // 编辑模式预填
  useEffect(() => {
    if (editingItem) {
      setMode('asset');
      setName(editingItem.name);
      setIconName(editingItem.iconName ?? '3d_handphone');
      setIconEmoji(null);
      setPrice(editingItem.price.toString());
      setPurchaseDate(new Date(editingItem.purchaseDate));
      setCategoryId(editingItem.categoryId);
      setSelectedTagIds(editingItem.tagIds);
      setNotes(editingItem.notes ?? '');
      setAttachments(editingItem.attachments ?? []);
      setTargetMode(editingItem.targetDailyCost != null ? 'custom' : 'none');
      setTargetCost(editingItem.targetDailyCost?.toString() ?? '');
      setRetired(editingItem.status === 'discarded');
      setSold(editingItem.status === 'sold');
      setPinned(editingItem.isPinned);
    } else if (editingWish) {
      setMode('wish');
      setName(editingWish.name);
      setIconName(editingWish.iconName ?? '3d_handphone');
      setIconEmoji(null);
      setPrice(editingWish.price.toString());
      setNotes(editingWish.notes ?? '');
    }
  }, [editingItem, editingWish]);

  const submit = () => {
    const now = new Date().toISOString();
    if (mode === 'asset') {
      const itemData: Omit<Item, 'createdAt'> = {
        id: editingItem?.id ?? crypto.randomUUID(),
        name: name.trim() || '未命名物品',
        iconName,
        categoryId,
        tagIds: selectedTagIds,
        price: Number(price) || 0,
        currency: 'CNY',
        purchaseDate: purchaseDate.toISOString(),
        targetDailyCost: targetMode !== 'none' && targetCost ? Number(targetCost) : undefined,
        usageCount: editingItem?.usageCount ?? 0,
        status: sold ? 'sold' : retired ? 'discarded' : 'inUse',
        isFavorite: editingItem?.isFavorite ?? false,
        isPinned: pinned,
        notes: notes.trim() || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        updatedAt: now,
      };
      if (editingItem) {
        updateItem(editingItem.id, itemData);
      } else {
        addItem({ ...itemData, createdAt: now });
      }
    } else {
      const wishData: WishItem = {
        id: editingWish?.id ?? crypto.randomUUID(),
        name: name.trim() || '心愿物品',
        iconName,
        price: Number(price) || 0,
        notes: notes.trim() || undefined,
        createdAt: editingWish?.createdAt ?? now,
      };
      if (editingWish) {
        updateWish(editingWish.id, wishData);
      } else {
        addWish(wishData);
      }
    }
    nav(-1);
  };

  const handleDelete = () => {
    if (!isEdit) return;
    const target = editingItem ?? editingWish;
    if (window.confirm(`确认删除「${target?.name}」？此操作不可撤销。`)) {
      if (editingItem) removeItem(editingItem.id);
      else if (editingWish) removeWish(editingWish.id);
      nav(-1);
    }
  };

  const cat = categories.find(c => c.id === categoryId);
  const selectedTags = useMemo(() => allTags.filter(t => selectedTagIds.includes(t.id)), [allTags, selectedTagIds]);

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-bg)] overflow-auto no-scrollbar">
      <header className="pt-safe sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur-lg">
        <div className="px-4 pt-3 pb-3 grid grid-cols-3 items-center">
          <button onClick={() => nav(-1)} className="-ml-1.5 w-9 h-9 flex items-center justify-center">
            <X size={26} strokeWidth={2.6} />
          </button>
          <div className="flex items-center justify-center gap-5">
            {(['asset', 'wish'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => !isEdit && setMode(m)}
                disabled={isEdit}
                className="relative font-display text-[18px] px-1 disabled:opacity-100"
              >
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
          <div className="flex justify-end">
            {isEdit && (
              <button onClick={handleDelete} className="w-9 h-9 flex items-center justify-center text-[var(--color-error)]">
                <Trash2 size={18} />
              </button>
            )}
          </div>
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

      <IconPicker
        open={pickerOpen}
        selected={iconEmoji ? undefined : iconName}
        onClose={() => setPickerOpen(false)}
        onSelect={(n) => { setIconName(n); setIconEmoji(null); }}
        onSelectEmoji={(e) => { setIconEmoji(e); }}
      />

      {/* 价格 */}
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

      {/* 资产模式才有 购买日期/类别/标签 三行（心愿没必要） */}
      {mode === 'asset' && (
        <section className="px-4 mt-3">
          <div className="rounded-[20px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] divide-y divide-[var(--color-divider)]">
            <NavRow
              icon="📅"
              label="购买日期"
              value={dayjs(purchaseDate).format('YYYY 年 M 月 D 日')}
              onClick={() => setDatePickerOpen(true)}
            />
            <NavRow
              icon="🗂"
              label="类别"
              value={cat?.name ?? '-'}
              onClick={() => setCatPickerOpen(true)}
            />
            <NavRow
              icon="🏷"
              label="标签"
              value={selectedTags.length > 0 ? selectedTags.map(t => t.name).join('、') : '未设置'}
              onClick={() => setTagPickerOpen(true)}
            />
          </div>
        </section>
      )}

      {/* 目标日均成本 */}
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

      {/* 备注 + 封面 + 保存 */}
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
            <button
              onClick={() => window.alert('H5 版本暂不支持上传封面图。在 iOS App 内可使用此功能。')}
              className="w-16 h-16 rounded-2xl bg-[var(--color-bg-elev-2)] flex items-center justify-center relative shrink-0"
            >
              <ImageIcon size={22} className="text-[var(--color-text-secondary)]" />
              <span className="absolute -top-1 -right-1"><ProTag size={18} /></span>
            </button>
            <button
              onClick={submit}
              className="flex-1 h-12 rounded-full bg-[var(--color-btn-dark)] text-[var(--color-text-on-dark)] font-bold text-[15px] active:scale-[0.98]"
            >
              {isEdit ? '保存修改' : '保存'}
            </button>
          </div>
        </div>
      </section>

      {/* 附加项 */}
      {mode === 'asset' && (
        <section className="px-4 mt-3">
          <div className="rounded-[20px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] p-4">
            <div className="flex items-center gap-1.5 text-[14px] font-bold mb-3">
              📎 附加项 <ProTag size={16} />
            </div>
            {attachments.map((a, i) => (
              <div key={a.id} className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-[var(--color-bg-elev-2)]">
                <span className="flex-1 text-[13px]">{a.name}</span>
                <span className="text-[13px] text-[var(--color-text-secondary)]">¥{a.price}</span>
                <button
                  onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-[var(--color-error)]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => setAttachSheetOpen(true)}
              className="w-full h-12 rounded-full bg-[var(--color-bg-elev-2)] flex items-center justify-center gap-1 text-[14px] text-[var(--color-text-secondary)]"
            >
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
        数据存储在浏览器 IndexedDB，可在「设置 → 备份与恢复」导出 JSON
      </p>

      {/* 日期选择器（用 native date input） */}
      <DatePickerSheet
        open={datePickerOpen}
        value={purchaseDate}
        onChange={setPurchaseDate}
        onClose={() => setDatePickerOpen(false)}
      />

      {/* 分类选择器 */}
      <CategoryPickerSheet
        open={catPickerOpen}
        categories={categories}
        selectedId={categoryId}
        onChange={(id) => { setCategoryId(id); setCatPickerOpen(false); }}
        onClose={() => setCatPickerOpen(false)}
      />

      {/* 标签多选选择器 */}
      <TagPickerSheet
        open={tagPickerOpen}
        tags={allTags}
        selectedIds={selectedTagIds}
        onChange={setSelectedTagIds}
        onClose={() => setTagPickerOpen(false)}
      />

      {/* 附加项添加 sheet */}
      <AttachmentAddSheet
        open={attachSheetOpen}
        onSubmit={(name, price) => {
          setAttachments(prev => [...prev, { id: crypto.randomUUID(), name, price }]);
          setAttachSheetOpen(false);
        }}
        onClose={() => setAttachSheetOpen(false)}
      />
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

function NavRow({ icon, label, value, pro, onClick }: {
  icon: string; label: string; value: string; pro?: boolean; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-black/[0.02] disabled:active:bg-transparent"
    >
      <span className="text-[16px]">{icon}</span>
      <span className="text-[14px] flex-1 flex items-center gap-1.5 text-left">
        {label} {pro && <ProTag size={16} />}
      </span>
      <span className="text-[13px] text-[var(--color-text-tertiary)] truncate max-w-[160px] text-right">{value}</span>
      {onClick && <ChevronRight size={16} className="text-[var(--color-text-tertiary)]" />}
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

// ============== Date Picker Sheet ==============
function DatePickerSheet({ open, value, onChange, onClose }: {
  open: boolean;
  value: Date;
  onChange: (d: Date) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(dayjs(value).format('YYYY-MM-DD'));
  useEffect(() => { if (open) setDraft(dayjs(value).format('YYYY-MM-DD')); }, [open, value]);

  return (
    <SheetWrapper open={open} onClose={onClose} title="选择购买日期">
      <div className="px-5 py-6">
        <input
          type="date"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          max={dayjs().format('YYYY-MM-DD')}
          className="w-full h-14 px-4 rounded-2xl bg-[var(--color-bg-elev-2)] text-[16px] outline-none text-[var(--color-text)]"
          style={{ colorScheme: 'inherit' }}
        />
        <button
          onClick={() => { onChange(new Date(draft)); onClose(); }}
          className="mt-5 w-full h-12 rounded-full bg-[var(--color-btn-dark)] text-[var(--color-text-on-dark)] font-bold text-[14px]"
        >
          确定
        </button>
      </div>
    </SheetWrapper>
  );
}

// ============== Category Picker Sheet ==============
function CategoryPickerSheet({ open, categories, selectedId, onChange, onClose }: {
  open: boolean;
  categories: { id: string; name: string; iconName?: string }[];
  selectedId: string;
  onChange: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <SheetWrapper open={open} onClose={onClose} title="选择分类">
      <div className="max-h-[60vh] overflow-y-auto no-scrollbar pb-safe pb-4">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className="w-full flex items-center gap-3 px-5 py-3 active:bg-black/[0.03]"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
              {c.iconName && <img src={getIcon(c.iconName)} alt="" className="w-full h-full object-contain" />}
            </div>
            <span className="flex-1 text-left text-[14px]">{c.name}</span>
            {selectedId === c.id && <Check size={18} className="text-[var(--color-brand-deep)]" />}
          </button>
        ))}
      </div>
    </SheetWrapper>
  );
}

// ============== Tag Multi-Picker Sheet ==============
function TagPickerSheet({ open, tags, selectedIds, onChange, onClose }: {
  open: boolean;
  tags: { id: string; name: string; color?: string }[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onClose: () => void;
}) {
  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);
  };
  return (
    <SheetWrapper open={open} onClose={onClose} title="选择标签（可多选）">
      <div className="px-5 pb-safe pb-4">
        {tags.length === 0 ? (
          <p className="text-center text-[13px] text-[var(--color-text-tertiary)] py-10">
            还没有标签<br />去 <span className="text-[var(--color-brand-deep)]">设置 → 标签管理</span> 创建
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 py-3">
            {tags.map(t => {
              const sel = selectedIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggle(t.id)}
                  className={clsx(
                    'h-10 px-4 rounded-full text-[13px] font-medium flex items-center gap-2 transition',
                    sel
                      ? 'bg-[var(--color-brand-deep)] text-[#1a1a1a]'
                      : 'bg-[var(--color-bg-elev-2)] text-[var(--color-text-secondary)]',
                  )}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: t.color ?? '#999' }} />
                  {t.name}
                  {sel && <Check size={14} />}
                </button>
              );
            })}
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-3 w-full h-12 rounded-full bg-[var(--color-btn-dark)] text-[var(--color-text-on-dark)] font-bold text-[14px]"
        >
          确定（已选 {selectedIds.length}）
        </button>
      </div>
    </SheetWrapper>
  );
}

// ============== Attachment Add Sheet ==============
function AttachmentAddSheet({ open, onSubmit, onClose }: {
  open: boolean;
  onSubmit: (name: string, price: number) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  useEffect(() => { if (!open) { setName(''); setPrice(''); } }, [open]);
  const canSubmit = name.trim().length > 0 && Number(price) > 0;

  return (
    <SheetWrapper open={open} onClose={onClose} title="添加附加项">
      <div className="px-5 pb-safe pb-4 space-y-3">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名称（如：保护壳、贴膜）"
          className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg-elev-2)] text-[14px] outline-none"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ''))}
          inputMode="decimal"
          placeholder="价格"
          className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg-elev-2)] text-[14px] outline-none"
        />
        <button
          onClick={() => onSubmit(name.trim(), Number(price))}
          disabled={!canSubmit}
          className="w-full h-12 rounded-full bg-[var(--color-btn-dark)] text-[var(--color-text-on-dark)] font-bold text-[14px] disabled:opacity-50"
        >
          添加
        </button>
      </div>
    </SheetWrapper>
  );
}

// ============== Sheet Wrapper ==============
function SheetWrapper({ open, onClose, title, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[55] bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[56] rounded-t-[28px] bg-[var(--color-bg-elev-1)]"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            <div className="flex justify-center py-2.5">
              <span className="w-9 h-1 rounded-full bg-[var(--color-bg-elev-3)]" />
            </div>
            <div className="px-5 pb-2 flex items-center justify-between">
              <h2 className="font-display text-[18px]">{title}</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[var(--color-text-secondary)]">
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
