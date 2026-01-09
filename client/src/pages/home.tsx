import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Story } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Menu, Search } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function Home() {
  const { data: stories, isLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Helmet>
        <title>The Scope | Latest Stories</title>
        <meta name="description" content="Browse the latest editorial stories, news, and insights on The Scope." />
        <link rel="canonical" href="https://thescope.replit.app/" />
      </Helmet>
      <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors" onClick={() => {}} title="Menu">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-serif font-black text-2xl tracking-tight text-[#111318] dark:text-white text-center">
            The Scope
          </h1>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors" onClick={() => {}} title="Search">
            <Search className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="w-full max-w-2xl mx-auto px-4 pb-12 pt-4 flex flex-col gap-8">
        {stories?.map((story, index) => (
          <Link key={story.id} href={`/stories/${story.id}`}>
            <article className="group cursor-pointer flex flex-col gap-3 pb-6 border-b border-gray-100 dark:border-gray-800">
              <div className="relative w-full aspect-[3/2] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                <img
                  src={story.coverImageUrl}
                  alt={story.title}
                  loading="eager"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=2000';
                  }}
                />
                {index === 0 && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
                      Breaking
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-primary text-xs font-bold uppercase tracking-wider">
                    {story.category || "Politics"}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {story.publishedAt ? new Date(story.publishedAt).toLocaleDateString() : "Just now"}
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight text-[#111318] dark:text-white group-hover:text-primary transition-colors">
                  {story.title}
                </h2>
                <p className="font-display text-[#616f89] dark:text-gray-400 text-base leading-relaxed line-clamp-3">
                  {story.summary}
                </p>
              </div>
            </article>
          </Link>
        ))}
        
        {isLoading && !stories && (
          <div className="flex flex-col items-center justify-center py-8 gap-3 opacity-60">
            <div className="w-8 h-8 border-2 border-primary rounded-full border-t-transparent animate-spin"></div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Loading stories</p>
          </div>
        )}
        
        {!isLoading && (!stories || stories.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-60">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No stories available yet</p>
          </div>
        )}
      </main>
    </div>
  );
}
