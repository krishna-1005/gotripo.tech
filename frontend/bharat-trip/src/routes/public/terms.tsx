import { AppShell } from "@/components/AppShell";
import { MarketingNav } from "@/components/MarketingNav";
import { useAuth } from "@/components/AuthProvider";
import { Footer } from "@/components/Footer";
import { Scale, CheckCircle, AlertCircle, Info } from "lucide-react";

export default function Terms() {
  const { user } = useAuth();

  const content = (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Scale className="size-4" />
          <span>Terms of Service</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 tracking-tight">
          Rules of the <span className="bg-warm-gradient bg-clip-text text-transparent">road</span>
        </h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Info className="size-6 text-primary" /> 1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using GoTripo, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our platform. We reserve the right to modify these terms at any time, and your continued use of GoTripo constitutes acceptance of those changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <CheckCircle className="size-6 text-primary" /> 2. User Responsibilities
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to use GoTripo only for lawful purposes and in a way that does not infringe the rights of others.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <AlertCircle className="size-6 text-primary" /> 3. AI-Generated Content
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              While our AI strives for accuracy, the itineraries and suggestions provided by GoTripo are for informational purposes only. You are responsible for verifying all travel details, including bookings, opening hours, and safety information, before your trip.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Scale className="size-6 text-primary" /> 4. Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              GoTripo is provided "as is" without any warranties. We shall not be liable for any damages arising out of your use of the platform or your reliance on the information provided, including any travel-related issues or cancellations.
            </p>
          </section>

          <section className="bg-surface border border-border rounded-3xl p-8 mt-12">
            <h3 className="text-xl font-bold mb-4">Need clarification on our terms?</h3>
            <p className="text-muted-foreground mb-6">
              Our legal team is here to help you understand your rights and responsibilities when using GoTripo.
            </p>
            <button className="px-6 py-3 rounded-xl bg-secondary text-foreground font-bold hover:bg-secondary/80 transition">
              Review Full Legal Docs
            </button>
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
