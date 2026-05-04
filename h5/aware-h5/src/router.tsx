import { useEffect } from 'react';
import { createBrowserRouter, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { TabBar } from './components/TabBar';
import { HomePage } from './pages/Home';
import { TrendPage } from './pages/Trend';
import { AddPage } from './pages/Add';
import { WishPage } from './pages/Wish';
import { SettingsPage } from './pages/Settings';
import { ItemDetailPage } from './pages/ItemDetail';
import { SubscribePage } from './pages/Subscribe';
import { WelcomePage } from './pages/Welcome';
import { OnboardingPage } from './pages/Onboarding';
import { useApplyTheme } from './lib/theme';

const WELCOMED_KEY = 'aware-welcomed';

/** 首次访问主 App 时跳到 /welcome（除非用户带 ?skip=1 调试） */
function useFirstVisitRedirect() {
  const nav = useNavigate();
  const loc = useLocation();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const search = new URLSearchParams(loc.search);
    if (search.has('skip')) {
      localStorage.setItem(WELCOMED_KEY, '1');
      return;
    }
    const welcomed = localStorage.getItem(WELCOMED_KEY);
    if (!welcomed) {
      nav('/welcome', { replace: true });
    }
  }, [nav, loc.search]);
}

function RootLayout() {
  useApplyTheme();
  useFirstVisitRedirect();
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col relative">
      <main className="flex-1 pb-[100px]">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}

function FullScreenLayout() {
  useApplyTheme();
  return <Outlet />;
}

export function markWelcomed() {
  localStorage.setItem(WELCOMED_KEY, '1');
}

export const router = createBrowserRouter([
  // 全屏 modal 类页面（不带 TabBar，但保留主题应用）
  {
    element: <FullScreenLayout />,
    children: [
      { path: '/welcome', element: <WelcomePage /> },
      { path: '/onboarding', element: <OnboardingPage /> },
    ],
  },
  // 主 App 路由（带 TabBar）
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/trend', element: <TrendPage /> },
      { path: '/wish', element: <WishPage /> },
      { path: '/settings', element: <SettingsPage /> },
      // 这些路径在 TabBar 里被自动隐藏
      { path: '/add', element: <AddPage /> },
      { path: '/item/:id', element: <ItemDetailPage /> },
      { path: '/subscribe', element: <SubscribePage /> },
    ],
  },
]);
