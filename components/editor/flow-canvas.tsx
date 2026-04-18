"use client";

import { useState, useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  ConnectionMode,
  Panel,
  Node,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ZoomIn, ZoomOut, Maximize2, Lock, Unlock } from "lucide-react";
import { useEditorStore } from "@/lib/stores";
import { nodeTypes } from "./nodes";
import { NodeEditModal } from "./node-edit-modal";
import type { SurveyNode, PresentationData, SingleChoiceData, MultipleChoiceData, RatingData, EndScreenData, TextInputData } from "@/types";

const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getDefaultNodeData = (type: string) => {
  switch (type) {
    case "presentation":
      return {
        type: "presentation",
        title: "Bem-vindo à Pesquisa",
        description: "Esta é uma pesquisa rápida que levará apenas alguns minutos.",
        buttonText: "Iniciar Pesquisa",
      } as PresentationData;
    case "singleChoice":
      return {
        type: "singleChoice",
        title: "Nova Pergunta",
        description: "Escolha uma opção",
        options: [
          { id: "opt1", label: "Opção 1", score: 10 },
          { id: "opt2", label: "Opção 2", score: 20 },
          { id: "opt3", label: "Opção 3", score: 30 },
        ],
      } as SingleChoiceData;
    case "multipleChoice":
      return {
        type: "multipleChoice",
        title: "Nova Pergunta",
        description: "Selecione todas que se aplicam",
        options: [
          { id: "opt1", label: "Opção 1", score: 10 },
          { id: "opt2", label: "Opção 2", score: 10 },
          { id: "opt3", label: "Opção 3", score: 10 },
        ],
      } as MultipleChoiceData;
    case "rating":
      return {
        type: "rating",
        title: "Nova Avaliação",
        description: "Avalie de 1 a 5",
        minValue: 1,
        maxValue: 5,
        minLabel: "Muito Insatisfeito",
        maxLabel: "Muito Satisfeito",
      } as RatingData;
    case "endScreen":
      return {
        type: "endScreen",
        title: "Obrigado!",
        description: "Sua resposta foi registrada com sucesso.",
        showScore: false,
      } as EndScreenData;
    case "textInput":
      return {
        type: "textInput",
        title: "Nova Pergunta Aberta",
        description: "Descreva sua resposta",
        isLong: false,
        placeholder: "Digite sua resposta aqui...",
        required: false,
      } as TextInputData;
    default:
      return null;
  }
};

const NODE_COLORS: Record<string, string> = {
  presentation:   "#f97316",
  singleChoice:   "#3b82f6",
  multipleChoice: "#22c55e",
  rating:         "#a855f7",
  textInput:      "#7c3aed",
  endScreen:      "#f43f5e",
};

function CustomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const [locked, setLocked] = useState(false);

  const handleLock = () => {
    setLocked((prev) => !prev);
  };

  return (
    <div className="flex flex-col gap-1 bg-white border border-gray-200 rounded-xl shadow-sm p-1 overflow-hidden">
      <button
        onClick={() => zoomIn({ duration: 200 })}
        title="Aumentar zoom"
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        onClick={() => zoomOut({ duration: 200 })}
        title="Diminuir zoom"
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <div className="h-px bg-gray-100 mx-1" />
      <button
        onClick={() => fitView({ duration: 300, padding: 0.15 })}
        title="Ajustar à tela"
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>
      <div className="h-px bg-gray-100 mx-1" />
      <button
        onClick={handleLock}
        title={locked ? "Desbloquear canvas" : "Bloquear canvas"}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
          locked
            ? "text-orange-500 bg-orange-50 hover:bg-orange-100"
            : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
        }`}
      >
        {locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function FlowCanvasInner() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
  } = useEditorStore();

  const [selectedNode, setSelectedNode] = useState<SurveyNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Configurar snap to grid
  const snapGrid: [number, number] = [20, 20];

  // Abrir modal ao dar duplo clique no nó
  const handleNodeDoubleClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as unknown as SurveyNode);
    setIsModalOpen(true);
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const data = getDefaultNodeData(type);
      if (!data) return;

      const newNode: SurveyNode = {
        id: generateId(),
        type,
        position,
        data,
      };

      addNode(newNode);
    },
    [screenToFlowPosition, addNode]
  );

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={handleNodeDoubleClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Strict}
        snapToGrid={true}
        snapGrid={snapGrid}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-50"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#94a3b8"
        />

        {/* Zoom controls customizados */}
        <Panel position="bottom-right">
          <CustomControls />
        </Panel>

        {/* MiniMap customizado */}
        <MiniMap
          nodeColor={(node) => NODE_COLORS[node.type ?? ""] ?? "#94a3b8"}
          maskColor="rgba(241, 245, 249, 0.85)"
          position="bottom-left"
          style={{ width: 160, height: 100 }}
          className="!rounded-xl !border !border-gray-200 !shadow-sm !bg-white !mb-0"
          pannable
          zoomable
        />

        <Panel position="top-left" className="bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">
              {nodes.length} {nodes.length === 1 ? "pergunta" : "perguntas"}
            </span>
          </div>
        </Panel>
      </ReactFlow>

      {/* Modal de edição */}
      {selectedNode && (
        <NodeEditModal
          node={selectedNode}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

export function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
}
