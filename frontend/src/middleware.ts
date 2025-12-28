import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname === '/' || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    const match = pathname.match(/^\/([^\/]+)(?:\/(.+))?$/);
    if (!match) {
        return NextResponse.next();
    }

    const tenantSlug = match[1];
    const path = match[2];

    const publicPaths = ['login', 'recover-password'];
    const isPublicRoute = !path || publicPaths.includes(path);

    if (isPublicRoute) {
        return NextResponse.next();
    }

    const token = request.cookies.get('token')?.value;
    const userCookie = request.cookies.get('user')?.value;

    if (!token) {
        return NextResponse.redirect(new URL(`/${tenantSlug}/login`, request.url));
    }

    if (userCookie) {
        try {
            const user = JSON.parse(userCookie);

            if (user.tenant_id && user.tenant?.slug && user.tenant.slug !== tenantSlug) {
                const response = NextResponse.redirect(new URL(`/${tenantSlug}/login`, request.url));
                return response;
            }
        } catch (e) {
            const response = NextResponse.redirect(new URL(`/${tenantSlug}/login`, request.url));
            response.cookies.delete('token');
            response.cookies.delete('user');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         * - public folder files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
