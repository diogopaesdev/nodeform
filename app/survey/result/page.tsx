"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Star, RotateCcw, Home } from "lucide-react";
import { useRuntimeStore } from "@/lib/stores/runtime-store";

export default function ResultPage() {
  const router = useRouter();
  const { survey, totalScore, answers, isCompleted, resetSurvey, getResult } =
    useRuntimeStore();

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!isCompleted) {
      router.push("/survey");
      return;
    }

    // Mostrar confetti quando carregar
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, [isCompleted, router]);

  if (!survey || !isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Carregando resultado...</p>
        </div>
      </div>
    );
  }

  const result = getResult();

  // Determinar mensagem baseada na pontuação (ou sem pontuação)
  const getResultMessage = (score: number, enableScoring?: boolean) => {
    // Se scoring está desativado, mostrar mensagem genérica
    if (!enableScoring) {
      return {
        title: "Concluído!",
        message: "Obrigado por completar a pesquisa.",
        icon: Star,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
      };
    }

    // Com scoring ativo, mostrar mensagem baseada na pontuação
    if (score >= 100) {
      return {
        title: "Excelente!",
        message: "Você teve uma pontuação incrível!",
        icon: Trophy,
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
      };
    } else if (score >= 50) {
      return {
        title: "Muito Bom!",
        message: "Você teve um bom desempenho.",
        icon: Star,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
      };
    } else {
      return {
        title: "Obrigado!",
        message: "Obrigado por completar a pesquisa.",
        icon: Star,
        color: "text-purple-500",
        bgColor: "bg-purple-50",
      };
    }
  };

  const resultData = getResultMessage(totalScore, survey?.enableScoring ?? true);
  const ResultIcon = resultData.icon;

  const handleRestart = () => {
    resetSurvey();
    router.push("/survey");
  };

  const handleGoHome = () => {
    resetSurvey();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gray-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-md mx-auto space-y-6 relative z-10">
        {/* Result Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
          {/* Icon */}
          <div className={`w-16 h-16 ${resultData.bgColor} rounded-2xl flex items-center justify-center mx-auto`}>
            <ResultIcon className={`w-8 h-8 ${resultData.color}`} />
          </div>

          {/* Title */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-bold text-gray-900">
              {resultData.title}
            </h1>
            <p className="text-sm text-gray-500">{resultData.message}</p>
          </div>

          {/* Score */}
          {(survey?.enableScoring ?? true) && (
            <div className="text-center py-6 border-y border-gray-100">
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                  Pontuação Final
                </p>
                <p className="text-4xl font-bold text-gray-900">{totalScore}</p>
                <p className="text-xs text-gray-400">pontos</p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-lg font-bold text-gray-900">
                {result?.answers.length || 0}
              </p>
              <p className="text-[10px] text-gray-500">Perguntas</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-lg font-bold text-gray-900">
                {result?.path.length || 0}
              </p>
              <p className="text-[10px] text-gray-500">Passos</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-lg font-bold text-gray-900">100%</p>
              <p className="text-[10px] text-gray-500">Completo</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleRestart}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Novamente
            </button>
            <button
              onClick={handleGoHome}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              Início
            </button>
          </div>
        </div>

        {/* Survey Info */}
        <div className="text-center space-y-1">
          <p className="text-xs text-gray-500">Pesquisa: {survey.title}</p>
          <p className="text-[11px] text-gray-400">
            Criado com NodeForm
          </p>
        </div>
      </div>
    </div>
  );
}
