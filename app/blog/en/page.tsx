import Link from "next/link"
import { ArrowLeft, Clock, ArrowRight } from "lucide-react"
import { getAllPosts, CATEGORY_LABELS, formatDate } from "@/lib/blog"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog — SurveyFlow",
  description:
    "Articles on online surveys, conditional logic forms, NPS, lead qualification, and use cases by industry segment.",
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

export default function BlogEnPage() {
  const posts = getAllPosts()

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
              href="/blog"
              className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors"
            >
              PT
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[14px] text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-14 sm:py-20">
          <p className="text-[12px] font-semibold text-orange-500 uppercase tracking-widest mb-3">Blog</p>
          <h1 className="text-[36px] sm:text-[48px] font-extrabold tracking-[-0.03em] leading-[1.05] text-gray-950 mb-4">
            Surveys, forms<br className="hidden sm:block" /> and smart flows
          </h1>
          <p className="text-[16px] text-gray-500 max-w-xl">
            Practical articles on survey creation, lead qualification, NPS, and use cases by industry segment.
          </p>
        </div>
      </div>

      {/* Posts grid */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => {
            const cat = CATEGORY_LABELS[post.category]
            return (
              <Link
                key={post.enSlug}
                href={`/blog/en/${post.enSlug}`}
                className="group bg-white rounded-2xl border border-gray-200 p-6 flex flex-col hover:shadow-md hover:border-gray-300 transition-all"
              >
                <span
                  className={`inline-block self-start text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4 ${cat.color}`}
                >
                  {cat.en}
                </span>
                <h2 className="text-[16px] font-bold text-gray-950 leading-snug mb-3 flex-1 group-hover:text-orange-600 transition-colors">
                  {post.en.title}
                </h2>
                <p className="text-[13px] text-gray-500 leading-relaxed mb-4 line-clamp-3">
                  {post.en.description}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-[12px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime} min</span>
                    <span className="mx-1">·</span>
                    <span>{formatDate(post.date, "en")}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm py-8 px-6 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
            <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
