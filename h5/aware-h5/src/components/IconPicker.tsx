import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import clsx from 'clsx';
import { getCategorizedIcons, getIconUrl } from '@/lib/icon-catalog';

type Tab = 'sticker' | 'emoji' | 'photo';

const EMOJI_CATEGORIES = [
  { id: 'recent', name: '常用', emoji: '⭐', list: ['📱', '💻', '🎧', '⌚', '📷', '🎮', '🚗', '🏠', '👕', '👟', '👜', '💄'] },
  { id: 'digital', name: '数码', emoji: '📱', list: ['📱', '💻', '🖥', '⌨️', '🖱', '🖨', '📷', '📸', '📹', '🎥', '📺', '📻', '🎙', '🎚', '🎛', '🎧', '⌚', '📱', '🔋', '🔌', '💾', '💿', '📀', '🎮', '🕹', '🎚'] },
  { id: 'home', name: '家居', emoji: '🛋', list: ['🛋', '🛏', '🚪', '🪑', '🛁', '🚿', '🚽', '🪟', '🪞', '🪴', '🕯', '💡', '🔦', '🧴', '🧻', '🧹', '🧺', '🧽'] },
  { id: 'wear', name: '穿戴', emoji: '👕', list: ['👕', '👔', '👖', '🧥', '🧣', '🧤', '🧦', '👗', '👘', '🥻', '👙', '👚', '🩱', '🩲', '🩳', '👒', '🎩', '🧢', '⛑', '👑', '👜', '👛', '👝', '🎒', '👞', '👟', '🥾', '👠', '👡', '👢', '🩴', '⌚', '📿', '💍', '💎', '🕶', '👓'] },
  { id: 'beauty', name: '美妆', emoji: '💄', list: ['💄', '💋', '💅', '🧴', '🧼', '🪥', '🪒', '🧻', '🪞', '👁'] },
  { id: 'travel', name: '出行', emoji: '🚗', list: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛵', '🏍', '🛺', '🚲', '🛴', '🛹', '🛼', '🚂', '🚆', '🚇', '🚈', '🚉', '✈️', '🛫', '🛬', '🛩', '🚀', '🛸', '🚁', '⛵', '🚤', '🛥', '🛳', '⛴', '🚢'] },
  { id: 'food', name: '美食', emoji: '🍔', list: ['🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🥗', '🍣', '🍱', '🍜', '🍝', '🍙', '🍚', '🍛', '🥘', '🍲', '🥣', '🍦', '🍩', '🍪', '🎂', '🍰', '🧁', '🍫', '🍬', '🍭', '☕', '🍵', '🧋', '🥤', '🍺', '🍻', '🍷', '🥂'] },
  { id: 'sport', name: '运动', emoji: '⚽', list: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥋', '🥊', '⛳', '🏹', '🎣', '🤿', '🎽', '🛷', '🥌', '🎿', '⛷', '🏂', '🏄', '🚴', '🚵', '🏋️', '🤸', '🧘'] },
];

interface Props {
  open: boolean;
  selected?: string;            // 当前选中的 iconName
  onClose: () => void;
  onSelect: (iconName: string) => void;  // sticker tab：iconName；emoji tab：emoji 字符
  onSelectEmoji?: (emoji: string) => void;
}

export function IconPicker({ open, selected, onClose, onSelect, onSelectEmoji }: Props) {
  const [tab, setTab] = useState<Tab>('sticker');
  const [catId, setCatId] = useState<string>('featured');
  const [emojiCatId, setEmojiCatId] = useState<string>('recent');
  const [query, setQuery] = useState('');

  const cats = useMemo(() => getCategorizedIcons(), []);
  const currentCat = cats.find((c) => c.id === catId) ?? cats[0];

  // 搜索过滤
  const stickerList = useMemo(() => {
    const list = currentCat?.iconNames ?? [];
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((n) => n.toLowerCase().includes(q));
  }, [currentCat, query]);

  // 关闭时复位
  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 遮罩 */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* 底部 sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[61] bg-[var(--color-bg-elev-1)] rounded-t-[28px] flex flex-col"
            style={{ height: '78vh' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            {/* 抓手 */}
            <div className="flex justify-center py-2.5">
              <span className="w-9 h-1 rounded-full bg-[var(--color-bg-elev-3)]" />
            </div>

            {/* 顶栏：tab + 关闭 */}
            <div className="px-4 flex items-center gap-3">
              <div className="flex-1 flex items-center justify-center gap-5">
                {(['photo', 'emoji', 'sticker'] as Tab[]).map((t) => (
                  <button key={t} onClick={() => setTab(t)} className="relative font-display text-[16px]">
                    <span className={tab === t ? 'text-[var(--color-text)]' : 'text-[var(--color-text-tertiary)]'}>
                      {t === 'photo' ? '相册' : t === 'emoji' ? 'Emoji' : '3D 图标'}
                    </span>
                    {tab === t && (
                      <span className="absolute left-0 right-0 -bottom-0.5 h-1.5 rounded-full -z-10" style={{ background: 'var(--color-brand)' }} />
                    )}
                  </button>
                ))}
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--color-bg-elev-3)] flex items-center justify-center">
                <X size={16} />
              </button>
            </div>

            {/* 搜索 */}
            {tab === 'sticker' && (
              <div className="px-4 mt-3">
                <div className="flex items-center gap-2 px-3 h-9 rounded-full bg-[var(--color-bg-elev-2)]">
                  <Search size={14} className="text-[var(--color-text-tertiary)]" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="搜索图标"
                    className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-[var(--color-text-tertiary)]"
                  />
                </div>
              </div>
            )}

            {/* 分类 chips */}
            {tab === 'sticker' && (
              <div className="mt-3 px-4 overflow-x-auto no-scrollbar">
                <div className="flex gap-2">
                  {cats.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCatId(c.id)}
                      className={clsx(
                        'h-8 px-3 rounded-full text-[12px] font-medium whitespace-nowrap transition flex items-center gap-1',
                        catId === c.id
                          ? 'bg-[var(--color-btn-dark)] text-[var(--color-text-on-dark)]'
                          : 'bg-[var(--color-bg-elev-2)] text-[var(--color-text-secondary)]',
                      )}
                    >
                      <span>{c.emoji}</span>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'emoji' && (
              <div className="mt-3 px-4 overflow-x-auto no-scrollbar">
                <div className="flex gap-2">
                  {EMOJI_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setEmojiCatId(c.id)}
                      className={clsx(
                        'h-8 px-3 rounded-full text-[12px] font-medium whitespace-nowrap transition flex items-center gap-1',
                        emojiCatId === c.id
                          ? 'bg-[var(--color-btn-dark)] text-[var(--color-text-on-dark)]'
                          : 'bg-[var(--color-bg-elev-2)] text-[var(--color-text-secondary)]',
                      )}
                    >
                      <span>{c.emoji}</span>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 内容区 */}
            <div className="flex-1 overflow-y-auto no-scrollbar mt-3 px-4 pb-safe pb-6">
              {tab === 'sticker' && (
                <div className="grid grid-cols-5 gap-3">
                  {stickerList.map((n) => {
                    const url = getIconUrl(n);
                    if (!url) return null;
                    const isSelected = selected === n;
                    return (
                      <button
                        key={n}
                        onClick={() => { onSelect(n); onClose(); }}
                        className={clsx(
                          'aspect-square rounded-2xl flex items-center justify-center p-2 transition active:scale-95',
                          isSelected
                            ? 'bg-[var(--color-brand-bg)] ring-2 ring-[var(--color-brand)]'
                            : 'bg-[var(--color-bg-elev-2)]',
                        )}
                      >
                        <img src={url} alt="" className="w-full h-full object-contain" />
                      </button>
                    );
                  })}
                  {stickerList.length === 0 && (
                    <div className="col-span-5 py-12 text-center text-[13px] text-[var(--color-text-tertiary)]">
                      没有匹配的图标
                    </div>
                  )}
                </div>
              )}

              {tab === 'emoji' && (
                <div className="grid grid-cols-7 gap-2">
                  {(EMOJI_CATEGORIES.find((c) => c.id === emojiCatId)?.list ?? []).map((e, i) => (
                    <button
                      key={`${e}-${i}`}
                      onClick={() => {
                        if (onSelectEmoji) onSelectEmoji(e);
                        onClose();
                      }}
                      className="aspect-square rounded-xl bg-[var(--color-bg-elev-2)] flex items-center justify-center text-[24px] active:scale-95 transition"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}

              {tab === 'photo' && (
                <div className="py-16 text-center">
                  <div className="text-[60px] mb-3">📷</div>
                  <div className="font-display text-[16px]">从相册选择</div>
                  <p className="text-[12px] text-[var(--color-text-tertiary)] mt-2 px-8">
                    H5 版本暂不支持调用相机/相册<br />在 iOS App 内可使用此功能
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
