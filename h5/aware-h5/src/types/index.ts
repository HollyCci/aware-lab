// 物品状态
export type ItemStatus =
  | 'inUse'      // 在用
  | 'idle'       // 闲置
  | 'sold'       // 已卖出
  | 'discarded'  // 已丢弃/退役
  | 'lost';      // 丢失

// 物品（核心数据）
export interface Item {
  id: string;
  name: string;
  iconName?: string;            // 对应 src/assets/icons 里图标 key（不含 @3x.png）
  cover?: string;               // 自定义封面图 dataURL（拍照后）
  categoryId: string;
  tagIds: string[];
  price: number;                // 买入价（CNY）
  currency: 'CNY';
  purchaseDate: string;         // ISO date
  targetDailyCost?: number;     // 目标日均成本
  targetUsageCount?: number;    // 目标使用次数
  usageCount: number;           // 实际使用次数
  status: ItemStatus;
  soldPrice?: number;           // 卖出价（如已卖）
  soldDate?: string;
  attachments?: Attachment[];   // 附加物（保护壳、配件…）
  notes?: string;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  price: number;
}

export interface Category {
  id: string;
  name: string;
  iconName?: string;
  order: number;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

// 心愿单
export interface WishItem {
  id: string;
  name: string;
  iconName?: string;
  price: number;
  url?: string;
  notes?: string;
  createdAt: string;
}

// 视图模式（首页列表）
export type ViewMode = 'card' | 'list' | 'compact' | 'sticker';

// 设置
export interface AppSettings {
  themeMode: 'dark' | 'light' | 'system';
  language: 'zh-Hans' | 'zh-HK' | 'en';
  currencySymbol: string;
  decimalPlaces: 0 | 1 | 2;
  thousandsSeparator: ',' | '.' | ' ' | '';
  dateFormat: 'yyyy.MM.dd' | 'yyyy-MM-dd' | 'MM/dd/yyyy';
  homeStyle: 'card' | 'list';
  appIconName: string; // appicon_0 ~ appicon_16
  hapticEnabled: boolean;
  appLockEnabled: boolean;
  iCloudSyncEnabled: boolean;
}

// 计算后的派生指标（不存库，按需算）
export interface ItemMetrics {
  daysOwned: number;       // 持有天数
  dailyCost: number;       // 日均成本（每日折旧）
  costPerUse: number;      // 每次使用成本
  isAchievedCost: boolean; // 是否已达成目标日均成本
  isAchievedUsage: boolean;
  remainingValue: number;  // 残值（已卖出时 = soldPrice，否则按某种估算）
  appreciation: number;    // 增值（卖出价 - 买入价）
  appreciationPct: number;
}
