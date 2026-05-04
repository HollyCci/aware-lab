import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock, Trash2, Delete } from 'lucide-react';
import { useStore } from '@/db/store';

const PIN_STORAGE_KEY = 'aware-pin';

type Stage = 'overview' | 'set-1' | 'set-2' | 'verify-old';

export function AppLockPage() {
  const nav = useNavigate();
  const settings = useStore(s => s.settings);
  const updateSettings = useStore(s => s.updateSettings);

  const [stage, setStage] = useState<Stage>('overview');
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState('');

  const enabled = settings.appLockEnabled;
  const hasPin = !!localStorage.getItem(PIN_STORAGE_KEY);

  useEffect(() => {
    setError('');
    setPin('');
  }, [stage]);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) onComplete(next);
  };

  const onComplete = (entered: string) => {
    if (stage === 'verify-old') {
      const stored = localStorage.getItem(PIN_STORAGE_KEY);
      if (entered === stored) {
        // 验证成功 → 改为关锁或换密码
        localStorage.removeItem(PIN_STORAGE_KEY);
        updateSettings({ appLockEnabled: false });
        setStage('overview');
      } else {
        setError('PIN 不正确，再试一次');
        setTimeout(() => { setPin(''); setError(''); }, 800);
      }
    } else if (stage === 'set-1') {
      setFirstPin(entered);
      setStage('set-2');
    } else if (stage === 'set-2') {
      if (entered === firstPin) {
        localStorage.setItem(PIN_STORAGE_KEY, entered);
        updateSettings({ appLockEnabled: true });
        setStage('overview');
      } else {
        setError('两次输入不一致，重新设置');
        setTimeout(() => { setStage('set-1'); setFirstPin(''); }, 800);
      }
    }
  };

  const handleDelete = () => setPin(p => p.slice(0, -1));

  if (stage !== 'overview') {
    return (
      <PinPad
        title={
          stage === 'set-1' ? '设置一个 4 位 PIN' :
          stage === 'set-2' ? '再输一次确认' :
          '输入当前 PIN'
        }
        sub={stage === 'set-2' && firstPin ? '确保两次一致' : undefined}
        pin={pin}
        error={error}
        onDigit={handleDigit}
        onDelete={handleDelete}
        onCancel={() => setStage('overview')}
      />
    );
  }

  return (
    <div className="min-h-full">
      <header className="pt-safe sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur-lg">
        <div className="px-2 pt-3 pb-3 flex items-center">
          <button onClick={() => nav(-1)} className="w-9 h-9 flex items-center justify-center">
            <ChevronLeft size={26} />
          </button>
          <h1 className="font-display text-[20px] flex-1 text-center pr-9">密码与安全</h1>
        </div>
      </header>

      <section className="px-4 mt-2">
        <div className="rounded-[24px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-brand-bg)] flex items-center justify-center">
            <Lock size={28} className="text-[var(--color-brand-deep)]" />
          </div>
          <h2 className="font-display text-[18px] mt-4">应用锁</h2>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-1.5 px-4">
            打开后每次启动都会要求输入 4 位 PIN，避免别人翻看你的资产数据。
          </p>
        </div>
      </section>

      <section className="px-4 mt-4">
        <div className="rounded-[20px] bg-[var(--color-bg-elev-1)] shadow-[var(--shadow-card)] divide-y divide-[var(--color-divider)] overflow-hidden">
          {!enabled || !hasPin ? (
            <button
              onClick={() => setStage('set-1')}
              className="w-full px-4 py-4 text-left text-[14px] font-medium text-[var(--color-brand-deep)]"
            >
              开启应用锁
            </button>
          ) : (
            <>
              <button
                onClick={() => setStage('set-1')}
                className="w-full px-4 py-4 text-left text-[14px] font-medium"
              >
                修改 PIN
              </button>
              <button
                onClick={() => setStage('verify-old')}
                className="w-full px-4 py-4 text-left text-[14px] font-medium text-[var(--color-error)] flex items-center gap-2"
              >
                <Trash2 size={14} />
                关闭应用锁
              </button>
            </>
          )}
        </div>
      </section>

      <p className="text-center text-[11px] text-[var(--color-text-tertiary)] mt-6 px-8 pb-safe pb-12">
        H5 版本的 PIN 仅是 UI 层防护，不能替代 iOS 的设备级 Face ID / Touch ID。
        如果忘记 PIN，需要手动清除浏览器的 localStorage。
      </p>
    </div>
  );
}

function PinPad({ title, sub, pin, error, onDigit, onDelete, onCancel }: {
  title: string;
  sub?: string;
  pin: string;
  error: string;
  onDigit: (d: string) => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-bg)] flex flex-col">
      <div className="pt-safe">
        <div className="px-4 pt-3 pb-3 flex items-center">
          <button onClick={onCancel} className="w-9 h-9 flex items-center justify-center">
            <ChevronLeft size={26} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <h1 className="font-display text-[22px]">{title}</h1>
        {sub && <p className="text-[13px] text-[var(--color-text-secondary)] mt-2">{sub}</p>}

        <div className="flex items-center gap-4 my-10">
          {[0, 1, 2, 3].map(i => (
            <span
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                i < pin.length
                  ? 'bg-[var(--color-brand-deep)] border-[var(--color-brand-deep)] scale-110'
                  : 'border-[var(--color-text-tertiary)]'
              } ${error ? '!border-[var(--color-error)] !bg-[var(--color-error)] animate-shake' : ''}`}
            />
          ))}
        </div>

        {error && <div className="text-[13px] text-[var(--color-error)] mb-4">{error}</div>}
      </div>

      <div className="grid grid-cols-3 gap-2 px-6 pb-safe pb-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
          <button
            key={d}
            onClick={() => onDigit(d.toString())}
            className="h-16 rounded-2xl text-[24px] font-display bg-[var(--color-bg-elev-1)] active:bg-[var(--color-bg-elev-2)] transition"
          >
            {d}
          </button>
        ))}
        <span />
        <button
          onClick={() => onDigit('0')}
          className="h-16 rounded-2xl text-[24px] font-display bg-[var(--color-bg-elev-1)] active:bg-[var(--color-bg-elev-2)] transition"
        >
          0
        </button>
        <button
          onClick={onDelete}
          className="h-16 rounded-2xl flex items-center justify-center text-[var(--color-text-secondary)] active:bg-[var(--color-bg-elev-2)] transition"
        >
          <Delete size={22} />
        </button>
      </div>
    </div>
  );
}
