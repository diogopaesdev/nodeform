"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function LgpdCookieBanner() {
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get("embed") === "true") return;
    if (!localStorage.getItem("lgpd_accepted")) {
      setVisible(true);
    }
  }, [searchParams]);

  const accept = () => {
    localStorage.setItem("lgpd_accepted", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-xl shadow-lg px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="flex-1 text-xs text-gray-600 leading-relaxed">
          Utilizamos cookies essenciais para o funcionamento da plataforma e cookies analíticos para melhorar sua experiência. Ao continuar navegando, você concorda com nossa{" "}
          <Link href="/privacy" className="underline hover:text-gray-900 transition-colors">
            Política de Privacidade
          </Link>{" "}
          e com o uso de cookies conforme a{" "}
          <span className="font-medium">LGPD (Lei nº 13.709/2018)</span>.
        </p>
        <button
          onClick={accept}
          className="flex-shrink-0 px-4 py-2 text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
        >
          Entendi e concordo
        </button>
      </div>
    </div>
  );
}
