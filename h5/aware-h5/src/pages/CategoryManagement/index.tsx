import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Edit2, Trash2, ArrowUp, ArrowDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/db/store';
import { getIcon } from '@/lib/icons';
import { IconPicker } from '@/components/IconPicker';
import type { Category } from '@/types';

export function CategoryManagementPage() {
  const nav = useNavigate();
  const categories = useStore(s => s.categories);
  const items = useStore(s => s.items);
  const addCategory = useStore(s => s.addCategory);
  const updateCategory = useStore(s => s.updateCategory);
  const removeCategory = useStore(s => s.removeCategory);
  const reorderCategories = useStore(s => s.reorderCategories);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftIcon, setDraftIcon] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // 按 order 排序，"others" 永远最后
  const sorted = [...categories].sort((a, b) => {
    if (a.id === 'others') return 1;
    if (b.id === 'others') return -1;
    return (a.order ?? 999) - (b.order ?? 999);
  });

  // 上/下移：触屏友好的排序方式（替代 HTML5 drag）
  const orderable = sorted.filter(c => c.id !== 'others').map(c => c.id);
  const moveUp = (id: string) => {
    const idx = orderable.indexOf(id);
    if (idx <= 0) return;
    const next = [...orderable];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    reorderCategories(next);
  };
  const moveDown = (id: string) => {
    const idx = orderable.indexOf(id);
    if (idx === -1 || idx === orderable.length - 1) return;
    const next = [...orderable];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    reorderCategories(next);
  };

  const usageCount = (id: string) => items.filter(i => i.categoryId === id).length;

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setDraftName(c.name);
    setDraftIcon(c.iconName ?? '');
  };

  const saveEdit = () => {
    if (!editingId || !draftName.trim()) return;
    updateCategory(editingId, { name: draftName.trim(), iconName: draftIcon || undefined });
    setEditingId(null);
  };

  const handleCreate = () => {
    if (!draftName.trim()) return;
    addCategory({
      id: `cat_${Date.now()}`,
      name: draftName.trim(),
      iconName: draftIcon || '3d_handphone',
      order: categories.length,
    });
    setShowCreate(false);
    setDraftName('');
    setDraftIcon('');
  };

  const handleDelete = (c: Category) => {
    const used = usageCount(c.id);
    const msg = used > 0
      ? `该分类下有 ${used} 个物品，删除后会自动归到"其他"分类。确认删除「${c.name}」?`
      : `确认删除分类「${c.name}」?`;
    if (window.confirm(msg)) {
      removeCategory(c.id);
    }
  };

  return (
    <div className="min-h-full">
      <header className="pt-safe sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur-lg">
        <div className="px-2 pt-3 pb-3 flex items-center">
          <button onClick={() => nav(-1)} className="w-9 h-9 flex items-center justify-center">
            <ChevronLeft size={26} />
          </button>
          <h1 className="font-display text-[20px] flex-1 text-center pr-9">分类管理</h1>
        </div>
      </header>

      <p className="px-5 text-[12px] text-[var(--color-text-secondary)] mb-3">
        用 ↑ ↓ 按钮调整顺序，「其他」分类不可删除（兜底用）。
      </p>

      <section className="px-4">
        <div className="rounded-[20px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] divide-y divide-[var(--color-divider)] overflow-hidden">
          {sorted.map(c => {
            const isOthers = c.id === 'others';
            const isEditing = editingId === c.id;
            const used = usageCount(c.id);
            const idxInOrderable = orderable.indexOf(c.id);
            const isFirst = idxInOrderable === 0;
            const isLast = idxInOrderable === orderable.length - 1;
            return (
              <div
                key={c.id}
                className="flex items-center gap-2 px-3 py-3"
              >
                {/* 上下箭头排序（手机 touch 友好，替代 HTML5 drag） */}
                {!isOthers && !isEditing ? (
                  <div className="flex flex-col -gap-px shrink-0">
                    <button
                      onClick={() => moveUp(c.id)}
                      disabled={isFirst}
                      className="w-6 h-5 flex items-center justify-center text-[var(--color-text-tertiary)] disabled:opacity-25 active:bg-[var(--color-bg-elev-2)] rounded"
                    >
                      <ArrowUp size={12} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => moveDown(c.id)}
                      disabled={isLast}
                      className="w-6 h-5 flex items-center justify-center text-[var(--color-text-tertiary)] disabled:opacity-25 active:bg-[var(--color-bg-elev-2)] rounded"
                    >
                      <ArrowDown size={12} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <span className="w-6 shrink-0" />
                )}

                <button
                  onClick={() => isEditing ? setPickerOpen(true) : null}
                  className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shrink-0 bg-[var(--color-icon-tile-bg)]"
                >
                  <img src={getIcon(isEditing ? draftIcon : c.iconName)} alt="" className="w-full h-full object-contain" />
                </button>

                {isEditing ? (
                  <input
                    autoFocus
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    className="flex-1 bg-transparent outline-none text-[14px] border-b border-[var(--color-brand)] py-1"
                  />
                ) : (
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px]">{c.name}</div>
                    <div className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">{used} 个物品</div>
                  </div>
                )}

                {isEditing ? (
                  <button onClick={saveEdit} className="text-[12px] text-[var(--color-brand-deep)] font-bold px-2">保存</button>
                ) : (
                  <>
                    {!isOthers && (
                      <>
                        <button
                          onClick={() => startEdit(c)}
                          className="w-8 h-8 flex items-center justify-center text-[var(--color-text-tertiary)]"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="w-8 h-8 flex items-center justify-center text-[var(--color-error)]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-4 mt-4">
        <button
          onClick={() => { setShowCreate(true); setDraftName(''); setDraftIcon('3d_handphone'); }}
          className="w-full h-12 rounded-full bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] flex items-center justify-center gap-1.5 text-[14px] font-bold text-[var(--color-text)]"
        >
          <Plus size={16} />
          新增分类
        </button>
      </section>

      {/* 新增分类 modal */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)}
            />
            <motion.div
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[61] rounded-3xl bg-[var(--color-bg-elev-1)] p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-[18px]">新增分类</h2>
                <button onClick={() => setShowCreate(false)}><X size={18} /></button>
              </div>
              <div className="flex flex-col items-center gap-3 mb-4">
                <button
                  onClick={() => setPickerOpen(true)}
                  className="w-20 h-20 rounded-2xl bg-[var(--color-icon-tile-bg)] flex items-center justify-center"
                >
                  <img src={getIcon(draftIcon)} alt="" className="w-full h-full object-contain p-2" />
                </button>
                <input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="分类名称"
                  className="w-full text-center text-[16px] bg-[var(--color-bg-elev-2)] rounded-xl px-4 py-2 outline-none"
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={!draftName.trim()}
                className="w-full h-11 rounded-full bg-[var(--color-btn-dark)] text-[var(--color-text-on-dark)] font-bold text-[14px] disabled:opacity-50"
              >
                创建
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <IconPicker
        open={pickerOpen}
        selected={draftIcon}
        onClose={() => setPickerOpen(false)}
        onSelect={(n) => {
          setDraftIcon(n);
          if (editingId) {
            updateCategory(editingId, { iconName: n });
          }
        }}
      />
    </div>
  );
}
