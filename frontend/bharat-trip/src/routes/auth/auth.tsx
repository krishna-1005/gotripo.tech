import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, Mail, Lock, ArrowRight, ChevronLeft, User as UserIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import heroImg from "@/assets/hero-jaipur.jpg";
import { auth } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";
import { useAuth } from "@/components/AuthProvider";
import { Logo } from "@/components/Logo";

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(72);
const nameSchema = z.string().trim().min(1, "Name is required").max(80);

type Mode = "signin" | "signup";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { user, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect away if already signed in
  useEffect(() => {
    if (!authLoading && user) {
      navigate(redirect ?? "/dashboard");
    }
  }, [user, authLoading, navigate, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // Validate
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.issues[0].message);
      return;
    }
    const pwResult = passwordSchema.safeParse(password);
    if (!pwResult.success) {
      toast.error(pwResult.error.issues[0].message);
      return;
    }
    if (mode === "signup") {
      const nameResult = nameSchema.safeParse(name);
      if (!nameResult.success) {
        toast.error(nameResult.error.issues[0].message);
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, emailResult.data, pwResult.data);
        await updateProfile(userCredential.user, {
          displayName: name.trim(),
        });
        toast.success("Welcome to GoTripo!");
      } else {
        await signInWithEmailAndPassword(auth, emailResult.data, pwResult.data);
        toast.success("Welcome back!");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let friendly = "Something went wrong";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        friendly = "Invalid email or password. If you usually use Google, try that instead.";
      } else if (err.code === "auth/email-already-in-use") {
        friendly = "An account with this email already exists. Sign in instead.";
      } else if (err.code === "auth/too-many-requests") {
        friendly = "Too many failed attempts. Please try again later or reset your password.";
      } else {
        friendly = err.message;
      }
      toast.error(friendly);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error("Please enter your email address first to reset your password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, emailResult.data);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    }
  };

  const handleGoogle = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Welcome to GoTripo!");
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="flex flex-col p-8 lg:p-14">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" /> Back home
        </Link>

        <div className="flex-1 grid place-items-center">
          <div className="w-full max-w-md">
            <Logo className="mb-8" />

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="mt-8 font-display font-bold text-4xl tracking-tight">
                  {mode === "signin" ? "Welcome back, traveller." : "Start your journey."}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {mode === "signin"
                    ? "Sign in to continue planning your next adventure."
                    : "Create your free GoTripo account in seconds."}
                </p>
              </motion.div>
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {mode === "signup" && (
                <label className="block">
                  <span className="text-sm font-medium">Full name</span>
                  <div className="mt-1.5 relative">
                    <UserIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Aarav Raman"
                      maxLength={80}
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-surface focus:border-ring outline-none text-sm transition"
                    />
                  </div>
                </label>
              )}

              <label className="block">
                <span className="text-sm font-medium">Email</span>
                <div className="mt-1.5 relative">
                  <Mail className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gotripo.com"
                    maxLength={255}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-surface focus:border-ring outline-none text-sm transition"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-medium">Password</span>
                <div className="mt-1.5 relative">
                  <Lock className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    maxLength={72}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-surface focus:border-ring outline-none text-sm transition"
                  />
                </div>
                {mode === "signup" ? (
                  <span className="text-xs text-muted-foreground mt-1.5 block">
                    Minimum 8 characters
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-primary font-medium mt-1.5 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl bg-warm-gradient text-white font-semibold shadow-cta inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    {mode === "signin" ? "Sign in" : "Create account"} <ArrowRight className="size-4" />
                  </>
                )}
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center"><span className="px-3 bg-background text-xs text-muted-foreground">or continue with</span></div>
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={submitting}
                className="w-full h-11 rounded-xl border border-border bg-surface text-sm font-semibold hover:bg-secondary transition inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <svg className="size-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>

              <p className="text-center text-sm text-muted-foreground mt-4">
                {mode === "signin" ? "New to GoTripo?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  className="text-primary font-semibold hover:underline"
                >
                  {mode === "signin" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative">
        <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover" width={1600} height={1100} />
        <div className="absolute inset-0 bg-hero-gradient opacity-85" />
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div className="relative h-full flex flex-col justify-end p-14 text-white">
          <div className="glass rounded-2xl px-3 py-1.5 text-xs inline-flex items-center gap-2 w-fit">
            <Sparkles className="size-3.5 text-accent" /> AI travel co-pilot
          </div>
          <h2 className="mt-6 font-display font-bold text-5xl leading-tight tracking-tight text-balance">
            Your next trip,<br />
            <span className="bg-warm-gradient bg-clip-text text-transparent">already half-planned.</span>
          </h2>
          <p className="mt-4 text-white/80 max-w-md">
            Sign in to pick up where you left off, share itineraries with friends, and let GoTripo handle the boring bits.
          </p>
        </div>
      </div>
    </div>
  );
}
