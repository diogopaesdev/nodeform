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
      draft: { label: "Rascunho", className: "bg-gray-100 text-gray-600 hover:bg-gray-200" },
      published: { label: "Publicada", className: "bg-green-100 text-green-700 hover:bg-green-200" },
      finished: { label: "Finalizada", className: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
      archived: { label: "Arquivada", className: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
    };
    const variant = variants[currentStatus];
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-colors ${variant.className}`}>
        {variant.label}
      </span>
    );
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
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 z-10">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-gray-200" />

          <div className="flex items-center gap-2">
            {editingTitle ? (
              <Input
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
                className="w-56 h-8 text-sm"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setEditingTitle(true)}
                className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors max-w-[200px] truncate"
              >
                {surveyTitle}
              </button>
            )}
            <button
              onClick={handleOpenConfig}
              className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Configurações"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="cursor-pointer">
                {getStatusBadge(status)}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[140px]">
              <DropdownMenuItem
                onClick={() => handleUpdateStatus("draft")}
                className={status === "draft" ? "bg-gray-100" : ""}
              >
                <FileEdit className="w-3.5 h-3.5 mr-2 text-gray-500" />
                <span className="text-sm">Rascunho</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleUpdateStatus("published")}
                className={status === "published" ? "bg-gray-100" : ""}
              >
                <Globe className="w-3.5 h-3.5 mr-2 text-green-600" />
                <span className="text-sm">Publicar</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleUpdateStatus("finished")}
                className={status === "finished" ? "bg-gray-100" : ""}
              >
                <Check className="w-3.5 h-3.5 mr-2 text-blue-600" />
                <span className="text-sm">Finalizar</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleUpdateStatus("archived")}
                className={status === "archived" ? "bg-gray-100" : ""}
              >
                <Archive className="w-3.5 h-3.5 mr-2 text-amber-600" />
                <span className="text-sm">Arquivar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Toggle de Pontuação */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-gray-50 mr-1">
            <span className="text-xs text-gray-500">Pontuação</span>
            <button
              onClick={() => setEnableScoring(!enableScoring)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                enableScoring ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                  enableScoring ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="h-5 w-px bg-gray-200" />

          <button
            onClick={handleClearSurvey}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Limpar pesquisa"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              saved
                ? "bg-green-50 text-green-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saved ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {saved ? "Salvo" : "Salvar"}
          </button>

          <button
            onClick={handleTestSurvey}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Testar
          </button>
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
