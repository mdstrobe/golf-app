import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Handle auth callback
  const { searchParams } = new URL(req.url);
  const error = searchParams.get('error');
  const errorCode = searchParams.get('error_code');
  const redirectTo = searchParams.get('redirect_to');

  // If there's an error in the URL but it's an OTP expired error
  if (error === 'access_denied' && errorCode === 'otp_expired') {
    // If there's a redirect_to parameter, use it, otherwise default to login
    const redirectUrl = redirectTo || '/login';
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  // Check auth state
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If user is not signed in and the current path is not /login or /signup,
  // redirect the user to /login
  if (!session && !['/login', '/signup'].includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 