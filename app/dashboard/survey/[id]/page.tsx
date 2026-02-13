"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Users,
  Calendar,
  BarChart3,
  Link as LinkIcon,
  Copy,
  Check,
  Trash2,
  User,
  Mail,
  Clock,
  ChevronDown,
  ChevronUp,
  Code,
  Globe,
  FileEdit,
  Archive,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Survey, SurveyResponse } from "@/types/survey";

export default function SurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  useEffect(() => {
    if (survey && survey.responseCount > 0) {
      fetchResponses();
    }
  }, [survey]);

  const fetchSurvey = async () => {
    try {
      const res = await fetch(`/api/surveys/${id}`);
      if (!res.ok) {
        router.push("/dashboard");
        return;
      }
      const data = await res.json();
      setSurvey(data.survey);
    } catch (error) {
      console.error("Error fetching survey:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async () => {
    setLoadingResponses(true);
    try {
      const res = await fetch(`/api/surveys/${id}/responses`);
      if (res.ok) {
        const data = await res.json();
        setResponses(data.responses || []);
      }
    } catch (error) {
      console.error("Error fetching responses:", error);
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleDeleteResponse = async (responseId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta resposta?")) return;

    try {
      const res = await fetch(`/api/surveys/${id}/responses?responseId=${responseId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setResponses(responses.filter((r) => r.id !== responseId));
        if (survey) {
          setSurvey({ ...survey, responseCount: survey.responseCount - 1 });
        }
      }
    } catch (error) {
      console.error("Error deleting response:", error);
    }
  };

  const handleUpdateStatus = async (newStatus: Survey["status"]) => {
    if (!survey) return;

    try {
      const res = await fetch(`/api/surveys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setSurvey({ ...survey, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getSurveyUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/survey/${id}`;
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(getSurveyUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEmbedCode = () => {
    const url = getSurveyUrl();
    return `<iframe
  id="nodeform-survey"
  src="${url}?embed=true"
  frameborder="0"
  style="width: 100%; border: none; overflow: hidden;"
  scrolling="no"
></iframe>
<script>
window.addEventListener("message", function(e) {
  if (e.data && e.data.type === "nodeform-resize") {
    document.getElementById("nodeform-survey").style.height = e.data.height + "px";
  }
});
</script>`;
  };

  const handleCopyEmbed = async () => {
    await navigator.clipboard.writeText(getEmbedCode());
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const getStatusBadge = (status: Survey["status"]) => {
    const variants = {
      draft: { label: "Rascunho", className: "bg-gray-100 text-gray-600 hover:bg-gray-200" },
      published: { label: "Publicada", className: "bg-green-100 text-green-700 hover:bg-green-200" },
      finished: { label: "Finalizada", className: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
      archived: { label: "Arquivada", className: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
    };
    const variant = variants[status];
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${variant.className}`}>
        {variant.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAnswerLabel = (
    node: Survey["nodes"][0],
    answer: SurveyResponse["answers"][0]
  ): string => {
    const data = node.data;

    if (data.type === "presentation") {
      const parts = [];
      if (answer.respondentName) parts.push(`Nome: ${answer.respondentName}`);
      if (answer.respondentEmail) parts.push(`Email: ${answer.respondentEmail}`);
      return parts.length > 0 ? parts.join(" | ") : "Iniciou a pesquisa";
    }

    if (data.type === "singleChoice" && answer.selectedOptionId) {
      const option = data.options.find((o) => o.id === answer.selectedOptionId);
      return option?.label || "Opção não encontrada";
    }

    if (data.type === "multipleChoice" && answer.selectedOptionIds) {
      const labels = answer.selectedOptionIds
        .map((optId) => data.options.find((o) => o.id === optId)?.label)
        .filter(Boolean);
      return labels.join(", ") || "Nenhuma opção selecionada";
    }

    if (data.type === "rating" && answer.ratingValue !== undefined) {
      return `${answer.ratingValue} de ${data.maxValue}`;
    }

    return "Sem resposta";
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          <div className="h-24 w-full bg-gray-200 rounded-xl animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return null;
  }

  return (
    <div className="p-6">
      {/* Back Button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-semibold text-gray-900">{survey.title}</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button>{getStatusBadge(survey.status)}</button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[140px]">
                <DropdownMenuItem
                  onClick={() => handleUpdateStatus("draft")}
                  className={`text-xs ${survey.status === "draft" ? "bg-gray-100" : ""}`}
                >
                  <FileEdit className="w-3.5 h-3.5 mr-2 text-gray-500" />
                  Rascunho
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleUpdateStatus("published")}
                  className={`text-xs ${survey.status === "published" ? "bg-gray-100" : ""}`}
                >
                  <Globe className="w-3.5 h-3.5 mr-2 text-green-600" />
                  Publicar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleUpdateStatus("finished")}
                  className={`text-xs ${survey.status === "finished" ? "bg-gray-100" : ""}`}
                >
                  <Check className="w-3.5 h-3.5 mr-2 text-blue-600" />
                  Finalizar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleUpdateStatus("archived")}
                  className={`text-xs ${survey.status === "archived" ? "bg-gray-100" : ""}`}
                >
                  <Archive className="w-3.5 h-3.5 mr-2 text-amber-600" />
                  Arquivar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {survey.description && (
            <p className="text-sm text-gray-500">{survey.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                Copiado!
              </>
            ) : (
              <>
                <LinkIcon className="w-3.5 h-3.5" />
                Compartilhar
              </>
            )}
          </button>
          <button
            onClick={() => setEmbedModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            Incorporar
          </button>
          <button
            onClick={() => router.push(`/editor/${survey.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </button>
        </div>
      </div>

      {/* Embed Modal */}
      <Dialog open={embedModalOpen} onOpenChange={setEmbedModalOpen}>
        <DialogContent className="max-w-3xl p-0 gap-0">
          <DialogTitle className="sr-only">Incorporar Pesquisa</DialogTitle>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Code className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-900">Incorporar Pesquisa</h2>
              <p className="text-xs text-gray-500">Cole o código no HTML do seu site</p>
            </div>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">
                <code>{getEmbedCode()}</code>
              </pre>
              <button
                onClick={handleCopyEmbed}
                className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
              >
                {copiedEmbed ? (
                  <>
                    <Check className="w-3 h-3 text-green-400" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copiar
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              O iframe se adapta automaticamente ao tamanho do conteúdo.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Respostas</span>
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{survey.responseCount}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Perguntas</span>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{survey.nodes.length}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Criada em</span>
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-900">{formatDate(survey.createdAt)}</p>
        </div>
      </div>

      {/* Survey Link */}
      <div className="bg-white border border-gray-200 rounded-xl mb-6">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">Link da Pesquisa</h2>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-xs text-gray-600 truncate">
              {getSurveyUrl()}
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copiar
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Compartilhe este link para coletar respostas.
          </p>
        </div>
      </div>

      {/* Responses List */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">Respostas ({survey.responseCount})</h2>
        </div>
        <div className="p-4">
          {survey.responseCount === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Nenhuma resposta ainda
              </h3>
              <p className="text-xs text-gray-500">
                Compartilhe o link para começar a coletar respostas.
              </p>
            </div>
          ) : loadingResponses ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {responses.map((response) => (
                <div
                  key={response.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() =>
                      setExpandedResponse(
                        expandedResponse === response.id ? null : response.id
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          {response.respondentName && (
                            <span className="flex items-center gap-1 text-xs font-medium text-gray-700">
                              <User className="w-3 h-3 text-gray-400" />
                              {response.respondentName}
                            </span>
                          )}
                          {response.respondentEmail && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail className="w-3 h-3 text-gray-400" />
                              {response.respondentEmail}
                            </span>
                          )}
                          {!response.respondentName && !response.respondentEmail && (
                            <span className="text-xs text-gray-400 italic">
                              Anônimo
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(response.completedAt)}
                          </span>
                          {survey.enableScoring && (
                            <span className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">
                              {response.totalScore} pts
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteResponse(response.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {expandedResponse === response.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {expandedResponse === response.id && (
                    <div className="p-3 border-t border-gray-200 bg-white">
                      <p className="text-xs font-medium text-gray-700 mb-2">Respostas:</p>
                      <div className="space-y-2">
                        {response.answers.map((answer, index) => {
                          const node = survey.nodes.find(
                            (n) => n.id === answer.nodeId
                          );
                          if (!node) return null;

                          return (
                            <div
                              key={index}
                              className="flex flex-col gap-0.5 p-2 bg-gray-50 rounded-md"
                            >
                              <span className="text-xs font-medium text-gray-700">
                                {node.data.title || `Pergunta ${index + 1}`}
                              </span>
                              <span className="text-xs text-gray-500">
                                {getAnswerLabel(node, answer)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
