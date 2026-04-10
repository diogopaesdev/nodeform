"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Play, User, Mail, FileText } from "lucide-react";
import type { PresentationData } from "@/types";

interface Props {
  data: PresentationData;
  selected?: boolean;
}

export const PresentationNode = memo(({ data, selected }: Props) => {
  const hasDataCollection = data.collectName || data.collectEmail || data.collectTerms;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border min-w-[240px] max-w-[280px] relative transition-all ${
        selected ? "border-orange-400 shadow-md shadow-orange-100" : "border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-gray-100">
        <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Play className="w-3.5 h-3.5 text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-medium text-orange-600 uppercase tracking-wide">Apresentação</div>
          <div className="font-semibold text-gray-900 text-sm truncate">{data.title || "Tela de Início"}</div>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2.5">
        {data.description && (
          <p className="text-xs text-gray-500 line-clamp-2">{data.description}</p>
        )}

        {/* Data Collection Preview */}
        {hasDataCollection && (
          <div className="space-y-1.5">
            {data.collectName && (
              <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-md text-xs text-gray-500">
                <User className="w-3 h-3 text-gray-400" />
                <span>{data.nameLabel || "Nome"}</span>
                {data.nameRequired && <span className="text-red-400">*</span>}
              </div>
            )}
            {data.collectEmail && (
              <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-md text-xs text-gray-500">
                <Mail className="w-3 h-3 text-gray-400" />
                <span>{data.emailLabel || "E-mail"}</span>
                {data.emailRequired && <span className="text-red-400">*</span>}
              </div>
            )}
            {data.collectTerms && (
              <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-md text-xs text-gray-500">
                <FileText className="w-3 h-3 text-gray-400" />
                <span className="truncate">{data.termsText || "Termos de Uso"}</span>
                {data.termsRequired && <span className="text-red-400">*</span>}
              </div>
            )}
          </div>
        )}

        {/* Button Preview */}
        <div className="flex justify-center pt-1">
          <div className="px-4 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-md">
            {data.buttonText || "Iniciar"}
          </div>
        </div>
      </div>

      {/* Handle de saída */}
      <Handle
        type="source"
        position={Position.Right}
        id="source"
        className="!w-3 !h-3 !bg-orange-500 !border-2 !border-white !-right-1.5"
      />
    </div>
  );
});

PresentationNode.displayName = "PresentationNode";
