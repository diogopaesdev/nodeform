"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { Bold, Italic, Underline, AArrowUp } from "lucide-react";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

const formatActions = [
  { icon: Bold, label: "Negrito", command: "bold", query: "bold" },
  { icon: Italic, label: "Itálico", command: "italic", query: "italic" },
  { icon: Underline, label: "Sublinhado", command: "underline", query: "underline" },
  { icon: AArrowUp, label: "Tamanho", command: "heading", query: "heading" },
] as const;

function getTextLength(el: HTMLElement) {
  return (el.textContent || "").length;
}

export function RichTextEditor({ value = "", onChange, placeholder, maxLength = 500 }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [charCount, setCharCount] = useState(0);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const isInternalChange = useRef(false);

  useEffect(() => {
    document.execCommand("defaultParagraphSeparator", false, "div");
  }, []);

  useEffect(() => {
    const el = editorRef.current;
    if (!el || isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (el.innerHTML !== value) {
      el.innerHTML = value;
    }
    setCharCount(el ? getTextLength(el) : 0);
  }, [value]);

  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();
    try {
      if (document.queryCommandState("bold")) formats.add("bold");
      if (document.queryCommandState("italic")) formats.add("italic");
      if (document.queryCommandState("underline")) formats.add("underline");

      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        let node: Node | null = sel.anchorNode;
        while (node && node !== editorRef.current) {
          if (node instanceof HTMLElement) {
            if (node.tagName === "H3") formats.add("heading");
          }
          node = node.parentNode;
        }
      }
    } catch {}
    setActiveFormats(formats);
  }, []);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;

    const textLen = getTextLength(el);
    if (textLen > maxLength) {
      const sel = window.getSelection();
      const range = sel?.getRangeAt(0);
      const offset = range?.startOffset ?? 0;

      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let remaining = maxLength;
      while (walker.nextNode()) {
        const textNode = walker.currentNode as Text;
        if (remaining <= 0) {
          textNode.textContent = "";
        } else if (textNode.textContent && textNode.textContent.length > remaining) {
          textNode.textContent = textNode.textContent.substring(0, remaining);
          remaining = 0;
        } else {
          remaining -= (textNode.textContent?.length ?? 0);
        }
      }

      try {
        if (sel && range) {
          const newRange = document.createRange();
          const lastText = el.lastChild;
          if (lastText) {
            const len = lastText.textContent?.length ?? 0;
            newRange.setStart(lastText, Math.min(offset, len));
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
          }
        }
      } catch {}
    }

    setCharCount(getTextLength(el));
    isInternalChange.current = true;
    const html = el.innerHTML;
    onChange?.(html === "<br>" ? "" : html);
    updateActiveFormats();
  }, [onChange, maxLength, updateActiveFormats]);

  const handleSelectionChange = useCallback(() => {
    if (!editorRef.current?.contains(document.activeElement) &&
        !editorRef.current?.contains(window.getSelection()?.anchorNode ?? null)) return;
    updateActiveFormats();
  }, [updateActiveFormats]);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [handleSelectionChange]);

  const execCommand = useCallback((command: string) => {
    if (command === "heading") {
      if (activeFormats.has("heading")) {
        document.execCommand("formatBlock", false, "div");
      } else {
        document.execCommand("formatBlock", false, "h3");
      }
    } else {
      document.execCommand(command, false);
    }
    editorRef.current?.focus();
    handleInput();
  }, [handleInput, activeFormats]);

  const isOverLimit = charCount > maxLength;

  return (
    <div className="rounded-md border border-gray-200 overflow-hidden focus-within:ring-1 focus-within:ring-gray-400 focus-within:border-gray-400">
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        {formatActions.map((action) => {
          const isActive = activeFormats.has(action.query);
          return (
            <button
              key={action.label}
              type="button"
              title={action.label}
              onMouseDown={(e) => {
                e.preventDefault();
                execCommand(action.command);
              }}
              className={`p-1.5 rounded transition-colors ${
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
              }`}
            >
              <action.icon className="w-3.5 h-3.5" />
            </button>
          );
        })}

        <div className="flex-1" />

        <span className={`text-[10px] tabular-nums ${isOverLimit ? "text-red-500" : "text-gray-400"}`}>
          {charCount}/{maxLength}
        </span>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        className="w-full px-3 py-2 text-sm min-h-[70px] bg-white focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none [&>h3]:text-base [&>h3]:font-semibold [&>h3]:mb-1 [&>p]:mb-1"
      />
    </div>
  );
}
