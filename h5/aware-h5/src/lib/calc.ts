import type { Item, ItemMetrics } from '@/types';

const MS_PER_DAY = 86_400_000;

/**
 * 核心业务计算：根据物品当前状态算出派生指标。
 * 这跟原 App 的逻辑一致：
 *   - 持有天数：从 purchaseDate 算到今天（或卖出/退役日）
 *   - 日均成本 = (买入价 + 附加物总价 - 残值) / 持有天数
 *   - 每次使用成本 = (买入价 + 附加物 - 残值) / 使用次数
 *   - 是否达成 = 当前日均/单次 ≤ 目标
 */
export function computeMetrics(item: Item, now: Date = new Date()): ItemMetrics {
  const purchase = new Date(item.purchaseDate);
  const endDate =
    item.status === 'sold' && item.soldDate ? new Date(item.soldDate) : now;
  const daysOwned = Math.max(1, Math.floor((+endDate - +purchase) / MS_PER_DAY));
  const attachmentTotal = (item.attachments ?? []).reduce(
    (s, a) => s + (a.price || 0),
    0,
  );
  const totalCost = item.price + attachmentTotal;
  const remainingValue =
    item.status === 'sold' && item.soldPrice != null ? item.soldPrice : 0;

  const netCost = Math.max(0, totalCost - remainingValue);

  const dailyCost = netCost / daysOwned;
  const costPerUse =
    item.usageCount > 0 ? netCost / item.usageCount : netCost;

  const isAchievedCost =
    item.targetDailyCost != null && dailyCost <= item.targetDailyCost;
  const isAchievedUsage =
    item.targetUsageCount != null && item.usageCount >= item.targetUsageCount;

  const appreciation =
    item.status === 'sold' && item.soldPrice != null
      ? item.soldPrice - item.price
      : 0;
  const appreciationPct = item.price > 0 ? (appreciation / item.price) * 100 : 0;

  return {
    daysOwned,
    dailyCost,
    costPerUse,
    isAchievedCost,
    isAchievedUsage,
    remainingValue,
    appreciation,
    appreciationPct,
  };
}

/** 总资产（在用 + 闲置物品的买入价合计） */
export function totalAssets(items: Item[]): number {
  return items
    .filter(i => i.status === 'inUse' || i.status === 'idle')
    .reduce((s, i) => s + i.price, 0);
}

/** 已退役/卖出/丢弃的物品总投入 */
export function retiredCost(items: Item[]): number {
  return items
    .filter(i => i.status === 'sold' || i.status === 'discarded' || i.status === 'lost')
    .reduce((s, i) => s + i.price, 0);
}

/** 总日均（所有在用物品的日均成本合计） */
export function totalDailyCost(items: Item[]): number {
  return items
    .filter(i => i.status === 'inUse' || i.status === 'idle')
    .reduce((s, i) => s + computeMetrics(i).dailyCost, 0);
}

/** 按日均成本排行（用于"最值得"/"最贵"卡片） */
export function rankByDailyCostAsc(items: Item[], limit = 10): Item[] {
  return [...items]
    .filter(i => i.status === 'inUse' || i.status === 'idle')
    .sort((a, b) => computeMetrics(a).dailyCost - computeMetrics(b).dailyCost)
    .slice(0, limit);
}

export function rankByDailyCostDesc(items: Item[], limit = 10): Item[] {
  return [...items]
    .filter(i => i.status === 'inUse' || i.status === 'idle')
    .sort((a, b) => computeMetrics(b).dailyCost - computeMetrics(a).dailyCost)
    .slice(0, limit);
}

/** 格式化金额：根据分隔符和小数位 */
export function formatPrice(
  n: number,
  opts: { symbol?: string; decimals?: 0 | 1 | 2; thousands?: string } = {},
): string {
  const { symbol = '¥', decimals = 0, thousands = ',' } = opts;
  const fixed = Math.abs(n).toFixed(decimals);
  const [int, frac] = fixed.split('.');
  const withSep = thousands ? int.replace(/\B(?=(\d{3})+(?!\d))/g, thousands) : int;
  const sign = n < 0 ? '-' : '';
  return `${sign}${symbol}${withSep}${frac ? '.' + frac : ''}`;
}
