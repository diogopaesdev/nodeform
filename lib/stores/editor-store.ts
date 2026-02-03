import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";
import type { SurveyNode, SurveyEdge, NodeData, Survey } from "@/types";

interface EditorState {
  // Estado do React Flow
  nodes: SurveyNode[];
  edges: SurveyEdge[];

  // Informações da pesquisa
  surveyId: string;
  surveyTitle: string;
  surveyDescription: string;
  enableScoring: boolean;
  timeLimit?: number;
  prize?: string;
  status: Survey["status"];
  isConfigured: boolean; // Se o modal inicial foi preenchido

  // Actions para nodes
  setNodes: (nodes: SurveyNode[]) => void;
  onNodesChange: (changes: NodeChange<SurveyNode>[]) => void;
  addNode: (node: SurveyNode) => void;
  updateNode: (nodeId: string, data: Partial<NodeData>) => void;
  deleteNode: (nodeId: string) => void;

  // Actions para edges
  setEdges: (edges: SurveyEdge[]) => void;
  onEdgesChange: (changes: EdgeChange<SurveyEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  deleteEdge: (edgeId: string) => void;

  // Actions para pesquisa
  setSurveyTitle: (title: string) => void;
  setSurveyDescription: (description: string) => void;
  setEnableScoring: (enable: boolean) => void;
  setTimeLimit: (time: number | undefined) => void;
  setPrize: (prize: string | undefined) => void;
  setStatus: (status: Survey["status"]) => void;
  setIsConfigured: (configured: boolean) => void;
  loadSurvey: (survey: Survey) => void;
  clearSurvey: () => void;

  // Helpers
  getSurvey: () => Survey;
}

const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      nodes: [],
      edges: [],
      surveyId: generateId(),
      surveyTitle: "Nova Pesquisa",
      surveyDescription: "",
      enableScoring: true,
      timeLimit: undefined,
      prize: undefined,
      status: "draft" as Survey["status"],
      isConfigured: false,

      // Node actions
      setNodes: (nodes) => set({ nodes }),

      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },

      addNode: (node) => {
        set({ nodes: [...get().nodes, node] });
      },

      updateNode: (nodeId, data) => {
        set({
          nodes: get().nodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, ...data } as NodeData }
              : node
          ),
        });
      },

      deleteNode: (nodeId) => {
        set({
          nodes: get().nodes.filter((node) => node.id !== nodeId),
          edges: get().edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          ),
        });
      },

      // Edge actions
      setEdges: (edges) => set({ edges }),

      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      onConnect: (connection) => {
        // Criar edge com data apropriada
        const newEdge: SurveyEdge = {
          ...connection,
          id: `edge_${connection.source}_${connection.target}_${Date.now()}`,
          data: {
            // Para singleChoice: sourceHandle contém o optionId
            optionId: connection.sourceHandle || undefined,
          },
        } as SurveyEdge;

        set({
          edges: [...get().edges, newEdge],
        });
      },

      deleteEdge: (edgeId) => {
        set({
          edges: get().edges.filter((edge) => edge.id !== edgeId),
        });
      },

      // Survey actions
      setSurveyTitle: (title) => set({ surveyTitle: title }),

      setSurveyDescription: (description) => set({ surveyDescription: description }),

      setEnableScoring: (enable) => set({ enableScoring: enable }),

      setTimeLimit: (time) => set({ timeLimit: time }),

      setPrize: (prize) => set({ prize: prize }),

      setStatus: (status) => set({ status }),

      setIsConfigured: (configured) => set({ isConfigured: configured }),

      loadSurvey: (survey) => {
        // Se a pesquisa já tem nodes ou foi configurada (título diferente de "Nova Pesquisa")
        const isConfigured = survey.nodes.length > 0 || survey.title !== "Nova Pesquisa";
        set({
          surveyId: survey.id,
          surveyTitle: survey.title,
          surveyDescription: survey.description || "",
          enableScoring: survey.enableScoring ?? true,
          timeLimit: survey.timeLimit,
          prize: survey.prize,
          status: survey.status,
          isConfigured,
          nodes: survey.nodes,
          edges: survey.edges,
        });
      },

      clearSurvey: () => {
        set({
          surveyId: generateId(),
          surveyTitle: "Nova Pesquisa",
          surveyDescription: "",
          enableScoring: true,
          timeLimit: undefined,
          prize: undefined,
          status: "draft" as Survey["status"],
          isConfigured: false,
          nodes: [],
          edges: [],
        });
      },

      // Helpers
      getSurvey: () => {
        const state = get();
        return {
          id: state.surveyId,
          userId: "",
          title: state.surveyTitle,
          description: state.surveyDescription,
          enableScoring: state.enableScoring,
          timeLimit: state.timeLimit,
          prize: state.prize,
          nodes: state.nodes,
          edges: state.edges,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: state.status,
          responseCount: 0,
        };
      },
    }),
    {
      name: "nodeform-editor-storage",
      partialize: (state) => ({
        surveyId: state.surveyId,
        surveyTitle: state.surveyTitle,
        surveyDescription: state.surveyDescription,
        enableScoring: state.enableScoring,
        timeLimit: state.timeLimit,
        prize: state.prize,
        status: state.status,
        isConfigured: state.isConfigured,
        nodes: state.nodes,
        edges: state.edges,
      }),
    }
  )
);
