import { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { 
  TestTube,
  ShieldAlert,
  Bug,
  CheckSquare,
  Zap,
  RotateCcw,
  Copy,
  Download,
  Smartphone,
  Monitor,
  Tablet,
  AlertTriangle,
  ChevronRight,
  ClipboardCheck,
  Search,
  Lock,
  Eye,
  Terminal,
  Layers,
  FileSearch
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

export default function TestingAgentPage() {
  return (
    <AdminProtectedRoute>
      <AdminShell>
        <TestingAgent />
      </AdminShell>
    </AdminProtectedRoute>
  );
}

const TESTING_TYPES = [
  "UI Testing",
  "API Testing",
  "Edge Cases",
  "Mobile Responsiveness",
  "Security Testing",
  "Form Validation"
];

const SEVERITIES = ["Low", "Medium", "High", "Critical"];

function TestingAgent() {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("UI Testing");
  const [severity, setSeverity] = useState("High");
  const [isGenerating, setIsGenerating] = useState(false);
  const [scenarios, setScenarios] = useState<any[]>([]);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Please describe the feature to test");
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      const mockScenarios = generateMockScenarios(type, prompt);
      setScenarios(mockScenarios);
      setIsGenerating(false);
      toast.success("Testing scenarios generated!");
    }, 1500);
  };

  const generateMockScenarios = (type: string, prompt: string) => {
    if (type === "Edge Cases") {
      return [
        { id: 1, title: "Booking across DST change", description: "Verify price calculation when a trip spans across Daylight Savings Time change dates.", priority: "Medium", status: "New" },
        { id: 2, title: "Zero results in high-intent search", description: "Ensure the 'No results' page provides relevant AI alternatives instead of an empty state.", priority: "High", status: "New" },
        { id: 3, title: "Partial API failure during payment", description: "Test system behavior if the booking API fails AFTER the payment gateway confirms success.", priority: "Critical", status: "New" }
      ];
    }
    if (type === "Security Testing") {
      return [
        { id: 1, title: "IDOR on Itinerary access", description: "Check if user A can access user B's itinerary by guessing the trip UUID in the URL.", priority: "Critical", status: "New" },
        { id: 2, title: "XSS in Trip Notes", description: "Validate that malicious scripts cannot be injected into collaborative trip notes.", priority: "High", status: "New" }
      ];
    }
    return [
      { id: 1, title: `Standard ${type} Scenario`, description: `Validate the core functionality of ${prompt} under normal conditions.`, priority: severity, status: "New" },
      { id: 2, title: "Mobile Touch Responsiveness", description: "Ensure all CTA buttons are at least 44x44px for touch accessibility.", priority: "Medium", status: "New" }
    ];
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-emerald-500/10 text-emerald-500 grid place-items-center">
              <TestTube className="size-6" />
            </div>
            Testing Agent
          </h1>
          <p className="text-muted-foreground mt-1">AI-driven QA engineering, bug detection, and edge case identification.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl gap-2 h-11 border-border bg-card">
             <Search className="size-4" /> Scan for Vulnerabilities
           </Button>
           <Button className="rounded-xl gap-2 h-11 shadow-lg shadow-emerald-500/20 font-bold px-6 bg-emerald-600 hover:bg-emerald-500">
             <ClipboardCheck className="size-4" /> Run Full Audit
           </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[400px_1fr] gap-6 flex-1 min-h-0">
        {/* Left Panel */}
        <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold flex items-center gap-2">
                <Terminal className="size-4 text-emerald-500" />
                Feature Description
              </label>
              <Textarea 
                placeholder="Describe the feature or bug report (e.g. 'The multi-city flight search results page')..."
                className="min-h-[160px] rounded-2xl bg-secondary/20 border-border focus:ring-emerald-500 transition-all resize-none text-base"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Testing Scope</label>
                <div className="grid grid-cols-2 gap-2">
                  {TESTING_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${
                        type === t 
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-sm" 
                        : "bg-secondary/30 border-transparent text-muted-foreground hover:bg-secondary/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Severity</label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger className="rounded-xl bg-secondary/30 border-transparent h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleGenerate} 
              className="w-full rounded-2xl h-12 text-base font-bold shadow-lg shadow-emerald-500/20 gap-2 bg-emerald-600 hover:bg-emerald-500"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RotateCcw className="size-5 animate-spin" />
                  Analyzing Edge Cases...
                </>
              ) : (
                <>
                  <Bug className="size-5" />
                  Generate Test Cases
                </>
              )}
            </Button>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
             <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                <FileSearch className="size-4 text-emerald-500" />
                QA Checklists
             </h4>
             <div className="space-y-2">
                {["Pre-release Audit", "Commerce Security", "SEO Accessibility", "API Load Stress"].map((c, i) => (
                   <button key={i} className="w-full text-left p-3 rounded-xl bg-secondary/30 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all text-xs font-medium border border-transparent hover:border-emerald-500/20 flex items-center justify-between group">
                      {c}
                      <ChevronRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </button>
                ))}
             </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col h-full min-h-0">
          <div className="grid grid-cols-3 gap-6 mb-6">
             <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-500 grid place-items-center">
                   <Monitor className="size-5" />
                </div>
                <div>
                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Browsers</span>
                   <p className="text-sm font-bold">Chrome, Safari, FF</p>
                </div>
             </div>
             <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
                <div className="size-10 rounded-xl bg-amber-500/10 text-amber-500 grid place-items-center">
                   <Smartphone className="size-5" />
                </div>
                <div>
                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mobile</span>
                   <p className="text-sm font-bold">iOS, Android WebView</p>
                </div>
             </div>
             <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
                <div className="size-10 rounded-xl bg-rose-500/10 text-rose-500 grid place-items-center">
                   <Lock className="size-5" />
                </div>
                <div>
                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Security</span>
                   <p className="text-sm font-bold">SSL & CORS Verified</p>
                </div>
             </div>
          </div>

          <ScrollArea className="flex-1 pr-4">
             <div className="space-y-6 pb-10">
                {scenarios.length > 0 ? (
                  <div className="grid gap-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-lg font-display font-bold tracking-tight flex items-center gap-2">
                          <CheckSquare className="size-5 text-emerald-500" />
                          Recommended Scenarios
                       </h3>
                       <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="rounded-lg h-8 gap-2 text-xs font-bold" onClick={() => toast.success("Exported to PDF")}>
                             <Download className="size-3" /> Export
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-lg h-8 gap-2 text-xs font-bold" onClick={() => toast.success("Copied to clipboard")}>
                             <Copy className="size-3" /> Copy All
                          </Button>
                       </div>
                    </div>

                    <div className="grid gap-4">
                       {scenarios.map(s => (
                          <div key={s.id} className="p-5 rounded-3xl border border-border bg-card hover:border-emerald-500/30 transition-all group">
                             <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                   <div className={`size-2 rounded-full ${
                                      s.priority === 'Critical' ? 'bg-rose-500 animate-pulse' : 
                                      s.priority === 'High' ? 'bg-orange-500' : 
                                      'bg-blue-500'
                                   }`} />
                                   <h4 className="font-bold text-foreground/90">{s.title}</h4>
                                </div>
                                <Badge variant="secondary" className={`text-[10px] font-bold ${
                                   s.priority === 'Critical' ? 'bg-rose-500/10 text-rose-500' : 
                                   'bg-secondary/50 text-muted-foreground'
                                }`}>
                                   {s.priority} Severity
                                </Badge>
                             </div>
                             <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                {s.description}
                             </p>
                             <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                <div className="flex items-center gap-4">
                                   <button className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-emerald-500 transition-colors">
                                      <Layers className="size-3" /> Add to Suite
                                   </button>
                                   <button className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-rose-500 transition-colors">
                                      <ShieldAlert className="size-3" /> Flag as Bug
                                   </button>
                                </div>
                                <Button variant="ghost" size="sm" className="h-7 rounded-lg text-[10px] font-bold hover:bg-emerald-500/10 hover:text-emerald-500">
                                   View Manual Steps
                                </Button>
                             </div>
                          </div>
                       ))}
                    </div>

                    <div className="rounded-3xl bg-rose-500/5 border border-rose-500/20 p-6">
                       <div className="flex items-center gap-3 mb-4">
                          <AlertTriangle className="size-5 text-rose-500" />
                          <h4 className="font-bold text-rose-500">Security Warning Cards</h4>
                       </div>
                       <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-slate-950/50 border border-rose-500/10">
                             <p className="text-xs font-bold text-rose-200 mb-1 uppercase tracking-wider">Data Privacy</p>
                             <p className="text-xs text-rose-200/60">Ensure sensitive traveler information is encrypted at rest and never logged in plain text.</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-slate-950/50 border border-rose-500/10">
                             <p className="text-xs font-bold text-rose-200 mb-1 uppercase tracking-wider">Access Control</p>
                             <p className="text-xs text-rose-200/60">Validate that admin-only routes are inaccessible to public users without proper session tokens.</p>
                          </div>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground/40 text-center gap-4 border-2 border-dashed border-border rounded-3xl">
                     <TestTube className="size-16 opacity-10" />
                     <div>
                        <p className="text-sm font-bold">Exhaustive testing begins here</p>
                        <p className="text-xs">Describe your feature and we'll hunt for the bugs</p>
                     </div>
                  </div>
                )}
             </div>
          </ScrollArea>
        </div>
      </div>

      {isGenerating && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50">
           <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="size-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <Eye className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 text-emerald-500 animate-pulse" />
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-lg font-display font-bold text-white tracking-tight">AI Vulnerability Scan</span>
                <span className="text-sm text-slate-500 animate-pulse">Running edge-case simulation engine...</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
