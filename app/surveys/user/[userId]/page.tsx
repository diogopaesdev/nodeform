"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FileText, Loader2, Clock, Gift, ArrowRight } from "lucide-react";
import { useEmbedResize } from "@/lib/hooks/use-embed-resize";

interface PublicSurvey {
  id: string;
  title: string;
  description?: string;
  responseCount: number;
  timeLimit?: number;
  prize?: string;
  updatedAt: string;
}

interface Brand {
  brandColor: string | null;
  logoUrl: string | null;
  displayName: string | null;
  brandDescription: string | null;
}

export default function UserSurveysPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const searchParams = useSearchParams();
  const isEmbedMode = searchParams.get("embed") === "true";

  const [surveys, setSurveys] = useState<PublicSurvey[]>([]);
  const [brand, setBrand] = useState<Brand>({ brandColor: null, logoUrl: null, displayName: null, brandDescription: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEmbedResize(isEmbedMode);

  useEffect(() => {
    fetchSurveys();
  }, [userId]);

  const fetchSurveys = async () => {
    try {
      const res = await fetch(`/api/public/users/${userId}/surveys`);
      if (!res.ok) {
        setError("Não foi possível carregar as pesquisas");
        return;
      }
      const data = await res.json();
      setSurveys(data.surveys || []);
      if (data.brand) setBrand(data.brand);
    } catch (err) {
      console.error("Error fetching surveys:", err);
      setError("Erro ao carregar pesquisas");
    } finally {
      setLoading(false);
    }
  };

  const accentColor = brand.brandColor || "#111827";

  if (loading) {
    return (
      <div className={isEmbedMode ? "p-4" : "min-h-screen bg-gray-50 p-8"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={isEmbedMode ? "p-4" : "min-h-screen bg-gray-50 p-8"}>
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isEmbedMode ? "p-4" : "min-h-screen bg-gray-50 p-8"}>
      <div className={`mx-auto ${isEmbedMode ? "max-w-full" : "max-w-4xl"}`}>

        {/* Brand header */}
        {(brand.logoUrl || brand.displayName || brand.brandDescription) && (
          <div className={`flex flex-col items-center text-center ${isEmbedMode ? "mb-5" : "mb-8"}`}>
            {brand.logoUrl && (
              <div className="mb-3">
                <Image
                  src={brand.logoUrl}
                  alt={brand.displayName || "Logo"}
                  width={56}
                  height={56}
                  className="rounded-xl object-contain"
                />
              </div>
            )}
            {brand.displayName && (
              <h1 className={`font-bold text-gray-900 ${isEmbedMode ? "text-lg" : "text-xl"}`}>
                {brand.displayName}
              </h1>
            )}
            {brand.brandDescription && (
              <p className="text-sm text-gray-500 mt-1">{brand.brandDescription}</p>
            )}
          </div>
        )}

        {/* Fallback header quando sem brand */}
        {!brand.logoUrl && !brand.displayName && !isEmbedMode && (
          <div className="text-center mb-8">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">Pesquisas Disponíveis</h1>
            <p className="text-sm text-gray-500">Selecione uma pesquisa para participar</p>
          </div>
        )}

        {surveys.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Nenhuma pesquisa disponível no momento</p>
          </div>
        ) : (
          <div className={`grid gap-3 ${isEmbedMode ? "grid-cols-1 md:grid-cols-4 w-full mx-auto" : "md:grid-cols-2 lg:grid-cols-3"}`}>
            {surveys.map((survey) => (
              <div key={survey.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                <h3 className="font-semibold text-gray-900 text-sm mb-1.5 leading-tight">
                  {survey.title}
                </h3>

                {survey.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {survey.description}
                  </p>
                )}

                <div className="space-y-1.5 mb-4">
                  {survey.timeLimit && (
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{survey.timeLimit} minutos</span>
                    </p>
                  )}
                  {survey.prize && (
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-gray-400" />
                      <span>{survey.prize}</span>
                    </p>
                  )}
                </div>

                <Link
                  href={`/survey/${survey.id}${isEmbedMode ? "?embed=true" : ""}`}
                  style={{ backgroundColor: accentColor }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-md transition-opacity hover:opacity-90"
                >
                  Participar
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {!isEmbedMode && (
          <div className="text-center mt-8">
            <p className="text-[11px] text-gray-400">Criado com SurveyFlow</p>
          </div>
        )}
      </div>
    </div>
  );
}
