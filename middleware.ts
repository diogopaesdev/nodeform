import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    const onboardingCompleted = token?.onboardingCompleted ?? false;

    // Usuário autenticado mas sem onboarding: redirecionar para /onboarding
    if (!onboardingCompleted && pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Usuário com onboarding completo tentando acessar /onboarding: redirecionar para dashboard
    if (onboardingCompleted && pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*", "/onboarding"],
};
