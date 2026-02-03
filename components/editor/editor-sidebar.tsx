"use client";

import { CircleDot, CheckSquare, Star, Play, GripVertical } from "lucide-react";

const nodeTypes = [
  {
    id: "presentation",
    title: "Apresentação",
    icon: Play,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  {
    id: "singleChoice",
    title: "Escolha Simples",
    icon: CircleDot,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    id: "multipleChoice",
    title: "Múltipla Escolha",
    icon: CheckSquare,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    id: "rating",
    title: "Avaliação",
    icon: Star,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
];

export function EditorSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-52 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Perguntas</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Arraste para o canvas
        </p>
      </div>

      {/* Node Types */}
      <div className="flex-1 p-2 space-y-1.5 overflow-y-auto">
        {nodeTypes.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.id}
              draggable
              onDragStart={(e) => onDragStart(e, node.id)}
              className="flex items-center gap-2.5 px-2.5 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing transition-colors group"
            >
              <div className={`w-7 h-7 ${node.bg} rounded-md flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${node.color}`} />
              </div>
              <span className="text-sm font-medium text-gray-700 flex-1">
                {node.title}
              </span>
              <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
