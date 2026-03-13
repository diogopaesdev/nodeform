import type { Metadata } from "next";
import { SessionProvider } from "@/components/providers/session-provider";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "SurveyFlow - Visual Survey Builder",
  description: "Crie pesquisas interativas com um editor visual de fluxo",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider><I18nProvider>{children}</I18nProvider></SessionProvider>
      </body>
    </html>
  );
}
