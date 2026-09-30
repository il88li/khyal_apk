'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Alert, Badge, Button, Field, Input, Modal, Textarea, toast } from './ui';
import { api } from '@/lib/api-client';
import { S } from '@/lib/strings';
import type { Post } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MODELS as MODEL_LIST, TAGS as SUGGESTED_TAGS } from '@/lib/taxonomy';

export function Composer({
  open, onClose, onCreated
}: {
  open: boolean; onClose: () => void; onCreated?: (post: Post) => void;
}) {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [model, setModel] = useState<string>(MODEL_LIST[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle(''); setPrompt(''); setImageUrl(''); setTags([]); setTagDraft(''); setError(null);
  }

  function addTag(raw: string) {
    const t = raw.trim().replace(/^#/, '').slice(0, 40);
    if (!t || tags.includes(t) || tags.length >= 10) return;
    setTags((cur) => [...cur, t]);
    setTagDraft('');
  }

  async function submit() {
    setError(null);
    if (title.trim().length < 2) return setError('العنوان قصير جداً');
    if (prompt.trim().length < 10) return setError('اكتب البرومبت كاملاً (10 أحرف على الأقل)');
    if (!/^https?:\/\//.test(imageUrl.trim())) return setError('أدخل رابط صورة صالحاً يبدأ بـ https://');

    setBusy(true);
    try {
      const post = await api.createPost({
        title: title.trim(),
        prompt: prompt.trim(),
        imageUrl: imageUrl.trim(),
        model,
        tags
      });
      toast(S.toast.published, 'success');
      onCreated?.(post);
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : S.states.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="نشر برومبت جديد"
      description="شارك الصورة والبرومبت الذي أنشأها ليستفيد منها المجتمع."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>إلغاء</Button>
          <Button onClick={submit} loading={busy}>نشر</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error ? <Alert kind="error">{error}</Alert> : null}

        <Field label="عنوان المنشور" required>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: مدينة عائمة عند الغروب"
            maxLength={120}
          />
        </Field>

        <Field label="البرومبت" required hint="انسخه كما كتبته تماماً — هذا ما يبحث عنه الآخرون.">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            dir="auto"
            placeholder="a floating city at golden hour, cinematic lighting, ultra detailed…"
            maxLength={5000}
          />
        </Field>

        <Field label="رابط الصورة" required hint="ارفع الصورة على أي مستضيف عام والصق الرابط هنا.">
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            dir="ltr"
            placeholder="https://…"
          />
        </Field>

        {/^https?:\/\//.test(imageUrl) ? (
          <div className="relative aspect-[4/5] w-40 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-muted)]">
            <Image src={imageUrl} alt="معاينة" fill sizes="160px" className="object-cover" unoptimized />
          </div>
        ) : null}

        <Field label="الموديل" required>
          <div className="flex flex-wrap gap-2">
            {MODEL_LIST.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModel(m)}
                className={cn(
                  'h-8 px-3 rounded-full border text-[var(--text-sm)] transition-colors',
                  model === m
                    ? 'bg-[var(--color-primary)] text-white border-transparent'
                    : 'border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </Field>

        <Field label="الوسوم" hint={`حتى 10 وسوم · ${tags.length}/10`}>
          <Input
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagDraft); }
            }}
            placeholder="اكتب وسماً واضغط Enter"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <button key={t} type="button" onClick={() => setTags((cur) => cur.filter((x) => x !== t))} aria-label={`إزالة ${t}`}>
                <Badge variant="brand">#{t} ✕</Badge>
              </button>
            ))}
          </div>
          {!tags.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.map((t) => (
                <button key={t} type="button" onClick={() => addTag(t)}>
                  <Badge variant="outline">+ {t}</Badge>
                </button>
              ))}
            </div>
          ) : null}
        </Field>
      </div>
    </Modal>
  );
}
