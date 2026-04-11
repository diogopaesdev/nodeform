"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** If provided, the user must type this exact string to enable the delete button */
  confirmName?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  labels: {
    deleteButton: string;
    cancelButton: string;
    cannotBeUndone: string;
    typeToConfirm?: string;
    inputPlaceholder?: string;
  };
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmName,
  onConfirm,
  loading = false,
  labels,
}: DeleteConfirmModalProps) {
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const needsTyping = Boolean(confirmName);
  const canDelete = !needsTyping || typed === confirmName;

  // Reset input when modal opens/closes
  useEffect(() => {
    if (open) {
      setTyped("");
      // Focus the input after animation
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
      if ((e.key === "Enter") && canDelete && !loading) {
        e.preventDefault();
        onConfirm();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, canDelete, loading, onConfirm, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-4 h-4 text-red-500" />
              </div>
              <DialogTitle className="text-base font-semibold text-gray-900">
                {title}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">{description}</p>

            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs font-medium text-red-600">
                {labels.cannotBeUndone}
              </p>
            </div>

            {needsTyping && (
              <div className="space-y-2 pt-1">
                <p className="text-xs text-gray-500">
                  {labels.typeToConfirm}{" "}
                  <span className="font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                    {confirmName}
                  </span>{" "}
                  para confirmar.
                </p>
                <input
                  ref={inputRef}
                  type="text"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder={labels.inputPlaceholder}
                  disabled={loading}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors disabled:opacity-50"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            {labels.cancelButton}
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-500">
              Esc
            </kbd>
          </button>
          <button
            onClick={onConfirm}
            disabled={!canDelete || loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {labels.deleteButton}
              </span>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                {labels.deleteButton}
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-red-500 bg-red-700/30 px-1.5 font-mono text-[10px] font-medium text-red-200">
                  ↵
                </kbd>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
