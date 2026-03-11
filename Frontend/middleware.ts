import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const tokenVal = request.cookies.get('token')?.value;
    const hasValidToken = !!tokenVal && tokenVal !== 'undefined' && tokenVal !== 'null' && tokenVal.trim() !== '';

    // Define public paths that don't require authentication
    const publicPaths = ['/login', '/']

    // Check if the current path is a public path
    const isPublicPath = publicPaths.some(path => {
        if (path === '/') {
            return request.nextUrl.pathname === '/';
        }
        return request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`);
    });

    // If the user is logged in and tries to access login/register, redirect to dashboard or home
    if (isPublicPath && hasValidToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // If the user is NOT logged in and tries to access a protected route, redirect to login
    if (!isPublicPath && !hasValidToken) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
    ],
}
