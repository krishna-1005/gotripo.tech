import { AppShell } from "@/components/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  CreditCard, 
  Trash2, 
  ChevronRight, 
  Save, 
  Loader2,
  Mail,
  Lock,
  Smartphone,
  Globe,
  Heart
} from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

function SettingsContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [budget, setBudget] = useState("medium");
  const [interests, setInterests] = useState<string[]>([]);
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [tripReminders, setTripReminders] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/profile");
        const u = res.data.user;
        setProfileData(u);
        setName(u.name || "");
        setBio(u.bio || "");
        setBudget(u.preferences?.preferredBudget || "medium");
        setInterests(u.preferences?.interests || []);
        setEmailNotifications(u.preferences?.emailAlerts ?? true);
        setTripReminders(u.preferences?.tripReminders ?? true);
      } catch (err) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/profile", { 
        name, 
        bio,
        preferences: {
          ...profileData?.preferences,
          preferredBudget: budget,
          interests,
          emailAlerts: emailNotifications,
          tripReminders: tripReminders
        }
      });
      toast.success("Settings saved successfully");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="px-4 lg:px-10 py-8 max-w-4xl mx-auto space-y-10">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="grid gap-8">
            {[1, 2, 3].map(i => (
              <section key={i} className="space-y-4">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-48 rounded-3xl w-full" />
              </section>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-4 lg:px-10 py-8 max-w-4xl mx-auto space-y-10">
        <div>
          <h1 className="font-display font-bold text-3xl tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences and travel settings.</p>
        </div>

        <div className="grid gap-8">
          {/* Profile Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 font-display font-bold text-xl">
              <User className="size-5 text-primary" /> Personal Information
            </div>
            <div className="rounded-3xl bg-card border border-border p-6 shadow-soft space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Display Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Email Address</label>
                  <div className="w-full bg-secondary/50 text-muted-foreground cursor-not-allowed rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                    <Mail className="size-4" /> {user?.email}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Bio</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px] resize-none"
                  placeholder="Tell us about your travel style..."
                />
              </div>
            </div>
          </section>

          {/* Travel Preferences */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 font-display font-bold text-xl">
              <Heart className="size-5 text-accent" /> Travel Preferences
            </div>
            <div className="rounded-3xl bg-card border border-border p-6 shadow-soft space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Budget Level</label>
                <div className="flex gap-2">
                  {["low", "medium", "high"].map(b => (
                    <button
                      key={b}
                      onClick={() => setBudget(b)}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all ${
                        budget === b 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {["Nature", "Culture", "Adventure", "History", "Food", "Spiritual", "Relaxation", "Photography"].map(tag => {
                    const active = interests.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          if (active) setInterests(interests.filter(t => t !== tag));
                          else setInterests([...interests, tag]);
                        }}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                          active 
                            ? "bg-primary text-primary-foreground shadow-md" 
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 font-display font-bold text-xl">
              <Bell className="size-5 text-primary" /> Notifications
            </div>
            <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-soft">
              <div className="p-4 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 text-primary grid place-items-center">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Email Notifications</div>
                    <div className="text-xs text-muted-foreground">Receive trip updates via email.</div>
                  </div>
                </div>
                <Toggle active={emailNotifications} onToggle={setEmailNotifications} />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 text-primary grid place-items-center">
                    <Smartphone className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Trip Reminders</div>
                    <div className="text-xs text-muted-foreground">Receive alerts for upcoming journeys.</div>
                  </div>
                </div>
                <Toggle active={tripReminders} onToggle={setTripReminders} />
              </div>
            </div>
          </section>

          {/* Account Security */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 font-display font-bold text-xl">
              <Shield className="size-5 text-primary" /> Security
            </div>
            <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-soft">
              <button className="w-full p-4 flex items-center justify-between hover:bg-secondary transition border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-secondary grid place-items-center">
                    <Lock className="size-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">Change Password</div>
                    <div className="text-xs text-muted-foreground">Update your account credentials.</div>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
              <button className="w-full p-4 flex items-center justify-between hover:bg-destructive/5 transition text-destructive group">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-destructive/10 text-destructive grid place-items-center">
                    <Trash2 className="size-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">Delete Account</div>
                    <div className="text-xs text-destructive/70">Permanently remove all your data.</div>
                  </div>
                </div>
                <ChevronRight className="size-4 text-destructive/70 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </section>

          {/* Appearance */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 font-display font-bold text-xl">
              <Palette className="size-5 text-primary" /> Appearance
            </div>
            <div className="rounded-3xl bg-card border border-border p-6 shadow-soft flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Interface Theme</div>
                <div className="text-xs text-muted-foreground">Switch between light and dark mode.</div>
              </div>
              <ThemeToggle />
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg hover:shadow-xl hover:opacity-90 transition flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Toggle({ active, onToggle }: { active: boolean; onToggle: (a: boolean) => void }) {
  return (
    <button 
      onClick={() => onToggle(!active)}
      className={`w-11 h-6 rounded-full transition-colors relative ${active ? "bg-primary" : "bg-secondary"}`}
    >
      <div className={`absolute top-1 size-4 rounded-full bg-white transition-all shadow-sm ${active ? "left-6" : "left-1"}`} />
    </button>
  );
}
