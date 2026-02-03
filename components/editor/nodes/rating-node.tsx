"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Star } from "lucide-react";
import type { RatingData } from "@/types";

interface Props {
  data: RatingData;
  selected?: boolean;
}

export const RatingNode = memo(({ data, selected }: Props) => {
  const ratingRange = Array.from(
    { length: data.maxValue - data.minValue + 1 },
    (_, i) => data.minValue + i
  );

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border min-w-[240px] max-w-[280px] relative transition-all ${
        selected ? "border-purple-400 shadow-md shadow-purple-100" : "border-gray-200"
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
        <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Star className="w-3.5 h-3.5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-medium text-purple-600 uppercase tracking-wide">Avaliação</div>
          <div className="font-semibold text-gray-900 text-sm truncate">{data.title || "Nova Avaliação"}</div>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        {data.description && (
          <p className="text-xs text-gray-500 line-clamp-2">{data.description}</p>
        )}

        {/* Rating Range */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-0.5 py-1.5">
            {ratingRange.map((value) => (
              <Star
                key={value}
                className="w-5 h-5 text-amber-400 fill-amber-400"
                strokeWidth={1.5}
              />
            ))}
          </div>

          {/* Labels */}
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>{data.minLabel || `${data.minValue}`}</span>
            <span>{data.maxLabel || `${data.maxValue}`}</span>
          </div>
        </div>
      </div>

      {/* Handle de saída */}
      <Handle
        type="source"
        position={Position.Right}
        id="source"
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white !-right-1.5"
      />
    </div>
  );
});

RatingNode.displayName = "RatingNode";
