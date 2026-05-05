import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Loader2, User, Quote, ArrowRight } from "lucide-react";
import { fetchReviews, postReview } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { FadeUp, StaggerGroup, StaggerItem } from "@/components/motion/primitives";

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export function ReviewSection() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [name, setName] = useState(user?.displayName || "");

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    if (user?.displayName && !name) {
      setName(user.displayName);
    }
  }, [user]);

  const loadReviews = async () => {
    try {
      const data = await fetchReviews();
      setReviews(data);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to give feedback");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setSubmitting(true);
    try {
      const newReview = await postReview({ rating, comment, name: name || "Anonymous" });
      setReviews((prev) => [newReview, ...prev]);
      setComment("");
      setRating(5);
      toast.success("Thank you for your feedback!");
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative max-w-7xl mx-auto px-6 lg:px-10 py-32 border-t border-border/50 overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-1/4 size-[500px] bg-accent/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-1/4 size-[500px] bg-primary/5 blur-[120px] rounded-full -z-10" />

      <div className="grid lg:grid-cols-12 gap-16 lg:gap-24">
        {/* Left Column: Reviews List */}
        <div className="lg:col-span-7">
          <div className="space-y-2 mb-12">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.4em]">Community Feedback</span>
              <div className="h-[1px] w-8 bg-accent/40" />
            </div>
            <h2 className="font-display font-bold text-5xl md:text-7xl tracking-tighter text-foreground">
              What our explorers say
            </h2>
          </div>

          <div className="space-y-6 max-h-[750px] overflow-y-auto pr-6 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="size-10 text-accent animate-spin" />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Synchronizing Stories</p>
              </div>
            ) : reviews.length > 0 ? (
              <StaggerGroup gap={0.1}>
                <AnimatePresence mode="popLayout">
                  {reviews.map((review) => (
                    <StaggerItem key={review._id}>
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative p-8 rounded-[40px] bg-card/40 backdrop-blur-md border border-border/50 shadow-soft group hover:shadow-card hover:bg-card/60 hover:border-accent/30 transition-all duration-500 overflow-hidden"
                      >
                        {/* Quote mark as subtle watermark */}
                        <Quote className="absolute -bottom-6 -right-6 size-32 text-accent/5 -z-0 group-hover:text-accent/10 group-hover:rotate-12 transition-all duration-700" />
                        
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                              <div className="size-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-display font-bold text-lg text-accent shadow-inner">
                                {review.userName?.[0]?.toUpperCase() || "U"}
                              </div>
                              <div>
                                <div className="font-bold text-sm tracking-tight text-foreground group-hover:text-accent transition-colors uppercase">
                                  {review.userName}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 opacity-60">
                                  {new Date(review.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`size-3.5 ${
                                    i < review.rating ? "fill-accent text-accent" : "text-muted-foreground/10"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <div className="relative">
                            <p className="text-foreground/90 text-xl leading-relaxed font-medium italic">
                              "{review.comment}"
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </AnimatePresence>
              </StaggerGroup>
            ) : (
              <div className="text-center py-24 bg-muted/10 rounded-[48px] border border-dashed border-border/50">
                <Star className="size-10 text-accent/20 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">The journal is empty. Start the first page.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Feedback Form */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-10 md:p-12 rounded-[48px] border border-border shadow-pop bg-card relative overflow-hidden"
            >
              {/* Decorative Glow */}
              <div className="absolute -top-24 -right-24 size-64 bg-accent/10 blur-[80px] rounded-full" />
              <div className="absolute -bottom-24 -left-24 size-64 bg-primary/5 blur-[80px] rounded-full" />
              
              <div className="relative z-10">
                <div className="size-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-8 shadow-sm">
                  <Send className="size-6" />
                </div>

                <h3 className="font-display font-bold text-4xl mb-3 tracking-tight">Share your vibe</h3>
                <p className="text-muted-foreground text-lg mb-10 text-balance leading-relaxed">
                  Your journey inspires our next update. Tell us what we nailed or where we can fly higher.
                </p>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">The Energy Level</label>
                    <div className="flex gap-3 bg-secondary/50 p-2 rounded-2xl w-fit border border-border/50">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className="relative p-2 transition-all active:scale-90 group/star"
                        >
                          <Star
                            className={`size-8 transition-all duration-300 ${
                              s <= rating 
                                ? "fill-accent text-accent scale-110 drop-shadow-[0_0_8px_rgba(5,150,105,0.4)]" 
                                : "text-muted-foreground/20 group-hover/star:text-accent/40"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Explorer Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your alias..."
                      className="h-14 rounded-2xl border-border/50 bg-secondary/30 backdrop-blur-sm focus:ring-accent focus:border-accent text-lg px-6"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">The Experience</label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write your story..."
                      className="min-h-[140px] rounded-3xl border-border/50 bg-secondary/30 backdrop-blur-sm resize-none focus:ring-accent focus:border-accent text-lg p-6 leading-relaxed"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:scale-[1.02] transition-all shadow-lg active:scale-[0.98] group"
                  >
                    {submitting ? (
                      <Loader2 className="size-6 animate-spin" />
                    ) : (
                      <>
                        Broadcast Feedback 
                        <ArrowRight className="ml-3 size-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>

                {!user && (
                  <div className="mt-8 p-4 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center gap-2">
                    <div className="size-2 rounded-full bg-accent animate-pulse" />
                    <p className="text-xs font-bold text-accent uppercase tracking-widest">
                      Login required to post
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
