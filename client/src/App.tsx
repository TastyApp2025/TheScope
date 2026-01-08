import { HelmetProvider } from 'react-helmet-async';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Switch, Route } from "wouter";
import Home from "@/pages/home";
import StoryPage from "@/pages/story";
import AdminPage from "@/pages/admin";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";

function SplashScreen() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#FAF9F6] dark:bg-[#101622] animate-in fade-in duration-700">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none opacity-50 dark:opacity-20"></div>
      <div className="relative z-10 flex flex-col items-center justify-center p-6 animate-in slide-in-from-bottom-5 duration-1000">
        <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-primary dark:text-white text-center leading-[0.9]">
          The<br/>Scope
        </h1>
      </div>
    </main>
  );
}

function ProtectedAdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin">Loading...</div></div>;
  }

  if (!user) {
    window.location.href = "/access-portal";
    return null;
  }

  return <Component />;
}

function Router() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/stories/:id" component={StoryPage} />
      <Route path="/access-portal" component={LoginPage} />
      <Route path="/create-access" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/dashboard-internal" component={() => <ProtectedAdminRoute component={AdminPage} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
