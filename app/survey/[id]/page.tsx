"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { X, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { QuestionRenderer } from "@/components/survey/question-renderer";
import { RespondentLoginGate } from "@/components/survey/respondent-login-gate";
import { useRuntimeStore } from "@/lib/stores/runtime-store";
import { useEmbedResize } from "@/lib/hooks/use-embed-resize";
import { Survey } from "@/types/survey";

interface Brand {
  brandColor: string | null;
  logoUrl: string | null;
  displayName: string | null;
  brandDescription: string | null;
}

interface RespondentInfo {
  id: string;
  name: string;
  email: string;
}

type AuthStatus = "loading" | "unauthenticated" | "authenticated" | "already_completed";

export default function SurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEmbedMode = searchParams.get("embed") === "true";
  const {
    survey,
    currentNodeId,
    isCompleted,
    totalScore,
    startSurvey,
    answerNode,
    getCurrentNode,
    resetSurvey,
    goBack,
    canGoBack,
  } = useRuntimeStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brand, setBrand] = useState<Brand>({ brandColor: null, logoUrl: null, displayName: null, brandDescription: null });
  const [respondent, setRespondent] = useState<RespondentInfo | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");

  useEmbedResize(isEmbedMode);

  useEffect(() => {
    fetchAndStartSurvey();
  }, [id]);

  const fetchAndStartSurvey = async () => {
    try {
      const res = await fetch(`/api/public/surveys/${id}`);

      if (!res.ok) {
        setError("Pesquisa não encontrada");
        return;
      }

      const data = await res.json();
      const surveyData = data.survey as Survey;
      if (data.brand) setBrand(data.brand);

      if (!surveyData || surveyData.nodes.length === 0) {
        setError("Esta pesquisa ainda não tem perguntas");
        return;
      }

      // Se requer login, verificar sessão do respondente antes de iniciar
      if (surveyData.requiresRespondentLogin) {
        await checkRespondentAuth(surveyData);
      } else {
        setAuthStatus("authenticated");
        startSurvey(surveyData);
      }
    } catch (err) {
      console.error("Error fetching survey:", err);
      setError("Erro ao carregar pesquisa");
    } finally {
      setIsLoading(false);
    }
  };

  const checkRespondentAuth = async (surveyData: Survey) => {
    // Verificar sessão ativa
    const meRes = await fetch("/api/respondent/me");
    const meData = await meRes.json();

    if (!meData.respondent) {
      setAuthStatus("unauthenticated");
      return;
    }

    // Verificar participação
    const statusRes = await fetch(`/api/respondent/survey/${id}/status`);
    const statusData = await statusRes.json();

    if (statusData.status === "completed") {
      setAuthStatus("already_completed");
      return;
    }

    setRespondent(meData.respondent);
    setAuthStatus("authenticated");
    startSurvey(surveyData);
  };

  const handleRespondentAuthenticated = async (info: RespondentInfo) => {
    setRespondent(info);

    // Verificar se já participou após login
    const statusRes = await fetch(`/api/respondent/survey/${id}/status`);
    const statusData = await statusRes.json();

    if (statusData.status === "completed") {
      setAuthStatus("already_completed");
      return;
    }

    // Recarregar pesquisa e iniciar
    const res = await fetch(`/api/public/surveys/${id}`);
    const data = await res.json();
    setAuthStatus("authenticated");
    startSurvey(data.survey as Survey);
  };

  const handleExitSurvey = () => {
    if (confirm("Deseja sair da pesquisa? O progresso será perdido.")) {
      resetSurvey();
      window.close();
      router.push(`/dashboard/survey/${id}`);
    }
  };

  // Redirecionar para resultados quando completar
  useEffect(() => {
    if (isCompleted) {
      router.push(`/survey/${id}/result${isEmbedMode ? "?embed=true" : ""}`);
    }
  }, [isCompleted, router, id, isEmbedMode]);

  if (isCompleted) {
    return (
      <div className={`flex items-center justify-center ${isEmbedMode ? "py-12" : "min-h-screen bg-gray-50"}`}>
        <div className="text-center space-y-3">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Finalizando pesquisa...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${isEmbedMode ? "py-12" : "min-h-screen bg-gray-50"}`}>
        <div className="text-center space-y-3">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Carregando pesquisa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${isEmbedMode ? "py-12" : "min-h-screen bg-gray-50"}`}>
        <div className="text-center space-y-3 p-6 bg-white rounded-xl border border-gray-200 max-w-sm">
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => window.close()}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  // Gate de login para respondentes
  if (authStatus === "unauthenticated") {
    return (
      <RespondentLoginGate
        surveyId={id}
        surveyTitle={survey?.title || ""}
        brandColor={brand.brandColor || undefined}
        onAuthenticated={handleRespondentAuthenticated}
      />
    );
  }

  // Já participou
  if (authStatus === "already_completed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center space-y-4">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-gray-900">Você já participou</h2>
            <p className="text-sm text-gray-500">
              {respondent?.name ? `${respondent.name}, sua` : "Sua"} resposta já foi registrada. Cada participante pode responder apenas uma vez.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!survey || !currentNodeId) {
    return (
      <div className={`flex items-center justify-center ${isEmbedMode ? "py-12" : "min-h-screen bg-gray-50"}`}>
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-500">Erro ao carregar pesquisa</p>
          <button
            onClick={() => window.close()}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  const currentNode = getCurrentNode();

  if (!currentNode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Pergunta não encontrada</p>
      </div>
    );
  }

  const handleAnswer = (answer: {
    selectedOptionId?: string;
    selectedOptionIds?: string[];
    ratingValue?: number;
    respondentName?: string;
    respondentEmail?: string;
  }) => {
    answerNode({
      nodeId: currentNodeId,
      ...answer,
      answeredAt: new Date(),
    });
  };

  return (
    <div className={isEmbedMode ? "" : "min-h-screen bg-gray-50"}>
      {!isEmbedMode && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleExitSurvey}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md shadow-sm transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>
      )}

      <div className={`px-4 ${isEmbedMode ? "py-6" : "py-12"}`}>
        <div className={`mx-auto space-y-6 ${isEmbedMode ? "max-w-full" : "max-w-4xl space-y-8"}`}>
          {(brand.logoUrl || brand.displayName) && (
            <div className="flex items-center justify-center gap-2.5">
              {brand.logoUrl && (
                <Image
                  src={brand.logoUrl}
                  alt={brand.displayName || "Logo"}
                  width={28}
                  height={28}
                  className="rounded-lg object-contain"
                />
              )}
              {brand.displayName && (
                <span className="text-sm font-semibold text-gray-700">{brand.displayName}</span>
              )}
            </div>
          )}

          <div className="text-center space-y-1.5">
            <h1 className={`font-semibold text-gray-900 ${isEmbedMode ? "text-lg" : "text-xl"}`}>{survey.title}</h1>
            {survey.description && (
              <p className={`text-gray-500 ${isEmbedMode ? "text-xs" : "text-sm"}`}>{survey.description}</p>
            )}
          </div>

          <QuestionRenderer node={currentNode} onAnswer={handleAnswer} totalScore={totalScore} brandColor={brand.brandColor || undefined} />

          {canGoBack() && (
            <div className="flex justify-center">
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar à Pergunta Anterior
              </button>
            </div>
          )}

          {survey?.enableScoring && !isEmbedMode && (
            <div className="text-center text-xs text-gray-400">
              <p>Pontuação atual: {totalScore} pontos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
