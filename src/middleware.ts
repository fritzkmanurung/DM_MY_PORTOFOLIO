import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // We only run auth checks/session updates for /admin and /portal-rahasia
  if (path.startsWith('/admin') || path === '/portal-rahasia') {
    // Refresh session and get the reusable supabase client
    const { response, supabase } = await updateSession(request)

    // Get user once, reuse for all checks
    const { data: { user } } = await supabase.auth.getUser()

    // Protect /admin routes — redirect to /login if not authenticated
    if (path.startsWith('/admin')) {
      if (!user) {
        const loginUrl = new URL('/portal-rahasia', request.url)
        loginUrl.searchParams.set('redirect', path)
        return NextResponse.redirect(loginUrl)
      }
    }

    // Redirect authenticated users away from /portal-rahasia
    if (path === '/portal-rahasia') {
      if (user) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
