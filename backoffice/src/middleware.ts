import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const origin = request.nextUrl.origin

  console.log(`🚀 [Middleware] ${request.method} ${pathname}`)

  // Définition des routes
  const publicPaths = ['/login', '/register']
  const apiPaths = ['/api']
  const protectedPaths = ['/', '/dashboard']

  // Vérifications des types de route
  const isPublicPath = publicPaths.includes(pathname)
  const isApiPath = apiPaths.some(path => pathname.startsWith(path))
  const isProtectedPath = protectedPaths.some(path => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  })

  // Ignorer les routes API
  if (isApiPath) {
    console.log('🔄 API route - bypassing middleware')
    return NextResponse.next()
  }

  // Récupération du token
  const adminToken = request.cookies.get('adminToken')?.value || 
                     request.cookies.get('admin-token')?.value

  console.log(`🔑 Token exists: ${!!adminToken}`)
  console.log(`🛡️ Protected: ${isProtectedPath}, Public: ${isPublicPath}`)
  console.log(`📍 Current path: ${pathname}`)

  // Rediriger vers /login si pas de token sur route protégée
  if (isProtectedPath && !adminToken) {
    console.log('❌ No token on protected route -> login')
    const loginUrl = new URL('/login', origin)
    return NextResponse.redirect(loginUrl)
  }

  // Rediriger vers / si token présent sur la page login
  if (pathname === '/login' && adminToken) {
    console.log('✅ Token found on login page -> /')
    return NextResponse.redirect(new URL('/', origin))
  }

  // Accès autorisé
  console.log('✨ Normal access granted')
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
