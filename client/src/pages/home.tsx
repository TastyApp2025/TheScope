import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Story } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Menu, Search, X } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useState } from "react";

export default function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stories, isLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  const filteredStories = stories?.filter(story => 
    story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    story.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Helmet>
        <title>The Scope | Latest Stories</title>
        <meta name="description" content="Browse the latest editorial stories, news, and insights on The Scope." />
        <link rel="canonical" href="https://thescope.replit.app/" />
      </Helmet>
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between h-28 px-4 max-w-2xl mx-auto">
          {isSearchOpen ? (
            <div className="flex items-center w-full gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search stories..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-display outline-none"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex justify-center flex-1">
                <img 
                  src="/assets/logo.jpg" 
                  alt="The Scope" 
                  className="h-24 w-auto object-contain dark:invert"
                />
              </div>
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <Search className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </header>

      <main className="w-full max-w-2xl mx-auto px-4 pb-12 pt-4 flex flex-col gap-6">
        {filteredStories?.length === 0 && searchQuery && (
          <div className="text-center py-20">
            <p className="text-gray-500 font-display">No stories found matching "{searchQuery}"</p>
          </div>
        )}

        {filteredStories?.map((story, index) => (
          <Link key={story.id} href={`/stories/${story.id}`}>
            <article className="group cursor-pointer relative w-full aspect-[4/3] sm:aspect-[16/9] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
              <img
                src={story.coverImageUrl}
                alt={story.title}
                loading="eager"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=2000';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-5 sm:p-8 flex flex-col gap-2 sm:gap-3">
                <div className="flex items-center gap-2 mb-2">
                  {story.isBreaking && (
                    <span className="bg-[#cc0000] text-white text-[10px] font-black uppercase tracking-[0.1em] px-2 py-1 rounded-sm shadow-md">
                      Breaking
                    </span>
                  )}
                  <span className="bg-[#0055cc] text-white text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded-sm shadow-md">
                    {story.category || "Politics"}
                  </span>
                </div>
                
                <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight text-white tracking-tight drop-shadow-md">
                  {story.title}
                </h2>
                
                <p className="font-display text-white/80 text-sm sm:text-base leading-snug line-clamp-2 max-w-[90%] drop-shadow-sm">
                  {story.summary}
                </p>
                
                <div className="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <span>{story.publishedAt ? new Date(story.publishedAt).toLocaleDateString() : "Just now"}</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3 opacity-60">
            <div className="w-8 h-8 border-2 border-primary rounded-full border-t-transparent animate-spin"></div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Loading stories</p>
          </div>
        )}
      </main>
    </div>
  );
}
