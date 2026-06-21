import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { AdminShell } from "@/components/AdminShell";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Heart, Star, Trash2, Search, Calendar, User as UserIcon, 
  MessageSquare, Loader2, Sparkles, RefreshCw,
  ThumbsUp, HelpCircle, Inbox, MessageCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const usefulMap: Record<string, { label: string; emoji: string; color: string }> = {
  very_useful: { label: "Very Useful", emoji: "🤩", color: "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20" },
  useful: { label: "Useful", emoji: "😊", color: "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20" },
  neutral: { label: "Neutral", emoji: "😐", color: "bg-amber-500/10 text-amber-500 dark:bg-amber-500/20" },
  not_useful: { label: "Not Useful", emoji: "😕", color: "bg-orange-500/10 text-orange-500 dark:bg-orange-500/20" },
  not_at_all: { label: "Not At All", emoji: "😞", color: "bg-rose-500/10 text-rose-500 dark:bg-rose-500/20" },
};

const yesNoMap: Record<string, { label: string; emoji: string; color: string }> = {
  definitely: { label: "Definitely!", emoji: "💯", color: "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20" },
  probably: { label: "Probably", emoji: "👍", color: "bg-teal-500/10 text-teal-500 dark:bg-teal-500/20" },
  not_sure: { label: "Not Sure", emoji: "🤔", color: "bg-amber-500/10 text-amber-500 dark:bg-amber-500/20" },
  probably_not: { label: "Probably Not", emoji: "👎", color: "bg-orange-500/10 text-orange-500 dark:bg-orange-500/20" },
  no: { label: "No", emoji: "❌", color: "bg-rose-500/10 text-rose-500 dark:bg-rose-500/20" },
};

export default function AdminFeedbackPage() {
  return (
    <AdminProtectedRoute>
      <AdminFeedback />
    </AdminProtectedRoute>
  );
}

function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [featureFilter, setFeatureFilter] = useState<string>("all");

  const fetchData = async () => {
    try {
      const [feedbacksRes, statsRes] = await Promise.all([
        api.get("/admin/feedback"),
        api.get("/admin/feedback/stats"),
      ]);
      setFeedbacks(feedbacksRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Feedback fetch error:", err);
      toast.error("Failed to load feedback data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    try {
      await api.delete(`/admin/feedback/${id}`);
      toast.success("Feedback deleted successfully");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete feedback");
    }
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    const matchesSearch = 
      (f.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.improvements || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = ratingFilter === "all" || f.overallRating.toString() === ratingFilter;
    const matchesFeature = featureFilter === "all" || f.favoriteFeature === featureFilter;

    return matchesSearch && matchesRating && matchesFeature;
  });

  // Extract unique feature options from feedbacks
  const uniqueFeatures = Array.from(
    new Set(feedbacks.map((f) => f.favoriteFeature).filter(Boolean))
  ) as string[];

  // Calculation for quick dashboard values
  const positiveUsefulnessPercent = stats?.total > 0
    ? (
        (feedbacks.filter(f => f.isUseful === "very_useful" || f.isUseful === "useful").length /
          feedbacks.length) *
        100
      ).toFixed(0)
    : 0;

  const recommendPercent = stats?.total > 0
    ? (
        (feedbacks.filter(f => f.willRecommend === "definitely" || f.willRecommend === "probably").length /
          feedbacks.length) *
        100
      ).toFixed(0)
    : 0;

  if (loading && feedbacks.length === 0) {
    return (
      <AdminShell>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-3xl" />
            ))}
          </div>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <Skeleton className="h-10 w-64 rounded-xl" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-[32px]" />
              ))}
            </div>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
              User Feedback <Heart className="size-6 text-accent fill-accent" />
            </h1>
            <p className="text-muted-foreground mt-1">
              Analyze suggestions, ratings, and satisfaction index from the feedback form.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="self-start sm:self-center flex items-center gap-2 px-4 py-2 border-2 border-border rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat Card 1: Total feedbacks */}
          <div className="p-6 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
            <div className="absolute right-4 top-4 size-10 rounded-2xl bg-primary/5 text-primary grid place-items-center">
              <Inbox className="size-5" />
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Feedbacks</span>
            <div className="mt-4">
              <h2 className="text-4xl font-black font-display">{stats?.total || 0}</h2>
              <p className="text-[11px] text-muted-foreground mt-1">Submitted responses</p>
            </div>
          </div>

          {/* Stat Card 2: Average Rating */}
          <div className="p-6 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
            <div className="absolute right-4 top-4 size-10 rounded-2xl bg-amber-500/5 text-amber-500 grid place-items-center">
              <Star className="size-5 fill-amber-500 text-amber-500" />
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Average Rating</span>
            <div className="mt-4">
              <h2 className="text-4xl font-black font-display flex items-baseline gap-1">
                {stats?.averageRating || 0}
                <span className="text-sm font-medium text-muted-foreground">/ 5.0</span>
              </h2>
              <div className="flex items-center gap-0.5 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`size-3 ${
                      i < Math.round(Number(stats?.averageRating || 0)) 
                        ? "fill-amber-400 text-amber-400" 
                        : "text-muted"
                    }`} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Stat Card 3: Utility Index */}
          <div className="p-6 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
            <div className="absolute right-4 top-4 size-10 rounded-2xl bg-emerald-500/5 text-emerald-500 grid place-items-center">
              <ThumbsUp className="size-5" />
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Utility Index</span>
            <div className="mt-4">
              <h2 className="text-4xl font-black font-display">
                {positiveUsefulnessPercent}%
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1">Rated GoTripo as "Useful" / "Very Useful"</p>
            </div>
          </div>

          {/* Stat Card 4: Recommendation Score */}
          <div className="p-6 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
            <div className="absolute right-4 top-4 size-10 rounded-2xl bg-teal-500/5 text-teal-500 grid place-items-center">
              <Sparkles className="size-5" />
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recommendation Index</span>
            <div className="mt-4">
              <h2 className="text-4xl font-black font-display">
                {recommendPercent}%
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1">Willing to recommend to friends</p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 sm:p-6 rounded-[28px] border border-border bg-card/50 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          {/* Search bar */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search feedback content, name, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-background border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Rating Filter */}
            <div className="flex items-center gap-2 bg-background border border-border rounded-2xl px-3 py-1.5 w-full sm:w-auto">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">Rating:</span>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="bg-transparent text-sm font-semibold outline-none w-full border-none cursor-pointer"
              >
                <option value="all">All Stars</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            {/* Favorite Feature Filter */}
            <div className="flex items-center gap-2 bg-background border border-border rounded-2xl px-3 py-1.5 w-full sm:w-auto">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">Feature:</span>
              <select
                value={featureFilter}
                onChange={(e) => setFeatureFilter(e.target.value)}
                className="bg-transparent text-sm font-semibold outline-none w-full border-none cursor-pointer"
              >
                <option value="all">All Features</option>
                {uniqueFeatures.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Feedback Listing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFeedbacks.length > 0 ? (
            filteredFeedbacks.map((f) => {
              const usefulness = usefulMap[f.isUseful] || { label: f.isUseful, emoji: "📝", color: "bg-slate-500/10 text-slate-500" };
              const recommend = yesNoMap[f.willRecommend] || { label: f.willRecommend, emoji: "🗳️", color: "bg-slate-500/10 text-slate-500" };
              const useAgain = yesNoMap[f.willUseAgain] || { label: f.willUseAgain, emoji: "🎒", color: "bg-slate-500/10 text-slate-500" };

              return (
                <div 
                  key={f._id} 
                  className="rounded-[32px] border border-border bg-card p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 relative group flex flex-col justify-between"
                >
                  {/* Delete button (visible on hover) */}
                  <button 
                    onClick={() => deleteFeedback(f._id)}
                    className="absolute top-6 right-6 p-2 rounded-xl bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm hover:bg-destructive hover:text-white"
                  >
                    <Trash2 className="size-4" />
                  </button>

                  <div className="space-y-6">
                    {/* User header info */}
                    <div className="flex items-start gap-4">
                      <div className="size-12 rounded-2xl bg-secondary grid place-items-center text-muted-foreground flex-shrink-0">
                        <UserIcon className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg leading-tight truncate">{f.name || "Anonymous"}</h3>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{f.email || "No email provided"}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-0.5 text-orange-500">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`size-3.5 ${
                                  i < f.overallRating ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-700"
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground">•</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                            <Calendar className="size-3" />
                            {new Date(f.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Metric Badges */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className={`p-2 rounded-2xl text-center flex flex-col items-center justify-center ${usefulness.color}`}>
                        <span className="text-lg leading-none">{usefulness.emoji}</span>
                        <span className="text-[9px] font-bold mt-1 tracking-tight leading-none truncate w-full">{usefulness.label}</span>
                      </div>
                      <div className={`p-2 rounded-2xl text-center flex flex-col items-center justify-center ${useAgain.color}`}>
                        <span className="text-lg leading-none">{useAgain.emoji}</span>
                        <span className="text-[9px] font-bold mt-1 tracking-tight leading-none truncate w-full">Use: {useAgain.label}</span>
                      </div>
                      <div className={`p-2 rounded-2xl text-center flex flex-col items-center justify-center ${recommend.color}`}>
                        <span className="text-lg leading-none">{recommend.emoji}</span>
                        <span className="text-[9px] font-bold mt-1 tracking-tight leading-none truncate w-full">Rec: {recommend.label}</span>
                      </div>
                    </div>

                    {/* Open suggestions */}
                    {f.improvements && (
                      <div className="bg-secondary/40 dark:bg-secondary/20 p-4 rounded-2xl border border-border/50">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Suggestions:</span>
                        <p className="text-sm italic text-foreground/80 leading-relaxed font-serif">
                          "{f.improvements}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Favorite feature footer */}
                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Favorite Feature:</span>
                    <span className="font-bold text-primary flex items-center gap-1.5 px-3 py-1 bg-primary/5 rounded-full">
                      <Sparkles className="size-3 text-primary" />
                      {f.favoriteFeature || "None Selected"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center rounded-[32px] border border-dashed border-border bg-secondary/20">
              <MessageCircle className="size-12 text-muted-foreground mx-auto mb-4 opacity-25" />
              <h3 className="font-bold text-lg text-foreground">No Feedback Found</h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
                No customer responses match your current search or filters. Try adjusting them.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
