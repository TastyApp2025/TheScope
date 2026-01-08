import { useQuery } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Story } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Bookmark, Share2, PlayCircle, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";

export default function StoryPage() {
  const [, params] = useRoute("/stories/:id");
  const id = params?.id;
  const [, setLocation] = useLocation();
  const touchStart = useRef<number | null>(null);

  const { data: story, isLoading } = useQuery<Story>({
    queryKey: [`/api/stories/${id}`],
    enabled: !!id,
  });

  const { data: allStories } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  const nextStory = allStories?.find(s => s.id > Number(id)) || allStories?.[0];

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStart.current === null) return;
      
      const touchEnd = e.changedTouches[0].clientY;
      const diff = touchStart.current - touchEnd;
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;

      // Swipe up (diff > 100) at the bottom of the page to go to next story
      if (diff > 100 && isAtBottom && nextStory) {
        setLocation(`/stories/${nextStory.id}`);
        window.scrollTo(0, 0);
      }
      
      touchStart.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [id, nextStory, setLocation]);

  const handleListen = () => {
    if (!story || !story.content) return;
    
    // Check if speech is already playing
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(story.content);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';
    
    window.speechSynthesis.speak(utterance);
  };

  const handleShare = async () => {
    if (!story) return;
    const shareData = {
      title: story.title,
      text: story.summary,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 min-h-screen">
        <Skeleton className="w-full h-[55vh]" />
        <div className="p-5 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (!story) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": story.title,
    "image": [story.coverImageUrl],
    "datePublished": story.publishedAt,
    "author": [{
      "@type": "Person",
      "name": story.authorName,
      "image": story.authorProfileImage
    }]
  };

  return (
    <main className="relative w-full max-w-md mx-auto bg-white dark:bg-slate-900 min-h-screen shadow-2xl overflow-hidden">
      <Helmet>
        <title>{`${story.title} | The Scope`}</title>
        <meta name="description" content={story.summary} />
        <meta property="og:title" content={story.title} />
        <meta property="og:description" content={story.summary} />
        <meta property="og:image" content={story.coverImageUrl} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>
      <nav className="absolute top-0 left-0 w-full z-50 flex items-center justify-between p-4 pt-6 bg-gradient-to-b from-black/60 to-transparent">
        <Link href="/">
          <button className="flex items-center justify-center size-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </Link>
        <button className="flex items-center justify-center size-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors">
          <Bookmark className="w-6 h-6" />
        </button>
      </nav>

      <header className="relative w-full h-[55vh] min-h-[420px]">
        <img 
          src={story.coverImageUrl} 
          alt={story.title}
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=2000';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-5 pb-8 flex flex-col gap-3">
          <span className="inline-block px-2 py-1 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded w-fit">
            {story.category || "Architecture"}
          </span>
          <h1 className="font-serif text-[32px] font-bold leading-[1.15] text-white tracking-tight drop-shadow-sm">
            {story.title}
          </h1>
          <p className="text-white/90 text-lg font-medium leading-snug font-display mt-1">
            {story.summary}
          </p>
        </div>
      </header>

      <div className="relative z-10 bg-white dark:bg-slate-900 -mt-4 rounded-t-2xl px-5 pt-6 pb-20">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-gray-200 overflow-hidden">
              {story.authorProfileImage && (
                <img src={story.authorProfileImage} alt={story.authorName} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 dark:text-white">{story.authorName}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {story.publishedAt ? new Date(story.publishedAt).toLocaleDateString() : 'Draft'} • 6 min read
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={handleListen}
            className="flex-1 h-12 bg-primary text-white rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 transition shadow-sm group"
          >
            <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold">Listen to Article</span>
          </button>
          <button 
            onClick={handleShare}
            className="h-12 w-12 rounded-full border border-gray-200 dark:border-gray-800 bg-transparent text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <article className="prose prose-lg dark:prose-invert prose-headings:font-display prose-p:font-display prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-p:leading-[1.7] max-w-none">
          <div className="first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-4px] first-letter:text-primary">
            {story.content.split('\n').map((paragraph, i) => (
              paragraph.trim() && <p key={i} className="mb-6">{paragraph}</p>
            ))}
          </div>
        </article>

        <div className="h-px w-full bg-gray-200 dark:bg-gray-800 my-10"></div>
        
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Read Next</h3>
        {nextStory && (
          <Link href={`/stories/${nextStory.id}`}>
            <div className="flex gap-4 items-start cursor-pointer group">
              <div 
                className="w-24 h-24 rounded-lg bg-gray-100 bg-cover bg-center shrink-0 transition-transform group-hover:scale-105" 
                style={{ backgroundImage: `url(${nextStory.coverImageUrl})` }}
              ></div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white leading-snug mb-1 group-hover:text-primary transition-colors">
                  {nextStory.title}
                </h4>
                <span className="text-xs text-gray-500">{nextStory.category}</span>
              </div>
            </div>
          </Link>
        )}
        
        <div className="mt-12 flex flex-col items-center gap-2 opacity-30 animate-bounce">
          <ChevronDown className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Swipe for next</span>
        </div>
      </div>
    </main>
  );
}
