"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, GripVertical, User, Mail, Trophy, Play, CircleDot, CheckSquare, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useEditorStore } from "@/lib/stores";
import type { SurveyNode, NodeData } from "@/types";

interface NodeEditModalProps {
  node: SurveyNode;
  isOpen: boolean;
  onClose: () => void;
}

// Schema base para todos os tipos
const baseSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
});

// Schema para presentation
const presentationSchema = baseSchema.extend({
  type: z.literal("presentation"),
  buttonText: z.string().min(1, "Texto do botão é obrigatório"),
  collectName: z.boolean().optional(),
  collectEmail: z.boolean().optional(),
  nameLabel: z.string().optional(),
  emailLabel: z.string().optional(),
  nameRequired: z.boolean().optional(),
  emailRequired: z.boolean().optional(),
});

// Schema para opções
const optionSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Label é obrigatório"),
  score: z.number().optional(),
});

// Schema para single/multiple choice
const choiceSchema = baseSchema.extend({
  type: z.enum(["singleChoice", "multipleChoice"]),
  options: z.array(optionSchema).min(1, "Adicione pelo menos uma opção"),
});

// Schema para rating
const ratingSchema = baseSchema.extend({
  type: z.literal("rating"),
  minValue: z.number().min(0),
  maxValue: z.number().min(1),
  minLabel: z.string().optional(),
  maxLabel: z.string().optional(),
});

type FormData = z.infer<typeof presentationSchema> | z.infer<typeof choiceSchema> | z.infer<typeof ratingSchema>;

const getTypeConfig = (type: string) => {
  const configs: Record<string, { label: string; icon: typeof Play; color: string; bg: string }> = {
    presentation: { label: "Apresentação", icon: Play, color: "text-orange-600", bg: "bg-orange-100" },
    singleChoice: { label: "Escolha Simples", icon: CircleDot, color: "text-blue-600", bg: "bg-blue-100" },
    multipleChoice: { label: "Múltipla Escolha", icon: CheckSquare, color: "text-green-600", bg: "bg-green-100" },
    rating: { label: "Avaliação", icon: Star, color: "text-purple-600", bg: "bg-purple-100" },
  };
  return configs[type] || configs.presentation;
};

export function NodeEditModal({ node, isOpen, onClose }: NodeEditModalProps) {
  const { updateNode, deleteNode, enableScoring } = useEditorStore();
  const typeConfig = getTypeConfig(node.data.type);
  const Icon = typeConfig.icon;

  const getDefaultValues = (): FormData => {
    const { type } = node.data;

    if (type === "presentation") {
      const presData = node.data as {
        buttonText?: string;
        collectName?: boolean;
        collectEmail?: boolean;
        nameLabel?: string;
        emailLabel?: string;
        nameRequired?: boolean;
        emailRequired?: boolean;
      };
      return {
        type: "presentation",
        title: node.data.title,
        description: node.data.description || "",
        buttonText: presData.buttonText || "Iniciar",
        collectName: presData.collectName || false,
        collectEmail: presData.collectEmail || false,
        nameLabel: presData.nameLabel || "Nome",
        emailLabel: presData.emailLabel || "E-mail",
        nameRequired: presData.nameRequired || false,
        emailRequired: presData.emailRequired || false,
      };
    }

    if (type === "singleChoice" || type === "multipleChoice") {
      return {
        type,
        title: node.data.title,
        description: node.data.description || "",
        options: (node.data as { options: Array<{ id: string; label: string; score?: number }> }).options,
      };
    }

    if (type === "rating") {
      const ratingData = node.data as { minValue: number; maxValue: number; minLabel?: string; maxLabel?: string };
      return {
        type: "rating",
        title: node.data.title,
        description: node.data.description || "",
        minValue: ratingData.minValue,
        maxValue: ratingData.maxValue,
        minLabel: ratingData.minLabel || "",
        maxLabel: ratingData.maxLabel || "",
      };
    }

    return {
      type: "presentation",
      title: "",
      description: "",
      buttonText: "Iniciar",
    };
  };

  const form = useForm<FormData>({
    resolver: zodResolver(
      node.data.type === "presentation"
        ? presentationSchema
        : node.data.type === "rating"
        ? ratingSchema
        : choiceSchema
    ),
    defaultValues: getDefaultValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options" as never,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(getDefaultValues());
    }
  }, [isOpen, node]);

  const onSubmit = (data: FormData) => {
    updateNode(node.id, data as Partial<NodeData>);
    onClose();
  };

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja deletar esta pergunta?")) {
      deleteNode(node.id);
      onClose();
    }
  };

  const addOption = () => {
    append({
      id: `opt_${Date.now()}`,
      label: `Opção ${fields.length + 1}`,
      score: 0,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogTitle className="sr-only">Editar {typeConfig.label}</DialogTitle>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className={`w-8 h-8 ${typeConfig.bg} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${typeConfig.color}`} />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-gray-900">{typeConfig.label}</h2>
            <p className="text-xs text-gray-500">Editar configurações</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Título */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <label className="text-xs font-medium text-gray-700">Título</label>
                    <FormControl>
                      <Input
                        placeholder="Digite o título..."
                        className="h-9 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Descrição */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <label className="text-xs font-medium text-gray-700">Descrição</label>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Digite uma descrição opcional..."
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Campos específicos por tipo */}
              {node.data.type === "presentation" && (
                <>
                  <FormField
                    control={form.control}
                    name="buttonText"
                    render={({ field }) => (
                      <FormItem>
                        <label className="text-xs font-medium text-gray-700">Texto do Botão</label>
                        <FormControl>
                          <Input
                            placeholder="Ex: Iniciar Pesquisa"
                            className="h-9 text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="pt-2">
                    <label className="text-xs font-medium text-gray-700">Captura de Dados</label>
                    <p className="text-xs text-gray-400 mt-0.5 mb-3">
                      Colete informações do respondente antes de iniciar.
                    </p>

                    {/* Coletar Nome */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3 mb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Coletar Nome</span>
                        </div>
                        <FormField
                          control={form.control}
                          name="collectName"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="scale-90"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {form.watch("collectName") && (
                        <div className="flex items-center gap-3 pt-1">
                          <FormField
                            control={form.control}
                            name="nameLabel"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input placeholder="Label" className="h-8 text-sm" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="nameRequired"
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Obrigatório</span>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="scale-75"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>

                    {/* Coletar Email */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Coletar E-mail</span>
                        </div>
                        <FormField
                          control={form.control}
                          name="collectEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="scale-90"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {form.watch("collectEmail") && (
                        <div className="flex items-center gap-3 pt-1">
                          <FormField
                            control={form.control}
                            name="emailLabel"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input placeholder="Label" className="h-8 text-sm" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="emailRequired"
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Obrigatório</span>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="scale-75"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {(node.data.type === "singleChoice" || node.data.type === "multipleChoice") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-medium text-gray-700">Opções de Resposta</label>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {node.data.type === "singleChoice"
                          ? "Uma única opção pode ser selecionada"
                          : "Múltiplas opções podem ser selecionadas"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addOption}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar
                    </button>
                  </div>

                  {enableScoring && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md">
                      <Trophy className="w-3.5 h-3.5 text-green-600" />
                      <p className="text-xs text-green-700">
                        Pontuação ativa: defina pontos para cada opção
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <GripVertical className="w-3.5 h-3.5 text-gray-300 cursor-grab" />

                        <FormField
                          control={form.control}
                          name={`options.${index}.label`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  placeholder="Texto da opção"
                                  className="h-8 text-sm border-0 bg-white"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {enableScoring && (
                          <FormField
                            control={form.control}
                            name={`options.${index}.score`}
                            render={({ field }) => (
                              <FormItem className="w-16">
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Pts"
                                    className="h-8 text-sm text-center border-0 bg-white"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          disabled={fields.length <= 1}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {node.data.type === "rating" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Configuração da Escala</label>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Defina o intervalo de valores para a avaliação
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="minValue"
                      render={({ field }) => (
                        <FormItem>
                          <label className="text-xs text-gray-500">Valor Mínimo</label>
                          <FormControl>
                            <Input
                              type="number"
                              className="h-9 text-sm"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxValue"
                      render={({ field }) => (
                        <FormItem>
                          <label className="text-xs text-gray-500">Valor Máximo</label>
                          <FormControl>
                            <Input
                              type="number"
                              className="h-9 text-sm"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="minLabel"
                      render={({ field }) => (
                        <FormItem>
                          <label className="text-xs text-gray-500">Label Mínimo</label>
                          <FormControl>
                            <Input
                              placeholder="Ex: Muito Insatisfeito"
                              className="h-9 text-sm"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxLabel"
                      render={({ field }) => (
                        <FormItem>
                          <label className="text-xs text-gray-500">Label Máximo</label>
                          <FormControl>
                            <Input
                              placeholder="Ex: Muito Satisfeito"
                              className="h-9 text-sm"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {enableScoring && (
                    <div className="flex items-start gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-md">
                      <Trophy className="w-3.5 h-3.5 text-green-600 mt-0.5" />
                      <p className="text-xs text-green-700">
                        O valor selecionado pelo usuário será usado como pontuação.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
