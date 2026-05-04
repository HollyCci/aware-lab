import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit3 } from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '@/db/store';
import { getIcon } from '@/lib/icons';
import { markWelcomed } from '@/lib/welcome';
import type { Item } from '@/types';

type Step = 'identify' | 'price' | 'target' | 'done';

const SAMPLE_ICON = '3d_handphone';
const SAMPLE_DEVICE = 'iPhone15,2 128GB';

export function OnboardingPage() {
  const nav = useNavigate();
  const addItem = useStore(s => s.addItem);
  const [step, setStep] = useState<Step>('identify');
  const [name, setName] = useState(SAMPLE_DEVICE);
  const [price, setPrice] = useState('');
  const [targetMode, setTargetMode] = useState<'price' | 'custom'>('price');
  const [targetCost, setTargetCost] = useState('');
  const [planYears, setPlanYears] = useState<1 | 3 | null>(null);

  const goBack = () => {
    if (step === 'price') setStep('identify');
    else if (step === 'target') setStep('price');
    else nav(-1);
  };

  const skipAll = () => { markWelcomed(); nav('/'); };

  const finish = () => {
    const now = new Date().toISOString();
    const it: Item = {
      id: crypto.randomUUID(),
      name: name.trim() || SAMPLE_DEVICE,
      iconName: SAMPLE_ICON,
      categoryId: 'electronics',
      tagIds: [],
      price: Number(price) || 0,
      currency: 'CNY',
      purchaseDate: now,
      targetDailyCost: targetCost ? Number(targetCost) : undefined,
      usageCount: 0,
      status: 'inUse',
      isFavorite: false,
      isPinned: true,
      createdAt: now,
      updatedAt: now,
    };
    addItem(it);
    markWelcomed();
    nav('/');
  };

  if (step === 'done') {
    return <DoneScreen onContinue={finish} name={name} price={price} target={targetCost} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-bg)] flex flex-col">
      <header className="pt-safe">
        <div className="px-4 pt-3 pb-3 flex items-center justify-between">
          {step === 'identify' ? (
            <div className="w-9" />
          ) : (
            <button onClick={goBack} className="-ml-1.5 w-9 h-9 flex items-center justify-center">
              <ChevronLeft size={26} />
            </button>
          )}
          <button onClick={skipAll} className="text-[14px] text-[var(--color-text-secondary)]">跳过</button>
        </div>
      </header>

      {step === 'identify' && (
        <IdentifyStep
          name={name}
          onChangeName={setName}
          onCapture={() => setStep('price')}
          onUseThisDevice={() => setStep('price')}
        />
      )}

      {step === 'price' && (
        <PriceStep
          price={price}
          onChangePrice={setPrice}
          onNext={() => setStep('target')}
        />
      )}

      {step === 'target' && (
        <TargetStep
          price={Number(price) || 0}
          targetMode={targetMode}
          onChangeMode={setTargetMode}
          targetCost={targetCost}
          onChangeTargetCost={setTargetCost}
          planYears={planYears}
          onPickYears={(y) => {
            setPlanYears(y);
            const p = Number(price) || 0;
            if (p > 0) setTargetCost((p / (y * 365)).toFixed(2));
          }}
          onNext={() => setStep('done')}
        />
      )}
    </div>
  );
}

function StickerImage({ name }: { name: string }) {
  return (
    <div
      className="w-32 h-32 flex items-center justify-center"
      style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.08))' }}
    >
      <img src={getIcon(name)} alt="" className="w-full h-full object-contain" />
    </div>
  );
}

function IdentifyStep({ name, onChangeName, onCapture, onUseThisDevice }: {
  name: string; onChangeName: (v: string) => void;
  onCapture: () => void; onUseThisDevice: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-between px-8 pb-safe pb-12">
      <div className="flex-1 flex items-center justify-center">
        <StickerImage name={SAMPLE_ICON} />
      </div>
      <div className="text-center mb-8">
        <h1 className="font-display text-[26px] leading-tight">开始记录你的第一件宝贝</h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mt-2">我们已识别到你的设备</p>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[var(--color-text-secondary)] text-[15px]">
          <input
            value={name}
            onChange={e => onChangeName(e.target.value)}
            className="bg-transparent text-center outline-none"
            style={{ width: `${Math.max(name.length, 8)}ch` }}
          />
          <Edit3 size={14} />
        </div>
      </div>
      <div className="w-full">
        <button
          onClick={onCapture}
          className="w-full h-[52px] rounded-full bg-[var(--color-btn-dark)] text-[var(--color-text-on-dark)] font-display text-[16px] active:scale-[0.98]"
        >
          拍照记录
        </button>
        <p className="text-center text-[12px] text-[var(--color-text-tertiary)] my-3">或</p>
        <button
          onClick={onUseThisDevice}
          className="w-full h-12 text-[15px] text-[var(--color-text-secondary)] active:scale-[0.98]"
        >
          直接记录这台设备
        </button>
      </div>
    </div>
  );
}

function PriceStep({ price, onChangePrice, onNext }: {
  price: string; onChangePrice: (v: string) => void; onNext: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col px-8">
      <h1 className="font-display text-[26px] mt-2 text-center">当时是多少钱入手的?</h1>
      <div className="flex-1 flex flex-col items-center justify-center">
        <StickerImage name={SAMPLE_ICON} />
        <div className="mt-8 flex items-baseline gap-1">
          <span className="font-display text-[32px]">¥</span>
          <input
            value={price}
            onChange={e => onChangePrice(e.target.value.replace(/[^\d.]/g, ''))}
            inputMode="decimal"
            placeholder="0"
            autoFocus
            className="font-display text-[32px] bg-transparent outline-none w-32 caret-[var(--color-brand-deep)] placeholder:text-[var(--color-text-tertiary)]"
          />
        </div>
      </div>
      <div className="pb-safe pb-8">
        <button
          onClick={onNext}
          disabled={!price}
          className="w-full h-[52px] rounded-full bg-[var(--color-btn-dark)] text-[var(--color-text-on-dark)] font-display text-[16px] disabled:opacity-50 active:scale-[0.98]"
        >
          下一步
        </button>
      </div>
    </div>
  );
}

function TargetStep({
  price, targetMode, onChangeMode, targetCost, onChangeTargetCost,
  planYears, onPickYears, onNext,
}: {
  price: number; targetMode: 'price' | 'custom'; onChangeMode: (m: 'price' | 'custom') => void;
  targetCost: string; onChangeTargetCost: (v: string) => void;
  planYears: 1 | 3 | null; onPickYears: (y: 1 | 3) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col px-8">
      <h1 className="font-display text-[26px] mt-2 text-center">定个"回本"小目标</h1>
      <p className="text-center text-[13px] text-[var(--color-text-secondary)] mt-1.5">
        每天的成本降到多少时，你会觉得"物超所值"?
      </p>

      <div className="flex justify-center mt-5">
        <div className="inline-flex bg-[var(--color-bg-elev-3)] rounded-full p-0.5 text-[12px]">
          {(['price', 'custom'] as const).map(t => (
            <button key={t} onClick={() => onChangeMode(t)} className={clsx(
              'px-5 h-9 rounded-full font-medium transition',
              targetMode === t ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] text-[#1a1a1a]' : 'text-[var(--color-text-secondary)]',
            )}>
              {t === 'price' ? '按价格' : '自定义'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-[14px] text-[var(--color-text-secondary)]">目标日均成本</div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-[28px]">¥</span>
          <input
            value={targetCost}
            onChange={e => onChangeTargetCost(e.target.value.replace(/[^\d.]/g, ''))}
            inputMode="decimal"
            placeholder="0"
            className="font-display text-[28px] bg-transparent outline-none w-24 caret-[var(--color-brand-deep)] placeholder:text-[var(--color-text-tertiary)]"
          />
          <span className="font-display text-[20px] text-[var(--color-text-secondary)]">/天</span>
        </div>

        {targetMode === 'price' && (
          <div className="mt-6 flex gap-3">
            {([1, 3] as const).map(y => (
              <button
                key={y}
                onClick={() => onPickYears(y)}
                className={clsx(
                  'h-10 px-5 rounded-full text-[13px] font-medium transition',
                  planYears === y
                    ? 'bg-[var(--color-text)] text-white'
                    : 'bg-[var(--color-bg-elev-3)] text-[var(--color-text-secondary)]',
                )}
              >
                打算用 {y} 年
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pb-safe pb-8">
        <button
          onClick={onNext}
          disabled={price <= 0}
          className="w-full h-[52px] rounded-full bg-[var(--color-btn-dark)] text-[var(--color-text-on-dark)] font-display text-[16px] disabled:opacity-50 active:scale-[0.98]"
        >
          下一步
        </button>
      </div>
    </div>
  );
}

function DoneScreen({ onContinue, name, price, target }: { onContinue: () => void; name: string; price: string; target: string }) {
  // 视频里的彩色 confetti 庆祝页
  const confetti = Array.from({ length: 18 }, (_, i) => ({
    color: ['#a0f030', '#5ac8fa', '#ff9500', '#ff3b30', '#ffd84a', '#af52de'][i % 6],
    x: 10 + (i * 47) % 80,
    y: 5 + (i * 29) % 90,
    rotate: (i * 37) % 180,
  }));

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-bg)] flex flex-col">
      {/* 彩色纸屑 */}
      {confetti.map((c, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: 14, height: 22,
            background: c.color,
            transform: `rotate(${c.rotate}deg) skewX(-20deg)`,
            borderRadius: 3,
          }}
        />
      ))}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        <h1 className="font-display text-[26px] text-center leading-tight">
          太棒了！<br />你的第一件宝贝已就位
        </h1>
        <div className="my-7">
          <div className="w-32 h-32 flex items-center justify-center" style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.08))' }}>
            <img src={getIcon(SAMPLE_ICON)} alt="" className="w-full h-full object-contain" />
          </div>
        </div>
        <div className="text-center">
          <div className="font-display text-[18px]">{name}</div>
          <div className="font-display text-[28px] mt-1">¥{Number(price).toLocaleString('zh-CN')}.00</div>
          {target && (
            <div className="text-[13px] text-[var(--color-text-secondary)] mt-2">
              日均成本：¥{target}　{Number(price) / Number(target) <= 1 ? '已达成目标' : '加油使用'}
            </div>
          )}
        </div>
      </div>
      <div className="px-8 pb-safe pb-12 relative z-10">
        <button
          onClick={onContinue}
          className="w-full h-[52px] rounded-full bg-[var(--color-btn-dark)] text-[var(--color-text-on-dark)] font-display text-[16px] active:scale-[0.98]"
        >
          开启长期主义之旅
        </button>
      </div>
    </div>
  );
}
