import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';

    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'intelicole.pe';
    const isDev = hostname.includes('localhost') || hostname.includes('127.0.0.1');

    if (
        url.pathname.startsWith('/_next') ||
        url.pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    if (isDev) {
        return NextResponse.next();
    }

    const cleanHost = hostname.replace(/:\d+$/, '');

    if (!cleanHost.endsWith(`.${baseDomain}`)) {
        return NextResponse.next();
    }

    const subdomain = cleanHost.slice(0, -(baseDomain.length + 1));

    if (!subdomain || subdomain === 'www') {
        return NextResponse.next();
    }

    if (subdomain === 'admin') {
        if (url.pathname.startsWith('/admin')) {
            return NextResponse.next();
        }

        if (url.pathname === '/') {
            url.pathname = '/admin/login';
            return NextResponse.rewrite(url);
        }

        url.pathname = `/admin${url.pathname}`;
        return NextResponse.rewrite(url);
    }

    if (url.pathname.startsWith(`/${subdomain}`)) {
        return NextResponse.next();
    }

    if (url.pathname === '/') {
        url.pathname = `/${subdomain}/login`;
        return NextResponse.rewrite(url);
    }

    url.pathname = `/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};
