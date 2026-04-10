"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { FlagTriangleRight } from "lucide-react";
import type { EndScreenData } from "@/types";

interface Props {
  data: EndScreenData;
  selected?: boolean;
}

export const EndScreenNode = memo(({ data, selected }: Props) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border min-w-[240px] max-w-[280px] relative transition-all ${
        selected ? "border-rose-400 shadow-md shadow-rose-100" : "border-gray-200"
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
        <div className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <FlagTriangleRight className="w-3.5 h-3.5 text-rose-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-medium text-rose-600 uppercase tracking-wide">Tela Final</div>
          <div className="font-semibold text-gray-900 text-sm truncate">{data.title || "Obrigado!"}</div>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        {data.description && (
          <p className="text-xs text-gray-500 line-clamp-2">{data.description}</p>
        )}

        {data.showScore && (
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-green-50 rounded-md text-xs text-green-600">
            Exibe pontuação
          </div>
        )}
      </div>
    </div>
  );
});

EndScreenNode.displayName = "EndScreenNode";
