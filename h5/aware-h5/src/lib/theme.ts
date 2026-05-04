import { useEffect } from 'react';
import { useStore } from '@/db/store';

/**
 * 主题应用：把 settings.themeMode 写到 <html data-theme="..."> 上，
 * CSS 变量根据 data-theme 切换浅/暗色。
 */
export function useApplyTheme() {
  const themeMode = useStore(s => s.settings.themeMode);
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', themeMode);
  }, [themeMode]);
}
