'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Post, User, Notification, Conversation, Theme,
  PostSort, SearchTab, Paginated
} from './types';

/* ---------- الجلسة ---------- */
interface SessionSlice {
  user: User | null;
  status: 'idle' | 'authenticating' | 'authenticated' | 'unauthenticated';
  setUser: (u: User | null) => void;
  setStatus: (s: SessionSlice['status']) => void;
  signout: () => Promise<void>;
}

/* ---------- الحالة العامة ---------- */
interface UiSlice {
  activeScreen: string;
  setActiveScreen: (s: string) => void;
  drawers: Record<string, boolean>;
  openDrawer: (k: string) => void;
  closeDrawer: (k: string) => void;
  closeAllDrawers: () => void;
}

/* ---------- المظهر ---------- */
interface ThemeSlice {
  theme: Theme;
  resolved: 'light' | 'dark';
  setTheme: (t: Theme) => void;
  applyResolved: (r: 'light' | 'dark') => void;
}

/* ---------- الصوت ---------- */
interface SoundSlice {
  soundEnabled: boolean;
  soundVolume: number;
  toggleSound: () => void;
  setSoundVolume: (v: number) => void;
}

/* ---------- الفلاتر ---------- */
interface FiltersSlice {
  sort: PostSort;
  setSort: (s: PostSort) => void;
  activeTags: string[];
  activeModels: string[];
  toggleTag: (t: string) => void;
  toggleModel: (m: string) => void;
  clearFilters: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchTab: SearchTab;
  setSearchTab: (t: SearchTab) => void;
}

/* ---------- المحتوى ---------- */
interface FeedKey { key: string }
interface ContentSlice {
  feeds: Record<string, Paginated<Post>>;
  setFeed: (key: string, data: Paginated<Post>) => void;
  appendFeed: (key: string, data: Paginated<Post>) => void;
  patchPost: (id: string, patch: Partial<Post>) => void;
  removePost: (id: string) => void;
  resetFeed: (key: string) => void;
}

/* ---------- الإشعارات ---------- */
interface NotificationsSlice {
  unreadCount: number;
  items: Notification[];
  setUnreadCount: (n: number) => void;
  setItems: (n: Notification[]) => void;
  markAllRead: () => void;
  markOneRead: (id: string) => void;
}

/* ---------- المحادثات ---------- */
interface MessagingSlice {
  conversations: Conversation[];
  activeConversationId: string | null;
  setConversations: (c: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
}

/* ---------- الشبكة ---------- */
interface NetworkSlice {
  online: boolean;
  setOnline: (b: boolean) => void;
}

/* ---------- التثبيت ---------- */
interface PwaSlice {
  installPromptEvent: unknown | null;
  canInstall: boolean;
  dismissedInstall: boolean;
  setInstallPrompt: (e: unknown | null) => void;
  dismissInstall: () => void;
}

/* ---------- التركيب النهائي ---------- */
export type Store = SessionSlice & UiSlice & ThemeSlice & SoundSlice &
  FiltersSlice & ContentSlice & NotificationsSlice & MessagingSlice &
  NetworkSlice & PwaSlice;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      /* --- session --- */
      user: null,
      status: 'idle',
      setUser: (u) => set({ user: u, status: u ? 'authenticated' : 'unauthenticated' }),
      setStatus: (s) => set({ status: s }),
      signout: async () => {
        try { await fetch('/api/auth/signout', { method: 'POST' }); } catch { /* نتجاهل */ }
        set({ user: null, status: 'unauthenticated', unreadCount: 0, items: [] });
      },

      /* --- ui --- */
      activeScreen: 'home',
      setActiveScreen: (s) => set({ activeScreen: s }),
      drawers: {},
      openDrawer: (k) => set((st) => ({ drawers: { ...st.drawers, [k]: true } })),
      closeDrawer: (k) => set((st) => ({ drawers: { ...st.drawers, [k]: false } })),
      closeAllDrawers: () => set({ drawers: {} }),

      /* --- theme --- */
      theme: 'system',
      resolved: 'light',
      setTheme: (t) => set({ theme: t }),
      applyResolved: (r) => {
        set({ resolved: r });
        if (typeof document !== 'undefined') {
          document.documentElement.dataset.theme = r;
          document.documentElement.style.colorScheme = r;
        }
      },

      /* --- sound --- */
      soundEnabled: true,
      soundVolume: 0.35,
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      setSoundVolume: (v) => set({ soundVolume: Math.max(0, Math.min(1, v)) }),

      /* --- filters --- */
      sort: 'latest',
      setSort: (s) => set({ sort: s }),
      activeTags: [],
      activeModels: [],
      toggleTag: (t) => set((st) => ({
        activeTags: st.activeTags.includes(t)
          ? st.activeTags.filter((x) => x !== t)
          : [...st.activeTags, t]
      })),
      toggleModel: (m) => set((st) => ({
        activeModels: st.activeModels.includes(m)
          ? st.activeModels.filter((x) => x !== m)
          : [...st.activeModels, m]
      })),
      clearFilters: () => set({ activeTags: [], activeModels: [] }),
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
      searchTab: 'all',
      setSearchTab: (t) => set({ searchTab: t }),

      /* --- content --- */
      feeds: {},
      setFeed: (key, data) => set((st) => ({ feeds: { ...st.feeds, [key]: data } })),
      appendFeed: (key, data) => set((st) => {
        const cur = st.feeds[key] ?? { items: [], nextCursor: null };
        const seen = new Set(cur.items.map((p) => p.id));
        const merged = [...cur.items, ...data.items.filter((p) => !seen.has(p.id))];
        return { feeds: { ...st.feeds, [key]: { items: merged, nextCursor: data.nextCursor } } };
      }),
      patchPost: (id, patch) => set((st) => {
        const feeds = Object.fromEntries(
          Object.entries(st.feeds).map(([k, v]) => [
            k,
            { ...v, items: v.items.map((p) => (p.id === id ? { ...p, ...patch } : p)) }
          ])
        );
        return { feeds };
      }),
      removePost: (id) => set((st) => {
        const feeds = Object.fromEntries(
          Object.entries(st.feeds).map(([k, v]) => [
            k,
            { ...v, items: v.items.filter((p) => p.id !== id) }
          ])
        );
        return { feeds };
      }),
      resetFeed: (key) => set((st) => {
        const feeds = { ...st.feeds };
        delete feeds[key];
        return { feeds };
      }),

      /* --- notifications --- */
      unreadCount: 0,
      items: [],
      setUnreadCount: (n) => set({ unreadCount: Math.max(0, n) }),
      setItems: (n) => set({ items: n }),
      markAllRead: () => set((st) => ({
        unreadCount: 0,
        items: st.items.map((it) => ({ ...it, readAt: it.readAt ?? new Date().toISOString() }))
      })),
      markOneRead: (id) => set((st) => {
        const items = st.items.map((it) => (it.id === id ? { ...it, readAt: it.readAt ?? new Date().toISOString() } : it));
        const unreadCount = items.filter((it) => !it.readAt).length;
        return { items, unreadCount };
      }),

      /* --- messaging --- */
      conversations: [],
      activeConversationId: null,
      setConversations: (c) => set({ conversations: c }),
      setActiveConversation: (id) => set({ activeConversationId: id }),

      /* --- network --- */
      online: true,
      setOnline: (b) => set({ online: b }),

      /* --- pwa --- */
      installPromptEvent: null,
      canInstall: false,
      dismissedInstall: false,
      setInstallPrompt: (e) => set({ installPromptEvent: e, canInstall: Boolean(e) }),
      dismissInstall: () => set({ dismissedInstall: true, canInstall: false })
    }),
    {
      name: 'khayal-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        theme: s.theme,
        soundEnabled: s.soundEnabled,
        soundVolume: s.soundVolume,
        dismissedInstall: s.dismissedInstall
      })
    }
  )
);

/* اختيارات مُحسّنة لتقليل إعادة الرسم */
export const selectUser = (s: Store) => s.user;
export const selectTheme = (s: Store) => s.theme;
export const selectResolved = (s: Store) => s.resolved;
export const selectUnread = (s: Store) => s.unreadCount;
export const selectSort = (s: Store) => s.sort;
export const selectFilters = (s: Store) => ({
  tags: s.activeTags, models: s.activeModels
});