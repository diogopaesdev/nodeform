"use client";

import { useState } from "react";
import { Star, Check, ArrowRight, User, Mail } from "lucide-react";
import type { SurveyNode, PresentationData } from "@/types";

function HtmlDescription({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

interface QuestionRendererProps {
  node: SurveyNode;
  onAnswer: (answer: {
    selectedOptionId?: string;
    selectedOptionIds?: string[];
    ratingValue?: number;
    respondentName?: string;
    respondentEmail?: string;
  }) => void;
}

export function QuestionRenderer({ node, onAnswer }: QuestionRendererProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [respondentName, setRespondentName] = useState<string>("");
  const [respondentEmail, setRespondentEmail] = useState<string>("");

  const handleSubmit = () => {
    if (node.data.type === "presentation") {
      const presentationData = node.data as PresentationData;
      const answer: {
        respondentName?: string;
        respondentEmail?: string;
      } = {};

      if (presentationData.collectName && respondentName.trim()) {
        answer.respondentName = respondentName.trim();
      }
      if (presentationData.collectEmail && respondentEmail.trim()) {
        answer.respondentEmail = respondentEmail.trim();
      }

      onAnswer(answer);
    } else if (node.data.type === "singleChoice" && selectedOption) {
      onAnswer({ selectedOptionId: selectedOption });
    } else if (node.data.type === "multipleChoice" && selectedOptions.length > 0) {
      onAnswer({ selectedOptionIds: selectedOptions });
    } else if (node.data.type === "rating" && selectedRating !== null) {
      onAnswer({ ratingValue: selectedRating });
    }
  };

  const toggleMultipleOption = (optionId: string) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(selectedOptions.filter(id => id !== optionId));
    } else {
      setSelectedOptions([...selectedOptions, optionId]);
    }
  };

  const isPresentationValid = () => {
    if (node.data.type !== "presentation") return false;
    const presentationData = node.data as PresentationData;

    if (presentationData.collectName && presentationData.nameRequired && !respondentName.trim()) {
      return false;
    }

    if (presentationData.collectEmail && presentationData.emailRequired && !respondentEmail.trim()) {
      return false;
    }

    if (presentationData.collectEmail && respondentEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(respondentEmail.trim())) {
        return false;
      }
    }

    return true;
  };

  const canSubmit =
    (node.data.type === "presentation" && isPresentationValid()) ||
    (node.data.type === "singleChoice" && selectedOption !== null) ||
    (node.data.type === "multipleChoice" && selectedOptions.length > 0) ||
    (node.data.type === "rating" && selectedRating !== null);

  // Presentation
  if (node.data.type === "presentation") {
    const presentationData = node.data as PresentationData;
    const hasDataCollection = presentationData.collectName || presentationData.collectEmail;

    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10 space-y-6 text-center">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {presentationData.title}
          </h1>
          {presentationData.description && (
            <HtmlDescription
              html={presentationData.description}
              className="text-base text-gray-500 max-w-lg mx-auto [&>p]:mb-2 [&>br]:block"
            />
          )}
        </div>

        {hasDataCollection && (
          <div className="space-y-3 max-w-sm mx-auto text-left">
            {presentationData.collectName && (
              <div className="space-y-1.5">
                <label htmlFor="respondent-name" className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                  <User className="w-3.5 h-3.5" />
                  {presentationData.nameLabel || "Nome"}
                  {presentationData.nameRequired && <span className="text-red-500">*</span>}
                </label>
                <input
                  id="respondent-name"
                  type="text"
                  placeholder={presentationData.nameLabel || "Digite seu nome"}
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                />
              </div>
            )}

            {presentationData.collectEmail && (
              <div className="space-y-1.5">
                <label htmlFor="respondent-email" className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                  <Mail className="w-3.5 h-3.5" />
                  {presentationData.emailLabel || "E-mail"}
                  {presentationData.emailRequired && <span className="text-red-500">*</span>}
                </label>
                <input
                  id="respondent-email"
                  type="email"
                  placeholder={presentationData.emailLabel || "Digite seu e-mail"}
                  value={respondentEmail}
                  onChange={(e) => setRespondentEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                />
              </div>
            )}
          </div>
        )}

        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {presentationData.buttonText || "Iniciar"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Single Choice
  if (node.data.type === "singleChoice") {
    const singleChoiceData = node.data as import("@/types").SingleChoiceData;

    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-5">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-gray-900">
            {singleChoiceData.title}
          </h2>
          {singleChoiceData.description && (
            <HtmlDescription
              html={singleChoiceData.description}
              className="text-sm text-gray-500 [&>p]:mb-2 [&>br]:block"
            />
          )}
        </div>

        <div className="space-y-2 pt-2">
          {(singleChoiceData.options || []).map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={`w-full p-3.5 text-left rounded-xl border transition-all ${
                selectedOption === option.id
                  ? "border-blue-500 bg-blue-50/50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedOption === option.id
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedOption === option.id && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-sm text-gray-900">{option.label}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  // Multiple Choice
  if (node.data.type === "multipleChoice") {
    const multipleChoiceData = node.data as import("@/types").MultipleChoiceData;

    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-5">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-gray-900">
            {multipleChoiceData.title}
          </h2>
          {multipleChoiceData.description && (
            <HtmlDescription
              html={multipleChoiceData.description}
              className="text-sm text-gray-500 [&>p]:mb-2 [&>br]:block"
            />
          )}
          <p className="text-xs text-gray-400 italic">Selecione todas que se aplicam</p>
        </div>

        <div className="space-y-2 pt-2">
          {(multipleChoiceData.options || []).map((option) => {
            const isSelected = selectedOptions.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => toggleMultipleOption(option.id)}
                className={`w-full p-3.5 text-left rounded-xl border transition-all ${
                  isSelected
                    ? "border-green-500 bg-green-50/50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? "border-green-500 bg-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    )}
                  </div>
                  <span className="text-sm text-gray-900">{option.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Continuar ({selectedOptions.length} selecionada{selectedOptions.length !== 1 ? 's' : ''})
          </button>
        </div>
      </div>
    );
  }

  // Rating
  if (node.data.type === "rating") {
    const ratingData = node.data as import("@/types").RatingData;
    const ratingRange = Array.from(
      { length: ratingData.maxValue - ratingData.minValue + 1 },
      (_, i) => ratingData.minValue + i
    );

    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-5">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-gray-900">
            {ratingData.title}
          </h2>
          {ratingData.description && (
            <HtmlDescription
              html={ratingData.description}
              className="text-sm text-gray-500 [&>p]:mb-2 [&>br]:block"
            />
          )}
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-center gap-3 py-6">
            {ratingRange.map((value) => (
              <button
                key={value}
                onClick={() => setSelectedRating(value)}
                className="flex flex-col items-center gap-1.5 group"
              >
                <Star
                  className={`w-10 h-10 transition-all ${
                    selectedRating !== null && value <= selectedRating
                      ? "text-yellow-400 fill-yellow-400 scale-110"
                      : "text-gray-300 group-hover:text-yellow-200"
                  }`}
                  strokeWidth={1.5}
                />
                <span className="text-xs font-medium text-gray-500">
                  {value}
                </span>
              </button>
            ))}
          </div>

          <div className="flex justify-between text-xs text-gray-400">
            <span>{ratingData.minLabel || `Mínimo (${ratingData.minValue})`}</span>
            <span>{ratingData.maxLabel || `Máximo (${ratingData.maxValue})`}</span>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  return null;
}
