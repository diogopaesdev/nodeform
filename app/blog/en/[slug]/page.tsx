import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock, ArrowRight } from "lucide-react"
import { getAllPosts, getPostByEnSlug, CATEGORY_LABELS, formatDate } from "@/lib/blog"
import type { Metadata } from "next"

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.enSlug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostByEnSlug(slug)
  if (!post) return {}
  return {
    title: `${post.en.title} — SurveyFlow Blog`,
    description: post.en.description,
  }
}

function Logo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <rect x="3" y="19" width="18" height="10" rx="3" fill="white" />
      <rect x="28" y="8" width="17" height="10" rx="3" fill="white" />
      <rect x="28" y="30" width="17" height="10" rx="3" fill="white" fillOpacity="0.55" />
      <path d="M21 24 C24.5 24 24.5 13 28 13" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
      <path d="M21 24 C24.5 24 24.5 35 28 35" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
      <circle cx="21" cy="24" r="3" fill="white" />
      <circle cx="28" cy="13" r="2.5" fill="white" />
      <circle cx="28" cy="35" r="2.5" fill="white" fillOpacity="0.55" />
    </svg>
  )
}

const prose = [
  "[&_p]:mb-5 [&_p]:leading-[1.8] [&_p]:text-gray-600 [&_p]:text-[15px]",
  "[&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:text-gray-950 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:tracking-tight [&_h2]:leading-snug",
  "[&_h3]:text-[18px] [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-7 [&_h3]:mb-3",
  "[&_ul]:mb-5 [&_ul]:space-y-2",
  "[&_li]:flex [&_li]:gap-2 [&_li]:items-start [&_li]:text-[15px] [&_li]:text-gray-600 [&_li]:leading-relaxed",
  "[&_li]:before:content-['–'] [&_li]:before:text-gray-400 [&_li]:before:flex-shrink-0 [&_li]:before:mt-0.5",
  "[&_strong]:font-semibold [&_strong]:text-gray-800",
  "[&_em]:italic [&_em]:text-gray-700",
  "[&_a]:text-orange-600 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-orange-800",
].join(" ")

export default async function BlogPostEnPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostByEnSlug(slug)
  if (!post) notFound()

  const cat = CATEGORY_LABELS[post.category]
  const allPosts = getAllPosts()
  const related = allPosts.filter((p) => p.enSlug !== post.enSlug).slice(0, 3)

  return (
    <div className="min-h-screen text-gray-900 antialiased bg-gray-50">
      {/* Navbar */}
      <header className="sticky top-0 z-50 h-[60px] flex items-center border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="w-full max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-[28px] h-[28px] bg-gray-900 rounded-[8px] flex items-center justify-center">
              <Logo />
            </div>
            <span className="text-[15px] font-bold tracking-tight">SurveyFlow</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={`/blog/${post.slug}`}
              className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors"
            >
              Ler em Português
            </Link>
            <Link
              href="/blog/en"
              className="flex items-center gap-1.5 text-[14px] text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Blog
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-20">
        {/* Post header */}
        <div className="mb-10">
          <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4 ${cat.color}`}>
            {cat.en}
          </span>
          <h1 className="text-[32px] sm:text-[40px] font-extrabold tracking-[-0.03em] leading-[1.1] text-gray-950 mb-5">
            {post.en.title}
          </h1>
          <div className="flex items-center gap-2 text-[13px] text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.readTime} min read</span>
            <span className="mx-1">·</span>
            <span>{formatDate(post.date, "en")}</span>
          </div>
        </div>

        {/* Content */}
        <div
          className={`bg-white rounded-2xl border border-gray-200 p-7 sm:p-10 ${prose}`}
          dangerouslySetInnerHTML={{ __html: post.en.content }}
        />

        {/* CTA */}
        <div className="mt-10 p-6 bg-gray-900 rounded-2xl text-white text-center">
          <p className="text-[18px] font-bold mb-2">Ready to get started?</p>
          <p className="text-[14px] text-gray-400 mb-5">7-day free trial, no credit card required.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white text-gray-900 text-[14px] font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Create my survey
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-[18px] font-bold text-gray-950 mb-5">More articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((r) => {
                const rCat = CATEGORY_LABELS[r.category]
                return (
                  <Link
                    key={r.enSlug}
                    href={`/blog/en/${r.enSlug}`}
                    className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-gray-300 transition-all"
                  >
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 ${rCat.color}`}>
                      {rCat.en}
                    </span>
                    <p className="text-[13px] font-semibold text-gray-800 leading-snug group-hover:text-orange-600 transition-colors">
                      {r.en.title}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm py-8 px-6 mt-8">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-[26px] h-[26px] bg-gray-900 rounded-[8px] flex items-center justify-center flex-shrink-0">
              <Logo />
            </div>
            <span className="text-[14px] font-bold">SurveyFlow</span>
          </div>
          <div className="flex items-center gap-4 text-[13px] text-gray-400">
            <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy</Link>
            <span>·</span>
            <Link href="/blog/en" className="hover:text-gray-700 transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
