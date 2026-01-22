'use client';

import { cx } from '@/lib/utils/cx';

interface ProgressBarProps {
  min?: number;
  max?: number;
  value: number;
  label?: string;
  labelPosition?: 'top' | 'top-floating' | 'bottom' | 'none';
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({
  min = 0,
  max = 100,
  value,
  label,
  labelPosition = 'none',
  showPercentage = true,
  size = 'md',
  className
}: ProgressBarProps) {
  const percentage = Math.round(((value - min) / (max - min)) * 100);
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={cx('w-full', className)}>
      {/* Top label */}
      {(labelPosition === 'top' || labelPosition === 'top-floating') && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-label text-muted-foreground">{label}</span>}
          {showPercentage && labelPosition === 'top' && (
            <span className="text-label font-medium text-foreground">{clampedPercentage}%</span>
          )}
        </div>
      )}

      {/* Progress bar container */}
      <div className="relative">
        <div className={cx('w-full bg-accent rounded-full overflow-hidden', sizeStyles[size])}>
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>

        {/* Floating percentage */}
        {labelPosition === 'top-floating' && showPercentage && (
          <div
            className="absolute -top-7 transition-all duration-300 ease-out"
            style={{ left: `${clampedPercentage}%`, transform: 'translateX(-50%)' }}
          >
            <span className="text-label font-medium text-foreground bg-card px-2 py-0.5 rounded border border-border shadow-sm">
              {clampedPercentage}%
            </span>
          </div>
        )}
      </div>

      {/* Bottom label */}
      {labelPosition === 'bottom' && (
        <div className="flex justify-between items-center mt-2">
          {label && <span className="text-label text-muted-foreground">{label}</span>}
          {showPercentage && (
            <span className="text-label font-medium text-foreground">{clampedPercentage}%</span>
          )}
        </div>
      )}
    </div>
  );
}
