"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  ArrowLeft,
  Trash2,
  Save,
  Loader2,
  Check,
  Clock,
  Gift,
  FileText,
  Settings,
  Globe,
  FileEdit,
  Archive,
} from "lucide-react";
import { FlowCanvas } from "@/components/editor/flow-canvas";
import { EditorSidebar } from "@/components/editor/editor-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useEditorStore } from "@/lib/stores";
import { Survey } from "@/types/survey";

export default function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const {
    nodes,
    edges,
    surveyTitle,
    surveyDescription,
    enableScoring,
    timeLimit,
    prize,
    status,
    isConfigured,
    setEnableScoring,
    setSurveyTitle,
    setSurveyDescription,
    setTimeLimit,
    setPrize,
    setStatus,
    setIsConfigured,
    loadSurvey,
    clearSurvey,
  } = useEditorStore();

  // Estados do modal de configuração
  const [configTitle, setConfigTitle] = useState("");
  const [configDescription, setConfigDescription] = useState("");
  const [configTimeLimit, setConfigTimeLimit] = useState("");
  const [configPrize, setConfigPrize] = useState("");

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      const res = await fetch(`/api/surveys/${id}`);
      if (!res.ok) {
        router.push("/dashboard");
        return;
      }
      const data = await res.json();
      loadSurvey(data.survey as Survey);
    } catch (error) {
      console.error("Error fetching survey:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/surveys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: surveyTitle,
          description: surveyDescription,
          nodes,
          edges,
          enableScoring,
          timeLimit: timeLimit || null,
          prize: prize || null,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving survey:", error);
    } finally {
      setSaving(false);
    }
  }, [id, surveyTitle, surveyDescription, nodes, edges, enableScoring, timeLimit, prize]);

  const handleOpenConfig = () => {
    // Preencher os campos com os valores atuais
    setConfigTitle(surveyTitle);
    setConfigDescription(surveyDescription);
    setConfigTimeLimit(timeLimit ? String(timeLimit) : "");
    setConfigPrize(prize || "");
    setShowConfigModal(true);
  };

  const handleSaveConfig = async () => {
    if (!configTitle.trim()) {
      return;
    }

    setSurveyTitle(configTitle.trim());
    setSurveyDescription(configDescription.trim());
    setTimeLimit(configTimeLimit ? parseInt(configTimeLimit) : undefined);
    setPrize(configPrize.trim() || undefined);
    setIsConfigured(true);
    setShowConfigModal(false);

    // Salvar configuração
    try {
      await fetch(`/api/surveys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: configTitle.trim(),
          description: configDescription.trim(),
          timeLimit: configTimeLimit ? parseInt(configTimeLimit) : null,
          prize: configPrize.trim() || null,
        }),
      });
    } catch (error) {
      console.error("Error saving config:", error);
    }
  };

  const handleTestSurvey = () => {
    if (nodes.length === 0) {
      alert("Adicione pelo menos uma pergunta antes de testar!");
      return;
    }
    // Salvar antes de testar
    handleSave();
    window.open(`/survey/${id}`, "_blank");
  };

  const handleClearSurvey = () => {
    if (
      confirm(
        "Tem certeza que deseja limpar toda a pesquisa? Esta ação não pode ser desfeita."
      )
    ) {
      clearSurvey();
      // Recarregar os dados do título original
      useEditorStore.setState({ surveyId: id });
    }
  };

  const handleTitleSubmit = () => {
    setEditingTitle(false);
    handleSave();
  };

  const handleUpdateStatus = async (newStatus: Survey["status"]) => {
    setStatus(newStatus);
    try {
      await fetch(`/api/surveys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusBadge = (currentStatus: Survey["status"]) => {
    const variants = {
      draft: { label: "Rascunho", className: "bg-slate-100 text-slate-700" },
      published: { label: "Publicada", className: "bg-green-100 text-green-700" },
      finished: { label: "Finalizada", className: "bg-blue-100 text-blue-700" },
      archived: { label: "Arquivada", className: "bg-amber-100 text-amber-700" },
    };
    const variant = variants[currentStatus];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Carregando editor...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Modal de Configuração */}
      <Dialog open={showConfigModal || !isConfigured} onOpenChange={(open) => {
        if (isConfigured) setShowConfigModal(open);
      }}>
        <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => {
          if (!isConfigured) e.preventDefault();
        }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-5 h-5 text-blue-600" />
              Configurar Pesquisa
            </DialogTitle>
            <DialogDescription>
              Defina as informações básicas da sua pesquisa antes de começar a editar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="config-title">
                Nome da Pesquisa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="config-title"
                placeholder="Ex: Pesquisa de Satisfação do Cliente"
                value={configTitle}
                onChange={(e) => setConfigTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="config-description">Descrição (opcional)</Label>
              <Textarea
                id="config-description"
                placeholder="Descreva brevemente o objetivo da pesquisa..."
                value={configDescription}
                onChange={(e) => setConfigDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="config-time" className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  Tempo Limite (opcional)
                </Label>
                <div className="relative">
                  <Input
                    id="config-time"
                    type="number"
                    placeholder="Ex: 10"
                    min="1"
                    value={configTimeLimit}
                    onChange={(e) => setConfigTimeLimit(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    minutos
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="config-prize" className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-slate-500" />
                  Prêmio (opcional)
                </Label>
                <Input
                  id="config-prize"
                  placeholder="Ex: R$ 50 em vale-compras"
                  value={configPrize}
                  onChange={(e) => setConfigPrize(e.target.value)}
                />
              </div>
            </div>

            <Button
              className="w-full mt-6"
              size="lg"
              onClick={handleSaveConfig}
              disabled={!configTitle.trim()}
            >
              {isConfigured ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Salvar
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Edição
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="text-slate-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <span className="text-slate-300">|</span>
          {editingTitle ? (
            <Input
              value={surveyTitle}
              onChange={(e) => setSurveyTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
              className="w-64 h-8"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="text-lg font-semibold text-slate-900 hover:text-slate-600 transition-colors"
            >
              {surveyTitle}
            </button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenConfig}
            className="text-slate-500 hover:text-slate-700"
            title="Configurações da pesquisa"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="cursor-pointer">
                {getStatusBadge(status)}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={() => handleUpdateStatus("draft")}
                className={status === "draft" ? "bg-slate-100" : ""}
              >
                <FileEdit className="w-4 h-4 mr-2 text-slate-600" />
                Rascunho
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleUpdateStatus("published")}
                className={status === "published" ? "bg-slate-100" : ""}
              >
                <Globe className="w-4 h-4 mr-2 text-green-600" />
                Publicar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleUpdateStatus("finished")}
                className={status === "finished" ? "bg-slate-100" : ""}
              >
                <Check className="w-4 h-4 mr-2 text-blue-600" />
                Finalizar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleUpdateStatus("archived")}
                className={status === "archived" ? "bg-slate-100" : ""}
              >
                <Archive className="w-4 h-4 mr-2 text-amber-600" />
                Arquivar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4">
          {/* Toggle de Pontuação */}
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-slate-600">Pontuação:</span>
            <button
              onClick={() => setEnableScoring(!enableScoring)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enableScoring ? "bg-green-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enableScoring ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-xs text-slate-500">
              {enableScoring ? "Ativa" : "Desativada"}
            </span>
          </label>

          <div className="h-6 w-px bg-slate-300" />

          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSurvey}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Limpar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="w-4 h-4  animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Save className="w-4 h-4 " />
            )}
            {saved ? "Salvo!" : "Salvar"}
          </Button>

          <Button
            size="sm"
            onClick={handleTestSurvey}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4" />
            Testar
          </Button>
        </div>
      </header>

      {/* Main Editor Area */}
      <main className="flex-1 flex overflow-hidden">
        <EditorSidebar />
        <div className="flex-1">
          <FlowCanvas />
        </div>
      </main>
    </div>
  );
}
