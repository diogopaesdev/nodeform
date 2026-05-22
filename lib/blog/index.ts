import { post as p01 } from "./posts/01-alternativa-typeform"
import { post as p02 } from "./posts/02-logica-condicional"
import { post as p03 } from "./posts/03-nps-online"
import { post as p04 } from "./posts/04-alternativa-google-forms"
import { post as p05 } from "./posts/05-clinicas-esteticas"
import { post as p06 } from "./posts/06-imobiliaria"
import { post as p07 } from "./posts/07-eventos"
import { post as p08 } from "./posts/08-pesquisa-mercado-ia"
import { post as p09 } from "./posts/09-infoprodutores"
import { post as p10 } from "./posts/10-saude"

export type { BlogPost } from "./types"
export { CATEGORY_LABELS } from "./types"

const allPosts = [p01, p02, p03, p04, p05, p06, p07, p08, p09, p10]

export function getAllPosts() {
  return [...allPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getPostBySlug(slug: string) {
  return allPosts.find((p) => p.slug === slug) ?? null
}

export function getPostByEnSlug(slug: string) {
  return allPosts.find((p) => p.enSlug === slug) ?? null
}

export function formatDate(dateStr: string, locale: "pt" | "en" = "pt") {
  const date = new Date(dateStr + "T12:00:00Z")
  return date.toLocaleDateString(locale === "pt" ? "pt-BR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}
