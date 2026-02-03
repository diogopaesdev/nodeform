"use client";

import { useState, useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ConnectionMode,
  Panel,
  Node,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEditorStore } from "@/lib/stores";
import { nodeTypes } from "./nodes";
import { NodeEditModal } from "./node-edit-modal";
import type { SurveyNode, PresentationData, SingleChoiceData, MultipleChoiceData, RatingData } from "@/types";

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
    default:
      return null;
  }
};

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
        <Controls
          showZoom
          showFitView
          showInteractive
          position="bottom-right"
        />
        <MiniMap
          nodeColor="#3b82f6"
          maskColor="rgb(0, 0, 0, 0.1)"
          position="bottom-left"
          className="bg-white border border-gray-200 rounded-lg"
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
