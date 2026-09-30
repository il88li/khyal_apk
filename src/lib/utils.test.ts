import { describe, expect, it } from 'vitest';
import { cn, formatCount, initials, isValidUsername, slugify, truncate } from './utils';

describe('cn', () => {
  it('يدمج الأصناف ويتجاهل القيم الفارغة', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });
});

describe('initials', () => {
  it('يأخذ أول حرفين من الكلمتين الأولى والثانية', () => {
    expect(initials('سارة العبد الله')).toBe('سا');
  });

  it('يتعامل مع اسم من كلمة واحدة', () => {
    expect(initials('خالد')).toBe('خ');
  });
});

describe('formatCount', () => {
  it('يعرض الأرقام الصغيرة كما هي', () => {
    expect(formatCount(999)).toBe('999');
  });

  it('يختصر الآلاف', () => {
    expect(formatCount(1200)).toBe('1.2 ألف');
    expect(formatCount(45000)).toBe('45 ألف');
  });

  it('يختصر الملايين', () => {
    expect(formatCount(2_500_000)).toBe('2.5 مليون');
  });
});

describe('truncate', () => {
  it('لا يغيّر النص القصير', () => {
    expect(truncate('برومبت', 20)).toBe('برومبت');
  });

  it('يقتطع ويضيف علامة الحذف دون تجاوز الحد', () => {
    const out = truncate('a'.repeat(50), 10);
    expect(out.endsWith('…')).toBe(true);
    expect(out.length).toBeLessThanOrEqual(10);
  });
});

describe('isValidUsername', () => {
  it('يقبل المعرّفات المسموحة', () => {
    expect(isValidUsername('khayal_2026')).toBe(true);
  });

  it('يرفض المعرّفات غير الصالحة', () => {
    expect(isValidUsername('Khayal')).toBe(false);
    expect(isValidUsername('ab')).toBe(false);
    expect(isValidUsername('has space')).toBe(false);
  });
});

describe('slugify', () => {
  it('يحوّل المسافات إلى شرطات ويحافظ على الحروف العربية', () => {
    expect(slugify('مدينة عائمة')).toBe('مدينة-عائمة');
  });

  it('يزيل الرموز ويحدّ الطول بـ 40 حرفاً', () => {
    expect(slugify('a!b@c#')).toBe('abc');
    expect(slugify('x'.repeat(80)).length).toBe(40);
  });
});
