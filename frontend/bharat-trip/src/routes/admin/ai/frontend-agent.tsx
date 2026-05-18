import { useState, useEffect } from "react";
import { AdminShell } from "@/components/AdminShell";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { 
  Trash2, 
  Copy, 
  Save, 
  Eye, 
  Zap, 
  Send,
  Settings2,
  Cpu,
  Code2,
  Terminal,
  Sparkles,
  Monitor,
  Check,
  Download,
  History,
  Bookmark,
  ChevronRight,
  Layout as LayoutIcon,
  Smartphone,
  Tablet,
  RotateCcw,
  Palette,
  Layers
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
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function FrontendAgentPage() {
  return (
    <AdminProtectedRoute>
      <AdminShell>
        <FrontendAgent />
      </AdminShell>
    </AdminProtectedRoute>
  );
}

const UI_TYPES = [
  "Hero Section",
  "Navbar",
  "Testimonials",
  "Pricing",
  "Dashboard",
  "Forms",
  "Cards"
];

const FRAMEWORKS = ["React", "Next.js"];
const STYLING = ["Tailwind", "CSS Modules"];

function FrontendAgent() {
  const [prompt, setPrompt] = useState("");
  const [uiType, setUiType] = useState("Hero Section");
  const [framework, setFramework] = useState("React");
  const [styling, setStyling] = useState("Tailwind");
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState("");
  const [activeTab, setActiveTab] = useState("code");
  const [previewSize, setPreviewSize] = useState("desktop");
  
  // History and Saved
  const [history, setHistory] = useState<any[]>([]);
  const [saved, setSaved] = useState<any[]>([]);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setActiveTab("code");
    
    // Simulate generation delay
    setTimeout(() => {
      let generatedCode = "";
      
      if (uiType === "Hero Section") {
        generatedCode = `import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function PremiumHero() {
  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-medium mb-8 animate-fade-in">
          <Sparkles className="size-4" />
          <span>New: AI Travel Planner 2.0 is live</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-display font-bold text-white tracking-tighter mb-8">
          Travel Beyond <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Boundaries.</span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Experience the world like never before with GoTripo's premium travel concierge. 
          Customized itineraries, exclusive stays, and 24/7 AI support.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-all flex items-center gap-2">
            Start Exploring <ArrowRight className="size-5" />
          </button>
          <button className="h-14 px-8 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all">
            View Destinations
          </button>
        </div>
      </div>
    </div>
  );
}`;
      } else if (uiType === "Testimonials") {
        generatedCode = `import React from 'react';
import { Star, Quote } from 'lucide-react';

export default function TestimonialGrid() {
  const reviews = [
    { name: "Julian Voss", role: "Photographer", text: "The most seamless booking experience I've ever had." },
    { name: "Elena Gilbert", role: "Travel Blogger", text: "GoTripo's AI planner found hidden gems I would have missed." },
    { name: "Marcus Chen", role: "Digital Nomad", text: "Reliable, fast, and the interface is stunning." }
  ];

  return (
    <section className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all">
              <Quote className="size-8 text-primary mb-6" />
              <p className="text-lg text-slate-300 mb-8 italic">"{r.text}"</p>
              <div className="flex items-center gap-1 mb-4 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="size-4 fill-current" />)}
              </div>
              <div>
                <h4 className="font-bold text-white">{r.name}</h4>
                <p className="text-sm text-slate-500">{r.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`;
      } else {
        generatedCode = `// AI generated component for ${uiType} using ${framework} + ${styling}\n\nexport default function GeneratedComponent() {\n  return (\n    <div className="p-10 bg-slate-900 rounded-3xl text-center">\n      <h2 className="text-2xl font-bold text-white mb-4">${uiType} Template</h2>\n      <p className="text-slate-400">This is a placeholder for the generated ${uiType.toLowerCase()} component.</p>\n    </div>\n  );\n}`;
      }

      setResponse(generatedCode);
      setHistory(prev => [{ id: Date.now(), type: uiType, prompt: prompt.substring(0, 30) + "...", date: new Date().toLocaleTimeString() }, ...prev]);
      setIsGenerating(false);
      toast.success("Component generated successfully!");
    }, 1500);
  };

  const handleSave = () => {
    if (!response) return;
    setSaved(prev => [{ id: Date.now(), type: uiType, code: response, date: new Date().toLocaleDateString() }, ...prev]);
    toast.success("Saved to templates");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    toast.success("Code copied to clipboard");
  };

  const handleClear = () => {
    setPrompt("");
    setResponse("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary grid place-items-center">
              <Code2 className="size-6" />
            </div>
            Frontend Agent
          </h1>
          <p className="text-muted-foreground mt-1">GoTripo Internal AI Design System & Code Generator.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl gap-2 h-11 border-border bg-card">
             <Settings2 className="size-4" /> Config
           </Button>
           <Button className="rounded-xl gap-2 h-11 shadow-lg shadow-primary/20 font-bold px-6">
             <Zap className="size-4 fill-current" /> Upgrade to Pro
           </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[400px_1fr_300px] gap-6 flex-1 min-h-0">
        {/* Left Panel: Controls */}
        <div className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-2">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                <Terminal className="size-4 text-primary" />
                Prompt
              </label>
              <Textarea 
                placeholder="E.g. 'A high-conversion hero section for a luxury travel app with glassmorphism effects'..."
                className="min-h-[160px] rounded-2xl bg-secondary/20 border-border focus:ring-primary transition-all resize-none text-base placeholder:text-muted-foreground/50"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <LayoutIcon className="size-3" /> UI Component Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {UI_TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => setUiType(t)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${
                          uiType === t 
                          ? "bg-primary/10 border-primary text-primary" 
                          : "bg-secondary/30 border-transparent text-muted-foreground hover:bg-secondary/50"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Palette className="size-3" /> Framework
                    </label>
                    <Select value={framework} onValueChange={setFramework}>
                      <SelectTrigger className="rounded-xl bg-secondary/30 border-transparent h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FRAMEWORKS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Layers className="size-3" /> Styling
                    </label>
                    <Select value={styling} onValueChange={setStyling}>
                      <SelectTrigger className="rounded-xl bg-secondary/30 border-transparent h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STYLING.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
               </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                onClick={handleGenerate} 
                className="flex-1 rounded-2xl h-12 text-base font-bold shadow-lg shadow-primary/20 gap-2"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="size-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="size-5 fill-current" />
                    Generate
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClear}
                className="rounded-2xl h-12 px-5 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all bg-card border-border"
              >
                <Trash2 className="size-5" />
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-border bg-secondary/5 p-6">
            <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Prompt Suggestions
            </h4>
            <div className="space-y-2">
              {[
                "Modern Pricing Table with yearly toggle",
                "Dark theme Dashboard Sidebar with user profile",
                "Glassmorphic Login Form with social icons",
                "Responsive Navbar with mega-menu dropdown"
              ].map((s, i) => (
                <button 
                  key={i}
                  onClick={() => setPrompt(s)}
                  className="w-full text-left p-3 rounded-xl bg-secondary/30 hover:bg-primary/10 hover:text-primary transition-all text-xs font-medium border border-transparent hover:border-primary/20 flex items-center justify-between group"
                >
                  {s}
                  <ChevronRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel: Preview & Code */}
        <div className="flex flex-col gap-4 h-full min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-secondary/30 p-1 rounded-xl h-12">
                <TabsTrigger value="code" className="rounded-lg px-6 font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">Code</TabsTrigger>
                <TabsTrigger value="preview" className="rounded-lg px-6 font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">Preview</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className={`rounded-xl ${previewSize === 'mobile' ? 'bg-primary/10 text-primary' : ''}`} onClick={() => setPreviewSize('mobile')}>
                  <Smartphone className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className={`rounded-xl ${previewSize === 'tablet' ? 'bg-primary/10 text-primary' : ''}`} onClick={() => setPreviewSize('tablet')}>
                  <Tablet className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className={`rounded-xl ${previewSize === 'desktop' ? 'bg-primary/10 text-primary' : ''}`} onClick={() => setPreviewSize('desktop')}>
                  <Monitor className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 rounded-3xl border border-border bg-slate-950 flex flex-col overflow-hidden shadow-2xl relative">
              <TabsContent value="code" className="flex-1 m-0 flex flex-col h-full overflow-hidden">
                <div className="h-10 border-b border-white/5 bg-white/5 flex items-center justify-between px-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="size-2.5 rounded-full bg-red-500/50" />
                      <div className="size-2.5 rounded-full bg-amber-500/50" />
                      <div className="size-2.5 rounded-full bg-emerald-500/50" />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-4">component.tsx</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-white/10 text-slate-400 bg-white/5 uppercase font-bold tracking-wider">
                      {styling}
                    </Badge>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-6 font-mono text-sm">
                    {response ? (
                      <pre className="text-slate-300">
                        <code>{response}</code>
                      </pre>
                    ) : (
                      <div className="h-[400px] flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50">
                        <Terminal className="size-12" />
                        <p>Generate code to see it here</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="preview" className="flex-1 m-0 flex flex-col h-full bg-slate-900 overflow-hidden">
                 <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
                    {response ? (
                      <div className={`bg-slate-950 rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 overflow-hidden ${
                        previewSize === 'mobile' ? 'w-[360px] h-[640px]' : 
                        previewSize === 'tablet' ? 'w-[768px] h-[500px]' : 
                        'w-full max-w-5xl h-full'
                      }`}>
                         <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-center p-10">
                            <Monitor className="size-16 mb-4 opacity-20" />
                            <h3 className="text-xl font-bold mb-2">Live Preview Engine</h3>
                            <p className="max-w-xs text-sm">Previewing: <span className="text-primary font-mono">{uiType}</span></p>
                            <div className="mt-8 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                               Interactive Sandboxing Active
                            </div>
                         </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50">
                        <Eye className="size-12" />
                        <p>Generate a component to preview it</p>
                      </div>
                    )}
                 </div>
              </TabsContent>

              {isGenerating && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50">
                   <div className="flex flex-col items-center gap-6">
                      <div className="relative">
                        <div className="size-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 text-primary animate-pulse" />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg font-display font-bold text-white tracking-tight">Crafting Excellence</span>
                        <span className="text-sm text-slate-500 animate-pulse">Architecting your component...</span>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </Tabs>

          <div className="grid grid-cols-4 gap-3">
             <Button variant="outline" className="rounded-xl gap-2 h-12 bg-card border-border hover:bg-secondary font-bold" disabled={!response} onClick={handleCopy}>
                <Copy className="size-4" /> Copy
             </Button>
             <Button variant="outline" className="rounded-xl gap-2 h-12 bg-card border-border hover:bg-secondary font-bold" disabled={!response} onClick={handleSave}>
                <Save className="size-4" /> Save
             </Button>
             <Button variant="outline" className="rounded-xl gap-2 h-12 bg-card border-border hover:bg-secondary font-bold" disabled={!response} onClick={() => toast.info("Exporting as ZIP...")}>
                <Download className="size-4" /> Export
             </Button>
             <Button className="rounded-xl gap-2 h-12 font-bold shadow-lg shadow-primary/20" disabled={!response} onClick={() => toast.success("Pushed to staging!")}>
                <Send className="size-4" /> Deploy
             </Button>
          </div>
        </div>

        {/* Right Panel: History/Saved */}
        <div className="flex flex-col gap-6 h-full min-h-0">
          <div className="rounded-3xl border border-border bg-card flex flex-col flex-1 overflow-hidden shadow-sm">
             <div className="p-5 border-b border-border flex items-center justify-between bg-secondary/10">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <History className="size-4 text-primary" />
                  Recent
                </h3>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer" onClick={() => setHistory([])}>Clear</Badge>
             </div>
             <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                   {history.length > 0 ? history.map(h => (
                      <div key={h.id} className="p-3 rounded-2xl bg-secondary/30 border border-transparent hover:border-border transition-all cursor-pointer group">
                         <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">{h.type}</span>
                            <span className="text-[9px] text-muted-foreground">{h.date}</span>
                         </div>
                         <p className="text-xs text-foreground/80 font-medium truncate">{h.prompt}</p>
                      </div>
                   )) : (
                      <div className="py-8 text-center text-muted-foreground/40 italic text-xs">No generations yet</div>
                   )}
                </div>
             </ScrollArea>
          </div>

          <div className="rounded-3xl border border-border bg-card flex flex-col flex-1 overflow-hidden shadow-sm">
             <div className="p-5 border-b border-border flex items-center justify-between bg-secondary/10">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Bookmark className="size-4 text-purple-500" />
                  Templates
                </h3>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{saved.length} Saved</span>
             </div>
             <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                   {saved.length > 0 ? saved.map(s => (
                      <div key={s.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group flex items-center justify-between">
                         <div className="min-w-0">
                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-tighter">{s.type}</span>
                            <p className="text-xs text-foreground/80 font-medium truncate">Component v1.0</p>
                         </div>
                         <Check className="size-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                   )) : (
                      <div className="py-8 text-center text-muted-foreground/40 italic text-xs">No saved snippets</div>
                   )}
                </div>
             </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
