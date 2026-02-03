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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [embedSize, setEmbedSize] = useState<"small" | "medium" | "large">("medium");

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
      month: "short",
      year: "numeric",
    });
  };

  const getSurveysListUrl = () => {
    if (typeof window === "undefined" || !session?.user?.id) return "";
    return `${window.location.origin}/surveys/user/${session.user.id}`;
  };

  const getEmbedDimensions = () => {
    const sizes = {
      small: { width: 400, height: 450 },
      medium: { width: 600, height: 550 },
      large: { width: 800, height: 650 },
    };
    return sizes[embedSize];
  };

  const getEmbedCode = () => {
    const { width, height } = getEmbedDimensions();
    return `<iframe
  src="${getSurveysListUrl()}?embed=true"
  width="${width}"
  height="${height}"
  frameborder="0"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"
></iframe>`;
  };

  const handleCopyEmbed = async () => {
    await navigator.clipboard.writeText(getEmbedCode());
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Gerencie suas pesquisas e acompanhe os resultados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={embedModalOpen} onOpenChange={setEmbedModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Code className="w-4 h-4 mr-2" />
                Incorporar Lista
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Incorporar Lista de Pesquisas
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p className="text-sm text-slate-500">
                  Copie o código abaixo para incorporar uma lista de todas as suas pesquisas publicadas no seu site.
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
                        {size === "small" && "Pequeno (400x450)"}
                        {size === "medium" && "Médio (600x550)"}
                        {size === "large" && "Grande (800x650)"}
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
                        src={`${getSurveysListUrl()}?embed=true`}
                        width={Math.min(getEmbedDimensions().width, 500)}
                        height={Math.min(getEmbedDimensions().height, 350)}
                        style={{
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  Apenas pesquisas com status &quot;Publicada&quot; aparecerão no widget.
                </p>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={handleCreateSurvey} disabled={creating}>
            {creating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Nova Pesquisa
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total de Pesquisas
            </CardTitle>
            <FileText className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold text-slate-900">
                {stats?.totalSurveys || 0}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total de Respostas
            </CardTitle>
            <Users className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold text-slate-900">
                {stats?.totalResponses || 0}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Pesquisas Ativas
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold text-slate-900">
                {stats?.activeSurveys || 0}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Surveys List */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Pesquisas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : surveys.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                Nenhuma pesquisa criada
              </h3>
              <p className="text-slate-500 mb-4">
                Comece criando sua primeira pesquisa interativa
              </p>
              <Button onClick={handleCreateSurvey} disabled={creating}>
                {creating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Criar Pesquisa
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {surveys.map((survey) => (
                <div
                  key={survey.id}
                  className="flex items-center justify-between py-4 hover:bg-slate-50 -mx-6 px-6 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">
                        {survey.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        {getStatusBadge(survey.status)}
                        <span className="text-sm text-slate-500">
                          {survey.responseCount} respostas
                        </span>
                        <span className="text-sm text-slate-400">
                          Atualizada em {formatDate(survey.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/survey/${survey.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/editor/${survey.id}`)}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDeleteSurvey(survey.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
