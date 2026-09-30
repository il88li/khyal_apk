'use client';
import { useEffect, useRef, useState } from 'react';
import { ConversationRow, MessageBubble, PageHeader } from '@/components/compounds';
import { Alert, Avatar, Button, EmptyState, IconButton, Skeleton } from '@/components/ui';
import { api } from '@/lib/api-client';
import { useStore } from '@/lib/store';
import type { Message } from '@/lib/types';
import { S } from '@/lib/strings';
import { cn } from '@/lib/utils';

/* ============================================================
   الرسائل — عمودان على الشاشات الكبيرة، وعمود واحد على الجوال.
   نُحمّل المحادثة عند الطلب فقط (بلا استقصاء دوري) لتخفيف الحمل.
   ============================================================ */

export function MessagesScreen() {
  const conversations = useStore((s) => s.conversations);
  const setConversations = useStore((s) => s.setConversations);
  const activeId = useStore((s) => s.activeConversationId);
  const setActive = useStore((s) => s.setActiveConversation);

  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [threadStatus, setThreadStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .conversations()
      .then((list) => { if (!cancelled) { setConversations(list); setStatus('ready'); } })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [setConversations]);

  useEffect(() => {
    if (!activeId) { setMessages([]); setThreadStatus('idle'); return; }
    let cancelled = false;
    setThreadStatus('loading');
    api
      .messages(activeId)
      .then((list) => { if (!cancelled) { setMessages(list); setThreadStatus('ready'); } })
      .catch(() => { if (!cancelled) setThreadStatus('error'); });
    return () => { cancelled = true; };
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  async function send() {
    const body = draft.trim();
    if (!body || !activeId || sending) return;
    setSending(true);
    try {
      const msg = await api.sendMessage(activeId, body);
      setMessages((cur) => [...cur, msg]);
      setDraft('');
      setConversations(conversations.map((c) =>
        c.id === activeId ? { ...c, lastMessage: msg.body, lastMessageAt: msg.createdAt } : c
      ));
    } catch {
      /* نُبقي المسودة لتُعاد المحاولة */
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <PageHeader title={S.messages.title} description="محادثاتك الخاصة مع المبدعين." />

      {status === 'error' ? <Alert kind="error">{S.states.error}</Alert> : null}

      <div className="grid gap-4 md:grid-cols-[300px_1fr]">
        {/* قائمة المحادثات */}
        <aside className={cn('flex-col gap-1', activeId ? 'hidden md:flex' : 'flex')}>
          {status === 'loading' ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={64} rounded="xl" className="w-full" />)
          ) : null}

          {status === 'ready' && !conversations.length ? (
            <EmptyState title={S.messages.empty} description={S.messages.emptyHint} />
          ) : null}

          {conversations.map((c) => (
            <ConversationRow key={c.id} convo={c} active={c.id === activeId} onOpen={setActive} />
          ))}
        </aside>

        {/* المحادثة */}
        <section className={cn(
          'min-h-[50vh] flex-col rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)]',
          activeId ? 'flex' : 'hidden md:flex'
        )}>
          {!active ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState title={S.messages.title} description="اختر محادثة من القائمة لتبدأ." />
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-[var(--color-border)] p-3">
                <IconButton
                  aria-label="رجوع"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setActive(null)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </IconButton>
                <Avatar src={active.peer.avatarUrl} name={active.peer.name} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-[var(--text-sm)] font-[var(--font-weight-semibold)]">{active.peer.name}</p>
                  <p className="truncate text-[var(--text-xs)] text-[var(--color-fg-subtle)]">@{active.peer.username}</p>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-4">
                {threadStatus === 'loading' ? (
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={40} rounded="xl" className="w-2/3" />)}
                  </div>
                ) : null}

                {threadStatus === 'error' ? <Alert kind="error">{S.states.error}</Alert> : null}

                {threadStatus === 'ready' && !messages.length ? (
                  <EmptyState title="لا رسائل بعد" description="اكتب أول رسالة لتفتح المحادثة." />
                ) : null}

                <div className="flex flex-col gap-2">
                  {messages.map((m) => (
                    <MessageBubble key={m.id} message={m} mine={m.senderId !== active.peer.id} />
                  ))}
                </div>
                <div ref={bottomRef} />
              </div>

              <footer className="flex items-center gap-2 border-t border-[var(--color-border)] p-3">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
                  placeholder={S.messages.placeholder}
                  aria-label={S.messages.placeholder}
                  className="h-10 flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 text-[var(--text-sm)] outline-none focus:border-[var(--color-border-focus)]"
                />
                <Button onClick={send} loading={sending} disabled={!draft.trim()}>{S.messages.send}</Button>
              </footer>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
