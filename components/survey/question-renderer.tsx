"use client";

import { useState } from "react";
import { Star, Check, ArrowRight, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SurveyNode, PresentationData } from "@/types";

// Componente para renderizar HTML básico de forma segura
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

  // Validação para presentation com campos de captura
  const isPresentationValid = () => {
    if (node.data.type !== "presentation") return false;
    const presentationData = node.data as PresentationData;

    // Se coleta nome e é obrigatório, verifica se foi preenchido
    if (presentationData.collectName && presentationData.nameRequired && !respondentName.trim()) {
      return false;
    }

    // Se coleta email e é obrigatório, verifica se foi preenchido
    if (presentationData.collectEmail && presentationData.emailRequired && !respondentEmail.trim()) {
      return false;
    }

    // Validação básica de email se estiver preenchido
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
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8 text-center">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            {presentationData.title}
          </h1>
          {presentationData.description && (
            <HtmlDescription
              html={presentationData.description}
              className="text-xl text-gray-600 max-w-lg mx-auto [&>p]:mb-2 [&>br]:block"
            />
          )}
        </div>

        {/* Data Collection Fields */}
        {hasDataCollection && (
          <div className="space-y-4 max-w-md mx-auto text-left">
            {presentationData.collectName && (
              <div className="space-y-2">
                <Label htmlFor="respondent-name" className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4" />
                  {presentationData.nameLabel || "Nome"}
                  {presentationData.nameRequired && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="respondent-name"
                  type="text"
                  placeholder={presentationData.nameLabel || "Digite seu nome"}
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  className="h-12"
                />
              </div>
            )}

            {presentationData.collectEmail && (
              <div className="space-y-2">
                <Label htmlFor="respondent-email" className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-4 h-4" />
                  {presentationData.emailLabel || "E-mail"}
                  {presentationData.emailRequired && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="respondent-email"
                  type="email"
                  placeholder={presentationData.emailLabel || "Digite seu e-mail"}
                  value={respondentEmail}
                  onChange={(e) => setRespondentEmail(e.target.value)}
                  className="h-12"
                />
              </div>
            )}
          </div>
        )}

        {/* CTA Button */}
        <div className="pt-8">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            size="lg"
            className="h-14 px-8 text-lg font-semibold bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {presentationData.buttonText || "Iniciar"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Single Choice
  if (node.data.type === "singleChoice") {
    const singleChoiceData = node.data as import("@/types").SingleChoiceData;

    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">
            {singleChoiceData.title}
          </h2>
          {singleChoiceData.description && (
            <HtmlDescription
              html={singleChoiceData.description}
              className="text-lg text-gray-600 [&>p]:mb-2 [&>br]:block"
            />
          )}
        </div>

        {/* Options */}
        <div className="space-y-3 pt-4">
          {(singleChoiceData.options || []).map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedOption === option.id
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedOption === option.id
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedOption === option.id && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-lg text-gray-900">{option.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full h-12 text-lg"
          >
            Continuar
          </Button>
        </div>
      </div>
    );
  }

  // Multiple Choice
  if (node.data.type === "multipleChoice") {
    const multipleChoiceData = node.data as import("@/types").MultipleChoiceData;

    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">
            {multipleChoiceData.title}
          </h2>
          {multipleChoiceData.description && (
            <HtmlDescription
              html={multipleChoiceData.description}
              className="text-lg text-gray-600 [&>p]:mb-2 [&>br]:block"
            />
          )}
          <p className="text-sm text-gray-500 italic">Selecione todas que se aplicam</p>
        </div>

        {/* Options */}
        <div className="space-y-3 pt-4">
          {(multipleChoiceData.options || []).map((option) => {
            const isSelected = selectedOptions.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => toggleMultipleOption(option.id)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-green-500 bg-green-50 shadow-md"
                    : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-green-500 bg-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    )}
                  </div>
                  <span className="text-lg text-gray-900">{option.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
          >
            Continuar ({selectedOptions.length} selecionada{selectedOptions.length !== 1 ? 's' : ''})
          </Button>
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
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">
            {ratingData.title}
          </h2>
          {ratingData.description && (
            <HtmlDescription
              html={ratingData.description}
              className="text-lg text-gray-600 [&>p]:mb-2 [&>br]:block"
            />
          )}
        </div>

        {/* Rating */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-center gap-4 py-8">
            {ratingRange.map((value) => (
              <button
                key={value}
                onClick={() => setSelectedRating(value)}
                className="flex flex-col items-center gap-2 group"
              >
                <Star
                  className={`w-12 h-12 transition-all ${
                    selectedRating !== null && value <= selectedRating
                      ? "text-yellow-400 fill-yellow-400 scale-110"
                      : "text-gray-300 group-hover:text-yellow-200"
                  }`}
                  strokeWidth={1.5}
                />
                <span className="text-sm font-medium text-gray-600">
                  {value}
                </span>
              </button>
            ))}
          </div>

          {/* Labels */}
          <div className="flex justify-between text-sm text-gray-500">
            <span>{ratingData.minLabel || `Mínimo (${ratingData.minValue})`}</span>
            <span>{ratingData.maxLabel || `Máximo (${ratingData.maxValue})`}</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full h-12 text-lg"
          >
            Continuar
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
