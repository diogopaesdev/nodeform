"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Loader2, Sparkles, Check, LogOut, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";

export default function UpgradePage() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  };

  const features = Object.values(t.upgrade.features);
  const soonFeatures = Object.values(t.upgrade.soonFeatures);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      {/* Language toggle */}
      <div className="absolute top-4 right-4">
        <LanguageToggle variant="navbar" />
      </div>

      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t.upgrade.trialExpired}</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
            {t.upgrade.trialExpiredDesc}
          </p>
        </div>

        {/* Plan card */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Plan header */}
          <div className="bg-gray-900 px-6 py-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-400">{t.upgrade.planName}</span>
              <span className="text-xs font-medium text-gray-900 bg-white/90 px-2 py-0.5 rounded-full">
                {t.upgrade.planTrial}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {t.upgrade.planPrice}
              </span>
              <span className="text-sm text-gray-400">{t.upgrade.planPriceUnit}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t.upgrade.planTrialDesc}</p>
          </div>

          {/* Features */}
          <div className="px-6 py-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {t.upgrade.included}
            </p>

            <ul className="space-y-2.5 mb-4">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            {/* Soon features */}
            {soonFeatures.length > 0 && (
              <ul className="space-y-2.5 pt-3 border-t border-gray-100">
                {soonFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-400">
                    <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    <span>{feature}</span>
                    <span className="ml-auto text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      {t.upgrade.comingSoon}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* CTA */}
          <div className="px-6 pb-6">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 rounded-xl transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.upgrade.subscribing}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t.upgrade.subscribe}
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              {t.upgrade.securePayment}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          <span className="text-xs text-gray-400">{session?.user?.email}</span>
          <span className="text-gray-300">·</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            {t.upgrade.signOut}
          </button>
        </div>
      </div>
    </div>
  );
}
