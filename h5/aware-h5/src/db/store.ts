import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';
import type { Item, Category, Tag, WishItem, AppSettings, ViewMode } from '@/types';
import { seedItems, seedCategories, seedTags, seedWish } from './seed';

// 用 IndexedDB 当 localStorage 的更大、更可靠替代
const idbStorage = {
  getItem: async (name: string) => {
    const v = await idbGet(name);
    return v ?? null;
  },
  setItem: async (name: string, value: string) => {
    await idbSet(name, value);
  },
  removeItem: async (name: string) => {
    await idbDel(name);
  },
};

interface AppStore {
  // 数据
  items: Item[];
  categories: Category[];
  tags: Tag[];
  wishlist: WishItem[];

  // UI 状态
  viewMode: ViewMode;
  selectedCategoryId: string | null;
  homeMultiSelectMode: boolean;       // 首页多选模式（同步给 TabBar 自动隐藏用）

  // 设置
  settings: AppSettings;

  // actions
  addItem: (item: Item) => void;
  updateItem: (id: string, patch: Partial<Item>) => void;
  removeItem: (id: string) => void;
  togglePin: (id: string) => void;
  toggleFavorite: (id: string) => void;
  bumpUsage: (id: string, delta?: number) => void;

  addCategory: (c: Category) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  reorderCategories: (orderedIds: string[]) => void;

  addTag: (t: Tag) => void;
  updateTag: (id: string, patch: Partial<Tag>) => void;
  removeTag: (id: string) => void;

  addWish: (w: WishItem) => void;
  updateWish: (id: string, patch: Partial<WishItem>) => void;
  removeWish: (id: string) => void;

  // 批量
  removeItems: (ids: string[]) => void;
  setItemsStatus: (ids: string[], status: import('@/types').ItemStatus) => void;

  // 数据导入导出（备份与恢复用）
  exportData: () => string;            // 返回 JSON 字符串
  importData: (jsonString: string) => { ok: boolean; error?: string };

  setViewMode: (m: ViewMode) => void;
  selectCategory: (id: string | null) => void;
  setHomeMultiSelectMode: (b: boolean) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetAll: () => void;
}

const defaultSettings: AppSettings = {
  themeMode: 'dark',
  language: 'zh-Hans',
  currencySymbol: '¥',
  decimalPlaces: 0,
  thousandsSeparator: ',',
  dateFormat: 'yyyy.MM.dd',
  homeStyle: 'card',
  appIconName: 'appicon_0',
  hapticEnabled: true,
  appLockEnabled: false,
  iCloudSyncEnabled: false,
};

export const useStore = create<AppStore>()(
  persist(
    (set, _get) => ({
      items: seedItems,
      categories: seedCategories,
      tags: seedTags,
      wishlist: seedWish,
      viewMode: 'card',
      selectedCategoryId: null,
      homeMultiSelectMode: false,
      settings: defaultSettings,

      addItem: (item) => set(s => ({ items: [item, ...s.items] })),
      updateItem: (id, patch) => set(s => ({
        items: s.items.map(i =>
          i.id === id ? { ...i, ...patch, updatedAt: new Date().toISOString() } : i,
        ),
      })),
      removeItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),
      togglePin: (id) => set(s => ({
        items: s.items.map(i => i.id === id ? { ...i, isPinned: !i.isPinned } : i),
      })),
      toggleFavorite: (id) => set(s => ({
        items: s.items.map(i => i.id === id ? { ...i, isFavorite: !i.isFavorite } : i),
      })),
      bumpUsage: (id, delta = 1) => set(s => ({
        items: s.items.map(i =>
          i.id === id ? { ...i, usageCount: Math.max(0, i.usageCount + delta) } : i,
        ),
      })),

      addCategory: (c) => set(s => ({ categories: [...s.categories, c] })),
      updateCategory: (id, patch) => set(s => ({
        categories: s.categories.map(c => c.id === id ? { ...c, ...patch } : c),
      })),
      removeCategory: (id) => set(s => ({
        categories: s.categories.filter(c => c.id !== id),
        items: s.items.map(i => i.categoryId === id ? { ...i, categoryId: 'others' } : i),
      })),
      reorderCategories: (orderedIds) => set(s => {
        const map = new Map(s.categories.map(c => [c.id, c]));
        const reordered = orderedIds
          .map((id, idx) => {
            const c = map.get(id);
            return c ? { ...c, order: idx + 1 } : null;
          })
          .filter((c): c is Category => c !== null);
        // 把不在 orderedIds 里的（比如 others）追加到末尾
        const remaining = s.categories.filter(c => !orderedIds.includes(c.id));
        return { categories: [...reordered, ...remaining] };
      }),

      addTag: (t) => set(s => ({ tags: [...s.tags, t] })),
      updateTag: (id, patch) => set(s => ({
        tags: s.tags.map(t => t.id === id ? { ...t, ...patch } : t),
      })),
      removeTag: (id) => set(s => ({
        tags: s.tags.filter(t => t.id !== id),
        items: s.items.map(i => ({ ...i, tagIds: i.tagIds.filter(x => x !== id) })),
      })),

      addWish: (w) => set(s => ({ wishlist: [w, ...s.wishlist] })),
      updateWish: (id, patch) => set(s => ({
        wishlist: s.wishlist.map(w => w.id === id ? { ...w, ...patch } : w),
      })),
      removeWish: (id) => set(s => ({ wishlist: s.wishlist.filter(w => w.id !== id) })),

      // 批量
      removeItems: (ids) => set(s => ({
        items: s.items.filter(i => !ids.includes(i.id)),
      })),
      setItemsStatus: (ids, status) => set(s => ({
        items: s.items.map(i =>
          ids.includes(i.id)
            ? { ...i, status, updatedAt: new Date().toISOString() }
            : i,
        ),
      })),

      exportData: () => {
        const s = _get();
        return JSON.stringify({
          version: 1,
          exportedAt: new Date().toISOString(),
          items: s.items,
          categories: s.categories,
          tags: s.tags,
          wishlist: s.wishlist,
          settings: s.settings,
        }, null, 2);
      },
      importData: (jsonString) => {
        try {
          const parsed = JSON.parse(jsonString);
          if (typeof parsed !== 'object' || parsed === null) {
            return { ok: false, error: '不是合法的 JSON 对象' };
          }
          const patch: Partial<AppStore> = {};
          if (Array.isArray(parsed.items)) patch.items = parsed.items;
          if (Array.isArray(parsed.categories)) patch.categories = parsed.categories;
          if (Array.isArray(parsed.tags)) patch.tags = parsed.tags;
          if (Array.isArray(parsed.wishlist)) patch.wishlist = parsed.wishlist;
          if (parsed.settings && typeof parsed.settings === 'object') {
            patch.settings = { ...defaultSettings, ...parsed.settings };
          }
          set(patch as Partial<AppStore>);
          return { ok: true };
        } catch (e) {
          return { ok: false, error: e instanceof Error ? e.message : '解析失败' };
        }
      },

      setViewMode: (m) => set({ viewMode: m }),
      selectCategory: (id) => set({ selectedCategoryId: id }),
      setHomeMultiSelectMode: (b) => set({ homeMultiSelectMode: b }),
      updateSettings: (patch) => set(s => ({ settings: { ...s.settings, ...patch } })),
      resetAll: () => set({
        items: seedItems,
        categories: seedCategories,
        tags: seedTags,
        wishlist: seedWish,
        settings: defaultSettings,
      }),
    }),
    {
      name: 'aware-h5-store',
      storage: createJSONStorage(() => idbStorage),
      version: 1,
    },
  ),
);
