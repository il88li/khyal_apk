import type { Post, User, Comment, Notification, Conversation, Message, Paginated, PostSort } from './types';

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    credentials: 'same-origin'
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export const api = {
  async feed(params: { sort: PostSort; tags?: string[]; models?: string[]; cursor?: string | null }): Promise<Paginated<Post>> {
    const q = new URLSearchParams({ sort: params.sort });
    if (params.tags?.length) q.set('tags', params.tags.join(','));
    if (params.models?.length) q.set('models', params.models.join(','));
    if (params.cursor) q.set('cursor', params.cursor);
    return req<Paginated<Post>>(`/api/posts?${q.toString()}`);
  },

  async post(id: string): Promise<{ post: Post; comments: Comment[]; related: Post[] }> {
    return req(`/api/posts/${id}`);
  },

  async createPost(input: { title: string; prompt: string; imageUrl: string; model: string; tags: string[] }): Promise<Post> {
    return req('/api/posts', { method: 'POST', body: JSON.stringify(input) });
  },

  async like(id: string, on: boolean) {
    return req(`/api/posts/${id}/like`, { method: on ? 'POST' : 'DELETE' });
  },

  async save(id: string, on: boolean) {
    return req(`/api/posts/${id}/save`, { method: on ? 'POST' : 'DELETE' });
  },

  async copy(id: string) {
    return req(`/api/posts/${id}/copy`, { method: 'POST' });
  },

  async comment(id: string, body: string): Promise<Comment> {
    return req(`/api/posts/${id}/comments`, { method: 'POST', body: JSON.stringify({ body }) });
  },

  async deleteComment(postId: string, id: string) {
    return req(`/api/posts/${postId}/comments/${id}`, { method: 'DELETE' });
  },

  async profile(username: string): Promise<{ user: User; posts: Post[] }> {
    return req(`/api/users/${username}`);
  },

  async follow(userId: string, on: boolean) {
    return req(`/api/users/${userId}/follow`, { method: on ? 'POST' : 'DELETE' });
  },

  async updateProfile(input: Partial<Pick<User, 'name' | 'bio' | 'avatarUrl' | 'coverUrl' | 'accentColor'>>): Promise<User> {
    return req('/api/me', { method: 'PATCH', body: JSON.stringify(input) });
  },

  async search(q: string, tab: 'all' | 'posts' | 'creators' | 'tags'): Promise<{
    creators: User[]; posts: Post[]; tags: string[];
  }> {
    return req(`/api/search?q=${encodeURIComponent(q)}&tab=${tab}`);
  },

  async notifications(): Promise<Notification[]> {
    return req('/api/notifications');
  },

  async markNotificationsRead(ids: string[] | 'all') {
    return req('/api/notifications/read', { method: 'POST', body: JSON.stringify({ ids }) });
  },

  async conversations(): Promise<Conversation[]> {
    return req('/api/messages/conversations');
  },

  async messages(conversationId: string): Promise<Message[]> {
    return req(`/api/messages/conversations/${conversationId}`);
  },

  async sendMessage(conversationId: string, body: string): Promise<Message> {
    return req(`/api/messages/conversations/${conversationId}`, { method: 'POST', body: JSON.stringify({ body }) });
  },

  async report(input: { targetType: 'post' | 'user' | 'comment'; targetId: string; reason: string; note?: string }) {
    return req('/api/reports', { method: 'POST', body: JSON.stringify(input) });
  },

  async health() {
    return req<{ ok: boolean; timestamp: string }>('/api/health');
  }
};