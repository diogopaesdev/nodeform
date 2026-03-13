"use client";

import { Check, Lock } from "lucide-react";

// Preview do tema básico — miniatura fiel ao surveys/user/[userId]/page.tsx
function BasicThemePreview() {
  const cards = [
    { title: "Pesquisa de Satisfação", desc: "Como foi sua experiência?" },
    { title: "Quiz de Conhecimentos", desc: "Teste seu nível" },
    { title: "Avaliação de Produto", desc: "Nos ajude a melhorar" },
  ];

  return (
    <div className="w-full h-full bg-gray-50 p-3 overflow-hidden">
      {/* Header mockup */}
      <div className="text-center mb-3">
        <div className="h-2.5 w-32 bg-gray-300 rounded mx-auto mb-1.5" />
        <div className="h-1.5 w-48 bg-gray-200 rounded mx-auto" />
      </div>
      {/* Cards grid */}
      <div className="grid grid-cols-3 gap-2">
        {cards.map((c, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-2">
            <div className="h-2 w-full bg-gray-200 rounded mb-1.5" />
            <div className="h-1.5 w-3/4 bg-gray-100 rounded mb-2" />
            <div className="h-4 w-12 bg-gray-900 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Placeholder de tema futuro
function ComingSoonPreview({ color }: { color: string }) {
  return (
    <div className={`w-full h-full ${color} flex items-center justify-center`}>
      <div className="text-center space-y-2 opacity-40">
        <div className="w-8 h-8 border-2 border-current rounded-lg mx-auto flex items-center justify-center">
          <Lock className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

const THEMES = [
  {
    id: "basic",
    name: "Básico",
    description: "Limpo, minimalista e focado no conteúdo. O tema padrão do SurveyFlow.",
    active: true,
    soon: false,
    preview: <BasicThemePreview />,
  },
  {
    id: "dark",
    name: "Dark",
    description: "Fundo escuro com elementos suaves. Ideal para contextos noturnos.",
    active: false,
    soon: true,
    preview: <ComingSoonPreview color="bg-gray-900" />,
  },
  {
    id: "bold",
    name: "Bold",
    description: "Cores vibrantes e tipografia marcante para quizzes e campanhas.",
    active: false,
    soon: true,
    preview: <ComingSoonPreview color="bg-orange-50" />,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Apenas o essencial. Sem bordas, sem sombras — puro conteúdo.",
    active: false,
    soon: true,
    preview: <ComingSoonPreview color="bg-white" />,
  },
];

export default function ThemesPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Temas</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Escolha como sua lista de pesquisas e páginas públicas serão exibidas para os respondentes.
        </p>
      </div>

      {/* Grid de temas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {THEMES.map((theme) => (
          <div
            key={theme.id}
            className={`group relative bg-white rounded-2xl border-2 transition-all flex flex-col overflow-hidden ${
              theme.active
                ? "border-gray-900 shadow-sm"
                : theme.soon
                ? "border-gray-200 opacity-60 cursor-not-allowed"
                : "border-gray-200 hover:border-gray-400 cursor-pointer"
            }`}
          >
            {/* Badge ativo */}
            {theme.active && (
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 bg-gray-900 text-white text-[10px] font-semibold rounded-full">
                <Check className="w-3 h-3" />
                Ativo
              </div>
            )}

            {/* Badge em breve */}
            {theme.soon && (
              <div className="absolute top-3 right-3 z-10 px-2 py-0.5 bg-gray-100 text-gray-400 text-[10px] font-semibold rounded-full">
                Em breve
              </div>
            )}

            {/* Preview */}
            <div className="h-44 overflow-hidden border-b border-gray-100">
              {theme.preview}
            </div>

            {/* Info */}
            <div className="p-4 flex-1 flex flex-col gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{theme.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{theme.description}</p>
              </div>

              <div className="mt-auto">
                {theme.active ? (
                  <div className="w-full h-8 flex items-center justify-center text-xs font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg">
                    Tema atual
                  </div>
                ) : (
                  <button
                    disabled={theme.soon}
                    className="w-full h-8 text-xs font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed"
                  >
                    {theme.soon ? "Em breve" : "Aplicar tema"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nota */}
      <p className="mt-8 text-xs text-gray-400">
        O tema selecionado é aplicado à sua página pública de pesquisas e às páginas de resposta individuais.
      </p>
    </div>
  );
}
