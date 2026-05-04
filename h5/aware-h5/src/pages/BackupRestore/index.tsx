import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Upload, RotateCcw, Database } from 'lucide-react';
import { useStore } from '@/db/store';

export function BackupRestorePage() {
  const nav = useNavigate();
  const items = useStore(s => s.items);
  const categories = useStore(s => s.categories);
  const tags = useStore(s => s.tags);
  const wishlist = useStore(s => s.wishlist);
  const exportData = useStore(s => s.exportData);
  const importData = useStore(s => s.importData);
  const resetAll = useStore(s => s.resetAll);

  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aware-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg({ type: 'ok', text: `已导出 ${items.length} 件物品 + ${categories.length} 个分类` });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleExportCsv = () => {
    const headers = ['name', 'category', 'price', 'purchaseDate', 'usageCount', 'status', 'targetDailyCost', 'notes'];
    const catMap = new Map(categories.map(c => [c.id, c.name]));
    const rows = items.map(i => [
      i.name,
      catMap.get(i.categoryId) ?? i.categoryId,
      i.price.toString(),
      i.purchaseDate.slice(0, 10),
      i.usageCount.toString(),
      i.status,
      i.targetDailyCost?.toString() ?? '',
      (i.notes ?? '').replace(/"/g, '""'),
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }); // BOM 让 Excel 正确识别中文
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aware-items-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg({ type: 'ok', text: `已导出 ${items.length} 件物品到 CSV（Excel 可直接打开）` });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleImportClick = () => fileRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const result = importData(text);
    if (result.ok) {
      setMsg({ type: 'ok', text: '导入成功，数据已替换' });
    } else {
      setMsg({ type: 'err', text: `导入失败：${result.error}` });
    }
    setTimeout(() => setMsg(null), 4000);
    e.target.value = '';
  };

  const handleReset = () => {
    if (window.confirm('确认清空所有数据并重置为示例数据？这个操作不可撤销。')) {
      resetAll();
      setMsg({ type: 'ok', text: '已重置为示例数据' });
      setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <div className="min-h-full">
      <header className="pt-safe sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur-lg">
        <div className="px-2 pt-3 pb-3 flex items-center">
          <button onClick={() => nav(-1)} className="w-9 h-9 flex items-center justify-center">
            <ChevronLeft size={26} />
          </button>
          <h1 className="font-display text-[20px] flex-1 text-center pr-9">备份与恢复</h1>
        </div>
      </header>

      <section className="px-4">
        <div className="rounded-[20px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-bg)] flex items-center justify-center">
            <Database size={22} className="text-[var(--color-brand-deep)]" />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-bold">本地数据</div>
            <div className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
              {items.length} 件物品 · {categories.length} 个分类 · {tags.length} 个标签 · {wishlist.length} 个心愿
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 mt-4">
        <div className="text-[12px] text-[var(--color-text-secondary)] mb-2 px-1">备份</div>
        <div className="rounded-[20px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] divide-y divide-[var(--color-divider)] overflow-hidden">
          <ActionRow
            icon={<Download size={18} />}
            iconBg="rgba(90, 200, 250, 0.16)"
            iconColor="#5ac8fa"
            title="导出全部数据为 JSON"
            desc="包含物品、分类、标签、心愿、设置 — 适合换设备"
            onClick={handleExport}
          />
          <ActionRow
            icon={<Download size={18} />}
            iconBg="rgba(52, 199, 89, 0.16)"
            iconColor="#34c759"
            title="导出物品列表为 CSV"
            desc="Excel / Numbers 可直接打开 — 适合做数据分析"
            onClick={handleExportCsv}
          />
        </div>
      </section>

      <section className="px-4 mt-4">
        <div className="text-[12px] text-[var(--color-text-secondary)] mb-2 px-1">恢复</div>
        <div className="rounded-[20px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] divide-y divide-[var(--color-divider)] overflow-hidden">
          <ActionRow
            icon={<Upload size={18} />}
            iconBg="rgba(255, 149, 0, 0.16)"
            iconColor="#ff9500"
            title="从 JSON 文件导入"
            desc="会替换当前所有数据，导入前请先备份"
            onClick={handleImportClick}
          />
          <ActionRow
            icon={<RotateCcw size={18} />}
            iconBg="rgba(255, 59, 48, 0.16)"
            iconColor="#ff3b30"
            title="重置为示例数据"
            desc="清空所有现有数据，恢复到首次安装的状态"
            onClick={handleReset}
            danger
          />
        </div>
      </section>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        className="hidden"
      />

      {msg && (
        <div
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full text-[13px] font-medium shadow-2xl ${
            msg.type === 'ok'
              ? 'bg-[var(--color-success)] text-white'
              : 'bg-[var(--color-error)] text-white'
          }`}
        >
          {msg.text}
        </div>
      )}

      <p className="text-center text-[11px] text-[var(--color-text-tertiary)] mt-6 pb-safe pb-12 px-8">
        H5 版本数据存在浏览器 IndexedDB 里，清浏览器数据会全没。养成定期导出 JSON 的习惯。
      </p>
    </div>
  );
}

function ActionRow({
  icon, iconBg, iconColor, title, desc, onClick, danger,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-black/[0.02] text-left">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-[14px] font-medium ${danger ? 'text-[var(--color-error)]' : ''}`}>{title}</div>
        <div className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5 truncate">{desc}</div>
      </div>
    </button>
  );
}
