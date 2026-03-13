"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Check, Upload, X, Loader2, ArrowRight, Clock, Palette } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Brand {
  brandColor: string;
  logoUrl: string;
  displayName: string;
  brandDescription: string;
}

// ─── Preset colors ────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  { label: "Preto",    value: "#111827" },
  { label: "Azul",    value: "#3b82f6" },
  { label: "Índigo",  value: "#6366f1" },
  { label: "Roxo",    value: "#8b5cf6" },
  { label: "Rosa",    value: "#ec4899" },
  { label: "Vermelho",value: "#ef4444" },
  { label: "Laranja", value: "#f97316" },
  { label: "Âmbar",  value: "#f59e0b" },
  { label: "Verde",   value: "#22c55e" },
  { label: "Teal",    value: "#14b8a6" },
  { label: "Ciano",   value: "#06b6d4" },
  { label: "Lima",    value: "#84cc16" },
];

// ─── Live preview ─────────────────────────────────────────────────────────────

function LivePreview({ brand }: { brand: Brand }) {
  const accent = brand.brandColor || "#111827";
  const mockSurveys = [
    { title: "Pesquisa de Satisfação", desc: "Como foi sua experiência conosco?", time: 5 },
    { title: "Quiz de Conhecimentos", desc: "Teste suas habilidades", prize: "R$ 50" },
    { title: "Avaliação do Produto", desc: "Nos ajude a melhorar" },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-gray-50">
      {/* Browser chrome */}
      <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-3 gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
        <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
        <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
        <div className="flex-1 mx-3 h-4 bg-white rounded border border-gray-200 flex items-center px-2">
          <span className="text-[9px] text-gray-400">nodeform.com.br/surveys/user/...</span>
        </div>
      </div>

      {/* Page content */}
      <div className="p-5 min-h-[280px]">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-5">
          {brand.logoUrl ? (
            <div className="mb-2">
              <Image
                src={brand.logoUrl}
                alt="Logo"
                width={36}
                height={36}
                className="rounded-lg object-contain"
              />
            </div>
          ) : (
            <div className="w-9 h-9 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
              <span className="text-[10px] text-gray-400 font-bold">LOGO</span>
            </div>
          )}
          <p className="text-sm font-bold text-gray-900">
            {brand.displayName || "Nome da Empresa"}
          </p>
          {brand.brandDescription && (
            <p className="text-[11px] text-gray-500 mt-0.5">{brand.brandDescription}</p>
          )}
        </div>

        {/* Survey cards */}
        <div className="grid grid-cols-3 gap-2">
          {mockSurveys.map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-3">
              <p className="text-[11px] font-semibold text-gray-900 mb-1 leading-tight">{s.title}</p>
              <p className="text-[10px] text-gray-400 mb-2 line-clamp-2">{s.desc}</p>
              {s.time && (
                <p className="text-[9px] text-gray-400 flex items-center gap-1 mb-1.5">
                  <Clock className="w-2.5 h-2.5" />{s.time} min
                </p>
              )}
              <div
                style={{ backgroundColor: accent }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[9px] font-medium text-white"
              >
                Participar <ArrowRight className="w-2 h-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AppearancePage() {
  const [brand, setBrand] = useState<Brand>({
    brandColor: "#111827",
    logoUrl: "",
    displayName: "",
    brandDescription: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setBrand({
            brandColor: data.user.brandColor || "#111827",
            logoUrl: data.user.logoUrl || "",
            displayName: data.user.displayName || data.user.companyName || "",
            brandDescription: data.user.brandDescription || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/user/brand", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brand),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/user/logo", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setBrand((b) => ({ ...b, logoUrl: data.url }));
    } finally {
      setUploadingLogo(false);
    }
  };

  const set = (key: keyof Brand, value: string) =>
    setBrand((b) => ({ ...b, [key]: value }));

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Aparência</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure a identidade visual das suas páginas públicas de pesquisas.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            saved
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50"
          }`}
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saved ? (
            <Check className="w-3.5 h-3.5" />
          ) : null}
          {saved ? "Salvo!" : "Salvar"}
        </button>
      </div>

      {/* Theme notice */}
      <div className="flex items-center gap-2.5 mb-6 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
        <Palette className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <p className="text-xs text-gray-500">
          As configurações de aparência são aplicadas sobre o{" "}
          <a href="/dashboard/themes" className="font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900 transition-colors">
            tema ativo
          </a>
          . Para trocar o layout base, acesse{" "}
          <a href="/dashboard/themes" className="font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900 transition-colors">
            Temas
          </a>
          .
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">

        {/* ── Left column: form ── */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Marca</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Exibida na lista de pesquisas e nas páginas de resposta
              </p>
            </div>

            <div className="px-5 py-5 space-y-5">
              {/* Logo */}
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-2">Logo</label>
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => !uploadingLogo && fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400 flex items-center justify-center cursor-pointer transition-colors overflow-hidden flex-shrink-0 bg-gray-50"
                  >
                    {uploadingLogo ? (
                      <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    ) : brand.logoUrl ? (
                      <Image
                        src={brand.logoUrl}
                        alt="Logo"
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    ) : (
                      <Upload className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="text-xs font-medium text-gray-700 hover:text-gray-900 underline underline-offset-2 transition-colors disabled:opacity-50"
                    >
                      {brand.logoUrl ? "Trocar logo" : "Fazer upload"}
                    </button>
                    <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG ou SVG · Máx 2MB</p>
                    {brand.logoUrl && (
                      <button
                        onClick={() => set("logoUrl", "")}
                        className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-0.5 mt-1 transition-colors"
                      >
                        <X className="w-3 h-3" /> Remover
                      </button>
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                    e.target.value = "";
                  }}
                />
              </div>

              {/* Public name */}
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1.5">
                  Nome público
                </label>
                <input
                  type="text"
                  value={brand.displayName}
                  onChange={(e) => set("displayName", e.target.value)}
                  placeholder="Ex: Acme Ltda."
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Short description */}
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1.5">
                  Descrição curta <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={brand.brandDescription}
                  onChange={(e) => set("brandDescription", e.target.value)}
                  placeholder="Ex: Pesquisas de satisfação do cliente"
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Accent color */}
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-2">
                  Cor de destaque
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      title={c.label}
                      onClick={() => set("brandColor", c.value)}
                      style={{ backgroundColor: c.value }}
                      className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                        brand.brandColor === c.value
                          ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                          : ""
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div
                    style={{ backgroundColor: brand.brandColor }}
                    className="w-8 h-8 rounded-lg flex-shrink-0 border border-gray-200"
                  />
                  <div className="relative">
                    <input
                      type="color"
                      value={brand.brandColor}
                      onChange={(e) => set("brandColor", e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <span className="text-xs font-mono text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg block cursor-pointer hover:bg-gray-100 transition-colors">
                      {brand.brandColor.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">Clique para personalizar</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column: live preview ── */}
        <div className="lg:sticky lg:top-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Preview — Lista de pesquisas
          </p>
          <LivePreview brand={brand} />
          <p className="text-[11px] text-gray-400 mt-3 text-center">
            Atualiza em tempo real conforme você edita
          </p>
        </div>

      </div>
    </div>
  );
}
