import { NextResponse, type NextRequest } from 'next/server';

/* ============================================================
   حماية المسارات — فحص سريع لوجود كوكي الجلسة (يعمل على Edge
   بلا تحميل Prisma)، مع تمرير المسار المقصود إلى صفحة الدخول.
   التحقّق الحقيقي من الجلسة يتم على الخادم داخل كل صفحة.
   ============================================================ */

const SESSION_COOKIES = ['authjs.session-token', '__Secure-authjs.session-token'];

function hasSessionCookie(req: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => req.cookies.has(name));
}

export function middleware(req: NextRequest) {
  if (hasSessionCookie(req)) return NextResponse.next();

  const { pathname, search } = req.nextUrl;
  const url = req.nextUrl.clone();
  url.pathname = '/signin';
  url.search = `?returnTo=${encodeURIComponent(`${pathname}${search}`)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/home/:path*',
    '/explore/:path*',
    '/search/:path*',
    '/bookmarks/:path*',
    '/notifications/:path*',
    '/messages/:path*',
    '/settings/:path*',
    '/u/:path*',
    '/post/:path*'
  ]
};
