import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Plus } from 'lucide-react';
import { HomeIcon, WishIcon, TrendIcon, SettingsIcon } from './icons';

const tabs = [
  { to: '/', icon: HomeIcon, label: '有数' },
  { to: '/wish', icon: WishIcon, label: '心愿' },
  { to: '/trend', icon: TrendIcon, label: '趋势' },
  { to: '/settings', icon: SettingsIcon, label: '设置' },
];

export function TabBar() {
  const loc = useLocation();
  const nav = useNavigate();

  // 模态全屏页面隐藏 TabBar
  if (
    loc.pathname.startsWith('/add') ||
    loc.pathname.startsWith('/item/') ||
    loc.pathname.startsWith('/subscribe') ||
    loc.pathname.startsWith('/welcome') ||
    loc.pathname.startsWith('/onboarding')
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 pb-safe pointer-events-none">
      <div className="px-4 pb-3 pt-2 flex items-center gap-3 max-w-md mx-auto">
        {/* 主 tab 胶囊 */}
        <nav
          className="
            pointer-events-auto flex-1 h-[60px]
            bg-[var(--color-bg-elev-1)] rounded-full
            flex items-center justify-around
            shadow-[var(--shadow-tabbar)]
          "
        >
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className="relative h-12 px-4 rounded-full flex items-center gap-1.5 select-none"
            >
              {({ isActive }) => (
                <>
                  {/* 选中态背景：layoutId 让滑动有平滑过渡 */}
                  {isActive && (
                    <motion.span
                      layoutId="tabbar-active-bg"
                      className="absolute inset-0 rounded-full bg-[var(--color-bg-elev-3)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className={clsx(
                    'relative z-10 transition-colors',
                    isActive ? 'text-[var(--color-text)]' : 'text-[var(--color-text-tertiary)]',
                  )}>
                    <Icon filled={isActive} size={20} />
                  </span>
                  <span className={clsx(
                    'relative z-10 text-[12px] transition-colors',
                    isActive ? 'font-bold text-[var(--color-text)]' : 'font-medium text-[var(--color-text-tertiary)]',
                  )}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* 独立 FAB 加号 */}
        <motion.button
          onClick={() => nav('/add')}
          whileTap={{ scale: 0.88 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          className="
            pointer-events-auto shrink-0
            w-[60px] h-[60px] rounded-full
            bg-[var(--color-fab-bg)] text-[var(--color-fab-fg)]
            flex items-center justify-center
            shadow-[var(--shadow-fab)]
          "
          aria-label="添加"
        >
          <Plus size={28} strokeWidth={2.6} />
        </motion.button>
      </div>
    </div>
  );
}
