/**
 * 首次访问标记 — 拆到独立文件是为了让 router.tsx 只 export React 组件，
 * 满足 vite-plugin-react-swc 的 Fast Refresh 规则
 * （组件文件不能同时 export 普通函数，否则 HMR 会 invalidate 整个文件）。
 */
export const WELCOMED_KEY = 'aware-welcomed';

/** 标记用户已完成过欢迎流程，下次进入主 App 不再跳 /welcome */
export function markWelcomed(): void {
  localStorage.setItem(WELCOMED_KEY, '1');
}

/** 是否已经看过欢迎页 */
export function isWelcomed(): boolean {
  return !!localStorage.getItem(WELCOMED_KEY);
}
