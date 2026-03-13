import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ACTIVE_STATUSES = ["active", "trialing"];

function hasValidAccess(token: { trialEnd?: string | null; subscriptionStatus?: string | null }): boolean {
  if (token.subscriptionStatus && ACTIVE_STATUSES.includes(token.subscriptionStatus)) {
    return true;
  }
  if (token.trialEnd && new Date(token.trialEnd).getTime() > Date.now()) {
    return true;
  }
  return false;
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    const onboardingCompleted = !!(token?.companyName || token?.onboardingCompleted);

    // 1. Sem onboarding → /onboarding
    if (!onboardingCompleted && pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // 2. Onboarding completo tentando acessar /onboarding → dashboard
    if (onboardingCompleted && pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 3. Sem acesso válido (trial expirado + sem assinatura) → /upgrade
    //    Exceção: settings e upgrade em si
    const isExempt =
      pathname === "/upgrade" ||
      pathname === "/dashboard/settings";

    if (onboardingCompleted && !isExempt && !hasValidAccess(token ?? {})) {
      return NextResponse.redirect(new URL("/upgrade", req.url));
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
  matcher: ["/dashboard/:path*", "/editor/:path*", "/onboarding", "/upgrade"],
};
