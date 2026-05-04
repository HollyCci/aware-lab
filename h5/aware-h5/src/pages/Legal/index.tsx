import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface LegalProps {
  kind: 'terms' | 'privacy';
}

export function LegalPage({ kind }: LegalProps) {
  const nav = useNavigate();
  const title = kind === 'terms' ? '用户协议' : '隐私政策';
  const content = kind === 'terms' ? TERMS : PRIVACY;

  return (
    <div className="min-h-full">
      <header className="pt-safe sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur-lg">
        <div className="px-2 pt-3 pb-3 flex items-center">
          <button onClick={() => nav(-1)} className="w-9 h-9 flex items-center justify-center">
            <ChevronLeft size={26} />
          </button>
          <h1 className="font-display text-[20px] flex-1 text-center pr-9">{title}</h1>
        </div>
      </header>

      <article className="px-5 pb-safe pb-12 prose-custom">
        <p className="text-[12px] text-[var(--color-text-tertiary)] mb-4">
          最后更新：2026 年 5 月 4 日
        </p>
        {content.map((section, i) => (
          <section key={i} className="mb-6">
            <h2 className="font-display text-[16px] mb-2">{section.title}</h2>
            {section.paragraphs.map((p, j) => (
              <p key={j} className="text-[13px] leading-relaxed text-[var(--color-text-secondary)] mb-2">
                {p}
              </p>
            ))}
          </section>
        ))}
      </article>
    </div>
  );
}

const TERMS = [
  {
    title: '一、服务概述',
    paragraphs: [
      '「有数 Aware」是一款记录个人物品 / 资产 / 心愿单，并按使用频率与持有时长换算"日均成本"的工具类应用。',
      '本 H5 版本是 iOS App 的跨端 Web 复刻，所有数据存储在你浏览器本地（IndexedDB），不会上传到任何服务器。',
    ],
  },
  {
    title: '二、用户权利与义务',
    paragraphs: [
      '你拥有自己创建的所有数据的完整权利，可随时通过「备份与恢复」导出。',
      '请遵守当地法律法规使用本应用。请不要利用本应用及其数据从事任何违法活动。',
      '本应用不收集你任何个人身份信息，所有数据仅在你设备本地处理。',
    ],
  },
  {
    title: '三、知识产权',
    paragraphs: [
      '本应用的图标、字体、UI 设计、源代码均为开发者所有或经授权使用。',
      '应用内嵌的字体、贴纸图标素材均经过相应版权方的合法许可。',
    ],
  },
  {
    title: '四、免责声明',
    paragraphs: [
      '本应用按"现状"提供，不就适用性做任何明示或暗示的保证。',
      '由于浏览器存储清除、设备故障等原因导致的数据丢失，开发者不承担相关责任，请定期通过「备份与恢复」导出你的数据。',
    ],
  },
  {
    title: '五、协议变更与终止',
    paragraphs: [
      '我们保留随时修改本协议的权利。重要变更将在应用内提示。',
      '你可以随时通过清除浏览器数据 / 卸载应用停止使用本服务。',
    ],
  },
];

const PRIVACY = [
  {
    title: '我们收集什么？',
    paragraphs: [
      '简短的回答：什么也不收集。',
      '本 H5 版本不发起任何向服务器的网络请求，没有埋点 SDK，没有任何统计与广告平台接入。所有你录入的物品、心愿、设置都只存在你浏览器的 IndexedDB 里，关闭页面不丢失（除非你主动清除浏览器数据）。',
    ],
  },
  {
    title: '我们怎么用这些数据？',
    paragraphs: [
      '本地数据由你自己 100% 掌控。我们不会读取，也无技术手段读取——因为根本没有服务器。',
      '所有计算（日均成本、达标进度、统计图表）全部在你设备本地完成。',
    ],
  },
  {
    title: '第三方资源',
    paragraphs: [
      '本应用使用了以下第三方资源，它们不会回传任何数据：阿里妈妈数黑体（Alibaba 字体协议）、WeChat Sans（腾讯字体协议）、Lucide Icons（ISC 协议）、若干 sticker 图标素材包（开发者已购买商业授权）。',
    ],
  },
  {
    title: '数据导出与删除',
    paragraphs: [
      '前往「设置 → 备份与恢复」可随时导出全部数据为 JSON，或导出物品列表为 CSV 用 Excel 查看。',
      '可在同页面"重置为示例数据"清空所有数据；或直接清除浏览器数据彻底删除。',
    ],
  },
  {
    title: '联系',
    paragraphs: [
      '若对隐私实践有任何疑问，可在 GitHub 仓库（HollyCci/aware-lab）提 Issue。',
    ],
  },
];
