"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { CircleDot } from "lucide-react";
import { useEditorStore } from "@/lib/stores";
import type { SingleChoiceData } from "@/types";

interface Props {
  data: SingleChoiceData;
  selected?: boolean;
}

export const SingleChoiceNode = memo(({ data, selected }: Props) => {
  const enableScoring = useEditorStore((state) => state.enableScoring);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border min-w-[240px] max-w-[280px] relative transition-all ${
        selected ? "border-blue-400 shadow-md shadow-blue-100" : "border-gray-200"
      }`}
    >
      {/* Handle de entrada */}
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white !-left-1.5"
      />

      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-gray-100">
        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <CircleDot className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-medium text-blue-600 uppercase tracking-wide">Escolha Simples</div>
          <div className="font-semibold text-gray-900 text-sm truncate">{data.title || "Nova Pergunta"}</div>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        {data.description && (
          <p className="text-xs text-gray-500 line-clamp-2">{data.description}</p>
        )}

        {/* Options */}
        <div className="space-y-1.5">
          {data.options.map((option, index) => (
            <div
              key={option.id}
              className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-md pr-5"
            >
              <div className="w-3 h-3 rounded-full border-2 border-blue-400 flex-shrink-0" />
              <span className="text-xs text-gray-700 flex-1 truncate">{option.label}</span>
              {enableScoring && option.score !== undefined && option.score > 0 && (
                <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  +{option.score}
                </span>
              )}
            </div>
          ))}
        </div>

        {data.options.length === 0 && (
          <p className="text-[10px] text-gray-400 italic text-center py-2">
            Nenhuma opção adicionada
          </p>
        )}
      </div>

      {/* Handles de saída para cada opção */}
      {data.options.map((option, index) => (
        <Handle
          key={option.id}
          type="source"
          position={Position.Right}
          id={option.id}
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !-right-1.5"
          style={{
            top: `${110 + index * 35}px`,
          }}
        />
      ))}
    </div>
  );
});

SingleChoiceNode.displayName = "SingleChoiceNode";
