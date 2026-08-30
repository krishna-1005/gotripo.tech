import { useAuth } from "./AuthProvider";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import api from "@/lib/api";

const ADMIN_EMAILS = ["gotripo@gmail.com", "krishkulkarni1005@gmail.com"];

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      console.log("No user found, redirecting to login");
      navigate("/admin/login");
      return;
    }

    const userEmail = user.email?.toLowerCase() || "";
    const isEmailAuthorized = ADMIN_EMAILS.includes(userEmail);
    
    if (!isEmailAuthorized) {
      console.log("Email not in admin list:", userEmail);
      setAuthorized(false);
      return;
    }

    // Verify with backend to ensure role is updated and token is valid for admin routes
    console.log("Verifying admin role with backend...");
    api.get("/admin/whoami")
      .then((res) => {
        console.log("Admin verification success:", res.data);
        setAuthorized(true);
      })
      .catch((err) => {
        console.error("Admin verification failed:", err);
        setError(err.message || "Failed to verify admin status");
        setAuthorized(false);
      });

  }, [user, authLoading, navigate]);

  if (authLoading || (authorized === null && !error)) {
    return (
      <div className="min-h-screen grid place-items-center bg-white dark:bg-slate-950" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="text-center">
          <Loader2 className="size-10 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">Verifying admin credentials...</p>
          <p className="text-[10px] text-slate-400 mt-2">If this takes too long, please try refreshing.</p>
        </div>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen grid place-items-center bg-background p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="size-20 rounded-full bg-destructive/10 text-destructive grid place-items-center mx-auto">
            <ShieldAlert className="size-10" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Access Denied</h1>
            <p className="text-muted-foreground mt-2">
              {error ? `Error: ${error}` : `Your account (${user?.email}) does not have administrative privileges.`}
              <br />Please contact the system owner if you believe this is an error.
            </p>
          </div>
          <button 
            onClick={() => navigate("/")}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg"
          >
            Return to GoTripo
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
