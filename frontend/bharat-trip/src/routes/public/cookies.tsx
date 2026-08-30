import { AppShell } from "@/components/AppShell";
import { MarketingNav } from "@/components/MarketingNav";
import { useAuth } from "@/components/AuthProvider";
import { Footer } from "@/components/Footer";
import { Cookie, Info, Settings, ShieldCheck } from "lucide-react";

export default function Cookies() {
  const { user } = useAuth();

  const content = (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Cookie className="size-4" />
          <span>Cookie Policy</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 tracking-tight">
          How we use <span className="bg-warm-gradient bg-clip-text text-transparent">cookies</span>
        </h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Info className="size-6 text-primary" /> 1. What are Cookies?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are stored on your device when you visit a website. They help us remember your preferences, keep you logged in, and understand how you use our platform so we can make it better.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <ShieldCheck className="size-6 text-primary" /> 2. Types of Cookies We Use
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-surface border border-border">
                <h4 className="font-bold mb-1">Essential Cookies</h4>
                <p className="text-sm text-muted-foreground">Necessary for the website to function, such as authentication and security.</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface border border-border">
                <h4 className="font-bold mb-1">Preference Cookies</h4>
                <p className="text-sm text-muted-foreground">Remember your settings like language, theme, and travel preferences.</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface border border-border">
                <h4 className="font-bold mb-1">Analytics Cookies</h4>
                <p className="text-sm text-muted-foreground">Help us understand how visitors interact with the site by collecting anonymous data.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Settings className="size-6 text-primary" /> 3. Managing Your Cookies
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Most web browsers allow you to control cookies through their settings. You can choose to block or delete cookies, but please note that some features of GoTripo may not function correctly if you disable essential cookies.
            </p>
          </section>

          <section className="bg-surface border border-border rounded-3xl p-8 mt-12">
            <h3 className="text-xl font-bold mb-4">Cookie Preferences</h3>
            <p className="text-muted-foreground mb-6">
              You can adjust your cookie settings at any time. Your preferences will be saved for your next visit.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition">
                Accept All Cookies
              </button>
              <button className="px-6 py-3 rounded-xl bg-secondary text-foreground font-bold hover:bg-secondary/80 transition">
                Manage Preferences
              </button>
            </div>
          </section>
        </div>
      </div>
      {!user && <Footer />}
    </div>
  );

  if (user) {
    return <AppShell>{content}</AppShell>;
  }

  return (
    <>
      <MarketingNav />
      {content}
    </>
  );
}
