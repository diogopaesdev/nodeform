"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { AlignLeft } from "lucide-react";
import type { TextInputData } from "@/types";

interface Props {
  data: TextInputData;
  selected?: boolean;
}

export const TextInputNode = memo(({ data, selected }: Props) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border min-w-[240px] max-w-[280px] relative transition-all ${
        selected ? "border-violet-400 shadow-md shadow-violet-100" : "border-gray-200"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white !-left-1.5"
      />

      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-gray-100">
        <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <AlignLeft className="w-3.5 h-3.5 text-violet-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-medium text-violet-600 uppercase tracking-wide">
            {data.isLong ? "Texto Longo" : "Texto Curto"}
          </div>
          <div className="font-semibold text-gray-900 text-sm truncate">{data.title || "Pergunta aberta"}</div>
        </div>
      </div>

      <div className="p-3 space-y-2">
        {data.description && (
          <p className="text-xs text-gray-500 line-clamp-2">{data.description}</p>
        )}
        <div
          className={`w-full bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-400 px-2 py-1.5 ${
            data.isLong ? "h-12" : "h-7"
          }`}
        >
          {data.placeholder || "Resposta do usuário..."}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="source"
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white !-right-1.5"
      />
    </div>
  );
});

TextInputNode.displayName = "TextInputNode";
