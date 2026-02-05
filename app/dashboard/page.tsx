"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Users,
  TrendingUp,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Code,
  Copy,
  Check,
  Link as LinkIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Survey, DashboardStats } from "@/types/survey";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/surveys?stats=true");
      const data = await res.json();
      setSurveys(data.surveys || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSurvey = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Nova Pesquisa" }),
      });
      const data = await res.json();
      if (data.survey) {
        router.push(`/editor/${data.survey.id}`);
      }
    } catch (error) {
      console.error("Error creating survey:", error);
      setCreating(false);
    }
  };

  const handleDeleteSurvey = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta pesquisa?")) return;

    try {
      await fetch(`/api/surveys/${id}`, { method: "DELETE" });
      setSurveys(surveys.filter((s) => s.id !== id));
      if (stats) {
        setStats({
          ...stats,
          totalSurveys: stats.totalSurveys - 1,
        });
      }
    } catch (error) {
      console.error("Error deleting survey:", error);
    }
  };

  const getStatusBadge = (status: Survey["status"]) => {
    const variants = {
      draft: { label: "Rascunho", className: "bg-gray-100 text-gray-600" },
      published: { label: "Publicada", className: "bg-green-100 text-green-700" },
      finished: { label: "Finalizada", className: "bg-blue-100 text-blue-700" },
      archived: { label: "Arquivada", className: "bg-amber-100 text-amber-700" },
    };
    const variant = variants[status];
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variant.className}`}>
        {variant.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getSurveysListUrl = () => {
    if (typeof window === "undefined" || !session?.user?.id) return "";
    return `${window.location.origin}/surveys/user/${session.user.id}`;
  };

  const getEmbedCode = () => {
    return `<iframe
  src="${getSurveysListUrl()}?embed=true"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none;"
></iframe>`;
  };

  const handleCopyEmbed = async () => {
    await navigator.clipboard.writeText(getEmbedCode());
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(getSurveysListUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gerencie suas pesquisas e acompanhe os resultados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
          >
            {copiedLink ? (
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
            onClick={handleCreateSurvey}
            disabled={creating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 rounded-md transition-colors"
          >
            {creating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            Nova Pesquisa
          </button>
        </div>
      </div>

      {/* Embed Modal */}
      <Dialog open={embedModalOpen} onOpenChange={setEmbedModalOpen}>
        <DialogContent className="max-w-3xl p-0 gap-0">
          <DialogTitle className="sr-only">Incorporar Lista de Pesquisas</DialogTitle>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Code className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-900">Incorporar Lista de Pesquisas</h2>
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
            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">Prévia</label>
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <iframe
                  src={`${getSurveysListUrl()}?embed=true`}
                  width="100%"
                  height="300"
                  style={{ border: "none" }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Apenas pesquisas com status &quot;Publicada&quot; aparecerão no widget.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Total de Pesquisas</span>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{stats?.totalSurveys || 0}</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Total de Respostas</span>
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{stats?.totalResponses || 0}</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Pesquisas Ativas</span>
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{stats?.activeSurveys || 0}</p>
          )}
        </div>
      </div>

      {/* Surveys List */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Suas Pesquisas</h2>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-gray-200 rounded" />
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : surveys.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Nenhuma pesquisa criada
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Comece criando sua primeira pesquisa interativa
              </p>
              <button
                onClick={handleCreateSurvey}
                disabled={creating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
              >
                {creating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                Criar Pesquisa
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {surveys.map((survey) => (
                <div
                  key={survey.id}
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {survey.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {getStatusBadge(survey.status)}
                        <span className="text-xs text-gray-500">
                          {survey.responseCount} respostas
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(survey.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => router.push(`/dashboard/survey/${survey.id}`)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ver
                    </button>
                    <button
                      onClick={() => router.push(`/editor/${survey.id}`)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-md transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[120px]">
                        <DropdownMenuItem
                          onClick={() => handleDeleteSurvey(survey.id)}
                          className="text-red-600 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
