'use client';
import Image from 'next/image';
import {
  forwardRef, useEffect, useId, useRef,
  type ButtonHTMLAttributes, type InputHTMLAttributes,
  type ReactNode, type TextareaHTMLAttributes, type SelectHTMLAttributes
} from 'react';
import { createPortal } from 'react-dom';
import { cn, initials } from '@/lib/utils';

/* ============================================================
   الأجزاء 3 – 8 — كل الذرات في ملف واحد
   ============================================================ */

/* ---------- Spinner ---------- */
export function Spinner({ size = 16, className, label }: { size?: number; className?: string; label?: string }) {
  return (
    <span role="status" aria-live="polite" className={cn('inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}

/* ---------- Button ---------- */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-primary)] text-[var(--color-fg-on-brand)] ' +
    'hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)] ' +
    'shadow-sm hover:shadow-brand disabled:bg-[var(--color-neutral-300)] ' +
    'disabled:shadow-none disabled:text-[var(--color-neutral-500)]',
  secondary:
    'bg-[var(--color-surface)] text-[var(--color-fg)] border border-[var(--color-border)] ' +
    'hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-strong)] ' +
    'active:bg-[var(--color-surface-active)]',
  ghost:
    'bg-transparent text-[var(--color-fg)] ' +
    'hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-active)]',
  danger:
    'bg-[var(--color-danger-600)] text-white hover:bg-[var(--color-danger-700)] shadow-sm',
  link:
    'bg-transparent text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] ' +
    'underline-offset-4 hover:underline px-0'
};

const BTN_SIZE: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[var(--text-sm)] gap-1.5 rounded-[var(--radius-md)]',
  md: 'h-10 px-4 text-[var(--text-base)] gap-2 rounded-[var(--radius-lg)]',
  lg: 'h-12 px-6 text-[var(--text-md)] gap-2.5 rounded-[var(--radius-xl)]'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, fullWidth, leadingIcon, trailingIcon,
    className, children, disabled, type = 'button', ...rest }, ref
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref} type={type} disabled={isDisabled} aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center font-[var(--font-weight-semibold)]',
        'select-none whitespace-nowrap',
        'transition-[background-color,border-color,color,box-shadow,transform]',
        'duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
        'active:scale-[0.98] disabled:active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed',
        BTN_VARIANT[variant],
        variant !== 'link' && BTN_SIZE[size],
        variant === 'link' && 'h-auto',
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {loading && <Spinner size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      {!loading && leadingIcon && <span className="inline-flex shrink-0">{leadingIcon}</span>}
      <span className="truncate">{children}</span>
      {!loading && trailingIcon && <span className="inline-flex shrink-0">{trailingIcon}</span>}
    </button>
  );
});

/* ---------- IconButton ---------- */
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'solid' | 'outline' | 'soft';
  loading?: boolean;
  children: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { size = 'md', variant = 'ghost', loading, className, children, disabled, type = 'button', ...rest }, ref
) {
  const SIZES = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' } as const;
  const VARS = {
    ghost: 'bg-transparent text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-fg)]',
    solid: 'bg-[var(--color-primary)] text-[var(--color-fg-on-brand)] hover:bg-[var(--color-primary-hover)] shadow-sm',
    outline: 'bg-[var(--color-surface)] text-[var(--color-fg)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]',
    soft: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)] hover:bg-[var(--color-brand-100)]'
  } as const;
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref} type={type} disabled={isDisabled} aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-full shrink-0',
        'transition-[background-color,color,transform] duration-[var(--duration-fast)]',
        'active:scale-[0.94] disabled:opacity-50 disabled:cursor-not-allowed',
        SIZES[size], VARS[variant], className
      )}
      {...rest}
    >
      {loading ? <Spinner size={size === 'sm' ? 14 : size === 'lg' ? 22 : 18} /> : children}
    </button>
  );
});

/* ---------- Input ---------- */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leadingIcon, trailingSlot, className, id, disabled, ...rest }, ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy =
    [hint ? `${inputId}-hint` : null, error ? `${inputId}-err` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-[var(--text-sm)] font-[var(--font-weight-medium)]">{label}</label>
      ) : null}
      <div className={cn(
        'flex items-center gap-2 h-10 px-3 rounded-[var(--radius-lg)]',
        'bg-[var(--color-surface)] border',
        'transition-[border-color,box-shadow] duration-[var(--duration-fast)]',
        error
          ? 'border-[var(--color-danger-500)] focus-within:shadow-[0_0_0_3px_rgb(239_68_68_/_0.15)]'
          : 'border-[var(--color-border)] focus-within:border-[var(--color-border-focus)] focus-within:shadow-[0_0_0_3px_rgb(168_85_247_/_0.15)]',
        disabled && 'opacity-60 cursor-not-allowed bg-[var(--color-bg-muted)]'
      )}>
        {leadingIcon ? <span className="shrink-0 inline-flex text-[var(--color-fg-subtle)]">{leadingIcon}</span> : null}
        <input
          ref={ref} id={inputId} disabled={disabled}
          aria-invalid={error ? true : undefined} aria-describedby={describedBy}
          className={cn(
            'flex-1 min-w-0 bg-transparent outline-none',
            'text-[var(--text-base)] text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)]',
            className
          )}
          {...rest}
        />
        {trailingSlot ? <span className="shrink-0 inline-flex">{trailingSlot}</span> : null}
      </div>
      {error
        ? <p id={`${inputId}-err`} role="alert" className="text-[var(--text-xs)] text-[var(--color-danger-600)]">{error}</p>
        : hint ? <p id={`${inputId}-hint`} className="text-[var(--text-xs)] text-[var(--color-fg-subtle)]">{hint}</p>
        : null}
    </div>
  );
});

/* ---------- Textarea ---------- */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  autoResize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, id, disabled, autoResize, rows = 4, onInput, ...rest }, ref
) {
  const autoId = useId();
  const areaId = id ?? autoId;
  const describedBy =
    [hint ? `${areaId}-hint` : null, error ? `${areaId}-err` : null].filter(Boolean).join(' ') || undefined;
  const handleInput: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
    if (autoResize) {
      const t = e.currentTarget;
      t.style.height = 'auto';
      t.style.height = `${t.scrollHeight}px`;
    }
    onInput?.(e);
  };
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label ? <label htmlFor={areaId} className="text-[var(--text-sm)] font-[var(--font-weight-medium)]">{label}</label> : null}
      <textarea
        ref={ref} id={areaId} rows={rows} disabled={disabled} onInput={handleInput}
        aria-invalid={error ? true : undefined} aria-describedby={describedBy}
        className={cn(
          'w-full px-3 py-2.5 rounded-[var(--radius-lg)] resize-none',
          'bg-[var(--color-surface)] border text-[var(--text-base)] text-[var(--color-fg)]',
          'placeholder:text-[var(--color-fg-subtle)] outline-none',
          'transition-[border-color,box-shadow] duration-[var(--duration-fast)]',
          error
            ? 'border-[var(--color-danger-500)] focus:shadow-[0_0_0_3px_rgb(239_68_68_/_0.15)]'
            : 'border-[var(--color-border)] focus:border-[var(--color-border-focus)] focus:shadow-[0_0_0_3px_rgb(168_85_247_/_0.15)]',
          disabled && 'opacity-60 cursor-not-allowed bg-[var(--color-bg-muted)]',
          className
        )}
        {...rest}
      />
      {error
        ? <p id={`${areaId}-err`} role="alert" className="text-[var(--text-xs)] text-[var(--color-danger-600)]">{error}</p>
        : hint ? <p id={`${areaId}-hint`} className="text-[var(--text-xs)] text-[var(--color-fg-subtle)]">{hint}</p>
        : null}
    </div>
  );
});

/* ---------- Select ---------- */
export interface SelectOption { value: string; label: string; disabled?: boolean }
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, placeholder, className, id, disabled, ...rest }, ref
) {
  const autoId = useId();
  const selId = id ?? autoId;
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label ? <label htmlFor={selId} className="text-[var(--text-sm)] font-[var(--font-weight-medium)]">{label}</label> : null}
      <div className="relative">
        <select
          ref={ref} id={selId} disabled={disabled} aria-invalid={error ? true : undefined}
          className={cn(
            'w-full h-10 ps-3 pe-9 rounded-[var(--radius-lg)] appearance-none cursor-pointer',
            'bg-[var(--color-surface)] border text-[var(--text-base)] text-[var(--color-fg)]',
            'transition-[border-color,box-shadow] duration-[var(--duration-fast)] outline-none',
            error
              ? 'border-[var(--color-danger-500)]'
              : 'border-[var(--color-border)] focus:border-[var(--color-border-focus)] focus:shadow-[0_0_0_3px_rgb(168_85_247_/_0.15)]',
            disabled && 'opacity-60 cursor-not-allowed bg-[var(--color-bg-muted)]',
            className
          )}
          {...rest}
        >
          {placeholder ? <option value="" disabled>{placeholder}</option> : null}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
          ))}
        </select>
        <span aria-hidden className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      {error
        ? <p role="alert" className="text-[var(--text-xs)] text-[var(--color-danger-600)]">{error}</p>
        : hint ? <p className="text-[var(--text-xs)] text-[var(--color-fg-subtle)]">{hint}</p>
        : null}
    </div>
  );
});

/* ---------- SearchInput ---------- */
export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> { onClear?: () => void }

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { className, onClear, value, ...rest }, ref
) {
  const hasValue = typeof value === 'string' && value.length > 0;
  return (
    <div className={cn(
      'flex items-center gap-2 h-10 px-3 rounded-full',
      'bg-[var(--color-bg-muted)] border border-transparent',
      'focus-within:bg-[var(--color-surface)] focus-within:border-[var(--color-border-focus)]',
      'focus-within:shadow-[0_0_0_3px_rgb(168_85_247_/_0.15)]',
      'transition-[background-color,border-color,box-shadow] duration-[var(--duration-fast)]',
      className
    )}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-[var(--color-fg-subtle)]">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        ref={ref} type="search" value={value}
        className="flex-1 min-w-0 bg-transparent outline-none text-[var(--text-base)] placeholder:text-[var(--color-fg-subtle)]"
        {...rest}
      />
      {hasValue && onClear ? (
        <button type="button" onClick={onClear} aria-label="مسح البحث"
          className="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-[var(--color-neutral-300)] hover:bg-[var(--color-neutral-400)] text-[var(--color-neutral-700)] transition">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
        </button>
      ) : null}
    </div>
  );
});

/* ---------- Checkbox / Radio / Switch ---------- */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> { label?: string; hint?: string }
export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> { label?: string; hint?: string }
export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> { label?: string; hint?: string }

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, hint, className, id, ...rest }, ref
) {
  const autoId = useId(); const cid = id ?? autoId;
  return (
    <label htmlFor={cid} className={cn('inline-flex items-start gap-2.5 cursor-pointer select-none', className)}>
      <span className="relative inline-flex shrink-0 mt-0.5">
        <input ref={ref} id={cid} type="checkbox" className="peer sr-only" {...rest} />
        <span aria-hidden className={cn(
          'h-5 w-5 rounded-[var(--radius-sm)] border-2 border-[var(--color-border-strong)]',
          'bg-[var(--color-surface)] transition-[background-color,border-color] duration-[var(--duration-fast)]',
          'peer-checked:bg-[var(--color-primary)] peer-checked:border-[var(--color-primary)]',
          'peer-focus-visible:ring-4 peer-focus-visible:ring-[var(--color-primary-ring)]/40',
          'peer-disabled:opacity-50',
          "after:content-[''] after:absolute after:left-1/2 after:top-1/2",
          'after:w-[10px] after:h-[6px] after:border-white after:border-l-2 after:border-b-2',
          'after:-translate-x-1/2 after:-translate-y-[60%] after:rotate-[-45deg]',
          'after:opacity-0 peer-checked:after:opacity-100 after:transition-opacity'
        )} />
      </span>
      {label || hint ? (
        <span className="flex flex-col gap-0.5">
          {label ? <span className="text-[var(--text-base)]">{label}</span> : null}
          {hint ? <span className="text-[var(--text-xs)] text-[var(--color-fg-subtle)]">{hint}</span> : null}
        </span>
      ) : null}
    </label>
  );
});

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, hint, className, id, ...rest }, ref
) {
  const autoId = useId(); const rid = id ?? autoId;
  return (
    <label htmlFor={rid} className={cn('inline-flex items-start gap-2.5 cursor-pointer select-none', className)}>
      <span className="relative inline-flex shrink-0 mt-0.5">
        <input ref={ref} id={rid} type="radio" className="peer sr-only" {...rest} />
        <span aria-hidden className={cn(
          'h-5 w-5 rounded-full border-2 border-[var(--color-border-strong)]',
          'bg-[var(--color-surface)] transition-[border-color] duration-[var(--duration-fast)]',
          'peer-checked:border-[var(--color-primary)]',
          'after:content-[""] after:absolute after:inset-[5px] after:rounded-full',
          'after:bg-[var(--color-primary)] after:scale-0 peer-checked:after:scale-100',
          'after:transition-transform after:duration-[var(--duration-fast)] after:ease-[var(--ease-spring)]',
          'peer-focus-visible:ring-4 peer-focus-visible:ring-[var(--color-primary-ring)]/40',
          'peer-disabled:opacity-50'
        )} />
      </span>
      {label || hint ? (
        <span className="flex flex-col gap-0.5">
          {label ? <span className="text-[var(--text-base)]">{label}</span> : null}
          {hint ? <span className="text-[var(--text-xs)] text-[var(--color-fg-subtle)]">{hint}</span> : null}
        </span>
      ) : null}
    </label>
  );
});

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, hint, className, id, ...rest }, ref
) {
  const autoId = useId(); const sid = id ?? autoId;
  return (
    <label htmlFor={sid} className={cn('inline-flex items-center gap-3 cursor-pointer select-none', className)}>
      <span className="relative inline-flex">
        <input ref={ref} id={sid} type="checkbox" role="switch" className="peer sr-only" {...rest} />
        <span aria-hidden className={cn(
          'inline-block h-6 w-11 rounded-full bg-[var(--color-neutral-300)]',
          'transition-colors duration-[var(--duration-fast)]',
          'peer-checked:bg-[var(--color-primary)]',
          'peer-focus-visible:ring-4 peer-focus-visible:ring-[var(--color-primary-ring)]/40',
          'peer-disabled:opacity-50',
          'after:content-[""] after:absolute after:top-0.5 after:start-0.5',
          'after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm',
          'after:transition-transform after:duration-[var(--duration-fast)]',
          'peer-checked:after:translate-x-[20px] rtl:peer-checked:after:-translate-x-[20px]'
        )} />
      </span>
      {label || hint ? (
        <span className="flex flex-col gap-0.5">
          {label ? <span className="text-[var(--text-base)]">{label}</span> : null}
          {hint ? <span className="text-[var(--text-xs)] text-[var(--color-fg-subtle)]">{hint}</span> : null}
        </span>
      ) : null}
    </label>
  );
});

/* ---------- Slider ---------- */
export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showValue?: boolean;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { label, showValue, className, id, value, ...rest }, ref
) {
  const autoId = useId(); const sid = id ?? autoId;
  return (
    <div className={cn('w-full flex flex-col gap-2', className)}>
      {(label || showValue) ? (
        <div className="flex items-center justify-between">
          {label ? <label htmlFor={sid} className="text-[var(--text-sm)] font-[var(--font-weight-medium)]">{label}</label> : <span />}
          {showValue ? <span className="num text-[var(--text-xs)] text-[var(--color-fg-subtle)]">{value}</span> : null}
        </div>
      ) : null}
      <input
        ref={ref} id={sid} type="range" value={value}
        className={cn(
          'w-full h-1.5 appearance-none cursor-pointer rounded-full',
          'bg-[var(--color-neutral-200)]',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4',
          '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-primary)]',
          '[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform',
          '[&::-webkit-slider-thumb]:active:scale-110',
          '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:border-0',
          '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--color-primary)]'
        )}
        {...rest}
      />
    </div>
  );
});

/* ---------- Badge ---------- */
export type BadgeVariant = 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
export interface BadgeProps { variant?: BadgeVariant; size?: 'sm' | 'md'; className?: string; children: ReactNode; leadingDot?: boolean }

const BADGE_V: Record<BadgeVariant, string> = {
  neutral: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]',
  brand:   'bg-[var(--color-brand-50)] text-[var(--color-brand-700)]',
  accent:  'bg-[var(--color-accent-50)] text-[var(--color-accent-700)]',
  success: 'bg-[var(--color-success-50)] text-[var(--color-success-700)]',
  warning: 'bg-[var(--color-warning-50)] text-[var(--color-warning-700)]',
  danger:  'bg-[var(--color-danger-50)] text-[var(--color-danger-700)]',
  info:    'bg-[var(--color-info-50)] text-[var(--color-info-700)]',
  outline: 'bg-transparent text-[var(--color-fg-muted)] border border-[var(--color-border)]'
};

export function Badge({ variant = 'neutral', size = 'md', leadingDot, className, children }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-[var(--font-weight-medium)] whitespace-nowrap',
      BADGE_V[variant],
      size === 'sm' ? 'h-5 px-2 text-[var(--text-2xs)] gap-1' : 'h-6 px-2.5 text-[var(--text-xs)] gap-1.5',
      className
    )}>
      {leadingDot ? <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

/* ---------- Avatar ---------- */
export interface AvatarProps { src?: string | null; name: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string; ring?: boolean }
const AV_PX = { sm: 32, md: 40, lg: 56, xl: 96 } as const;
const AV_TX = { sm: 'text-[var(--text-xs)]', md: 'text-[var(--text-sm)]', lg: 'text-[var(--text-lg)]', xl: 'text-[var(--text-2xl)]' } as const;

export function Avatar({ src, name, size = 'md', className, ring }: AvatarProps) {
  const px = AV_PX[size];
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        'bg-[var(--color-brand-100)] text-[var(--color-brand-700)]',
        ring && 'ring-2 ring-[var(--color-bg)] outline outline-1 outline-[var(--color-border)]',
        className
      )}
      style={{ width: px, height: px }}
    >
      {src
        ? <Image src={src} alt={name} fill sizes={`${px}px`} className="object-cover" />
        : <span aria-hidden className={cn('font-[var(--font-weight-semibold)]', AV_TX[size])}>{initials(name)}</span>}
    </span>
  );
}

/* ---------- Divider ---------- */
export function Divider({ orientation = 'horizontal', label, className }: { orientation?: 'horizontal' | 'vertical'; label?: string; className?: string }) {
  if (orientation === 'vertical') return <span aria-hidden className={cn('inline-block w-px self-stretch bg-[var(--color-border)]', className)} />;
  if (label) return (
    <div className={cn('flex items-center gap-3', className)} role="separator">
      <span className="h-px flex-1 bg-[var(--color-border)]" />
      <span className="text-[var(--text-xs)] text-[var(--color-fg-subtle)]">{label}</span>
      <span className="h-px flex-1 bg-[var(--color-border)]" />
    </div>
  );
  return <hr role="separator" className={cn('h-px w-full border-0 bg-[var(--color-border)]', className)} />;
}

/* ---------- Skeleton ---------- */
export interface SkeletonProps { width?: string | number; height?: string | number; rounded?: 'sm'|'md'|'lg'|'xl'|'full'; className?: string }
const SK_R = { sm: 'rounded-[var(--radius-sm)]', md: 'rounded-[var(--radius-md)]', lg: 'rounded-[var(--radius-lg)]', xl: 'rounded-[var(--radius-xl)]', full: 'rounded-full' } as const;

export function Skeleton({ width, height = 12, rounded = 'md', className }: SkeletonProps) {
  return (
    <span aria-hidden
      className={cn('inline-block bg-[var(--color-neutral-200)]', SK_R[rounded], className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'k-shimmer 1.6s infinite linear'
      }}
    />
  );
}

/* ---------- Progress ---------- */
export function Progress({ value, max = 100, size = 'md', className, label }: { value: number; max?: number; size?: 'sm'|'md'; className?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn('w-full', className)} role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <div className={cn('w-full overflow-hidden rounded-full bg-[var(--color-neutral-200)]', size === 'sm' ? 'h-1' : 'h-2')}>
        <div className="h-full bg-[var(--color-primary)] rounded-full transition-[width] duration-[var(--duration-base)]"
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ---------- Modal ---------- */
export interface ModalProps {
  open: boolean; onClose: () => void; title?: string; description?: string;
  size?: 'sm' | 'md' | 'lg'; children: ReactNode; footer?: ReactNode; closeOnOverlay?: boolean;
}

export function Modal({ open, onClose, title, description, size = 'md', children, footer, closeOnOverlay = true }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && ref.current) {
        const nodes = ref.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
        );
        if (!nodes.length) return;
        const first = nodes[0]!; const last = nodes[nodes.length - 1]!;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => ref.current?.querySelector<HTMLElement>('input,button')?.focus(), 60);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); clearTimeout(t); };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;
  const SIZE = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' } as const;

  return createPortal(
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 animate-fade-in"
      role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined}>
      <button aria-label="إغلاق" onClick={() => closeOnOverlay && onClose()}
        className="absolute inset-0 bg-[var(--color-bg-overlay)] backdrop-blur-sm" />
      <div ref={ref} className={cn(
        'relative w-full bg-[var(--color-bg-elevated)] rounded-[var(--radius-2xl)]',
        'shadow-2xl border border-[var(--color-border)] animate-scale-in',
        'max-h-[90dvh] flex flex-col', SIZE[size]
      )}>
        {title ? (
          <div className="p-5 border-b border-[var(--color-border)] flex items-start justify-between gap-4">
            <div>
              <h2 id="modal-title" className="text-[var(--text-lg)] font-[var(--font-weight-bold)]">{title}</h2>
              {description ? <p className="mt-1 text-[var(--text-sm)] text-[var(--color-fg-muted)]">{description}</p> : null}
            </div>
            <button type="button" onClick={onClose} aria-label="إغلاق"
              className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-surface-hover)] transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
        ) : null}
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
        {footer ? <div className="p-4 border-t border-[var(--color-border)] flex items-center justify-end gap-2">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}

/* ---------- Drawer ---------- */
export interface DrawerProps {
  open: boolean; onClose: () => void;
  side?: 'start' | 'end' | 'bottom';
  title?: string; children: ReactNode; width?: string;
}

export function Drawer({ open, onClose, side = 'end', title, children, width }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const pos =
    side === 'start' ? 'start-0 top-0 h-full'
    : side === 'end' ? 'end-0 top-0 h-full'
    : 'bottom-0 inset-x-0 rounded-t-[var(--radius-2xl)]';

  return createPortal(
    <div className="fixed inset-0 z-[var(--z-drawer)]" role="dialog" aria-modal="true">
      <button aria-label="إغلاق" onClick={onClose}
        className="absolute inset-0 bg-[var(--color-bg-overlay)] backdrop-blur-sm animate-fade-in" />
      <div className={cn(
        'absolute bg-[var(--color-bg-elevated)] shadow-2xl border-[var(--color-border)] flex flex-col',
        side !== 'bottom' && 'w-full max-w-sm animate-fade-in',
        side === 'start' ? 'border-e' : side === 'end' ? 'border-s' : 'border-t',
        pos
      )} style={side !== 'bottom' && width ? { width } : undefined}>
        {title ? (
          <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h2 className="text-[var(--text-lg)] font-[var(--font-weight-bold)]">{title}</h2>
            <button type="button" onClick={onClose} aria-label="إغلاق"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-surface-hover)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
        ) : null}
        <div className="p-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>,
    document.body
  );
}

/* ---------- Dropdown ---------- */
export interface DropdownItem {
  id: string; label: string; icon?: ReactNode;
  danger?: boolean; disabled?: boolean;
  onSelect?: () => void;
}

export function Dropdown({ trigger, items, align = 'end', label }: {
  trigger: ReactNode; items: DropdownItem[]; align?: 'start' | 'end'; label?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} aria-label={label}>
        {trigger}
      </button>
      {open ? (
        <div role="menu" className={cn(
          'absolute top-full mt-2 z-[var(--z-dropdown)] min-w-[12rem]',
          'bg-[var(--color-bg-elevated)] rounded-[var(--radius-xl)] border border-[var(--color-border)]',
          'shadow-xl py-1.5 animate-scale-in',
          align === 'end' ? 'end-0' : 'start-0'
        )}>
          {items.map((it) => (
            <button key={it.id} role="menuitem" disabled={it.disabled}
              onClick={() => { it.onSelect?.(); setOpen(false); }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 text-[var(--text-sm)] text-start',
                'transition-colors duration-[var(--duration-fast)]',
                'hover:bg-[var(--color-surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed',
                it.danger ? 'text-[var(--color-danger-600)]' : 'text-[var(--color-fg)]'
              )}>
              {it.icon ? <span className="inline-flex shrink-0">{it.icon}</span> : null}
              <span className="truncate">{it.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Tooltip ---------- */
export function Tooltip({ children, content }: { children: ReactNode; content: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)} onBlur={() => setShow(false)}>
      {children}
      {show ? (
        <span role="tooltip" className={cn(
          'absolute bottom-full mb-2 start-1/2 -translate-x-1/2 rtl:translate-x-1/2',
          'bg-[var(--color-neutral-900)] text-white text-[var(--text-xs)]',
          'px-2 py-1 rounded-[var(--radius-md)] whitespace-nowrap',
          'z-[var(--z-tooltip)] animate-fade-in pointer-events-none'
        )}>{content}</span>
      ) : null}
    </span>
  );
}

/* ---------- Toast ---------- */
interface ToastMsg { id: string; body: string; kind?: 'info' | 'success' | 'error' }
let pushToast: ((m: Omit<ToastMsg, 'id'>) => void) | null = null;

export function toast(body: string, kind: ToastMsg['kind'] = 'info') {
  pushToast?.({ body, kind });
}

export function ToastHost() {
  const [items, setItems] = useState<ToastMsg[]>([]);

  useEffect(() => {
    pushToast = (m) => {
      const id = Math.random().toString(36).slice(2);
      setItems((cur) => [...cur, { ...m, id }]);
      setTimeout(() => setItems((cur) => cur.filter((x) => x.id !== id)), 3200);
    };
    return () => { pushToast = null; };
  }, []);

  if (typeof document === 'undefined' || !items.length) return null;

  return createPortal(
    <div className="fixed bottom-24 md:bottom-6 inset-x-0 z-[var(--z-toast)] flex flex-col items-center gap-2 pointer-events-none px-4">
      {items.map((t) => (
        <div key={t.id} role="status" className={cn(
          'pointer-events-auto max-w-sm px-4 py-2.5 rounded-[var(--radius-xl)] shadow-lg',
          'text-[var(--text-sm)] font-[var(--font-weight-medium)] animate-slide-up',
          t.kind === 'error' ? 'bg-[var(--color-danger-600)] text-white'
          : t.kind === 'success' ? 'bg-[var(--color-success-600)] text-white'
          : 'bg-[var(--color-neutral-900)] text-white'
        )}>{t.body}</div>
      ))}
    </div>,
    document.body
  );
}

/* ---------- Tabs ---------- */
export interface TabItem { id: string; label: string; badge?: number }
export function Tabs({ items, active, onChange, variant = 'underline' }: {
  items: TabItem[]; active: string; onChange: (id: string) => void;
  variant?: 'underline' | 'pill';
}) {
  return (
    <div role="tablist" className={cn(
      'flex items-center gap-1 overflow-x-auto scrollbar-none',
      variant === 'underline' && 'border-b border-[var(--color-border)]',
      variant === 'pill' && 'p-1 bg-[var(--color-bg-muted)] rounded-full w-fit'
    )}>
      {items.map((t) => {
        const on = t.id === active;
        return (
          <button key={t.id} role="tab" aria-selected={on} onClick={() => onChange(t.id)}
            className={cn(
              'shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap',
              'transition-[color,background-color,border-color] duration-[var(--duration-fast)]',
              'font-[var(--font-weight-medium)] text-[var(--text-sm)]',
              variant === 'underline' && cn(
                'px-3 py-3 -mb-px border-b-2',
                on ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                   : 'border-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
              ),
              variant === 'pill' && cn(
                'h-8 px-4 rounded-full',
                on ? 'bg-[var(--color-surface)] text-[var(--color-fg)] shadow-sm'
                   : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
              )
            )}>
            {t.label}
            {typeof t.badge === 'number' && t.badge > 0 ? (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold">
                {t.badge > 99 ? '99+' : t.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- EmptyState / Alert ---------- */
export function EmptyState({ icon, title, description, action }: {
  icon?: ReactNode; title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-6">
      {icon ? <div className="mb-4 text-[var(--color-fg-subtle)] opacity-60">{icon}</div> : null}
      <h3 className="text-[var(--text-lg)] font-[var(--font-weight-semibold)] text-[var(--color-fg)]">{title}</h3>
      {description ? <p className="mt-2 max-w-sm text-[var(--text-sm)] text-[var(--color-fg-muted)]">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Alert({ kind = 'info', title, children, action }: {
  kind?: 'info' | 'success' | 'warning' | 'error';
  title?: string; children: ReactNode; action?: ReactNode;
}) {
  const map = {
    info:    'bg-[var(--color-info-50)] border-[var(--color-info-500)]/25 text-[var(--color-info-700)]',
    success: 'bg-[var(--color-success-50)] border-[var(--color-success-500)]/25 text-[var(--color-success-700)]',
    warning: 'bg-[var(--color-warning-50)] border-[var(--color-warning-500)]/25 text-[var(--color-warning-700)]',
    error:   'bg-[var(--color-danger-50)] border-[var(--color-danger-500)]/25 text-[var(--color-danger-700)]'
  } as const;
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={cn('p-3.5 rounded-[var(--radius-lg)] border flex items-start gap-3', map[kind])}>
      <div className="flex-1 min-w-0">
        {title ? <p className="font-[var(--font-weight-semibold)] text-[var(--text-sm)]">{title}</p> : null}
        <div className="text-[var(--text-sm)] opacity-90">{children}</div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ---------- Field (حقل بحالة) ---------- */
export function Field({ label, hint, error, required, children }: {
  label: string; hint?: string; error?: string; required?: boolean; children: ReactNode;
}) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      <label className="text-[var(--text-sm)] font-[var(--font-weight-medium)]">
        {label}{required ? <span className="text-[var(--color-danger-600)] ms-1">*</span> : null}
      </label>
      {children}
      {error ? <p role="alert" className="text-[var(--text-xs)] text-[var(--color-danger-600)]">{error}</p>
        : hint ? <p className="text-[var(--text-xs)] text-[var(--color-fg-subtle)]">{hint}</p> : null}
    </div>
  );
}

/* استيراد useState بعدياً لتجنب مشاكل ترتيب التصريح */
import { useState } from 'react';