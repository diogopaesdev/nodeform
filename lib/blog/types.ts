export type BlogPost = {
  slug: string
  enSlug: string
  category: "comparacao" | "funcionalidade" | "caso-de-uso"
  date: string
  readTime: number
  pt: {
    title: string
    description: string
    content: string
  }
  en: {
    title: string
    description: string
    content: string
  }
}

export const CATEGORY_LABELS: Record<BlogPost["category"], { pt: string; en: string; color: string }> = {
  "comparacao":    { pt: "Comparação",    en: "Comparison",  color: "bg-blue-100 text-blue-700"     },
  "funcionalidade":{ pt: "Funcionalidade",en: "Feature",     color: "bg-orange-100 text-orange-700"  },
  "caso-de-uso":   { pt: "Caso de Uso",   en: "Use Case",    color: "bg-emerald-100 text-emerald-700"},
}
