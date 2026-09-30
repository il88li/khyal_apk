import Link from 'next/link';
import { Badge, LinkButton } from '@/components/ui';
import { ThemeToggle } from '@/components/theme-toggle';
import { S } from '@/lib/strings';

/* ============================================================
   صفحة الهبوط — عربية، RTL، بلا اعتماد على الشبكة أو القاعدة،
   فتُبنى كملف ثابت وتُخدَم من شبكة التوزيع بسرعة فائقة لأي عدد زوار.
   ============================================================ */

const STATS = [
  { value: '+12k', label: 'برومبت منشور' },
  { value: '+4.8k', label: 'مبدع عربي' },
  { value: '99.9%', label: 'جاهزية الخدمة' }
];

const FEATURES = [
  {
    title: 'البرومبت كاملاً، لا صورة فقط',
    body: 'كل منشور يأتي بنصّه الأصلي جاهزاً للنسخ والتعديل، مع الموديل والوسوم التي تناسب أسلوبك.',
    icon: (
      <path d="M4 6h16M4 12h10M4 18h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    )
  },
  {
    title: 'مكتبة تُبنى بذكائك',
    body: 'احفظ ما يعجبك، صنّفه بوسوم، وارجع إليه لاحقاً من أي جهاز في ثوانٍ.',
    icon: (
      <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    )
  },
  {
    title: 'مجتمع عربي أصيل',
    body: 'واجهة من اليمين لليسار، ووسوم عربية، وناس يشاركون شغفك من المحيط إلى الخليج.',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" stroke="currentColor" strokeWidth="2" />
      </>
    )
  }
];

const STEPS = [
  { n: '01', title: 'أنشئ حسابك', body: 'بريد إلكتروني وكلمة مرور — وتدخل فوراً بلا خطوات زائدة.' },
  { n: '02', title: 'شارك أو استكشف', body: 'انشر برومبتك الأول، أو تصفّح ما نشره المبدعون اليوم.' },
  { n: '03', title: 'احفظ وابنِ مكتبتك', body: 'احفظ أفضل ما تراه، وانسخ البرومبتات متى احتجتها.' }
];

const SAMPLES = [
  { t: 'مدينة عائمة عند الغروب', p: 'floating city above the clouds, golden hour, volumetric light', m: 'Midjourney', hue: 'from-violet-500/70 to-indigo-700/70' },
  { t: 'بورتريه بإضاءة سينمائية', p: 'cinematic portrait, rim light, 85mm, shallow depth of field', m: 'Flux', hue: 'from-amber-400/70 to-orange-600/70' },
  { t: 'غابة ضبابية مستقبلية', p: 'misty neon forest, bioluminescent plants, moody fog', m: 'Stable Diffusion', hue: 'from-emerald-400/70 to-teal-700/70' },
  { t: 'مخطوطة عربية مزخرفة', p: 'ornate arabic calligraphy, gold leaf, dark parchment', m: 'Ideogram', hue: 'from-rose-400/70 to-fuchsia-700/70' },
  { t: 'مركبة صحراوية', p: 'retro futuristic desert rover, dust trail, wide lens', m: 'DALL·E 3', hue: 'from-sky-400/70 to-blue-700/70' },
  { t: 'معمار إسلامي حديث', p: 'modern islamic architecture, geometric screens, sunlight', m: 'Recraft', hue: 'from-lime-400/70 to-emerald-700/70' }
];

export function Landing() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      {/* ---------- الشريط العلوي ---------- */}
      <header className="sticky top-0 z-[var(--z-header)] border-b border-[var(--color-border)]/70 bg-[var(--color-bg)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[var(--container-full)] items-center gap-3 px-4 md:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={S.app.name}>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white font-[var(--font-weight-bold)] shadow-[var(--shadow-brand)]">
              خ
            </span>
            <span className="text-[var(--text-lg)] font-[var(--font-weight-bold)] tracking-tight">{S.app.name}</span>
          </Link>

          <nav className="mx-4 hidden items-center gap-1 md:flex" aria-label="روابط الصفحة">
            <a href="#features" className="rounded-full px-3 py-2 text-[var(--text-sm)] text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-fg)]">المميزات</a>
            <a href="#how" className="rounded-full px-3 py-2 text-[var(--text-sm)] text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-fg)]">كيف تعمل</a>
            <a href="#community" className="rounded-full px-3 py-2 text-[var(--text-sm)] text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-fg)]">من المجتمع</a>
          </nav>

          <div className="flex-1" />
          <ThemeToggle />
          <LinkButton href="/signin" variant="ghost" size="sm" className="hidden sm:inline-flex">تسجيل الدخول</LinkButton>
          <LinkButton href="/signup" size="sm">{S.landing.ctaPrimary}</LinkButton>
        </div>
      </header>

      <main id="main">
        {/* ---------- البطل ---------- */}
        <section className="relative mx-auto grid max-w-[var(--container-full)] items-center gap-12 px-4 pb-16 pt-14 md:px-8 md:pb-24 md:pt-20 lg:grid-cols-[1.05fr_1fr]">
          <div className="k-anim-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-1.5 text-[var(--text-xs)] text-[var(--color-fg-muted)] shadow-[var(--shadow-xs)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success-500)] k-pulse-dot" />
              {S.app.tagline}
            </span>

            <h1 className="mt-5 text-[var(--text-4xl)] font-[var(--font-weight-bold)] leading-[1.1] tracking-tight md:text-[var(--text-5xl)]">
              <span className="k-gradient-text">{S.landing.heroTitle}</span>
            </h1>

            <p className="mt-5 max-w-xl text-[var(--text-md)] leading-relaxed text-[var(--color-fg-muted)]">
              {S.landing.heroLead}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LinkButton href="/signup" size="lg" className="shadow-[var(--shadow-brand)]">{S.landing.ctaPrimary}</LinkButton>
              <LinkButton href="/home" size="lg" variant="secondary">{S.landing.ctaSecondary}</LinkButton>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-[var(--color-border)] pt-6">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="text-[var(--text-2xs)] text-[var(--color-fg-subtle)]">{s.label}</dt>
                  <dd className="num mt-1 text-[var(--text-xl)] font-[var(--font-weight-bold)]">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* بطاقات عائمة */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden>
            <div className="k-orb pointer-events-none absolute -top-16 start-1/4 h-72 w-72 rounded-full bg-[var(--color-brand-500)]/25 blur-3xl" />
            <div className="k-orb-2 pointer-events-none absolute -bottom-10 end-0 h-56 w-56 rounded-full bg-[var(--color-accent-400)]/25 blur-3xl" />

            <div className="relative grid gap-4">
              {SAMPLES.slice(0, 3).map((s, i) => (
                <article
                  key={s.t}
                  className={`k-float relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-xl)]`}
                  style={{ animationDelay: `${i * 0.6}s`, marginInlineStart: `${i * 14}px` }}
                >
                  <div className={`h-24 rounded-[var(--radius-lg)] bg-gradient-to-br ${s.hue}`} />
                  <h3 className="mt-3 text-[var(--text-sm)] font-[var(--font-weight-semibold)]">{s.t}</h3>
                  <p dir="ltr" className="mt-1 line-clamp-2 text-start font-mono text-[var(--text-2xs)] text-[var(--color-fg-subtle)]">
                    {s.p}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="brand" size="sm">{s.m}</Badge>
                    <span className="text-[var(--text-2xs)] text-[var(--color-fg-subtle)]">برومبت جاهز للنسخ</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- المميزات ---------- */}
        <section id="features" className="border-y border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-16 md:py-24">
          <div className="mx-auto max-w-[var(--container-full)] px-4 md:px-8">
            <header className="max-w-2xl">
              <h2 className="text-[var(--text-3xl)] font-[var(--font-weight-bold)]">{S.landing.valueTitle}</h2>
              <p className="mt-3 text-[var(--text-md)] text-[var(--color-fg-muted)]">
                بنينا خَيال ليصنع فرقاً حقيقياً في طريقة اكتشافك للبرومبتات وتنظيمها.
              </p>
            </header>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {FEATURES.map((f) => (
                <article key={f.title} className="group rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-shadow hover:shadow-[var(--shadow-lg)]">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>{f.icon}</svg>
                  </span>
                  <h3 className="mt-4 text-[var(--text-lg)] font-[var(--font-weight-semibold)]">{f.title}</h3>
                  <p className="mt-2 text-[var(--text-sm)] leading-relaxed text-[var(--color-fg-muted)]">{f.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- كيف تعمل ---------- */}
        <section id="how" className="py-16 md:py-24">
          <div className="mx-auto max-w-[var(--container-full)] px-4 md:px-8">
            <h2 className="text-[var(--text-3xl)] font-[var(--font-weight-bold)]">{S.landing.stepsTitle}</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.n} className="relative rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                  <span className="num text-[var(--text-3xl)] font-[var(--font-weight-bold)] text-[var(--color-brand-400)]">{s.n}</span>
                  <h3 className="mt-3 text-[var(--text-lg)] font-[var(--font-weight-semibold)]">{s.title}</h3>
                  <p className="mt-2 text-[var(--text-sm)] text-[var(--color-fg-muted)]">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- من المجتمع ---------- */}
        <section id="community" className="border-y border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-16 md:py-24">
          <div className="mx-auto max-w-[var(--container-full)] px-4 md:px-8">
            <header className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-[var(--text-3xl)] font-[var(--font-weight-bold)]">{S.landing.communityTitle}</h2>
                <p className="mt-3 max-w-xl text-[var(--text-md)] text-[var(--color-fg-muted)]">
                  عيّنة من البرومبتات التي يشاركها المبدعون كل يوم.
                </p>
              </div>
              <LinkButton href="/explore" variant="secondary">تصفّح المزيد</LinkButton>
            </header>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SAMPLES.map((s) => (
                <article key={s.t} className="group overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] transition-transform duration-[var(--duration-base)] hover:-translate-y-1">
                  <div className={`relative h-40 bg-gradient-to-br ${s.hue}`}>
                    <span className="absolute bottom-3 start-3 inline-flex h-7 items-center rounded-full bg-black/55 px-2.5 text-[var(--text-xs)] text-white backdrop-blur">
                      {s.m}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-[var(--text-sm)] font-[var(--font-weight-semibold)]">{s.t}</h3>
                    <p dir="ltr" className="mt-1.5 line-clamp-2 text-start font-mono text-[var(--text-2xs)] text-[var(--color-fg-subtle)]">
                      {s.p}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- نداء أخير ---------- */}
        <section className="px-4 py-16 md:px-8 md:py-24">
          <div className="k-cta mx-auto max-w-[var(--container-wide)] overflow-hidden rounded-[var(--radius-3xl)] border border-[var(--color-border)] p-10 text-center md:p-16">
            <h2 className="text-[var(--text-3xl)] font-[var(--font-weight-bold)]">{S.landing.finalCtaTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-[var(--text-md)] text-[var(--color-fg-muted)]">
              {S.landing.finalCtaLead}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <LinkButton href="/signup" size="lg">{S.landing.ctaPrimary}</LinkButton>
              <LinkButton href="/signin" size="lg" variant="secondary">لدي حساب</LinkButton>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--color-border)] py-10">
        <div className="mx-auto flex max-w-[var(--container-full)] flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-8">
          <p className="text-[var(--text-xs)] text-[var(--color-fg-subtle)]">
            © {new Date().getFullYear()} {S.app.name} — {S.app.description}
          </p>
          <nav className="flex items-center gap-4 text-[var(--text-xs)] text-[var(--color-fg-subtle)]">
            <Link href="/explore" className="hover:text-[var(--color-fg)]">استكشف</Link>
            <Link href="/signin" className="hover:text-[var(--color-fg)]">تسجيل الدخول</Link>
            <Link href="/signup" className="hover:text-[var(--color-fg)]">إنشاء حساب</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
