import type { NextConfig } from "next";

// Bucket do Firebase Storage: restringe o host público só ao nosso bucket, para
// o otimizador de imagens não virar proxy de qualquer objeto no storage.googleapis.com.
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Logo da marca e imagens enviadas pelo admin: /api/user/logo e /api/upload
      // gravam no Firebase Storage e devolvem URL em storage.googleapis.com.
      // Sem esta entrada o next/image recusa a origem e a logo aparece quebrada.
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        ...(storageBucket ? { pathname: `/${storageBucket}/**` } : {}),
      },
    ],
  },
  async headers() {
    // Shared hardening applied everywhere.
    const baseHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ];

    // CSP for admin/app pages: never embedded in a frame.
    const appCsp =
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self'; frame-ancestors 'none'";

    // CSP for public survey pages: MUST be embeddable in client iframes.
    // frame-ancestors * replaces X-Frame-Options (which cannot allow arbitrary hosts).
    const embedCsp =
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self'; frame-ancestors *";

    return [
      // Public, embeddable survey routes: no X-Frame-Options, framing allowed via CSP.
      {
        source: "/survey/:path*",
        headers: [...baseHeaders, { key: "Content-Security-Policy", value: embedCsp }],
      },
      {
        source: "/surveys/:path*",
        headers: [...baseHeaders, { key: "Content-Security-Policy", value: embedCsp }],
      },
      // Everything else: deny framing entirely.
      {
        source: "/((?!survey/|surveys/).*)",
        headers: [
          ...baseHeaders,
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: appCsp },
        ],
      },
    ];
  },
};

export default nextConfig;
