import { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { 
  Library,
  Search,
  Plus,
  Filter,
  Copy,
  Edit3,
  Trash2,
  Star,
  Bookmark,
  ChevronRight,
  Code2,
  Server,
  Megaphone,
  TestTube,
  Palette,
  Lightbulb,
  History,
  Download,
  Upload,
  MoreVertical,
  ExternalLink,
  Tags
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function PromptLibraryPage() {
  return (
    <AdminProtectedRoute>
      <AdminShell>
        <PromptLibrary />
      </AdminShell>
    </AdminProtectedRoute>
  );
}

const CATEGORIES = [
  { id: "All", icon: Library },
  { id: "Frontend", icon: Code2, color: "text-blue-500" },
  { id: "Backend", icon: Server, color: "text-indigo-500" },
  { id: "Marketing", icon: Megaphone, color: "text-rose-500" },
  { id: "Testing", icon: TestTube, color: "text-emerald-500" },
  { id: "UI/UX", icon: Palette, color: "text-purple-500" },
  { id: "Startup Strategy", icon: Lightbulb, color: "text-amber-500" }
];

const INITIAL_PROMPTS = [
  {
    id: 1,
    title: "Premium Hero Generator",
    category: "Frontend",
    tags: ["React", "Tailwind", "Animation"],
    content: "Generate a high-conversion hero section for a luxury travel app using React and Tailwind. Include abstract background animations and a prominent CTA.",
    isFavorite: true,
    uses: 124
  },
  {
    id: 2,
    title: "JWT Auth Controller",
    category: "Backend",
    tags: ["Node.js", "Express", "Auth"],
    content: "Create a production-ready Express router for JWT authentication including login, register, and password reset logic with bcrypt hashing.",
    isFavorite: false,
    uses: 89
  },
  {
    id: 3,
    title: "Viral Instagram Hook",
    category: "Marketing",
    tags: ["Social", "Viral", "Travel"],
    content: "Generate 5 viral-style hooks for a travel reel about hidden gems in Bali. Tone: Gen-Z, high curiosity.",
    isFavorite: true,
    uses: 256
  },
  {
    id: 4,
    title: "Edge Case Discovery",
    category: "Testing",
    tags: ["QA", "Edge Cases"],
    content: "Identify 10 critical edge cases for a multi-currency travel booking system spanning across different time zones.",
    isFavorite: false,
    uses: 45
  },
  {
    id: 5,
    title: "Glassmorphism UI Rules",
    category: "UI/UX",
    tags: ["Design", "Glassmorphism"],
    content: "Define CSS variables and Tailwind configuration rules for a consistent glassmorphism effect across a dark-themed admin dashboard.",
    isFavorite: true,
    uses: 67
  }
];

function PromptLibrary() {
  const [prompts, setPrompts] = useState(INITIAL_PROMPTS);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPrompts = prompts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: number) => {
    setPrompts(prompts.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
    toast.success("Library updated");
  };

  const copyPrompt = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Prompt copied to clipboard");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-amber-500/10 text-amber-500 grid place-items-center">
              <Library className="size-6" />
            </div>
            Prompt Library
          </h1>
          <p className="text-muted-foreground mt-1">Central repository for GoTripo's high-performance AI prompts.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl gap-2 h-11 border-border bg-card">
             <Upload className="size-4" /> Import
           </Button>
           <Button variant="outline" className="rounded-xl gap-2 h-11 border-border bg-card">
             <Download className="size-4" /> Export
           </Button>
           <Button className="rounded-xl gap-2 h-11 shadow-lg shadow-primary/20 font-bold px-6">
             <Plus className="size-4" /> New Prompt
           </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8 flex-1 min-h-0">
        {/* Sidebar Filters */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-3 mb-2 block">Categories</label>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat.id 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <cat.icon className={`size-4 ${activeCategory === cat.id ? "text-primary" : "text-muted-foreground"}`} />
                {cat.id}
              </button>
            ))}
          </div>

          <Separator className="bg-border/50" />

          <div className="rounded-2xl bg-secondary/20 p-4 border border-border/50">
             <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
               <History className="size-3" /> Recently Used
             </h4>
             <div className="space-y-2">
                {prompts.slice(0, 3).map(p => (
                   <div key={p.id} className="text-xs font-medium text-foreground/70 hover:text-primary transition-colors cursor-pointer flex items-center justify-between group">
                      <span className="truncate pr-2">{p.title}</span>
                      <ChevronRight className="size-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                ))}
             </div>
          </div>

          <div className="rounded-2xl bg-primary/5 p-4 border border-primary/10">
             <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Pro Tip</h4>
             <p className="text-[10px] text-muted-foreground leading-relaxed">
               Use placeholders like <code className="bg-primary/10 px-1 rounded">{"{{topic}}"}</code> in your prompts to make them dynamic and reusable.
             </p>
          </div>
        </div>

        {/* Main Library Grid */}
        <div className="flex flex-col gap-6 min-h-0">
          <div className="flex items-center gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input 
                  placeholder="Search prompts by title, content or tags..." 
                  className="pl-10 h-11 rounded-xl bg-card border-border focus:ring-primary"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl shrink-0">
                <Filter className="size-4" />
             </Button>
          </div>

          <ScrollArea className="flex-1 pr-4">
             <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                {filteredPrompts.length > 0 ? filteredPrompts.map(p => (
                   <div key={p.id} className="group rounded-3xl border border-border bg-card flex flex-col overflow-hidden shadow-sm hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
                      <div className="p-5 flex-1 space-y-4">
                         <div className="flex items-start justify-between">
                            <Badge variant="secondary" className="rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-secondary/50">
                               {p.category}
                            </Badge>
                            <button onClick={() => toggleFavorite(p.id)}>
                               <Star className={`size-4 transition-all ${p.isFavorite ? "fill-amber-500 text-amber-500 scale-110" : "text-muted-foreground hover:text-amber-500"}`} />
                            </button>
                         </div>
                         
                         <div>
                            <h3 className="font-display font-bold text-lg leading-tight group-hover:text-primary transition-colors">{p.title}</h3>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                               {p.tags.map(tag => (
                                  <span key={tag} className="text-[9px] font-bold text-muted-foreground bg-secondary/30 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                     <Tags className="size-2.5" /> {tag}
                                  </span>
                               ))}
                            </div>
                         </div>

                         <div className="relative">
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 italic">
                               "{p.content}"
                            </p>
                         </div>
                      </div>

                      <div className="p-4 bg-secondary/10 border-t border-border/50 flex items-center justify-between">
                         <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                            <Bookmark className="size-3 text-primary" />
                            {p.uses} uses
                         </div>
                         <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => copyPrompt(p.content)}>
                               <Copy className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-500 transition-colors">
                               <Edit3 className="size-3.5" />
                            </Button>
                            <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                                     <MoreVertical className="size-3.5" />
                                  </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end" className="rounded-xl border-border bg-card">
                                  <DropdownMenuItem className="text-xs font-bold gap-2 focus:bg-primary/10 focus:text-primary cursor-pointer">
                                     <ExternalLink className="size-3.5" /> Open in Agent
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs font-bold gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer" onClick={() => toast.error("Delete requested")}>
                                     <Trash2 className="size-3.5" /> Delete Prompt
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                         </div>
                      </div>
                   </div>
                )) : (
                   <div className="col-span-full h-[300px] flex flex-col items-center justify-center text-center gap-4 opacity-40">
                      <Library className="size-16" />
                      <div>
                         <p className="text-lg font-bold">No prompts found</p>
                         <p className="text-sm">Try adjusting your search or filters</p>
                      </div>
                   </div>
                )}
             </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-px w-full ${className}`} />;
}
