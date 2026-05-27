import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { AdminShell } from "@/components/AdminShell";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Users, 
  Map, 
  Sparkles, 
  MessageSquare, 
  ArrowUpRight, 
  TrendingUp, 
  Activity,
  UserCheck,
  MousePointer2,
  Loader2,
  RefreshCw,
  Globe,
  Mail,
  Send
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  return (
    <AdminProtectedRoute>
      <AdminDashboard />
    </AdminProtectedRoute>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);

  useEffect(() => {
    api.get("/admin/stats")
      .then(res => setStats(res.data))
      .catch(err => console.error("Stats fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleBroadcastDigest = async () => {
    if (!confirm("Are you sure you want to broadcast the Weekly Travel Digest to ALL eligible users?")) return;
    
    setBroadcasting(true);
    try {
      const res = await api.post("/admin/broadcast-digest");
      toast.success(`Broadcast successful! Sent to ${res.data.count} users.`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Broadcast failed");
    } finally {
      setBroadcasting(false);
    }
  };

  if (loading) {
    return (
      <AdminShell>
        <div className="space-y-8">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-[400px] rounded-3xl" />
              <Skeleton className="h-[400px] rounded-3xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 rounded-3xl" />
              <Skeleton className="h-[400px] rounded-3xl" />
            </div>
          </div>
        </div>
      </AdminShell>
    );
  }

  const s = stats?.summary || {};
  const chartData = stats?.growthChart || [];

  const chartConfig = {
    plans: {
      label: "Plans Generated",
      color: "hsl(var(--primary))",
    },
    users: {
      label: "New Users",
      color: "hsl(var(--accent))",
    },
  };

  return (
    <AdminShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">System Overview</h1>
            <p className="text-muted-foreground mt-1">Real-time performance and user engagement metrics.</p>
          </div>
          <button 
            onClick={handleBroadcastDigest}
            disabled={broadcasting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-70"
          >
            {broadcasting ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
            {broadcasting ? "Broadcasting..." : "Broadcast Weekly Digest"}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Total Visitors" 
            value={s.totalUniqueVisitors} 
            icon={Globe} 
            trend="+15%" 
            color="bg-blue-600" 
          />
          <StatCard 
            label="Today's Traffic" 
            value={s.todayUniqueVisitors} 
            icon={Activity} 
            trend="Real-time" 
            color="bg-orange-500" 
          />
          <StatCard 
            label="Plans Generated" 
            value={s.totalPlansGenerated} 
            icon={Sparkles} 
            trend="+24%" 
            color="bg-purple-500" 
          />
          <StatCard 
            label="User Conversion" 
            value={s.totalConversions} 
            icon={TrendingUp} 
            trend="+8%" 
            color="bg-indigo-500" 
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Activity Chart Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <div className="font-display font-bold text-lg">Growth & Engagement</div>
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    Last 7 Days <ArrowUpRight className="size-3" />
                  </div>
               </div>
               <div className="h-[300px] w-full">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPlans" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-plans)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--color-plans)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                        tickFormatter={(str) => {
                          const d = new Date(str);
                          return d.toLocaleDateString("en-IN", { weekday: 'short' });
                        }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="plans" 
                        stroke="var(--color-plans)" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorPlans)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="users" 
                        stroke="var(--color-users)" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorUsers)" 
                      />
                    </AreaChart>
                  </ChartContainer>
               </div>
            </div>

            {/* Recent Activity Table */}
            <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border flex items-center justify-between">
                   <div className="font-display font-bold text-lg">Live Activity Feed</div>
                   <Activity className="size-4 text-primary" />
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-secondary/50 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                         <tr>
                            <th className="px-6 py-4">User / IP</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                         {stats?.recentActivityLogs?.map((log: any, i: number) => (
                           <tr key={i} className="hover:bg-secondary/20 transition">
                              <td className="px-6 py-4 font-medium">
                                {log.userId?.email || log.ipAddress || "Unknown"}
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                                  {log.action?.replace(/_/g, " ")}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-muted-foreground">
                                {new Date(log.createdAt).toLocaleTimeString()}
                              </td>
                              <td className="px-6 py-4 text-emerald-500 font-bold">OK</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
             <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-display font-bold text-lg mb-4">Retention Breakdown</h3>
                <div className="space-y-4">
                   <TrafficItem label="Returning Users" value={s.returningUsersCount} icon={UserCheck} color="text-emerald-500" />
                   <TrafficItem label="Returning Guests" value={s.returningGuestsCount} icon={RefreshCw} color="text-amber-500" />
                   <TrafficItem label="Guest Sessions" value={s.guestCount} icon={MousePointer2} color="text-orange-500" />
                   <TrafficItem label="Registered Users" value={s.totalRegisteredUsers} icon={Users} color="text-blue-500" />
                   <TrafficItem label="Monthly Active" value={s.mauCount} icon={Activity} color="text-purple-500" />
                </div>
             </div>

             <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-display font-bold text-lg mb-4">Newest Users</h3>
                <div className="space-y-4">
                   {stats?.recentRegisteredUsers?.map((user: any) => (
                     <div key={user._id} className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-secondary grid place-items-center font-bold text-sm">
                           {user.name?.[0] || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="font-bold truncate text-sm">{user.name}</div>
                           <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(user.createdAt).toLocaleDateString()}</div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value, icon: Icon, trend, color }: any) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div className={`size-12 rounded-2xl ${color} text-white grid place-items-center shadow-lg`}>
          <Icon className="size-6" />
        </div>
        <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
          {trend}
        </div>
      </div>
      <div className="mt-5">
        <div className="text-2xl font-display font-bold tracking-tight">{value?.toLocaleString() || 0}</div>
        <div className="text-sm text-muted-foreground font-medium">{label}</div>
      </div>
    </div>
  );
}

function TrafficItem({ label, value, icon: Icon, color }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30">
       <div className="flex items-center gap-3">
          <Icon className={`size-4 ${color}`} />
          <span className="text-sm font-medium">{label}</span>
       </div>
       <span className="font-bold">{value || 0}</span>
    </div>
  );
}
