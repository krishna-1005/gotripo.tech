import { useState, useEffect } from "react";
import { AdminShell } from "@/components/AdminShell";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import api from "@/lib/api";
import { 
  Megaphone,
  Sparkles,
  Zap,
  Copy,
  Save,
  RotateCcw,
  Instagram,
  Linkedin,
  Twitter,
  Layout,
  MessageSquare,
  TrendingUp,
  History,
  Bookmark,
  ChevronRight,
  Hash,
  Share2,
  Heart,
  MousePointer2,
  Terminal,
  Type,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export default function MarketingAgentPage() {
  return (
    <AdminProtectedRoute>
      <AdminShell>
        <MarketingAgent />
      </AdminShell>
    </AdminProtectedRoute>
  );
}

const CONTENT_TYPES = [
  { id: "Instagram Caption", icon: Instagram },
  { id: "Reel Hook", icon: Zap },
  { id: "LinkedIn Post", icon: Linkedin },
  { id: "Twitter Post", icon: Twitter },
  { id: "CTA Copy", icon: MousePointer2 },
  { id: "Ad Copy", icon: Megaphone },
  { id: "Landing Page Copy", icon: Layout }
];

const TONES = ["Professional", "Viral", "Minimal", "Luxury", "Gen-Z"];

function MarketingAgent() {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("Instagram Caption");
  const [tone, setTone] = useState("Viral");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [savedCampaigns, setSavedCampaigns] = useState<any[]>([]);

  useEffect(() => {
    fetchSavedCampaigns();
  }, []);

  const fetchSavedCampaigns = async () => {
    try {
      const res = await api.get("/ai/marketing/campaigns");
      if (res.data.success) {
        setSavedCampaigns(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns", err);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("What are we marketing today?");
      return;
    }

    setIsGenerating(true);
    
    try {
      const res = await api.post("/ai/marketing", {
        prompt,
        contentType: type,
        tone
      });

      if (res.data.success) {
        const newResult = res.data.data;
        setResults([newResult, ...results]);
        toast.success("Marketing copy ready!");
        fetchSavedCampaigns(); // Refresh sidebar
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      toast.error(err.response?.data?.message || "Failed to generate marketing content");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-rose-500/10 text-rose-500 grid place-items-center">
              <Megaphone className="size-6" />
            </div>
            Marketing Agent
          </h1>
          <p className="text-muted-foreground mt-1">High-velocity copywriting and campaign generation for GoTripo.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl gap-2 h-11 border-border bg-card">
             <TrendingUp className="size-4" /> Trending Hooks
           </Button>
           <Button className="rounded-xl gap-2 h-11 shadow-lg shadow-rose-500/20 font-bold px-6 bg-rose-600 hover:bg-rose-500">
             <Sparkles className="size-4" /> Viral mode
           </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[400px_1fr] gap-6 flex-1 min-h-0">
        {/* Left Panel */}
        <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold flex items-center gap-2">
                <Type className="size-4 text-rose-500" />
                Campaign Context
              </label>
              <Textarea 
                placeholder="What are we promoting? (e.g. 'Flash sale for Bali trips next month')..."
                className="min-h-[160px] rounded-2xl bg-secondary/20 border-border focus:ring-rose-500 transition-all resize-none text-base"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Content Format</label>
                <div className="grid grid-cols-1 gap-2">
                  {CONTENT_TYPES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-3 ${
                        type === t.id 
                        ? "bg-rose-500/10 border-rose-500 text-rose-500 shadow-sm" 
                        : "bg-secondary/30 border-transparent text-muted-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <t.icon className="size-4" />
                      {t.id}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Brand Tone</label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="rounded-xl bg-secondary/30 border-transparent h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleGenerate} 
              className="w-full rounded-2xl h-12 text-base font-bold shadow-lg shadow-rose-500/20 gap-2 bg-rose-600 hover:bg-rose-500"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Analyzing Trends...
                </>
              ) : (
                <>
                  <Zap className="size-5 fill-current" />
                  Generate Copy
                </>
              )}
            </Button>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
             <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                <Bookmark className="size-4 text-rose-500" />
                Saved Campaigns
             </h4>
             <div className="space-y-2">
                {savedCampaigns.length > 0 ? savedCampaigns.map((c) => (
                   <button 
                    key={c._id} 
                    onClick={() => setResults([c, ...results])}
                    className="w-full text-left p-3 rounded-xl bg-secondary/30 hover:bg-rose-500/10 hover:text-rose-500 transition-all text-xs font-medium border border-transparent hover:border-rose-500/20 flex items-center justify-between group"
                   >
                      <span className="truncate pr-2">{c.prompt}</span>
                      <ChevronRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </button>
                )) : (
                  <p className="text-xs text-muted-foreground px-2">No campaigns yet.</p>
                )}
             </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col h-full min-h-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-display font-bold tracking-tight">Generated Variants</h2>
              <Badge variant="secondary" className="bg-rose-500/10 text-rose-500">
                {results.length} results
              </Badge>
            </div>
            <div className="flex items-center gap-2">
               <Button variant="ghost" size="sm" className="gap-2 text-xs font-bold text-muted-foreground hover:text-rose-500" onClick={() => setResults([])}>
                 <History className="size-3.5" /> Clear History
               </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 pr-4">
             <div className="space-y-6 pb-10">
                {results.length > 0 ? results.map(r => {
                  const contentType = CONTENT_TYPES.find(c => c.id === r.contentType);
                  const Icon = contentType?.icon || Megaphone;
                  
                  return (
                  <div key={r._id || r.id} className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm group animate-fade-in">
                    <div className="p-4 border-b border-border bg-secondary/10 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-rose-500/10 text-rose-500 grid place-items-center">
                             <Icon className="size-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold block leading-none">{r.contentType}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Tone: {r.tone}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                            High Engagement
                          </Badge>
                          <Button variant="ghost" size="icon" className="size-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => toast.success("Campaign already saved!")}>
                            <Save className="size-3.5" />
                          </Button>
                       </div>
                    </div>
                    <div className="p-6 space-y-6">
                       <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1 block">The Hook</label>
                          <div className="text-base font-display font-bold text-foreground leading-tight italic">
                            "{r.generatedContent?.hook || "N/A"}"
                          </div>
                       </div>

                       <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Full Caption</label>
                          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-medium">
                            {r.generatedContent?.caption || "No caption generated"}
                          </div>
                       </div>

                       <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">CTA</label>
                          <div className="text-sm font-bold text-primary">
                            {r.generatedContent?.cta || "No CTA"}
                          </div>
                       </div>
                       
                       <div className="mt-6 pt-6 border-t border-border/50 flex flex-wrap gap-2">
                          <Hash className="size-3.5 text-rose-500" />
                          {(r.generatedContent?.hashtags || []).map((h: string) => (
                            <span key={h} className="text-[10px] font-bold text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer">#{h.replace("#", "")}</span>
                          ))}
                       </div>
                    </div>
                    <div className="p-4 bg-secondary/5 flex items-center justify-between">
                       <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center gap-1">
                             <Heart className="size-3.5" />
                             <span className="text-[10px] font-bold">Predicted Viral</span>
                          </div>
                          <div className="flex items-center gap-1">
                             <Share2 className="size-3.5" />
                             <span className="text-[10px] font-bold">Trending</span>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="h-8 rounded-lg gap-2 text-[10px] font-bold" onClick={() => handleGenerate()}>
                            <RotateCcw className="size-3" /> Regenerate
                          </Button>
                          <Button size="sm" className="h-8 rounded-lg gap-2 text-[10px] font-bold bg-rose-600 hover:bg-rose-500" onClick={() => {
                            const fullText = `${r.generatedContent?.hook}\n\n${r.generatedContent?.caption}\n\n${r.generatedContent?.cta}\n\n${(r.generatedContent?.hashtags || []).map((h: string) => "#" + h.replace("#", "")).join(" ")}`;
                            navigator.clipboard.writeText(fullText);
                            toast.success("Copied to clipboard!");
                          }}>
                            <Copy className="size-3" /> Copy Full Text
                          </Button>
                       </div>
                    </div>
                  </div>
                )}) : (
                  <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground/40 text-center gap-4 border-2 border-dashed border-border rounded-3xl">
                     <Megaphone className="size-16 opacity-10" />
                     <div>
                        <p className="text-sm font-bold">Your viral campaign starts here</p>
                        <p className="text-xs">Select a content format and hit generate</p>
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
