"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FileText, Users, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PublicSurvey {
  id: string;
  title: string;
  description?: string;
  responseCount: number;
  updatedAt: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      console.error("Error fetching surveys:", err);
      setError("Erro ao carregar pesquisas");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 ${isEmbedMode ? "p-4" : "p-8"}`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 ${isEmbedMode ? "p-4" : "p-8"}`}>
        <div className="text-center py-12">
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 ${isEmbedMode ? "p-4" : "p-8"}`}>
      <div className={`mx-auto ${isEmbedMode ? "max-w-full" : "max-w-4xl"}`}>
        {!isEmbedMode && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pesquisas Disponíveis</h1>
            <p className="text-gray-600">Selecione uma pesquisa para participar</p>
          </div>
        )}

        {surveys.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma pesquisa disponível no momento</p>
          </div>
        ) : (
          <div className={`grid gap-4 ${isEmbedMode ? "grid-cols-1" : "md:grid-cols-2"}`}>
            {surveys.map((survey) => (
              <Card key={survey.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {survey.title}
                      </h3>
                      {survey.description && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                          {survey.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {survey.responseCount} respostas
                        </span>
                        <Link
                          href={`/survey/${survey.id}${isEmbedMode ? "?embed=true" : ""}`}
                          target={isEmbedMode ? "_blank" : undefined}
                        >
                          <Button size="sm">
                            Participar
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isEmbedMode && (
          <div className="text-center mt-8">
            <p className="text-xs text-gray-400">
              Criado com NodeForm
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
