import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/db/store';
import type { Tag } from '@/types';

const COLOR_PALETTE = [
  '#b5f23d', '#a0f030', '#5ac8fa', '#007aff', '#5856d6',
  '#af52de', '#ff2d55', '#ff3b30', '#ff9500', '#ffd84a',
  '#34c759', '#00c7be', '#8e8e93', '#1a1a1a',
];

export function TagManagementPage() {
  const nav = useNavigate();
  const tags = useStore(s => s.tags);
  const items = useStore(s => s.items);
  const addTag = useStore(s => s.addTag);
  const updateTag = useStore(s => s.updateTag);
  const removeTag = useStore(s => s.removeTag);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftColor, setDraftColor] = useState(COLOR_PALETTE[0]);
  const [showCreate, setShowCreate] = useState(false);

  const usageCount = (id: string) => items.filter(i => i.tagIds.includes(id)).length;

  const startEdit = (t: Tag) => {
    setEditingId(t.id);
    setDraftName(t.name);
    setDraftColor(t.color ?? COLOR_PALETTE[0]);
  };

  const saveEdit = () => {
    if (!editingId || !draftName.trim()) return;
    updateTag(editingId, { name: draftName.trim(), color: draftColor });
    setEditingId(null);
  };

  const handleCreate = () => {
    if (!draftName.trim()) return;
    addTag({
      id: `tag_${Date.now()}`,
      name: draftName.trim(),
      color: draftColor,
    });
    setShowCreate(false);
    setDraftName('');
    setDraftColor(COLOR_PALETTE[0]);
  };

  const handleDelete = (t: Tag) => {
    const used = usageCount(t.id);
    const msg = used > 0
      ? `「${t.name}」已被 ${used} 个物品使用，删除后会从这些物品上一并取消。确认?`
      : `确认删除标签「${t.name}」?`;
    if (window.confirm(msg)) removeTag(t.id);
  };

  return (
    <div className="min-h-full">
      <header className="pt-safe sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur-lg">
        <div className="px-2 pt-3 pb-3 flex items-center">
          <button onClick={() => nav(-1)} className="w-9 h-9 flex items-center justify-center">
            <ChevronLeft size={26} />
          </button>
          <h1 className="font-display text-[20px] flex-1 text-center pr-9">标签管理</h1>
        </div>
      </header>

      <p className="px-5 text-[12px] text-[var(--color-text-secondary)] mb-3">
        给物品打标签，方便筛选和分组。
      </p>

      <section className="px-4">
        <div className="rounded-[20px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] divide-y divide-[var(--color-divider)] overflow-hidden">
          {tags.length === 0 && (
            <div className="text-center py-10 text-[13px] text-[var(--color-text-tertiary)]">
              还没有标签，点下面新增一个
            </div>
          )}
          {tags.map(t => {
            const isEditing = editingId === t.id;
            const used = usageCount(t.id);
            return (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: isEditing ? draftColor : (t.color ?? '#999') }}
                />
                {isEditing ? (
                  <input
                    autoFocus
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    className="flex-1 bg-transparent outline-none text-[14px] border-b border-[var(--color-brand)] py-1"
                  />
                ) : (
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px]">{t.name}</div>
                    <div className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">{used} 个物品</div>
                  </div>
                )}
                {isEditing ? (
                  <>
                    <ColorPaletteInline value={draftColor} onChange={setDraftColor} />
                    <button onClick={saveEdit} className="text-[12px] text-[var(--color-brand-deep)] font-bold px-2">保存</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(t)}
                      className="w-8 h-8 flex items-center justify-center text-[var(--color-text-tertiary)]"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      className="w-8 h-8 flex items-center justify-center text-[var(--color-error)]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-4 mt-4">
        <button
          onClick={() => { setShowCreate(true); setDraftName(''); setDraftColor(COLOR_PALETTE[0]); }}
          className="w-full h-12 rounded-full bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] flex items-center justify-center gap-1.5 text-[14px] font-bold text-[var(--color-text)]"
        >
          <Plus size={16} />
          新增标签
        </button>
      </section>

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
                <h2 className="font-display text-[18px]">新增标签</h2>
                <button onClick={() => setShowCreate(false)}><X size={18} /></button>
              </div>
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="标签名称（如：每天用）"
                className="w-full text-[16px] bg-[var(--color-bg-elev-2)] rounded-xl px-4 py-2.5 outline-none"
              />
              <p className="text-[12px] text-[var(--color-text-secondary)] mt-3 mb-2">选个颜色</p>
              <div className="grid grid-cols-7 gap-2">
                {COLOR_PALETTE.map(c => (
                  <button
                    key={c}
                    onClick={() => setDraftColor(c)}
                    className={`aspect-square rounded-full border-2 ${draftColor === c ? 'border-[var(--color-text)]' : 'border-transparent'}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
              <button
                onClick={handleCreate}
                disabled={!draftName.trim()}
                className="mt-5 w-full h-11 rounded-full bg-[var(--color-btn-dark)] text-[var(--color-text-on-dark)] font-bold text-[14px] disabled:opacity-50"
              >
                创建
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ColorPaletteInline({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-6 h-6 rounded-full border-2 border-[var(--color-stroke)]"
        style={{ background: value }}
      />
      {open && (
        <div className="absolute right-0 top-8 z-10 bg-[var(--color-bg-elev-1)] rounded-2xl p-2 shadow-2xl border border-[var(--color-stroke)] w-44">
          <div className="grid grid-cols-7 gap-1.5">
            {COLOR_PALETTE.map(c => (
              <button
                key={c}
                onClick={() => { onChange(c); setOpen(false); }}
                className={`aspect-square rounded-full border-2 ${value === c ? 'border-[var(--color-text)]' : 'border-transparent'}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
