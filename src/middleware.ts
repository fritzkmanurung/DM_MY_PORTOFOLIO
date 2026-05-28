import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Refresh session and get the reusable supabase client
  const { response, supabase } = await updateSession(request)

  // Get user once, reuse for all checks
  const { data: { user } } = await supabase.auth.getUser()

  // Protect /admin routes — redirect to /login if not authenticated
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/portal-rahasia', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect authenticated users away from /portal-rahasia
  if (request.nextUrl.pathname === '/portal-rahasia') {
    if (user) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
