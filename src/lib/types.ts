export interface User {
  id: string;
  username: string;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  accentColor: string;
  createdAt: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
}

export interface Post {
  id: string;
  title: string;
  prompt: string;
  imageUrl: string;
  model: string;
  tags: string[];
  likeCount: number;
  saveCount: number;
  copyCount: number;
  viewCount: number;
  createdAt: string;
  author: Pick<User, 'id' | 'username' | 'name' | 'avatarUrl'>;
  liked?: boolean;
  saved?: boolean;
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: Pick<User, 'id' | 'username' | 'name' | 'avatarUrl'>;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
  body?: string | null;
  postId?: string | null;
  readAt?: string | null;
  createdAt: string;
  actor?: Pick<User, 'id' | 'username' | 'name' | 'avatarUrl'> | null;
}

export interface Conversation {
  id: string;
  peer: Pick<User, 'id' | 'username' | 'name' | 'avatarUrl'>;
  lastMessage?: string | null;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
  senderId: string;
}

export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
}

export type PostSort = 'latest' | 'trending';
export type SearchTab = 'all' | 'posts' | 'creators' | 'tags';
export type Theme = 'light' | 'dark' | 'system';
export type Screen = 'home' | 'explore' | 'search' | 'likes' | 'bookmarks' | 'post' | 'profile' | 'messages' | 'settings';