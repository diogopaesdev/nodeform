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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [embedSize, setEmbedSize] = useState<"small" | "medium" | "large">("medium");
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

  const getSurveyUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/survey/${id}`;
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(getSurveyUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEmbedDimensions = () => {
    const sizes = {
      small: { width: 400, height: 500 },
      medium: { width: 600, height: 650 },
      large: { width: 800, height: 700 },
    };
    return sizes[embedSize];
  };

  const getEmbedCode = () => {
    const { width, height } = getEmbedDimensions();
    return `<iframe
  src="${getSurveyUrl()}?embed=true"
  width="${width}"
  height="${height}"
  frameborder="0"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"
  allow="clipboard-write"
></iframe>`;
  };

  const handleCopyEmbed = async () => {
    await navigator.clipboard.writeText(getEmbedCode());
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const getStatusBadge = (status: Survey["status"]) => {
    const variants = {
      draft: { label: "Rascunho", className: "bg-slate-100 text-slate-700" },
      published: { label: "Publicada", className: "bg-green-100 text-green-700" },
      archived: { label: "Arquivada", className: "bg-amber-100 text-amber-700" },
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
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

    // Presentation - mostrar dados coletados
    if (data.type === "presentation") {
      const parts = [];
      if (answer.respondentName) parts.push(`Nome: ${answer.respondentName}`);
      if (answer.respondentEmail) parts.push(`Email: ${answer.respondentEmail}`);
      return parts.length > 0 ? parts.join(" | ") : "Iniciou a pesquisa";
    }

    // Single Choice
    if (data.type === "singleChoice" && answer.selectedOptionId) {
      const option = data.options.find((o) => o.id === answer.selectedOptionId);
      return option?.label || "Opção não encontrada";
    }

    // Multiple Choice
    if (data.type === "multipleChoice" && answer.selectedOptionIds) {
      const labels = answer.selectedOptionIds
        .map((optId) => data.options.find((o) => o.id === optId)?.label)
        .filter(Boolean);
      return labels.join(", ") || "Nenhuma opção selecionada";
    }

    // Rating
    if (data.type === "rating" && answer.ratingValue !== undefined) {
      return `${answer.ratingValue} de ${data.maxValue}`;
    }

    return "Sem resposta";
  };

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return null;
  }

  return (
    <div className="p-8">
      {/* Back Button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar ao Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">{survey.title}</h1>
            {getStatusBadge(survey.status)}
          </div>
          {survey.description && (
            <p className="text-slate-500">{survey.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCopyLink}>
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-600" />
                Copiado!
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4 mr-2" />
                Copiar Link
              </>
            )}
          </Button>
          <Dialog open={embedModalOpen} onOpenChange={setEmbedModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Code className="w-4 h-4 mr-2" />
                Incorporar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Incorporar no seu Site
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p className="text-sm text-slate-500">
                  Copie o código abaixo e cole no HTML do seu site para incorporar esta pesquisa.
                </p>

                {/* Size Selection */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Tamanho do Widget
                  </label>
                  <div className="flex gap-2">
                    {(["small", "medium", "large"] as const).map((size) => (
                      <Button
                        key={size}
                        variant={embedSize === size ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEmbedSize(size)}
                      >
                        {size === "small" && "Pequeno (400x500)"}
                        {size === "medium" && "Médio (600x650)"}
                        {size === "large" && "Grande (800x700)"}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Embed Code */}
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
                    <code>{getEmbedCode()}</code>
                  </pre>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleCopyEmbed}
                  >
                    {copiedEmbed ? (
                      <>
                        <Check className="w-4 h-4 mr-1 text-green-600" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>

                {/* Preview */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Prévia
                  </label>
                  <div className="border rounded-lg p-4 bg-slate-50">
                    <div className="flex justify-center">
                      <iframe
                        src={`${getSurveyUrl()}?embed=true`}
                        width={Math.min(getEmbedDimensions().width, 500)}
                        height={Math.min(getEmbedDimensions().height, 350)}
                        style={{
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        allow="clipboard-write"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => router.push(`/editor/${survey.id}`)}>
            <Pencil className="w-4 h-4 mr-2" />
            Editar Pesquisa
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Respostas
            </CardTitle>
            <Users className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {survey.responseCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Perguntas
            </CardTitle>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {survey.nodes.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Criada em
            </CardTitle>
            <Calendar className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium text-slate-900">
              {formatDate(survey.createdAt)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Survey Link */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Link da Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-slate-100 rounded-lg px-4 py-3 font-mono text-sm text-slate-600 truncate">
              {getSurveyUrl()}
            </div>
            <Button variant="outline" onClick={handleCopyLink}>
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            Compartilhe este link para que as pessoas possam responder sua pesquisa.
          </p>
        </CardContent>
      </Card>

      {/* Responses List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Respostas ({survey.responseCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {survey.responseCount === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                Nenhuma resposta ainda
              </h3>
              <p className="text-slate-500">
                Compartilhe o link da sua pesquisa para começar a coletar respostas.
              </p>
            </div>
          ) : loadingResponses ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((response) => (
                <div
                  key={response.id}
                  className="border rounded-lg overflow-hidden"
                >
                  {/* Response Header */}
                  <div
                    className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() =>
                      setExpandedResponse(
                        expandedResponse === response.id ? null : response.id
                      )
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          {response.respondentName && (
                            <span className="flex items-center gap-1 text-sm font-medium text-slate-700">
                              <User className="w-4 h-4 text-slate-400" />
                              {response.respondentName}
                            </span>
                          )}
                          {response.respondentEmail && (
                            <span className="flex items-center gap-1 text-sm text-slate-500">
                              <Mail className="w-4 h-4 text-slate-400" />
                              {response.respondentEmail}
                            </span>
                          )}
                          {!response.respondentName && !response.respondentEmail && (
                            <span className="text-sm text-slate-500 italic">
                              Respondente anônimo
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(response.completedAt)}
                          </span>
                          {survey.enableScoring && (
                            <Badge variant="outline" className="text-xs">
                              {response.totalScore} pontos
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteResponse(response.id);
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {expandedResponse === response.id ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Response Details (Expanded) */}
                  {expandedResponse === response.id && (
                    <div className="p-4 border-t bg-white">
                      <h4 className="text-sm font-medium text-slate-700 mb-3">
                        Respostas:
                      </h4>
                      <div className="space-y-3">
                        {response.answers.map((answer, index) => {
                          const node = survey.nodes.find(
                            (n) => n.id === answer.nodeId
                          );
                          if (!node) return null;

                          return (
                            <div
                              key={index}
                              className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg"
                            >
                              <span className="text-sm font-medium text-slate-700">
                                {node.data.title || `Pergunta ${index + 1}`}
                              </span>
                              <span className="text-sm text-slate-600">
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
        </CardContent>
      </Card>
    </div>
  );
}
