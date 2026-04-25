'use client';

interface StepIndicatorProps {
  steps: string[];
  current: number;
  onJump?: (index: number) => void;
}

export function StepIndicator({ steps, current, onJump }: StepIndicatorProps) {
  return (
    <ol className="flex flex-wrap gap-2">
      {steps.map((label, idx) => {
        const isActive = idx === current;
        const isDone = idx < current;
        const clickable = onJump && idx <= current;

        return (
          <li key={label}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onJump?.(idx)}
              className={[
                'rounded-full px-3 py-1.5 text-xs font-medium transition',
                isActive
                  ? 'bg-brand-600 text-white shadow'
                  : isDone
                  ? 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                  : 'bg-slate-200 text-slate-500',
                clickable && !isActive ? 'cursor-pointer' : '',
              ].join(' ')}
            >
              {idx + 1}. {label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
