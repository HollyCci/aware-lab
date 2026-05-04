import { useNavigate } from 'react-router-dom';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { useStore } from '@/db/store';
import { ProTag } from '@/components/icons';
import { getIcon } from '@/lib/icons';

type SettingItem = {
  iconKey: string;
  label: string;
  value?: string;
  pro?: boolean;
  toggle?: boolean;
  to?: string;
  custom?: 'theme' | 'home-style';
};

// 这两张原图是透明 + 浅色描边设计，在暗色卡片上对比度弱，给它们补一个 elev-2 浅底
const NEEDS_ICON_BG = new Set(['icon_common_classify', 'icon_common_label']);

export function SettingsPage() {
  const nav = useNavigate();
  const settings = useStore(s => s.settings);
  const updateSettings = useStore(s => s.updateSettings);

  const groups: { title: string; items: SettingItem[] }[] = [
    {
      title: '数据管理',
      items: [
        { iconKey: 'icon_common_classify', label: '分类管理' },
        { iconKey: 'icon_common_label', label: '标签管理' },
        { iconKey: 'icon_settings_icloud', label: 'iCloud 同步' },
        { iconKey: 'icon_settings_backup', label: '备份与恢复' },
        { iconKey: 'icon_settings_pwd', label: '密码与安全' },
      ],
    },
    {
      title: '数值与单位',
      items: [
        { iconKey: 'icon_settings_unit', label: '货币单位', value: settings.currencySymbol },
        { iconKey: 'icon_settings_timeformat', label: '服役时长单位', value: '天', pro: true },
        { iconKey: 'icon_settings_decimal', label: '小数点设置', value: `保留 ${settings.decimalPlaces} 位`, pro: true },
        { iconKey: 'icon_settings_separator', label: '使用千位分隔符', toggle: true, pro: true },
      ],
    },
    {
      title: '显示与外观',
      items: [
        { iconKey: 'icon_settings_theme', label: '主题模式', custom: 'theme' },
        { iconKey: 'icon_settings_appicon', label: '应用图标' },
        { iconKey: 'icon_settings_homestyle', label: '首页风格', custom: 'home-style' },
        { iconKey: 'icon_settings_language', label: '语言' },
        { iconKey: 'icon_settings_quality', label: '画面质量', value: '高' },
      ],
    },
    {
      title: '反馈',
      items: [
        { iconKey: 'icon_settings_feedback', label: '我要提意见' },
        { iconKey: 'icon_settings_contact', label: '联系我们' },
        { iconKey: 'icon_settings_share', label: '分享应用' },
        { iconKey: 'icon_settings_rate', label: '为我们评分' },
      ],
    },
    {
      title: '关于',
      items: [
        { iconKey: 'icon_settings_terms', label: '用户协议' },
        { iconKey: 'icon_settings_privacy', label: '隐私政策' },
      ],
    },
  ];

  return (
    <div className="min-h-full">
      <header className="pt-safe px-4 pt-3 pb-4 flex items-center justify-between">
        <h1 className="font-display text-[34px] leading-none">设置</h1>
        <button className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)]">
          <RefreshCw size={14} />
          恢复会员
        </button>
      </header>

      {/* Pro 推广 banner */}
      <section className="px-4">
        <button
          onClick={() => nav('/subscribe')}
          className="
            w-full text-left
            rounded-[24px] p-5 relative overflow-hidden
            shadow-[var(--shadow-card)]
          "
          style={{
            background:
              'linear-gradient(135deg, #b8f23d 0%, #a0f030 60%, #8cd824 100%)',
          }}
        >
          {/* 几何点纹理 */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.4) 1.5px, transparent 1.5px)',
              backgroundSize: '14px 14px',
              backgroundPosition: '0 0',
            }}
          />
          <div className="relative">
            <h2 className="font-display text-[24px] text-[#1a1a1a] leading-tight">加入有数 PRO</h2>
            <p className="text-[13px] text-[#1a1a1a]/80 mt-1">
              解锁全部权限，让资产心中有数
            </p>
            <div className="mt-4 inline-flex items-center px-5 py-2 rounded-full bg-[#1a1a1a] text-white text-[13px] font-bold">
              了解权益
            </div>
          </div>
          {/* 吉祥物 */}
          <Mascot className="absolute right-3 bottom-1 w-[100px]" />
        </button>
      </section>

      {groups.map(g => (
        <section key={g.title} className="px-4 mt-5">
          <div className="text-[12px] text-[var(--color-text-secondary)] mb-2 px-1">{g.title}</div>
          <div className="rounded-[24px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] divide-y divide-[var(--color-divider)] overflow-hidden">
            {g.items.map(item => (
              <SettingRow
                key={item.label}
                item={item}
                themeMode={settings.themeMode}
                homeStyle={settings.homeStyle}
                onChangeTheme={(m) => updateSettings({ themeMode: m })}
                onChangeHomeStyle={(s) => updateSettings({ homeStyle: s })}
              />
            ))}
          </div>
        </section>
      ))}

      {/* 友情推荐 */}
      <section className="px-4 mt-5">
        <div className="text-[12px] text-[var(--color-text-secondary)] mb-2 px-1">友情推荐</div>
        <div className="rounded-[24px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] divide-y divide-[var(--color-divider)]">
          {[
            { name: '小轻柠 - 体重日记', desc: '简洁的体重管理 App' },
            { name: '小台本 - AI 悬浮提词器', desc: 'AI 实时字幕和提词' },
            { name: '悬浮补光灯相机 - 自拍神器', desc: '随时补光的拍照工具' },
          ].map(a => (
            <div key={a.name} className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[var(--color-bg-elev-3)] flex items-center justify-center text-[18px]">📱</div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold truncate">{a.name}</div>
                <div className="text-[11px] text-[var(--color-text-tertiary)] truncate">{a.desc}</div>
              </div>
              <button className="px-3 py-1 rounded-full bg-[var(--color-bg-elev-3)] text-[12px] font-medium">下载</button>
            </div>
          ))}
        </div>
      </section>

      <p className="text-center text-[11px] text-[var(--color-text-tertiary)] mt-6 mb-4">
        版本 1.6.9 (71)
      </p>
    </div>
  );
}

function SettingRow({
  item, themeMode, homeStyle, onChangeTheme, onChangeHomeStyle,
}: {
  item: SettingItem;
  themeMode: 'dark' | 'light' | 'system';
  homeStyle: 'card' | 'list';
  onChangeTheme: (m: 'dark' | 'light' | 'system') => void;
  onChangeHomeStyle: (s: 'card' | 'list') => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 active:bg-black/[0.02]">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shrink-0 ${
          NEEDS_ICON_BG.has(item.iconKey)
            ? 'bg-[var(--color-icon-tile-bg)] p-1'
            : ''
        }`}
      >
        <img src={getIcon(item.iconKey)} alt="" className="w-full h-full object-contain" />
      </div>
      <div className="flex-1 text-[14px] flex items-center gap-1.5">
        {item.label}
        {item.pro && <ProTag size={16} />}
      </div>

      {item.custom === 'theme' && (
        <SegControl
          options={[
            { id: 'system', label: '系统' },
            { id: 'light', label: '浅色' },
            { id: 'dark', label: '深色' },
          ]}
          value={themeMode}
          onChange={(v) => onChangeTheme(v as 'system' | 'light' | 'dark')}
        />
      )}

      {item.custom === 'home-style' && (
        <SegControl
          options={[
            { id: 'card', label: '默认' },
            { id: 'list', label: '经典' },
          ]}
          value={homeStyle}
          onChange={(v) => onChangeHomeStyle(v as 'card' | 'list')}
        />
      )}

      {item.toggle && <Switch />}

      {!item.custom && !item.toggle && (
        <div className="flex items-center gap-1 text-[13px] text-[var(--color-text-tertiary)]">
          {item.value}
          <ChevronRight size={16} />
        </div>
      )}
    </div>
  );
}

function SegControl({ options, value, onChange }: {
  options: { id: string; label: React.ReactNode }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex items-center bg-[var(--color-bg-elev-3)] rounded-full p-0.5">
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition flex items-center justify-center min-w-[32px] ${value === o.id ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] text-[#1a1a1a]' : 'text-[var(--color-text-secondary)]'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Switch() {
  return (
    <div className="w-10 h-6 rounded-full bg-[var(--color-bg-elev-3)] relative">
      <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow" />
    </div>
  );
}

function Mascot({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none">
      <ellipse cx="60" cy="100" rx="40" ry="6" fill="rgba(0,0,0,0.08)" />
      <ellipse cx="60" cy="74" rx="42" ry="32" fill="#ffd84a" stroke="#1a1a1a" strokeWidth="2.5" />
      <rect x="22" y="44" width="76" height="14" rx="2" fill="#1a1a1a" />
      <circle cx="42" cy="68" r="10" fill="#1a1a1a" />
      <circle cx="78" cy="68" r="10" fill="#1a1a1a" />
      <circle cx="42" cy="68" r="3" fill="#fff" />
      <circle cx="78" cy="68" r="3" fill="#fff" />
      <path d="M28 36 L40 22 L52 30 L60 18 L68 30 L80 22 L92 36 Z" fill="#ffd84a" stroke="#1a1a1a" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="40" cy="22" r="3" fill="#1a1a1a" />
      <circle cx="60" cy="18" r="3" fill="#1a1a1a" />
      <circle cx="80" cy="22" r="3" fill="#1a1a1a" />
    </svg>
  );
}
