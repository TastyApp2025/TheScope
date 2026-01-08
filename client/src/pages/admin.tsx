import { useQuery, useMutation } from "@tanstack/react-query";
import { Story, insertStorySchema } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Plus, 
  Pencil, 
  Trash2, 
  Headphones, 
  LayoutDashboard, 
  FileText, 
  LogOut,
  User,
  Clock,
  ChevronRight,
  Search
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function AdminPage() {
  const { toast } = useToast();
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [generatingAudioId, setGeneratingAudioId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: stories, isLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create story");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      setIsDialogOpen(false);
      toast({ title: "Success", description: "Story created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/stories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update story");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      setIsDialogOpen(false);
      setEditingStory(null);
      toast({ title: "Success", description: "Story updated successfully" });
    },
  });

  const generateAudioMutation = useMutation({
    mutationFn: async (id: number) => {
      setGeneratingAudioId(id);
      const res = await fetch(`/api/stories/${id}/generate-audio`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to generate audio");
      return res.blob();
    },
    onSuccess: () => {
      toast({ 
        title: "Audio Generated", 
        description: "AI audio has been generated successfully." 
      });
    },
    onError: (error) => {
      toast({ 
        title: "Generation Failed", 
        description: error instanceof Error ? error.message : "Could not generate audio",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setGeneratingAudioId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/stories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete story");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      toast({ title: "Success", description: "Story deleted" });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertStorySchema),
    defaultValues: editingStory || {
      title: "",
      summary: "",
      content: "",
      coverImageUrl: "",
      category: "Politics",
      authorName: "",
      authorProfileImage: "",
      audioUrl: "",
    },
  });

  const onSubmit = (data: any) => {
    if (editingStory) {
      updateMutation.mutate({ id: editingStory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredStories = stories?.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.authorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground font-medium">Loading Dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r bg-white dark:bg-slate-900 hidden lg:flex flex-col">
        <div className="p-6 border-b">
          <h2 className="font-serif text-2xl font-black text-primary">The Scope</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Editorial Suite</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start text-primary bg-primary/5">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-slate-100 dark:hover:bg-slate-800">
            <FileText className="mr-2 h-4 w-4" />
            Articles
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-slate-100 dark:hover:bg-slate-800">
            <User className="mr-2 h-4 w-4" />
            Authors
          </Button>
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5" onClick={() => window.location.href = "/"}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b bg-white dark:bg-slate-900 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search articles..." 
                className="pl-10 bg-slate-50 dark:bg-slate-800 border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingStory(null);
                form.reset({
                  title: "",
                  summary: "",
                  content: "",
                  coverImageUrl: "",
                  category: "Politics",
                  authorName: "",
                  authorProfileImage: "",
                  audioUrl: "",
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="shadow-lg shadow-primary/20">
                  <Plus className="mr-2 h-4 w-4" /> New Article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
                <div className="p-8">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-serif">{editingStory ? "Edit Article" : "Create New Article"}</DialogTitle>
                    <CardDescription>Fill in the details below to {editingStory ? 'update' : 'publish'} your editorial content.</CardDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                          <FormItem><FormLabel>Headline</FormLabel><FormControl><Input placeholder="Enter a catchy headline..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="summary" render={({ field }) => (
                          <FormItem><FormLabel>Snippet / Summary</FormLabel><FormControl><Textarea placeholder="Brief overview of the story..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="content" render={({ field }) => (
                          <FormItem><FormLabel>Story Content</FormLabel><FormControl><Textarea placeholder="Write the full story here..." {...field} className="min-h-[300px] font-serif leading-relaxed" /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-2 gap-6">
                        <FormField control={form.control} name="coverImageUrl" render={({ field }) => (
                          <FormItem><FormLabel>Cover Image URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="category" render={({ field }) => (
                          <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="e.g. Technology" /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 pb-6">
                        <FormField control={form.control} name="authorName" render={({ field }) => (
                          <FormItem><FormLabel>Author Name</FormLabel><FormControl><Input placeholder="Full name" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="authorProfileImage" render={({ field }) => (
                          <FormItem><FormLabel>Author Avatar URL</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      
                      <div className="sticky bottom-0 bg-white dark:bg-slate-900 pt-4 border-t flex gap-4">
                        <Button variant="outline" type="button" className="flex-1" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                          {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {editingStory ? "Save Changes" : "Publish Article"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Editorial Dashboard</h2>
            <p className="text-muted-foreground mt-1">Manage and moderate your publication's content library.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white dark:bg-slate-900 border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Articles</p>
                    <h3 className="text-3xl font-bold mt-1">{stories?.length || 0}</h3>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-900 border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">AI Audio Ready</p>
                    <h3 className="text-3xl font-bold mt-1">{stories?.filter(s => s.audioUrl).length || 0}</h3>
                  </div>
                  <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                    <Headphones className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-900 border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Categories</p>
                    <h3 className="text-3xl font-bold mt-1">{new Set(stories?.map(s => s.category)).size || 0}</h3>
                  </div>
                  <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                    <Badge variant="secondary" className="bg-transparent border-none p-0"><LayoutDashboard className="h-6 w-6" /></Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-slate-900 border-none shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-800/50">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Recent Content
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredStories?.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center">
                    <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">No articles found</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto mt-2">Start your editorial journey by publishing your first article.</p>
                    <Button variant="outline" className="mt-6" onClick={() => setIsDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Create First Article
                    </Button>
                  </div>
                ) : (
                  filteredStories?.map((story) => (
                    <div key={story.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="h-12 w-16 rounded-md bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
                          <img src={story.coverImageUrl} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors flex items-center gap-2">
                            {story.title}
                            {story.audioUrl && <Badge variant="secondary" className="h-5 text-[10px] uppercase font-bold px-1.5"><Headphones className="h-3 w-3 mr-1" /> Audio</Badge>}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><User className="h-3 w-3" /> {story.authorName}</span>
                            <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                            <span className="flex items-center gap-1 uppercase tracking-wider text-[10px] font-bold text-primary">{story.category}</span>
                            <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(story.publishedAt!).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => generateAudioMutation.mutate(story.id)}
                          disabled={generatingAudioId === story.id}
                        >
                          {generatingAudioId === story.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Headphones className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-slate-500"
                          onClick={() => {
                            setEditingStory(story);
                            form.reset(story);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-destructive hover:bg-destructive/5"
                          onClick={() => {
                            if (confirm("Permanently delete this article? This action cannot be undone.")) {
                              deleteMutation.mutate(story.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
