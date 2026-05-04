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
  removeCategory: (id: string) => void;

  addTag: (t: Tag) => void;
  removeTag: (id: string) => void;

  addWish: (w: WishItem) => void;
  removeWish: (id: string) => void;

  setViewMode: (m: ViewMode) => void;
  selectCategory: (id: string | null) => void;
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
      removeCategory: (id) => set(s => ({
        categories: s.categories.filter(c => c.id !== id),
        items: s.items.map(i => i.categoryId === id ? { ...i, categoryId: 'others' } : i),
      })),

      addTag: (t) => set(s => ({ tags: [...s.tags, t] })),
      removeTag: (id) => set(s => ({
        tags: s.tags.filter(t => t.id !== id),
        items: s.items.map(i => ({ ...i, tagIds: i.tagIds.filter(x => x !== id) })),
      })),

      addWish: (w) => set(s => ({ wishlist: [w, ...s.wishlist] })),
      removeWish: (id) => set(s => ({ wishlist: s.wishlist.filter(w => w.id !== id) })),

      setViewMode: (m) => set({ viewMode: m }),
      selectCategory: (id) => set({ selectedCategoryId: id }),
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
