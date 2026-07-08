"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  AArrowUp,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RemoveFormatting,
  Code,
} from "lucide-react";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

type FormatAction = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  command: string;
  query: string;
};

const markActions: readonly FormatAction[] = [
  { icon: Bold, label: "Negrito", command: "bold", query: "bold" },
  { icon: Italic, label: "Itálico", command: "italic", query: "italic" },
  { icon: Underline, label: "Sublinhado", command: "underline", query: "underline" },
  { icon: AArrowUp, label: "Tamanho", command: "heading", query: "heading" },
];

const alignActions: readonly FormatAction[] = [
  { icon: AlignLeft, label: "Alinhar à esquerda", command: "justifyLeft", query: "justifyLeft" },
  { icon: AlignCenter, label: "Centralizar", command: "justifyCenter", query: "justifyCenter" },
  { icon: AlignRight, label: "Alinhar à direita", command: "justifyRight", query: "justifyRight" },
];

function getTextLength(el: HTMLElement) {
  return (el.textContent || "").length;
}

function htmlToTextLength(html: string) {
  if (typeof document === "undefined") return html.length;
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || "").length;
}

export function RichTextEditor({ value = "", onChange, placeholder, maxLength = 2000 }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [charCount, setCharCount] = useState(0);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [showCode, setShowCode] = useState(false);
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
  }, [value, showCode]);

  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();
    try {
      if (document.queryCommandState("bold")) formats.add("bold");
      if (document.queryCommandState("italic")) formats.add("italic");
      if (document.queryCommandState("underline")) formats.add("underline");

      if (document.queryCommandState("justifyCenter")) formats.add("justifyCenter");
      else if (document.queryCommandState("justifyRight")) formats.add("justifyRight");
      else if (document.queryCommandState("justifyLeft")) formats.add("justifyLeft");

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

  const clearFormatting = useCallback(() => {
    document.execCommand("removeFormat", false);
    document.execCommand("formatBlock", false, "div");
    document.execCommand("justifyLeft", false);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const html = e.target.value;
    onChange?.(html);
    setCharCount(htmlToTextLength(html));
  }, [onChange]);

  const renderButton = (action: FormatAction) => {
    const isActive = activeFormats.has(action.query);
    return (
      <button
        key={action.label}
        type="button"
        title={action.label}
        disabled={showCode}
        onMouseDown={(e) => {
          e.preventDefault();
          execCommand(action.command);
        }}
        className={`p-1.5 rounded transition-colors ${
          showCode
            ? "text-gray-300 cursor-not-allowed"
            : isActive
              ? "text-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
        }`}
      >
        <action.icon className="w-3.5 h-3.5" />
      </button>
    );
  };

  const isOverLimit = charCount > maxLength;

  return (
    <div className="rounded-md border border-gray-200 overflow-hidden focus-within:ring-1 focus-within:ring-gray-400 focus-within:border-gray-400">
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        {markActions.map(renderButton)}

        <div className="w-px h-4 bg-gray-200 mx-1" />

        {alignActions.map(renderButton)}

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <button
          type="button"
          title="Limpar formatação"
          disabled={showCode}
          onMouseDown={(e) => {
            e.preventDefault();
            clearFormatting();
          }}
          className={`p-1.5 rounded transition-colors ${
            showCode
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
          }`}
        >
          <RemoveFormatting className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <button
          type="button"
          title={showCode ? "Ver texto formatado" : "Ver código HTML"}
          onMouseDown={(e) => {
            e.preventDefault();
            setShowCode((v) => !v);
          }}
          className={`p-1.5 rounded transition-colors ${
            showCode
              ? "text-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
          }`}
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        <div className="flex-1" />

        <span className={`text-[10px] tabular-nums ${isOverLimit ? "text-red-500" : "text-gray-400"}`}>
          {charCount}/{maxLength}
        </span>
      </div>

      {showCode ? (
        <textarea
          value={value}
          onChange={handleCodeChange}
          spellCheck={false}
          placeholder="<p>Seu HTML aqui…</p>"
          className="w-full px-3 py-2 text-xs font-mono leading-relaxed min-h-[120px] bg-white text-gray-800 focus:outline-none resize-y"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          data-placeholder={placeholder}
          className="w-full px-3 py-2 text-sm min-h-[70px] bg-white focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none [&>h3]:text-base [&>h3]:font-semibold [&>h3]:mb-1 [&>p]:mb-1"
        />
      )}
    </div>
  );
}
