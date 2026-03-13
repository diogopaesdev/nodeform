import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

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

    // Verificação de assinatura é feita no dashboard/layout.tsx (Server Component)
    // que lê o Firestore em tempo real — sem depender do JWT em cache.
    // Passa o pathname como header para o layout conseguir isentar /settings.
    const res = NextResponse.next();
    res.headers.set("x-pathname", pathname);
    return res;
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
