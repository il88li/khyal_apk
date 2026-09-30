# خَيال — Khayal

منصة عربية لمشاركة واكتشاف **برومبتات الصور المُنشأة بالذكاء الاصطناعي**. كل منشور يأتي مع البرومبت الكامل، الموديل، والوسوم، جاهزاً للنسخ والحفظ في مكتبتك الخاصة.

## التقنيات

| الطبقة | التقنية |
| --- | --- |
| الواجهة | Next.js 15 (App Router) · React 19 · TypeScript |
| التنسيق | Tailwind CSS 4 + نظام رموز (design tokens) في `src/app/globals.css` |
| الحالة | Zustand (مع تخزين جزئي للمظهر والصوت) |
| الخادم | Route Handlers على Node + Prisma |
| القاعدة | PostgreSQL (Prisma) |
| المصادقة | Auth.js v5 (NextAuth) — جلسات JWT مع مُهايئ Prisma |
| المراقبة | Sentry · Vercel Analytics · Speed Insights |

## البنية

```
src/
├─ app/
│  ├─ (صفحات محمية) home · explore · search · bookmarks · notifications
│  │                · messages · settings · u/[username] · post/[id]
│  ├─ signin · signup          ← صفحات المصادقة
│  ├─ api/[...route]           ← موجّه REST واحد يوزّع على src/lib/server/routes.ts
│  ├─ api/auth/[...nextauth]   ← مسار Auth.js
│  └─ globals.css              ← نظام التصميم كاملاً
├─ components/                 ← الذرات (ui) · المركّبات (compounds) · الإطار (shell)
├─ lib/
│  ├─ server/                  ← db · auth · routes · session
│  ├─ api-client.ts            ← عميل واحد لكل نداءات الـ API
│  ├─ store.ts · use-feed.ts   ← حالة العميل وخطاف القوائم المرقّمة
│  └─ taxonomy.ts · strings.ts · types.ts · utils.ts
```

## التشغيل محلياً

1. **تجهيز البيئة** — أنشئ `.env.local` وأضف:

   | المتغيّر | إلزامي | الوصف |
   | --- | --- | --- |
   | `DATABASE_URL` | ✅ | رابط PostgreSQL (في الإنتاج: أضف `?sslmode=require&connection_limit=10&pool_timeout=20` واستعمل مُجمِّع اتصالات مثل Neon/Supabase Pooler/PgBouncer) |
   | `AUTH_SECRET` | ✅ | مفتاح توقيع الجلسات: `openssl rand -base64 32` |
   | `NEXT_PUBLIC_SITE_URL` | ➖ | العنوان العام (روابط المشاركة و`metadataBase`) |
   | `CRON_SECRET` | ➖ | يحمي `/api/cron/cleanup` |
   | `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | ➖ | المراقبة |

2. **القاعدة**
   ```bash
   bun install
   bun run db:push     # إنشاء الجداول والفهارس
   bun run db:seed     # بيانات تجريبية للانطلاق (اختياري)
   ```

3. **التطوير**
   ```bash
   bun run dev
   ```

### الأوامر

| الأمر | الوظيفة |
| --- | --- |
| `bun run dev` | خادم التطوير |
| `bun run build` | بناء الإنتاج |
| `bun run start` | تشغيل نسخة الإنتاج |
| `bun run typecheck` | فحص الأنواع |
| `bun run test` | اختبارات Vitest |
| `bun run lint` | ESLint |
| `bun run db:push` / `db:seed` / `db:generate` | Prisma |

## الاستعداد لعدد مستخدمين كبير

ما هو مطبَّق فعلياً في هذا المستودع:

- **ترقيم بالمؤشّر (cursor pagination)** في كل القوائم — لا `OFFSET` يتدهور مع كبر الجداول.
- **فهارس قاعدة بيانات موجّهة للقراءة**: `(createdAt)` للتدفّق الزمني، `(likeCount, createdAt)` للترتيب حسب التفاعل، فهرس `GIN` على `Post.tags` لتصفية الوسوم، وفهارس مركّبة على التعليقات والإشعارات والمحادثات.
- **جلسات JWT** — لا استعلام قاعدة بيانات للتحقق من الجلسة على كل طلب.
- **حدّ طلبات لكل IP** (قراءة 300/دقيقة، كتابة 60/دقيقة) قبل الوصول إلى Prisma، مع تنظيف دوري للذاكرة.
- **صفحة الهبوط ثابتة (Static)** تُخدَم من شبكة التوزيع، وكل الأقسام الثقيلة تحمّل محتواها على العميل.
- **تحميل تدريجي عند التمرير** عبر `IntersectionObserver` بدل مكتبات ثقيلة.
- **تأخير ذكي للبحث (debounce)** لتقليل الطلبات عند الكتابة.
- **صور محسّنة** (AVIF/WebP) مع `minimumCacheTTL` 30 يوماً وتخزين ثابت `immutable` لأصول `/_next/static`.
- **Service Worker** يخزّن الأصول الثابتة فقط ولا يخزّن الـ API، مع صفحة «غير متصل» احتياطية.
- **`content-visibility: auto`** لتخطي رسم الأقسام البعيدة عن الشاشة.
- **إزالة `console`** من حزمة الإنتاج (مع إبقاء `error`/`warn`).
- **عدّادات التعامل بدون معاملات ثقيلة** — تُعتمد القيود الفريدة `(userId, postId)` لمنع ازدواج العدّ.

### قبل الإطلاق التجاري

1. **تشغيل نسخ متعدّدة**: استبدل محدّد الطلبات في الذاكرة (في `src/lib/server/routes.ts`) بمخزن مشترك (Redis/Upstash) بنفس الواجهة.
2. **مُجمِّع اتصالات قاعدة البيانات**: PgBouncer أو Pooler المزوّد، مع `connection_limit` مناسب لكل نسخة.
3. **نسخ قراءة (Read replicas)** لقوائم التدفّق والاستكشاف إن تجاوز الترافيك قدرة النسخة الواحدة.
4. **تخزين مؤقّت على الحافة** لقوائم الزوّار غير المسجّلين — مسارات `/api/posts` تُرجع `liked/saved` لكل مستخدم، لذا استعمل نسخة مجهولة منفصلة.
5. **رفع الصور**: حاليًا تُلصق روابط خارجية. الانتقال إلى تخزين كائنات (S3 / Vercel Blob) + CDN يمنع الروابط المكسورة.
6. **المراقبة**: فعّل Sentry وتنبيهات زمن الاستجابة، وراقب `/api/health` (يفحص الاتصال بقاعدة البيانات).

## الأمان

- تشفير كلمات المرور بـ bcrypt (12 دورة) ولا تُعاد أبداً في أي استجابة.
- تحقّق من كل مدخلات الـ API بـ Zod.
- ترويسات CSP وHSTS و`X-Frame-Options` على كل المسارات.
- حماية المسارات في `src/middleware.ts` مع تمرير `returnTo`، وتحقق حقيقي من الجلسة داخل كل صفحة على الخادم.
- حدّ الطلبات، وتقييد `callbackUrl`/`returnTo` بالمسارات الداخلية فقط.
