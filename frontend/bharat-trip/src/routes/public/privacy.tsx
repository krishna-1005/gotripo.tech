import { AppShell } from "@/components/AppShell";
import { MarketingNav } from "@/components/MarketingNav";
import { useAuth } from "@/components/AuthProvider";
import { Footer } from "@/components/Footer";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function Privacy() {
  const { user } = useAuth();

  const content = (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Shield className="size-4" />
          <span>Privacy Policy</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 tracking-tight">
          Your privacy is our <span className="bg-warm-gradient bg-clip-text text-transparent">priority</span>
        </h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Eye className="size-6 text-primary" /> 1. Information We Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              At GoTripo, we collect information to provide better services to all our users. This includes information you provide to us (like your name, email address, and travel preferences) and information we collect automatically when you use our platform (like your IP address, device type, and how you interact with our website).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Lock className="size-6 text-primary" /> 2. How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect to operate, maintain, and improve our services, to develop new ones, and to protect GoTripo and our users. For example, your travel preferences help our AI generate more relevant itineraries for you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Shield className="size-6 text-primary" /> 3. Data Security
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We work hard to protect GoTripo and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold. We use industry-standard encryption and security practices to keep your data safe.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <FileText className="size-6 text-primary" /> 4. Your Rights
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to access, update, or delete your personal information at any time. You can manage your account settings directly within the GoTripo dashboard or contact our support team for assistance.
            </p>
          </section>

          <section className="bg-surface border border-border rounded-3xl p-8 mt-12">
            <h3 className="text-xl font-bold mb-4">Questions about our privacy policy?</h3>
            <p className="text-muted-foreground mb-6">
              If you have any questions or concerns regarding our privacy practices, please don't hesitate to reach out to our privacy team.
            </p>
            <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition">
              Contact Privacy Team
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
