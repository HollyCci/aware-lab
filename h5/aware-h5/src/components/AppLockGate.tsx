import { useEffect, useState } from 'react';
import { Lock, Delete } from 'lucide-react';
import { useStore } from '@/db/store';

const PIN_STORAGE_KEY = 'aware-pin';
// 这一项不持久化到 localStorage，刷新页面就要重新解锁（符合"应用锁"语义）
let sessionUnlocked = false;

export function AppLockGate({ children }: { children: React.ReactNode }) {
  const enabled = useStore(s => s.settings.appLockEnabled);
  const hasPin = !!localStorage.getItem(PIN_STORAGE_KEY);
  const [unlocked, setUnlocked] = useState(sessionUnlocked);

  // 启用了锁但 PIN 不存在（比如 PIN 被手动从 localStorage 删了）→ 当作未启用处理，避免锁死
  if (!enabled || !hasPin || unlocked) {
    return <>{children}</>;
  }

  return (
    <PinChallenge
      onPass={() => {
        sessionUnlocked = true;
        setUnlocked(true);
      }}
    />
  );
}

function PinChallenge({ onPass }: { onPass: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (pin.length === 4) {
      const stored = localStorage.getItem(PIN_STORAGE_KEY);
      if (pin === stored) {
        onPass();
      } else {
        setError('PIN 不正确');
        setTimeout(() => { setPin(''); setError(''); }, 700);
      }
    }
  }, [pin, onPass]);

  const handleDigit = (d: string) => {
    if (pin.length < 4) setPin(p => p + d);
  };
  const handleDelete = () => setPin(p => p.slice(0, -1));

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--color-bg)] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-16 h-16 rounded-full bg-[var(--color-brand-bg)] flex items-center justify-center">
          <Lock size={28} className="text-[var(--color-brand-deep)]" />
        </div>
        <h1 className="font-display text-[22px] mt-5">输入 PIN 解锁</h1>
        <p className="text-[12px] text-[var(--color-text-secondary)] mt-1.5 text-center px-4">
          已开启应用锁，每次启动都需要输入 4 位 PIN
        </p>

        <div className="flex items-center gap-4 my-10">
          {[0, 1, 2, 3].map(i => (
            <span
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                i < pin.length
                  ? 'bg-[var(--color-brand-deep)] border-[var(--color-brand-deep)] scale-110'
                  : 'border-[var(--color-text-tertiary)]'
              } ${error ? '!border-[var(--color-error)] !bg-[var(--color-error)]' : ''}`}
            />
          ))}
        </div>

        {error && <div className="text-[13px] text-[var(--color-error)] mb-4">{error}</div>}
      </div>

      <div className="grid grid-cols-3 gap-2 px-6 pb-safe pb-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
          <button
            key={d}
            onClick={() => handleDigit(d.toString())}
            className="h-16 rounded-2xl text-[24px] font-display bg-[var(--color-bg-elev-1)] active:bg-[var(--color-bg-elev-2)] transition"
          >
            {d}
          </button>
        ))}
        <span />
        <button
          onClick={() => handleDigit('0')}
          className="h-16 rounded-2xl text-[24px] font-display bg-[var(--color-bg-elev-1)] active:bg-[var(--color-bg-elev-2)] transition"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="h-16 rounded-2xl flex items-center justify-center text-[var(--color-text-secondary)] active:bg-[var(--color-bg-elev-2)] transition"
        >
          <Delete size={22} />
        </button>
      </div>
    </div>
  );
}
