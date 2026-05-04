import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpDown, Filter, CheckSquare, X, Check, Trash2, Archive, ArrowDown, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useStore } from '@/db/store';
import { computeMetrics, formatPrice, totalAssets, totalDailyCost } from '@/lib/calc';
import { getIcon } from '@/lib/icons';
import { DiamondIcon } from '@/components/icons';
import type { Item, ItemStatus } from '@/types';

type StatusFilter = 'all' | ItemStatus;
type SortKey = 'pinned' | 'name' | 'price' | 'purchaseDate' | 'dailyCost' | 'usageCount';
type SortDir = 'asc' | 'desc';

const statusFilterTabs: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'inUse', label: '服役中' },
  { id: 'discarded', label: '已退役' },
  { id: 'sold', label: '已卖出' },
];

const SORT_OPTIONS: { id: SortKey; label: string; defaultDir: SortDir }[] = [
  { id: 'pinned', label: '智能排序（置顶 + 最新）', defaultDir: 'desc' },
  { id: 'price', label: '按价格', defaultDir: 'desc' },
  { id: 'purchaseDate', label: '按购买日期', defaultDir: 'desc' },
  { id: 'dailyCost', label: '按日均成本', defaultDir: 'desc' },
  { id: 'usageCount', label: '按使用次数', defaultDir: 'desc' },
  { id: 'name', label: '按名称', defaultDir: 'asc' },
];

export function HomePage() {
  const items = useStore(s => s.items);
  const categories = useStore(s => s.categories);
  const tags = useStore(s => s.tags);
  const settings = useStore(s => s.settings);
  const removeItems = useStore(s => s.removeItems);
  const setItemsStatus = useStore(s => s.setItemsStatus);
  const nav = useNavigate();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // 排序
  const [sortKey, setSortKey] = useState<SortKey>('pinned');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [sortSheetOpen, setSortSheetOpen] = useState(false);

  // 筛选
  const [filterCatIds, setFilterCatIds] = useState<string[]>([]);
  const [filterTagIds, setFilterTagIds] = useState<string[]>([]);
  const [filterAchieved, setFilterAchieved] = useState<'all' | 'achieved' | 'not-achieved'>('all');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const filterActive = filterCatIds.length + filterTagIds.length > 0 || filterAchieved !== 'all';

  // 多选
  const [multiMode, setMultiMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const enterMulti = (initialId?: string) => {
    setMultiMode(true);
    if (initialId) setSelectedIds(new Set([initialId]));
  };

  const exitMulti = () => {
    setMultiMode(false);
    setSelectedIds(new Set());
  };

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

  // 三层过滤：状态 → 分类/标签 → 达标
  const display = useMemo(() => {
    let list = statusFilter === 'all' ? items : items.filter(i => i.status === statusFilter);
    if (filterCatIds.length > 0) {
      list = list.filter(i => filterCatIds.includes(i.categoryId));
    }
    if (filterTagIds.length > 0) {
      list = list.filter(i => i.tagIds.some(t => filterTagIds.includes(t)));
    }
    if (filterAchieved !== 'all') {
      list = list.filter(i => {
        const m = computeMetrics(i);
        return filterAchieved === 'achieved' ? m.isAchievedCost : !m.isAchievedCost;
      });
    }

    const sorted = [...list].sort((a, b) => {
      if (sortKey === 'pinned') {
        const pinDiff = Number(b.isPinned) - Number(a.isPinned);
        if (pinDiff !== 0) return pinDiff;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      let av: number | string = 0;
      let bv: number | string = 0;
      switch (sortKey) {
        case 'name': av = a.name; bv = b.name; break;
        case 'price': av = a.price; bv = b.price; break;
        case 'purchaseDate': av = new Date(a.purchaseDate).getTime(); bv = new Date(b.purchaseDate).getTime(); break;
        case 'dailyCost': av = computeMetrics(a).dailyCost; bv = computeMetrics(b).dailyCost; break;
        case 'usageCount': av = a.usageCount; bv = b.usageCount; break;
      }
      const cmp = typeof av === 'string'
        ? av.localeCompare(bv as string, 'zh-Hans')
        : (av as number) - (bv as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [items, statusFilter, sortKey, sortDir, filterCatIds, filterTagIds, filterAchieved]);

  const fmt = (n: number, dec: 0 | 1 | 2 = settings.decimalPlaces) =>
    formatPrice(n, { symbol: settings.currencySymbol, decimals: dec });

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`确认删除 ${selectedIds.size} 件物品？此操作不可撤销。`)) {
      removeItems(Array.from(selectedIds));
      exitMulti();
    }
  };

  const handleBatchStatus = (status: ItemStatus) => {
    if (selectedIds.size === 0) return;
    setItemsStatus(Array.from(selectedIds), status);
    exitMulti();
  };

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
              <div className="font-display text-[28px] tracking-tight">{fmt(stats.total, 2)}</div>
            </div>
            <div>
              <div className="text-[11px] text-[var(--color-text-secondary)] mb-1">日均成本</div>
              <div className="font-display text-[28px] tracking-tight">{fmt(stats.dailyCost, 2)}</div>
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

      {/* 筛选 chips + 工具按钮（多选模式时换成 顶栏） */}
      {!multiMode ? (
        <section className="px-4 mt-4 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {statusFilterTabs.map(t => (
              <button
                key={t.id}
                onClick={() => setStatusFilter(t.id)}
                className={clsx(
                  'h-9 px-4 rounded-full text-[13px] font-bold whitespace-nowrap transition',
                  statusFilter === t.id
                    ? 'bg-[var(--color-btn-dark)] text-[var(--color-text-on-dark)]'
                    : 'bg-[var(--color-bg-elev-1)] text-[var(--color-text-secondary)]',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <ToolBtn icon={ArrowUpDown} onClick={() => setSortSheetOpen(true)} />
          <ToolBtn icon={Filter} onClick={() => setFilterSheetOpen(true)} active={filterActive} />
          <ToolBtn icon={CheckSquare} onClick={() => enterMulti()} />
        </section>
      ) : (
        <section className="px-4 mt-4 flex items-center gap-3">
          <button onClick={exitMulti} className="text-[14px] text-[var(--color-text-secondary)]">取消</button>
          <div className="flex-1 text-center text-[14px] font-bold">
            已选 {selectedIds.size} 项
          </div>
          <button
            onClick={() => {
              if (selectedIds.size === display.length) setSelectedIds(new Set());
              else setSelectedIds(new Set(display.map(i => i.id)));
            }}
            className="text-[14px] text-[var(--color-brand-deep)] font-bold"
          >
            {selectedIds.size === display.length ? '取消全选' : '全选'}
          </button>
        </section>
      )}

      {/* 物品单列卡片 */}
      <section className="px-4 mt-3 space-y-3 pb-32">
        {display.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            fmt={fmt}
            multiMode={multiMode}
            selected={selectedIds.has(item.id)}
            onClick={() => {
              if (multiMode) toggleSelect(item.id);
              else nav(`/item/${item.id}`);
            }}
            onLongPress={() => { if (!multiMode) enterMulti(item.id); }}
          />
        ))}
        {display.length === 0 && (
          <div className="text-center py-20 text-[var(--color-text-tertiary)] text-sm">
            {filterActive ? '当前筛选下没有物品，换个条件试试' : '暂无物品'}
          </div>
        )}
      </section>

      {/* Sort sheet */}
      <SortSheet
        open={sortSheetOpen}
        onClose={() => setSortSheetOpen(false)}
        sortKey={sortKey}
        sortDir={sortDir}
        onChange={(k, d) => { setSortKey(k); setSortDir(d); setSortSheetOpen(false); }}
      />

      {/* Filter sheet */}
      <FilterSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        categories={categories}
        tags={tags}
        catIds={filterCatIds}
        tagIds={filterTagIds}
        achieved={filterAchieved}
        onChangeCats={setFilterCatIds}
        onChangeTags={setFilterTagIds}
        onChangeAchieved={setFilterAchieved}
        onReset={() => { setFilterCatIds([]); setFilterTagIds([]); setFilterAchieved('all'); }}
      />

      {/* 多选模式底部操作栏 */}
      <AnimatePresence>
        {multiMode && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-0 inset-x-0 z-50 pb-safe pointer-events-none"
          >
            <div className="px-4 pb-3 pt-2 max-w-md mx-auto">
              <div className="pointer-events-auto bg-[var(--color-bg-elev-1)] rounded-full shadow-[var(--shadow-tabbar)] flex items-center justify-around py-1.5">
                <BatchBtn icon={Archive} label="退役" disabled={selectedIds.size === 0} onClick={() => handleBatchStatus('discarded')} />
                <BatchBtn icon={Check} label="服役" disabled={selectedIds.size === 0} onClick={() => handleBatchStatus('inUse')} />
                <BatchBtn icon={Trash2} label="删除" danger disabled={selectedIds.size === 0} onClick={handleBatchDelete} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolBtn({ icon: Icon, onClick, active }: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-9 h-9 rounded-full flex items-center justify-center transition',
        active
          ? 'bg-[var(--color-brand)] text-[#1a1a1a]'
          : 'bg-[var(--color-bg-elev-1)] text-[var(--color-text)]',
      )}
    >
      <Icon size={16} strokeWidth={2.2} />
    </button>
  );
}

function BatchBtn({ icon: Icon, label, onClick, disabled, danger }: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-full transition',
        disabled ? 'opacity-40' : 'active:bg-[var(--color-bg-elev-2)]',
        danger ? 'text-[var(--color-error)]' : 'text-[var(--color-text)]',
      )}
    >
      <Icon size={20} />
      <span className="text-[11px]">{label}</span>
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

// ================ ItemCard with longpress + multi-select =================
function ItemCard({
  item, fmt, multiMode, selected, onClick, onLongPress,
}: {
  item: Item;
  fmt: (n: number, d?: 0 | 1 | 2) => string;
  multiMode: boolean;
  selected: boolean;
  onClick: () => void;
  onLongPress?: () => void;
}) {
  const m = computeMetrics(item);
  const statusLabel = item.status === 'inUse' ? '服役中' : item.status === 'idle' ? '闲置' : item.status === 'sold' ? '已卖出' : item.status === 'discarded' ? '已退役' : '丢失';
  const isInUse = item.status === 'inUse' || item.status === 'idle';
  const progress = item.targetDailyCost
    ? Math.min(100, (item.targetDailyCost / Math.max(m.dailyCost, item.targetDailyCost)) * 100)
    : 0;

  // 长按检测
  let pressTimer: ReturnType<typeof setTimeout> | null = null;
  const handlePressStart = () => {
    if (!onLongPress) return;
    pressTimer = setTimeout(() => { onLongPress(); pressTimer = null; }, 500);
  };
  const handlePressEnd = () => {
    if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
  };

  return (
    <motion.article
      onClick={onClick}
      onPointerDown={handlePressStart}
      onPointerUp={handlePressEnd}
      onPointerLeave={handlePressEnd}
      onPointerCancel={handlePressEnd}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      className={clsx(
        'relative rounded-[24px] bg-[var(--color-bg-elev-1)] p-4 shadow-[var(--shadow-card)] cursor-pointer',
        selected && 'ring-2 ring-[var(--color-brand-deep)]',
      )}
    >
      {multiMode && (
        <span
          className={clsx(
            'absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition',
            selected
              ? 'bg-[var(--color-brand-deep)] text-white'
              : 'border-2 border-[var(--color-text-tertiary)] bg-[var(--color-bg-elev-1)]',
          )}
        >
          {selected && <Check size={12} strokeWidth={3} />}
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-elev-2)] flex items-center justify-center overflow-hidden shrink-0">
          {item.iconName && <img src={getIcon(item.iconName)} alt="" className="w-full h-full object-contain" />}
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[15px] font-bold truncate">{item.name}</div>
            {!multiMode && (
              <span
                className={clsx(
                  'shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium',
                  isInUse
                    ? 'text-[#1a1a1a] bg-[#ecfacc]'
                    : 'text-[var(--color-text-secondary)] bg-[var(--color-bg-elev-3)]',
                )}
              >
                <span className={clsx('w-1.5 h-1.5 rounded-full', isInUse ? 'bg-[var(--color-brand-deep)]' : 'bg-[var(--color-text-tertiary)]')} />
                {statusLabel}
              </span>
            )}
          </div>
          <div className="text-[12px] text-[var(--color-text-secondary)] mt-1">
            {fmt(item.price)} · 已使用 {item.usageCount}
          </div>
          <div className="font-display text-[20px] mt-1.5">
            {fmt(m.dailyCost, 2)}<span className="text-[12px] font-medium text-[var(--color-text-secondary)]">/天</span>
          </div>
        </div>
      </div>

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

// ============== Sort Sheet ==============
function SortSheet({ open, onClose, sortKey, sortDir, onChange }: {
  open: boolean;
  onClose: () => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onChange: (k: SortKey, d: SortDir) => void;
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
              <h2 className="font-display text-[18px]">排序方式</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[var(--color-text-secondary)]">
                <X size={18} />
              </button>
            </div>
            <div className="px-3 pb-safe pb-4">
              {SORT_OPTIONS.map(opt => {
                const isActive = sortKey === opt.id;
                return (
                  <div key={opt.id} className="flex items-center">
                    <button
                      onClick={() => onChange(opt.id, isActive ? sortDir : opt.defaultDir)}
                      className={clsx(
                        'flex-1 text-left px-4 py-3 rounded-2xl text-[14px] font-medium',
                        isActive ? 'text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]',
                      )}
                    >
                      {opt.label}
                    </button>
                    {isActive && opt.id !== 'pinned' && (
                      <button
                        onClick={() => onChange(opt.id, sortDir === 'asc' ? 'desc' : 'asc')}
                        className="w-9 h-9 mr-2 rounded-full bg-[var(--color-brand-bg)] text-[var(--color-brand-deep)] flex items-center justify-center"
                      >
                        {sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      </button>
                    )}
                    {isActive && (
                      <span className="text-[var(--color-brand-deep)] mr-3"><Check size={18} /></span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============== Filter Sheet ==============
function FilterSheet({
  open, onClose, categories, tags, catIds, tagIds, achieved,
  onChangeCats, onChangeTags, onChangeAchieved, onReset,
}: {
  open: boolean;
  onClose: () => void;
  categories: { id: string; name: string; iconName?: string }[];
  tags: { id: string; name: string; color?: string }[];
  catIds: string[];
  tagIds: string[];
  achieved: 'all' | 'achieved' | 'not-achieved';
  onChangeCats: (v: string[]) => void;
  onChangeTags: (v: string[]) => void;
  onChangeAchieved: (v: 'all' | 'achieved' | 'not-achieved') => void;
  onReset: () => void;
}) {
  const toggleCat = (id: string) => {
    onChangeCats(catIds.includes(id) ? catIds.filter(x => x !== id) : [...catIds, id]);
  };
  const toggleTag = (id: string) => {
    onChangeTags(tagIds.includes(id) ? tagIds.filter(x => x !== id) : [...tagIds, id]);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[55] bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[56] rounded-t-[28px] bg-[var(--color-bg-elev-1)] max-h-[78vh] flex flex-col"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            <div className="flex justify-center py-2.5">
              <span className="w-9 h-1 rounded-full bg-[var(--color-bg-elev-3)]" />
            </div>
            <div className="px-5 pb-2 flex items-center justify-between">
              <h2 className="font-display text-[18px]">筛选</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[var(--color-text-secondary)]">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-5">
              <div className="text-[12px] text-[var(--color-text-secondary)] mt-2 mb-2">分类</div>
              <div className="flex flex-wrap gap-2 mb-5">
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => toggleCat(c.id)}
                    className={clsx(
                      'h-9 px-3 rounded-full text-[12px] font-medium flex items-center gap-1.5',
                      catIds.includes(c.id)
                        ? 'bg-[var(--color-brand-deep)] text-[#1a1a1a]'
                        : 'bg-[var(--color-bg-elev-2)] text-[var(--color-text-secondary)]',
                    )}
                  >
                    {c.iconName && <img src={getIcon(c.iconName)} className="w-4 h-4 object-contain" alt="" />}
                    {c.name}
                  </button>
                ))}
              </div>

              <div className="text-[12px] text-[var(--color-text-secondary)] mb-2">标签</div>
              <div className="flex flex-wrap gap-2 mb-5">
                {tags.length === 0 && (
                  <div className="text-[12px] text-[var(--color-text-tertiary)]">暂无标签，去 设置 → 标签管理 创建</div>
                )}
                {tags.map(t => (
                  <button
                    key={t.id}
                    onClick={() => toggleTag(t.id)}
                    className={clsx(
                      'h-9 px-3 rounded-full text-[12px] font-medium flex items-center gap-1.5',
                      tagIds.includes(t.id)
                        ? 'bg-[var(--color-brand-deep)] text-[#1a1a1a]'
                        : 'bg-[var(--color-bg-elev-2)] text-[var(--color-text-secondary)]',
                    )}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: t.color ?? '#999' }} />
                    {t.name}
                  </button>
                ))}
              </div>

              <div className="text-[12px] text-[var(--color-text-secondary)] mb-2">达标状态</div>
              <div className="inline-flex bg-[var(--color-bg-elev-2)] rounded-full p-0.5 text-[12px] mb-5">
                {([
                  { id: 'all', label: '全部' },
                  { id: 'achieved', label: '已达成' },
                  { id: 'not-achieved', label: '未达成' },
                ] as const).map(o => (
                  <button
                    key={o.id}
                    onClick={() => onChangeAchieved(o.id)}
                    className={clsx(
                      'px-3 h-8 rounded-full font-medium transition',
                      achieved === o.id ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] text-[#1a1a1a]' : 'text-[var(--color-text-secondary)]',
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 pb-safe pb-4 flex gap-3">
              <button
                onClick={onReset}
                className="flex-1 h-11 rounded-full bg-[var(--color-bg-elev-2)] font-bold text-[14px] text-[var(--color-text-secondary)]"
              >
                重置
              </button>
              <button
                onClick={onClose}
                className="flex-1 h-11 rounded-full bg-[var(--color-btn-dark)] text-[var(--color-text-on-dark)] font-bold text-[14px]"
              >
                确定
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
