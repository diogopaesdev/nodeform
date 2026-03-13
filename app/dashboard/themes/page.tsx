"use client";

import { Check, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// ─── Mock survey cards shared between previews ────────────────────────────────

function MockCard({
  titleClass,
  descClass,
  btnClass,
  cardClass,
}: {
  titleClass: string;
  descClass: string;
  btnClass: string;
  cardClass: string;
}) {
  return (
    <div className={`rounded-xl p-2 ${cardClass}`}>
      <div className={`h-2 rounded mb-1.5 w-3/4 ${titleClass}`} />
      <div className={`h-1.5 rounded mb-1 w-full ${descClass}`} />
      <div className={`h-1.5 rounded mb-2 w-2/3 ${descClass}`} />
      <div className={`h-4 rounded w-full ${btnClass}`} />
    </div>
  );
}

// ─── Theme previews ───────────────────────────────────────────────────────────

function BasicPreview() {
  return (
    <div
      className="w-full h-full bg-gray-50 p-4 flex flex-col"
      style={{
        backgroundImage:
          "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      }}
    >
      {/* Brand header */}
      <div className="flex flex-col items-center mb-4">
        <div className="w-7 h-7 bg-gray-200 rounded-lg mb-1.5" />
        <div className="h-2 w-20 bg-gray-300 rounded mb-1" />
        <div className="h-1.5 w-28 bg-gray-200 rounded" />
      </div>
      {/* Cards */}
      <div className="grid grid-cols-3 gap-2 flex-1">
        <MockCard
          cardClass="bg-white border border-gray-200"
          titleClass="bg-gray-800"
          descClass="bg-gray-200"
          btnClass="bg-gray-800"
        />
        <MockCard
          cardClass="bg-white border border-gray-200"
          titleClass="bg-gray-800"
          descClass="bg-gray-200"
          btnClass="bg-gray-800"
        />
        <MockCard
          cardClass="bg-white border border-gray-200"
          titleClass="bg-gray-800"
          descClass="bg-gray-200"
          btnClass="bg-gray-800"
        />
      </div>
    </div>
  );
}

function DarkPreview() {
  return (
    <div className="w-full h-full bg-gray-900 p-4 flex flex-col">
      <div className="flex flex-col items-center mb-4">
        <div className="w-7 h-7 bg-gray-700 rounded-lg mb-1.5" />
        <div className="h-2 w-20 bg-gray-600 rounded mb-1" />
        <div className="h-1.5 w-28 bg-gray-700 rounded" />
      </div>
      <div className="grid grid-cols-3 gap-2 flex-1">
        <MockCard
          cardClass="bg-gray-800 border border-gray-700"
          titleClass="bg-gray-400"
          descClass="bg-gray-600"
          btnClass="bg-gray-500"
        />
        <MockCard
          cardClass="bg-gray-800 border border-gray-700"
          titleClass="bg-gray-400"
          descClass="bg-gray-600"
          btnClass="bg-gray-500"
        />
        <MockCard
          cardClass="bg-gray-800 border border-gray-700"
          titleClass="bg-gray-400"
          descClass="bg-gray-600"
          btnClass="bg-gray-500"
        />
      </div>
    </div>
  );
}

function BoldPreview() {
  return (
    <div
      className="w-full h-full p-4 flex flex-col"
      style={{
        background: "linear-gradient(135deg, #f97316 0%, #f59e0b 50%, #fbbf24 100%)",
      }}
    >
      <div className="flex flex-col items-center mb-4">
        <div className="w-7 h-7 bg-white/30 rounded-lg mb-1.5" />
        <div className="h-2 w-20 bg-white/70 rounded mb-1" />
        <div className="h-1.5 w-28 bg-white/50 rounded" />
      </div>
      <div className="grid grid-cols-3 gap-2 flex-1">
        <MockCard
          cardClass="bg-white/20 border border-white/30 backdrop-blur-sm"
          titleClass="bg-white/80"
          descClass="bg-white/50"
          btnClass="bg-white/70"
        />
        <MockCard
          cardClass="bg-white/20 border border-white/30 backdrop-blur-sm"
          titleClass="bg-white/80"
          descClass="bg-white/50"
          btnClass="bg-white/70"
        />
        <MockCard
          cardClass="bg-white/20 border border-white/30 backdrop-blur-sm"
          titleClass="bg-white/80"
          descClass="bg-white/50"
          btnClass="bg-white/70"
        />
      </div>
    </div>
  );
}

function MinimalPreview() {
  return (
    <div className="w-full h-full bg-white p-4 flex flex-col">
      <div className="flex flex-col items-center mb-4">
        <div className="w-7 h-7 bg-gray-100 rounded-lg mb-1.5" />
        <div className="h-2 w-20 bg-gray-200 rounded mb-1" />
        <div className="h-1.5 w-28 bg-gray-100 rounded" />
      </div>
      <div className="grid grid-cols-3 gap-2 flex-1">
        <MockCard
          cardClass="bg-white border-0"
          titleClass="bg-gray-700"
          descClass="bg-gray-100"
          btnClass="bg-gray-100"
        />
        <MockCard
          cardClass="bg-white border-0"
          titleClass="bg-gray-700"
          descClass="bg-gray-100"
          btnClass="bg-gray-100"
        />
        <MockCard
          cardClass="bg-white border-0"
          titleClass="bg-gray-700"
          descClass="bg-gray-100"
          btnClass="bg-gray-100"
        />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ThemesPage() {
  const { t } = useI18n();

  const THEMES = [
    {
      id: "basic",
      name: t.themes.basic.name,
      description: t.themes.basic.desc,
      active: true,
      soon: false,
      Preview: BasicPreview,
    },
    {
      id: "dark",
      name: t.themes.dark.name,
      description: t.themes.dark.desc,
      active: false,
      soon: true,
      Preview: DarkPreview,
    },
    {
      id: "bold",
      name: t.themes.bold.name,
      description: t.themes.bold.desc,
      active: false,
      soon: true,
      Preview: BoldPreview,
    },
    {
      id: "minimal",
      name: t.themes.minimal.name,
      description: t.themes.minimal.desc,
      active: false,
      soon: true,
      Preview: MinimalPreview,
    },
  ];

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">{t.themes.title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {t.themes.subtitle}
        </p>
      </div>

      {/* Theme grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {THEMES.map((theme) => {
          const { Preview } = theme;
          return (
            <div
              key={theme.id}
              className={`rounded-2xl overflow-hidden flex flex-col transition-all ${
                theme.active
                  ? "border-2 border-gray-900 shadow-sm"
                  : "border border-gray-200 opacity-60"
              }`}
            >
              {/* Preview area */}
              <div className="h-52 relative overflow-hidden bg-gray-100">
                <Preview />

                {/* Coming soon overlay */}
                {theme.soon && (
                  <div className="absolute inset-0 backdrop-blur-[2px] bg-white/30 flex items-center justify-center">
                    <div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
                      <Lock className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                )}
              </div>

              {/* Card footer */}
              <div className="p-4 bg-white flex flex-col gap-3 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{theme.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{theme.description}</p>
                  </div>
                  {theme.active ? (
                    <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold bg-gray-900 text-white px-2 py-0.5 rounded-full">
                      <Check className="w-2.5 h-2.5" />
                      {t.common.active}
                    </span>
                  ) : (
                    <span className="flex-shrink-0 text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {t.common.comingSoon}
                    </span>
                  )}
                </div>

                {/* Action button */}
                {theme.active ? (
                  <button
                    disabled
                    className="w-full text-xs font-medium py-2 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
                  >
                    {t.themes.current}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full text-xs font-medium py-2 rounded-lg bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100"
                  >
                    {t.common.soon}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
