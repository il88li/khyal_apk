import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url))
});

/** @type {import('eslint').Linter.Config[]} */
const config = [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'dist/**'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // نسمح بالمتغيّرات غير المستعملة عند بدء اسم بـ _
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // الصور الخارجية المتغيّرة (روابط المستخدمين) تُعرض عبر <img> عند الحاجة
      '@next/next/no-img-element': 'warn'
    }
  }
];

export default config;
