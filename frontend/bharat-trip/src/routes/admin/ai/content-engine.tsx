import { useState, useEffect } from "react";
import { AdminShell } from "@/components/AdminShell";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import api from "@/lib/api";
import { 
  Cpu,
  Sparkles,
  Zap,
  Copy,
  RotateCcw,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Layout,
  TrendingUp,
  History,
  ChevronRight,
  Hash,
  Share2,
  Heart,
  Type,
  Loader2,
  CheckCircle2,
  XCircle,
  Calendar,
  Download,
  Flame,
  Clapperboard,
  Image as ImageIcon,
  ScrollText,
  Clock,
  Trash2
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminAiContentEnginePage() {
  return (
    <AdminProtectedRoute>
      <AdminShell>
        <ContentEngine />
      </AdminShell>
    </AdminProtectedRoute>
  );
}

const PLATFORMS = [
  { id: "Instagram", icon: Instagram, color: "text-pink-500" },
  { id: "YouTube Shorts", icon: Youtube, color: "text-red-500" },
  { id: "Twitter/X", icon: Twitter, color: "text-sky-500" },
  { id: "LinkedIn", icon: Linkedin, color: "text-blue-600" }
];

const CONTENT_TYPES = ["Reel", "Carousel", "Story", "Tweet", "Ad Creative"];
const TONES = ["Viral", "Luxury", "Emotional", "Adventure", "Minimal"];
const DURATIONS = ["15 sec", "30 sec", "60 sec"];

const MOCK_TRENDS = [
  "Hidden Bali Cafes",
  "Budget Dubai Luxury",
  "Thailand Under ₹30k",
  "Secret Goa Spots"
];

function ContentEngine() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [contentType, setContentType] = useState("Reel");
  const [tone, setTone] = useState("Viral");
  const [duration, setDuration] = useState("30 sec");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentContent, setCurrentContent] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("hooks");
  const [showGallery, setShowGallery] = useState(false);
  const [savedMedia, setSavedMedia] = useState<{images: any[], videos: any[]}>({ images: [], videos: [] });
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchSavedMedia = async () => {
    setIsLoadingGallery(true);
    try {
      const res = await api.get("/ai/content-engine/media/saved");
      if (res.data.success) {
        setSavedMedia(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to fetch media library");
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const toggleSave = async (mediaId: string, mediaType: 'image' | 'video', contentId?: string) => {
    const targetId = contentId || currentContent?._id;
    if (!targetId) return;

    try {
      const res = await api.patch(`/ai/content-engine/${targetId}/media/${mediaId}/toggle-save`, { mediaType });
      if (res.data.success) {
        const isNowSaved = res.data.data.isSaved;
        toast.success(isNowSaved ? "Added to Media Library" : "Removed from Library");
        
        // Update local state for current content
        if (currentContent?._id === targetId) {
          const updatedContent = { ...currentContent };
          if (mediaType === 'image') {
            updatedContent.mediaOutput.imagePrompts = updatedContent.mediaOutput.imagePrompts.map((img: any) => 
              img._id === mediaId ? { ...img, isSaved: isNowSaved } : img
            );
          } else {
            updatedContent.mediaOutput.videoPrompts = updatedContent.mediaOutput.videoPrompts.map((vid: any) => 
              vid._id === mediaId ? { ...vid, isSaved: isNowSaved } : vid
            );
          }
          setCurrentContent(updatedContent);
          setHistory(history.map(item => item._id === targetId ? updatedContent : item));
        }

        // Refresh gallery if open
        if (showGallery) fetchSavedMedia();
      }
    } catch (err) {
      toast.error("Failed to update library");
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get("/ai/content-engine");
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Enter a topic to generate content");
      return;
    }

    setIsGenerating(true);
    setCurrentContent(null);
    
    try {
      const res = await api.post("/ai/content-engine", {
        topic,
        platform,
        contentType,
        tone,
        videoDuration: duration
      });

      if (res.data.success) {
        setCurrentContent(res.data.data);
        setHistory([res.data.data, ...history]);
        toast.success("Viral content generated!");
        setActiveTab("hooks");
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      toast.error(err.response?.data?.message || "Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await api.patch(`/ai/content-engine/${id}`, { status });
      if (res.data.success) {
        toast.success(`Content ${status.toLowerCase()}!`);
        if (currentContent?._id === id) {
          setCurrentContent(res.data.data);
        }
        setHistory(history.map(item => item._id === id ? res.data.data : item));
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const updateMediaStatus = async (id: string, mediaStatus: string) => {
    try {
      const res = await api.patch(`/ai/content-engine/${id}`, { mediaStatus });
      if (res.data.success) {
        toast.success(`Media ${mediaStatus.toLowerCase()}!`);
        if (currentContent?._id === id) {
          setCurrentContent(res.data.data);
        }
        setHistory(history.map(item => item._id === id ? res.data.data : item));
      }
    } catch (err) {
      toast.error("Failed to update media status");
    }
  };

  const deleteContent = async (id: string) => {
    try {
      await api.delete(`/ai/content-engine/${id}`);
      toast.success("Content deleted");
      if (currentContent?._id === id) setCurrentContent(null);
      setHistory(history.filter(item => item._id !== id));
    } catch (err) {
      toast.error("Failed to delete content");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const pollVideoStatus = async (jobId: string, provider: string) => {
    try {
      const res = await api.get(`/ai/content-engine/media/status`, {
        params: { jobId, provider }
      });

      if (res.data.success) {
        const { status, videoUrl } = res.data.data;
        
        if (status === 'SUCCEEDED' || status === 'COMPLETED') {
          toast.success("Video generation complete!", {
            description: "You can now download your cinematic video."
          });
          // In a real app, you'd update the UI state to show the video or a download link
          console.log("Video Ready:", videoUrl);
          return true;
        } else if (status === 'FAILED') {
          toast.error("Video generation failed", {
            description: "Check the provider dashboard for details."
          });
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Polling error:", err);
      return true; // Stop on error
    }
  };

  const generateImage = async (imageId: string) => {
    if (!currentContent?._id) return;

    toast.promise(
      api.patch(`/ai/content-engine/${currentContent._id}/image/${imageId}/generate`, {}),
      {
        loading: "Generating cinematic visual...",
        success: (res) => {
          if (res.data.success) {
            const updatedImage = res.data.data;
            const updatedContent = { ...currentContent };
            updatedContent.mediaOutput.imagePrompts = updatedContent.mediaOutput.imagePrompts.map((img: any) => 
              img._id === imageId ? updatedImage : img
            );
            setCurrentContent(updatedContent);
            setHistory(history.map(item => item._id === currentContent._id ? updatedContent : item));
            return "Visual generated successfully!";
          }
          return "Generation complete";
        },
        error: "Failed to generate image"
      }
    );
  };

  const handleMediaAction = async (action: string, data: any) => {
    console.log(`[MediaAction] ${action}:`, data);
    
    switch(action) {
      case 'generate-video':
        toast.promise(
          api.post("/ai/content-engine/media/generate", {
            provider: data.provider || 'Runway',
            prompt: data.prompt,
            contentId: currentContent?._id,
            options: {
              duration: duration.includes("15") ? "5" : "10",
              aspectRatio: "9:16"
            }
          }),
          {
            loading: `Sending prompt to ${data.provider}...`,
            success: (res) => {
              const jobId = res.data.data.jobId;
              // Start polling
              const interval = setInterval(async () => {
                const stop = await pollVideoStatus(jobId, data.provider);
                if (stop) clearInterval(interval);
              }, 5000);
              
              return `${data.provider} generation started! Job ID: ${jobId}`;
            },
            error: (err) => err.response?.data?.message || `Failed to start ${data.provider} generation`
          }
        );
        break;
      case 'save-visual':
      case 'save-concept':
        toast.success("Media concept saved to library!", {
          description: "This prompt is now available in your media assets gallery."
        });
        break;
      case 'download-video':
        toast.info("Preparing video for download...", {
          description: "If the generation just finished, this may take a moment."
        });
        break;
      default:
        toast.success("Action performed successfully!");
    }
  };

  const PlatformIcon = PLATFORMS.find(p => p.id === platform)?.icon || Cpu;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-500 grid place-items-center">
              <Cpu className="size-5" />
            </div>
            AI Content Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Generate viral travel content across platforms with elite AI.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button 
            variant="outline" 
            size="sm" 
            className="rounded-lg gap-2 border-indigo-500/20 bg-indigo-500/5 text-indigo-500 hover:bg-indigo-500/10 font-bold"
            onClick={() => {
              setShowGallery(true);
              fetchSavedMedia();
            }}
           >
             <ImageIcon className="size-3.5" /> Media Library
           </Button>
           <Badge variant="secondary" className="px-2.5 py-0.5 gap-1.5 border-indigo-500/10 bg-indigo-500/5 text-indigo-500 font-medium">
              <Flame className="size-3.5 fill-current" />
              Viral Mode Active
           </Badge>
           <Button variant="outline" size="sm" className="rounded-lg gap-2 border-border/50 shadow-sm font-medium">
             <Calendar className="size-3.5" /> Schedule Queue
           </Button>
        </div>
      </div>

      <MediaGalleryModal 
        isOpen={showGallery} 
        onClose={() => setShowGallery(false)} 
        data={savedMedia} 
        isLoading={isLoadingGallery}
        onToggleSave={toggleSave}
      />

      <div className="grid lg:grid-cols-[340px_1fr] gap-6 flex-1 min-h-0">
        {/* Left Panel: Configuration */}
        <div className="flex flex-col gap-6 h-full overflow-hidden">
          <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-6 pb-6">
              <Card className="rounded-2xl border-border/50 bg-card shadow-sm overflow-hidden">
                <CardHeader className="pb-4 pt-6 px-6">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Type className="size-4 text-indigo-500" />
                    Content Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 px-6 pb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Main Topic / Idea</label>
                    <Textarea 
                      placeholder="e.g. Hidden beaches in Gokarna, Luxury stay in Udaipur for cheap..."
                      className="min-h-[120px] rounded-xl bg-secondary/20 border-border/50 focus:ring-1 focus:ring-indigo-500 transition-all resize-none text-sm p-4"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Select Platform</label>
                      <div className="grid grid-cols-2 gap-2">
                        {PLATFORMS.map(p => (
                          <button
                            key={p.id}
                            onClick={() => setPlatform(p.id)}
                            className={cn(
                              "px-3 py-3 rounded-xl text-xs font-medium border transition-all flex items-center gap-2.5",
                              platform === p.id 
                              ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-500 shadow-sm" 
                              : "bg-secondary/30 border-transparent text-muted-foreground hover:bg-secondary/50"
                            )}
                          >
                            <p.icon className={cn("size-4", platform === p.id ? "text-indigo-500" : p.color)} />
                            {p.id}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Format</label>
                        <Select value={contentType} onValueChange={setContentType}>
                          <SelectTrigger className="rounded-xl bg-secondary/30 border-transparent h-10 text-xs font-medium px-4">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CONTENT_TYPES.map(t => <SelectItem key={t} value={t} className="text-xs font-medium">{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Vibe</label>
                        <Select value={tone} onValueChange={setTone}>
                          <SelectTrigger className="rounded-xl bg-secondary/30 border-transparent h-10 text-xs font-medium px-4">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TONES.map(t => <SelectItem key={t} value={t} className="text-xs font-medium">{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Duration</label>
                      <div className="flex gap-2">
                        {DURATIONS.map(d => (
                          <button
                            key={d}
                            onClick={() => setDuration(d)}
                            className={cn(
                              "flex-1 py-2.5 rounded-xl text-[10px] font-bold border transition-all uppercase tracking-tight",
                              duration === d 
                              ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-500 shadow-sm" 
                              : "bg-secondary/30 border-transparent text-muted-foreground hover:bg-secondary/50"
                            )}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-6 px-6">
                  <Button 
                    onClick={handleGenerate} 
                    className="w-full rounded-xl h-12 text-sm font-semibold shadow-md gap-2 bg-indigo-600 hover:bg-indigo-500 transition-all active:scale-[0.98]"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Analyzing Trends...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Generate Viral Kit
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="rounded-2xl border-border/50 bg-card shadow-sm">
                <CardHeader className="pb-2 px-6 pt-5">
                  <CardTitle className="text-xs font-semibold flex items-center gap-2">
                    <TrendingUp className="size-3.5 text-indigo-500" />
                    Trending Now
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {MOCK_TRENDS.map(t => (
                      <button 
                        key={t}
                        onClick={() => setTopic(t)}
                        className="px-3 py-1.5 rounded-lg bg-secondary/40 text-[10px] font-medium hover:bg-indigo-500/10 hover:text-indigo-500 transition-all border border-transparent hover:border-indigo-500/20"
                      >
                        #{t.replace(/\s+/g, '')}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/50 bg-card shadow-sm flex flex-col min-h-[300px]">
                <CardHeader className="pb-4 px-6 pt-5">
                   <CardTitle className="text-xs font-semibold flex items-center gap-2">
                      <History className="size-3.5 text-indigo-500" />
                      Recent Generations
                   </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-3">
                    {history.length > 0 ? history.map((h) => (
                       <div 
                        key={h._id} 
                        className={cn(
                          "group p-4 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-all cursor-pointer border-l-2",
                          h.status === 'Approved' ? 'border-emerald-500' : 
                          h.status === 'Rejected' ? 'border-rose-500' : 'border-indigo-500/30'
                        )}
                        onClick={() => setCurrentContent(h)}
                       >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-indigo-500/80 uppercase tracking-tight">{h.platform} • {h.contentType}</span>
                            <span className="text-[9px] text-muted-foreground">{new Date(h.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs font-medium truncate pr-4">{h.topic}</p>
                       </div>
                    )) : (
                      <div className="text-center py-12 opacity-40">
                        <Clock className="size-8 mx-auto mb-3" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No history yet</p>
                      </div>
                    )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel: Content Display */}
        <div className="flex flex-col h-full min-h-0 bg-secondary/5 rounded-2xl border border-border/40 overflow-hidden shadow-inner">
          {currentContent ? (
            <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
              {/* Top Banner */}
              <div className="p-6 bg-card border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-indigo-500/10 text-indigo-500 grid place-items-center">
                    {(() => {
                      const platformData = PLATFORMS.find(p => p.id === currentContent.platform);
                      const Icon = platformData?.icon || Cpu;
                      return <Icon className="size-6" />;
                    })()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold tracking-tight">{currentContent.topic}</h2>
                      <div className="flex gap-2">
                        <Badge className={cn(
                          "px-2 py-0 h-5 text-[9px] font-bold uppercase",
                          currentContent.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                          currentContent.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                          'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                        )}>
                          CONTENT: {currentContent.status}
                        </Badge>
                        <Badge className={cn(
                          "px-2 py-0 h-5 text-[9px] font-bold uppercase",
                          currentContent.mediaStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                          currentContent.mediaStatus === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                          currentContent.mediaStatus === 'Queued' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                        )}>
                          MEDIA: {currentContent.mediaStatus || 'Pending'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                        <Layout className="size-3.5" /> {currentContent.contentType}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                        <Sparkles className="size-3.5" /> {currentContent.tone}
                      </span>
                      {currentContent.videoDuration && (
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                          <Clock className="size-3.5" /> {currentContent.videoDuration}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5 bg-secondary/20 p-3.5 rounded-xl border border-border/30">
                  <div className="text-center pr-5 border-r border-border/30">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Virality</p>
                    <p className="text-2xl font-bold text-indigo-500 leading-none">{currentContent.generatedOutput.viralityScore}%</p>
                  </div>
                  <div className="max-w-[180px]">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">AI Insights</p>
                    <p className="text-[11px] font-medium leading-normal text-muted-foreground italic line-clamp-2">{currentContent.generatedOutput.engagementPrediction}</p>
                  </div>
                </div>
              </div>

              {/* Tabs Section */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                <div className="px-6 py-3 border-b border-border/30 bg-card/50 overflow-x-auto no-scrollbar">
                  <TabsList className="bg-secondary/40 p-1 rounded-lg h-11 w-max justify-start gap-1">
                    {[
                      { id: "hooks", icon: Zap, label: "Hooks", color: "text-amber-500" },
                      { id: "script", icon: Clapperboard, label: "Script", color: "text-indigo-500" },
                      { id: "storyboard", icon: ImageIcon, label: "Storyboard", color: "text-rose-500" },
                      { id: "caption", icon: ScrollText, label: "Caption", color: "text-emerald-500" },
                      { id: "images", icon: ImageIcon, label: "Images", color: "text-pink-500" },
                      { id: "videos", icon: Youtube, label: "Videos", color: "text-red-500" },
                      { id: "scene-prompts", icon: Layout, label: "Scene Prompts", color: "text-sky-500" },
                    ].map(t => (
                      <TabsTrigger key={t.id} value={t.id} className="rounded-md gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 h-full">
                        <t.icon className={cn("size-3.5", t.color)} />
                        <span className="text-[11px] font-semibold uppercase tracking-tight">{t.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  <div className="space-y-6 pb-24">
                    <TabsContent value="hooks" className="mt-0 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {currentContent.generatedOutput.hooks.map((hook: string, i: number) => (
                        <div key={i} className="group relative p-8 rounded-2xl border border-border/50 bg-card shadow-sm hover:border-indigo-500/30 transition-all">
                           <div className="absolute top-6 right-6 flex gap-2">
                             <Button variant="ghost" size="icon" className="size-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(hook)}>
                               <Copy className="size-4" />
                             </Button>
                           </div>
                           <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-4 block">Viral Hook Option 0{i+1}</label>
                           <p className="text-xl font-semibold leading-snug text-foreground tracking-tight italic">"{hook}"</p>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="script" className="mt-0 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-secondary/20 border-b border-border/50">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-20">Scene</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Visual Description</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Audio / VO</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                              {currentContent.generatedOutput.reelScript.map((scene: any) => (
                                <tr key={scene.scene} className="hover:bg-secondary/5 transition-colors">
                                  <td className="px-6 py-6 align-top">
                                    <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-500 grid place-items-center font-bold text-sm shadow-inner">
                                      {scene.scene}
                                    </div>
                                  </td>
                                  <td className="px-6 py-6 text-sm font-medium leading-relaxed text-foreground/80">{scene.visual}</td>
                                  <td className="px-6 py-6 text-base font-bold text-indigo-500/90 italic leading-relaxed tracking-tight">"{scene.audio}"</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                       </div>
                    </TabsContent>

                    <TabsContent value="storyboard" className="mt-0 grid xl:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                       {currentContent.generatedOutput.storyboard.map((shot: any) => (
                         <div key={shot.shot} className="p-6 rounded-2xl border border-border/50 bg-card shadow-sm flex gap-5 items-start">
                            <div className="size-10 shrink-0 rounded-xl bg-secondary/50 border border-border/50 grid place-items-center text-xs font-bold">
                              S{shot.shot}
                            </div>
                            <div>
                               <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Visual Direction</label>
                               <p className="text-sm font-medium leading-relaxed">{shot.description}</p>
                            </div>
                         </div>
                       ))}
                    </TabsContent>

                    <TabsContent value="caption" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <div className="group relative p-10 rounded-2xl border border-border/50 bg-card shadow-sm">
                          <div className="absolute top-8 right-8 flex gap-2">
                             <Button variant="outline" size="sm" className="rounded-xl gap-2 font-semibold shadow-sm" onClick={() => copyToClipboard(currentContent.generatedOutput.caption)}>
                               <Copy className="size-3.5" /> Copy Caption
                             </Button>
                          </div>
                          <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-6 block">Elite Platform Ready Caption</label>
                          <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90 font-medium">
                            {currentContent.generatedOutput.caption}
                          </div>
                       </div>
                    </TabsContent>

                    {/* NEW MEDIA TABS */}
                    <TabsContent value="images" className="mt-0 grid xl:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {currentContent.mediaOutput?.imagePrompts?.length > 0 ? currentContent.mediaOutput.imagePrompts.map((img: any, i: number) => (
                        <Card key={i} className="rounded-2xl border-border/50 bg-card shadow-sm overflow-hidden group">
                          {img.imageUrl && (
                            <div className="aspect-[9/16] relative overflow-hidden bg-secondary/20">
                               <img src={img.imageUrl} alt={img.type} className="w-full h-full object-cover animate-in fade-in zoom-in-105 duration-700" />
                               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                               <div className="absolute bottom-4 left-4">
                                  <Badge className="bg-indigo-500 text-white border-none text-[9px] font-bold uppercase">{img.type}</Badge>
                               </div>
                            </div>
                          )}
                          <CardHeader className="p-5 pb-2">
                            <div className="flex items-center justify-between">
                              {!img.imageUrl && (
                                <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest text-pink-500 border-pink-500/20 bg-pink-500/5">
                                  {img.type}
                                </Badge>
                              )}
                              {img.imageUrl && <div />}
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="size-7" onClick={() => copyToClipboard(img.prompt)}>
                                  <Copy className="size-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="size-7 text-indigo-500" onClick={() => generateImage(img._id)}>
                                  <RotateCcw className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-5 pt-0 space-y-4">
                            <p className="text-sm font-medium leading-relaxed text-foreground/90 italic">"{img.prompt}"</p>
                            <div className="grid grid-cols-2 gap-3 text-[10px]">
                              <div className="space-y-1">
                                <p className="font-bold text-muted-foreground uppercase">Style</p>
                                <p className="font-medium">{img.style}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="font-bold text-muted-foreground uppercase">Lighting</p>
                                <p className="font-medium">{img.lighting}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="font-bold text-muted-foreground uppercase">Color</p>
                                <p className="font-medium">{img.colorGrading}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="font-bold text-muted-foreground uppercase">Mood</p>
                                <p className="font-medium">{img.mood}</p>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="p-4 bg-secondary/10 border-t border-border/30 flex justify-end gap-2">
                            {!img.imageUrl && (
                              <Button 
                                size="sm" 
                                className="h-8 text-[10px] font-bold rounded-lg px-3 bg-indigo-600 hover:bg-indigo-500"
                                onClick={() => generateImage(img._id)}
                              >
                                GENERATE IMAGE
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant={img.isSaved ? "secondary" : "outline"} 
                              className={cn("h-8 text-[10px] font-bold rounded-lg px-3", img.isSaved && "bg-indigo-500/10 text-indigo-500 border-indigo-500/20")}
                              onClick={() => toggleSave(img._id, 'image')}
                            >
                              {img.isSaved ? "SAVED" : "SAVE VISUAL"}
                            </Button>
                          </CardFooter>
                        </Card>
                      )) : (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-border/50 rounded-3xl">
                           <ImageIcon className="size-12 mx-auto mb-4 text-muted-foreground/30" />
                           <p className="text-sm font-bold text-muted-foreground">No Image Prompts Found</p>
                           <p className="text-xs text-muted-foreground/60 mt-1">Please regenerate this kit to create cinematic image prompts.</p>
                           <Button variant="outline" size="sm" className="mt-6 gap-2 rounded-xl" onClick={handleGenerate} disabled={isGenerating}>
                             <RotateCcw className="size-3.5" /> Regenerate Now
                           </Button>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="videos" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {currentContent.mediaOutput?.videoPrompts?.length > 0 ? (
                        <div className="grid xl:grid-cols-2 gap-6">
                          {currentContent.mediaOutput.videoPrompts.map((vid: any, i: number) => (
                            <Card key={i} className="rounded-2xl border-border/50 bg-card shadow-sm overflow-hidden group">
                              <CardHeader className="p-5 pb-2">
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest text-red-500 border-red-500/20 bg-red-500/5">
                                    {vid.provider}
                                  </Badge>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="size-7" onClick={() => copyToClipboard(vid.prompt)}>
                                      <Copy className="size-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="size-7 text-indigo-500" onClick={() => handleMediaAction('download-video', vid)}>
                                      <Download className="size-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="p-5 pt-0 space-y-4">
                                <p className="text-sm font-medium leading-relaxed text-foreground/90 italic">"{vid.prompt}"</p>
                                <div className="space-y-3 text-[10px]">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <p className="font-bold text-muted-foreground uppercase">Camera</p>
                                      <p className="font-medium">{vid.cameraMovement}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="font-bold text-muted-foreground uppercase">Motion</p>
                                      <p className="font-medium">{vid.motionDirection}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="font-bold text-muted-foreground uppercase">Transitions</p>
                                    <p className="font-medium">{vid.transitions}</p>
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter className="p-4 bg-secondary/10 border-t border-border/30 flex justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant={vid.isSaved ? "secondary" : "outline"} 
                                  className={cn("h-8 text-[10px] font-bold rounded-lg px-3", vid.isSaved && "bg-indigo-500/10 text-indigo-500 border-indigo-500/20")}
                                  onClick={() => toggleSave(vid._id, 'video')}
                                >
                                  {vid.isSaved ? "SAVED" : "SAVE CONCEPT"}
                                </Button>
                                <Button size="sm" className="h-8 text-[10px] font-bold rounded-lg px-3 bg-red-600 hover:bg-red-500" onClick={() => handleMediaAction('generate-video', vid)}>GENERATE VIDEO</Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-3xl">
                           <Youtube className="size-12 mx-auto mb-4 text-muted-foreground/30" />
                           <p className="text-sm font-bold text-muted-foreground">No Video Concepts Found</p>
                           <p className="text-xs text-muted-foreground/60 mt-1">Please regenerate this kit to create AI video motion prompts.</p>
                           <Button variant="outline" size="sm" className="mt-6 gap-2 rounded-xl" onClick={handleGenerate} disabled={isGenerating}>
                             <RotateCcw className="size-3.5" /> Regenerate Now
                           </Button>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="scene-prompts" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {currentContent.mediaOutput?.scenePrompts?.length > 0 ? (
                        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
                          <div className="p-6 bg-secondary/20 border-b border-border/50">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500">Cinematic Scene Breakdown</h3>
                          </div>
                          <div className="divide-y divide-border/30">
                            {currentContent.mediaOutput.scenePrompts.map((scene: any, i: number) => (
                              <div key={i} className="p-6 hover:bg-secondary/5 transition-colors flex gap-6">
                                <div className="size-10 shrink-0 rounded-xl bg-indigo-500/10 text-indigo-500 grid place-items-center font-bold text-xs shadow-inner">
                                  {scene.scene}
                                </div>
                                <div className="flex-1 space-y-4">
                                  <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Visual Description</label>
                                      <p className="text-sm font-medium leading-relaxed">{scene.description}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-bold text-emerald-500 uppercase">Subtitle Overlay</label>
                                      <p className="text-sm font-bold italic">"{scene.subtitle}"</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4 text-[10px]">
                                    <div className="space-y-1">
                                      <p className="font-bold text-muted-foreground uppercase">Angle</p>
                                      <p className="font-medium">{scene.cameraAngle}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="font-bold text-muted-foreground uppercase">Transition</p>
                                      <p className="font-medium">{scene.transition}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="font-bold text-muted-foreground uppercase">Audio Cue</p>
                                      <p className="font-medium">{scene.audio}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-3xl">
                           <Layout className="size-12 mx-auto mb-4 text-muted-foreground/30" />
                           <p className="text-sm font-bold text-muted-foreground">No Scene Breakdowns Found</p>
                           <p className="text-xs text-muted-foreground/60 mt-1">Please regenerate this kit to create cinematic scene prompts.</p>
                           <Button variant="outline" size="sm" className="mt-6 gap-2 rounded-xl" onClick={handleGenerate} disabled={isGenerating}>
                             <RotateCcw className="size-3.5" /> Regenerate Now
                           </Button>
                        </div>
                      )}
                    </TabsContent>
                  </div>
                </div>
              </Tabs>

              {/* Bottom Action Bar */}
              <div className="p-4 bg-card border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
                 <div className="flex items-center gap-4 border-r border-border/50 pr-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">Content Strategy</p>
                      <div className="flex items-center gap-2">
                        {currentContent.status === 'Pending' ? (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => updateStatus(currentContent._id, 'Approved')}
                              className="rounded-lg h-8 px-3 gap-1.5 bg-emerald-600 hover:bg-emerald-500 shadow-sm font-semibold text-[10px]"
                            >
                              <CheckCircle2 className="size-3" /> Approve
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => updateStatus(currentContent._id, 'Rejected')}
                              className="rounded-lg h-8 px-3 gap-1.5 text-rose-500 hover:bg-rose-500/10 font-semibold text-[10px]"
                            >
                              <XCircle className="size-3" /> Reject
                            </Button>
                          </>
                        ) : (
                          <Badge className={cn(
                            "h-7 px-3 rounded-lg font-bold text-[9px] gap-1.5 uppercase",
                            currentContent.status === 'Approved' ? 'bg-emerald-500' : 'bg-rose-500'
                          )}>
                            {currentContent.status === 'Approved' ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                            {currentContent.status}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">Media Assets</p>
                      <div className="flex items-center gap-2">
                        {(currentContent.mediaStatus === 'Pending' || !currentContent.mediaStatus) ? (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => updateMediaStatus(currentContent._id, 'Approved')}
                              className="rounded-lg h-8 px-3 gap-1.5 bg-indigo-600 hover:bg-indigo-500 shadow-sm font-semibold text-[10px]"
                            >
                              <ImageIcon className="size-3" /> Approve Media
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => updateMediaStatus(currentContent._id, 'Rejected')}
                              className="rounded-lg h-8 px-3 gap-1.5 text-rose-500 hover:bg-rose-500/10 font-semibold text-[10px]"
                            >
                              <XCircle className="size-3" /> Reject
                            </Button>
                          </>
                        ) : (
                          <Badge className={cn(
                            "h-7 px-3 rounded-lg font-bold text-[9px] gap-1.5 uppercase",
                            currentContent.mediaStatus === 'Approved' ? 'bg-emerald-500' : 
                            currentContent.mediaStatus === 'Queued' ? 'bg-amber-500' : 'bg-rose-500'
                          )}>
                            {currentContent.mediaStatus === 'Approved' ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                            {currentContent.mediaStatus}
                          </Badge>
                        )}
                      </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-lg h-9 px-3.5 gap-2 border-border/50 font-semibold text-xs" onClick={handleGenerate} disabled={isGenerating}>
                       <RotateCcw className={cn("size-3.5", isGenerating && "animate-spin")} /> Regenerate
                    </Button>
                    <Button 
                      size="sm" 
                      className="rounded-lg h-9 px-5 gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-sm font-bold text-xs"
                      onClick={() => updateMediaStatus(currentContent._id, 'Queued')}
                    >
                       QUEUE FOR POSTING <ChevronRight className="size-3.5" />
                    </Button>
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-700">
               <div className="size-20 rounded-2xl bg-indigo-500/5 grid place-items-center mb-6 relative">
                  <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500/10 border-t-indigo-500/40 animate-spin" />
                  <Cpu className="size-8 text-indigo-500 opacity-20" />
               </div>
               <h3 className="text-xl font-bold tracking-tight mb-2">Ready to Go Viral?</h3>
               <p className="text-muted-foreground max-w-xs mb-6 text-xs font-medium leading-relaxed">
                  Select your platform and topic on the left to generate a complete viral content kit with hooks, scripts, and captions.
               </p>
               <div className="flex gap-2">
                  <Badge variant="outline" className="px-3 py-1 rounded-lg border-border/50 bg-card/50 text-[9px] font-bold">
                    <Zap className="size-3 text-amber-500 mr-1.5" /> AI Optimized
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 rounded-lg border-border/50 bg-card/50 text-[9px] font-bold">
                    <Flame className="size-3 text-rose-500 mr-1.5" /> Trending Logic
                  </Badge>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MediaGalleryModal({ isOpen, onClose, data, isLoading, onToggleSave }: any) {
  const [activeType, setActiveType] = useState<'images' | 'videos'>('images');
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const currentList = activeType === 'images' ? data.images : data.videos;
  const filtered = currentList.filter((item: any) => 
    item.prompt.toLowerCase().includes(search.toLowerCase()) || 
    item.topic?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl bg-card border border-border rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-border/50 bg-secondary/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="size-12 rounded-2xl bg-indigo-500/10 text-indigo-500 grid place-items-center">
                <ImageIcon className="size-6" />
             </div>
             <div>
                <h2 className="text-2xl font-bold tracking-tight">Admin Media Library</h2>
                <p className="text-sm text-muted-foreground">Your curated collection of travel visuals and concepts.</p>
             </div>
          </div>
          <button onClick={onClose} className="size-10 rounded-full hover:bg-secondary grid place-items-center transition-colors">
            <XCircle className="size-6 text-muted-foreground" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-8 py-4 border-b border-border/30 bg-card/50 flex items-center justify-between gap-4">
           <div className="flex gap-2">
              <Button 
                variant={activeType === 'images' ? 'default' : 'ghost'} 
                size="sm" 
                className="rounded-xl px-6 h-9 font-bold text-xs"
                onClick={() => setActiveType('images')}
              >
                IMAGE PROMPTS
              </Button>
              <Button 
                variant={activeType === 'videos' ? 'default' : 'ghost'} 
                size="sm" 
                className="rounded-xl px-6 h-9 font-bold text-xs"
                onClick={() => setActiveType('videos')}
              >
                VIDEO CONCEPTS
              </Button>
           </div>
           <div className="relative flex-1 max-w-xs">
              <History className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                placeholder="Search library..." 
                className="w-full bg-secondary/30 border-transparent rounded-xl h-9 pl-9 text-xs font-medium focus:ring-1 focus:ring-indigo-500 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-8">
          {isLoading ? (
            <div className="h-[400px] flex flex-col items-center justify-center gap-4">
               <Loader2 className="size-10 text-indigo-500 animate-spin" />
               <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Library...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
               {filtered.map((item: any) => (
                 <Card key={item._id} className="rounded-2xl border-border/50 bg-secondary/10 hover:bg-card transition-all group relative overflow-hidden text-left">
                    {item.imageUrl && (
                      <div className="aspect-[9/16] w-full overflow-hidden bg-secondary/20 relative">
                         <img src={item.imageUrl} alt={item.topic} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                      </div>
                    )}
                    <CardHeader className="p-5 pb-3">
                       <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest border-indigo-500/20 bg-indigo-500/5 text-indigo-500">
                             {item.type || item.provider}
                          </Badge>
                          <button 
                            onClick={() => onToggleSave(item._id, activeType, item.contentId)}
                            className="size-7 rounded-lg bg-indigo-500 text-white grid place-items-center shadow-lg active:scale-95 transition-transform"
                          >
                             <CheckCircle2 className="size-4" />
                          </button>
                       </div>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate mb-1">{item.topic}</p>
                       <p className="text-sm font-medium leading-relaxed italic line-clamp-3">"{item.prompt}"</p>
                    </CardHeader>
                    <CardFooter className="p-5 pt-0 flex gap-2">
                       <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 flex-1 rounded-lg text-[10px] font-bold gap-2"
                        onClick={() => {
                          navigator.clipboard.writeText(item.prompt);
                          toast.success("Prompt copied!");
                        }}
                       >
                         <Copy className="size-3" /> COPY PROMPT
                       </Button>
                    </CardFooter>
                 </Card>
               ))}
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-center opacity-40">
               <ImageIcon className="size-16 mb-6" />
               <h3 className="text-xl font-bold">Library is empty</h3>
               <p className="text-sm max-w-xs mt-2">Saved image and video concepts from the Content Engine will appear here.</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
