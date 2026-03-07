"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Survey } from "@/types/survey";

const STATUS_OPTIONS = ["Todos", "draft", "published", "finished", "archived"] as const;
type FilterStatus = (typeof STATUS_OPTIONS)[number];

const STATUS_LABELS: Record<string, string> = {
  Todos: "Todos",
  draft: "Rascunho",
  published: "Publicada",
  finished: "Finalizada",
  archived: "Arquivada",
};

export default function SurveysPage() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("Todos");

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const res = await fetch("/api/surveys");
      const data = await res.json();
      setSurveys(data.surveys || []);
    } catch (error) {
      console.error("Error fetching surveys:", error);
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
      setSurveys((prev) => prev.filter((s) => s.id !== id));
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

  const filtered = surveys.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "Todos" || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Pesquisas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Crie e gerencie todas as suas pesquisas
          </p>
        </div>
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

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar pesquisa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900/10 text-gray-900 placeholder-gray-400"
          />
        </div>
        <div className="flex items-center gap-1">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterStatus === status
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-gray-100 rounded" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
                <div className="h-5 w-16 bg-gray-100 rounded" />
                <div className="h-4 w-20 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              {search || filterStatus !== "Todos" ? "Nenhuma pesquisa encontrada" : "Nenhuma pesquisa criada"}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {search || filterStatus !== "Todos"
                ? "Tente ajustar os filtros"
                : "Comece criando sua primeira pesquisa interativa"}
            </p>
            {!search && filterStatus === "Todos" && (
              <button
                onClick={handleCreateSurvey}
                disabled={creating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
              >
                {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Criar Pesquisa
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-2.5 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-medium text-gray-500">Nome</span>
              <span className="text-xs font-medium text-gray-500 w-24 text-center">Status</span>
              <span className="text-xs font-medium text-gray-500 w-20 text-center">Respostas</span>
              <span className="text-xs font-medium text-gray-500 w-28 text-center">Atualizado em</span>
              <span className="w-16" />
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100">
              {filtered.map((survey) => (
                <div
                  key={survey.id}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  {/* Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{survey.title}</p>
                      {survey.description && (
                        <p className="text-xs text-gray-400 truncate">{survey.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="w-24 flex justify-center">
                    {getStatusBadge(survey.status)}
                  </div>

                  {/* Responses */}
                  <div className="w-20 text-center">
                    <span className="text-sm text-gray-600">{survey.responseCount}</span>
                  </div>

                  {/* Date */}
                  <div className="w-28 text-center">
                    <span className="text-xs text-gray-400">{formatDate(survey.updatedAt)}</span>
                  </div>

                  {/* Actions */}
                  <div className="w-16 flex items-center justify-end gap-1">
                    <button
                      onClick={() => router.push(`/dashboard/survey/${survey.id}`)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                      title="Ver respostas"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => router.push(`/editor/${survey.id}`)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                          <MoreVertical className="w-3.5 h-3.5" />
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
          </>
        )}
      </div>

      {/* Footer count */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 mt-3 text-right">
          {filtered.length} {filtered.length === 1 ? "pesquisa" : "pesquisas"}
          {filterStatus !== "Todos" || search ? " encontradas" : " no total"}
        </p>
      )}
    </div>
  );
}
