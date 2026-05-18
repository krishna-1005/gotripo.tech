import { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { 
  Trash2, 
  Copy, 
  Save, 
  Zap, 
  Settings2,
  Cpu,
  Server,
  Terminal,
  Sparkles,
  Database,
  ShieldCheck,
  Globe,
  Code2,
  FileCode,
  Bug,
  Play,
  RotateCcw,
  ChevronRight,
  Plus,
  ArrowRightLeft
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export default function BackendAgentPage() {
  return (
    <AdminProtectedRoute>
      <AdminShell>
        <BackendAgent />
      </AdminShell>
    </AdminProtectedRoute>
  );
}

const BACKEND_TYPES = [
  "REST API",
  "Authentication",
  "Database Schema",
  "Middleware",
  "File Upload",
  "Payment Integration"
];

const LANGUAGES = ["Node.js", "Express"];
const DATABASES = ["MongoDB", "PostgreSQL"];

function BackendAgent() {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("REST API");
  const [language, setLanguage] = useState("Express");
  const [db, setDb] = useState("MongoDB");
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState("");
  const [activeTab, setActiveTab] = useState("code");

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a backend prompt");
      return;
    }

    setIsGenerating(true);
    setActiveTab("code");
    
    setTimeout(() => {
      let code = "";
      if (type === "Authentication") {
        code = `const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, email: user.email } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;`;
      } else if (type === "Database Schema") {
        code = `const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  startDate: Date,
  endDate: Date,
  budget: {
    total: Number,
    currency: { type: String, default: 'INR' }
  },
  status: {
    type: String,
    enum: ['planning', 'confirmed', 'completed', 'cancelled'],
    default: 'planning'
  },
  itinerary: [{
    day: Number,
    activities: [{
      title: String,
      location: String,
      time: String
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('trip', TripSchema);`;
      } else {
        code = `// AI Generated ${type} for GoTripo\n// Language: ${language} | DB: ${db}\n\nconst express = require('express');\nconst router = express.Router();\n\nrouter.get('/', (req, res) => {\n  res.json({ message: '${type} endpoint active' });\n});\n\nmodule.exports = router;`;
      }

      setResponse(code);
      setIsGenerating(false);
      toast.success("Backend logic generated!");
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-indigo-500/10 text-indigo-500 grid place-items-center">
              <Server className="size-6" />
            </div>
            Backend Agent
          </h1>
          <p className="text-muted-foreground mt-1">Generate robust APIs, schemas, and server-side logic for GoTripo.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl gap-2 h-11 border-border bg-card">
             <Bug className="size-4" /> Debugger
           </Button>
           <Button className="rounded-xl gap-2 h-11 shadow-lg shadow-indigo-500/20 font-bold px-6 bg-indigo-600 hover:bg-indigo-500">
             <ShieldCheck className="size-4" /> Security Audit
           </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[400px_1fr] gap-6 flex-1 min-h-0">
        {/* Left Panel */}
        <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold flex items-center gap-2">
                <Terminal className="size-4 text-indigo-500" />
                Backend Prompt
              </label>
              <Textarea 
                placeholder="Describe the API or logic (e.g. 'A JWT authentication route with email verification')..."
                className="min-h-[160px] rounded-2xl bg-secondary/20 border-border focus:ring-indigo-500 transition-all resize-none text-base"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Internal Feature Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {BACKEND_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${
                        type === t 
                        ? "bg-indigo-500/10 border-indigo-500 text-indigo-500" 
                        : "bg-secondary/30 border-transparent text-muted-foreground hover:bg-secondary/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="rounded-xl bg-secondary/30 border-transparent h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Database</label>
                  <Select value={db} onValueChange={setDb}>
                    <SelectTrigger className="rounded-xl bg-secondary/30 border-transparent h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATABASES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleGenerate} 
              className="w-full rounded-2xl h-12 text-base font-bold shadow-lg shadow-indigo-500/20 gap-2 bg-indigo-600 hover:bg-indigo-500"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RotateCcw className="size-5 animate-spin" />
                  Generating Architecture...
                </>
              ) : (
                <>
                  <Zap className="size-5 fill-current" />
                  Generate Logic
                </>
              )}
            </Button>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
             <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                <FileCode className="size-4 text-indigo-500" />
                Backend Templates
             </h4>
             <div className="space-y-2">
                {["Auth Middleware", "S3 Image Upload", "Stripe Checkout", "Rate Limiter"].map((t, i) => (
                   <button key={i} className="w-full text-left p-3 rounded-xl bg-secondary/30 hover:bg-indigo-500/10 hover:text-indigo-500 transition-all text-xs font-medium border border-transparent hover:border-indigo-500/20 flex items-center justify-between group">
                      {t}
                      <ChevronRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </button>
                ))}
             </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-4 h-full min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-secondary/30 p-1 rounded-xl h-12">
                <TabsTrigger value="code" className="rounded-lg px-6 font-bold data-[state=active]:bg-card">Logic</TabsTrigger>
                <TabsTrigger value="test" className="rounded-lg px-6 font-bold data-[state=active]:bg-card">API Test</TabsTrigger>
                <TabsTrigger value="schema" className="rounded-lg px-6 font-bold data-[state=active]:bg-card">DB Map</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] h-6 border-indigo-500/30 text-indigo-500 bg-indigo-500/5">
                  v1.4.2-stable
                </Badge>
              </div>
            </div>

            <div className="flex-1 rounded-3xl border border-border bg-slate-950 flex flex-col overflow-hidden shadow-2xl relative">
              <TabsContent value="code" className="flex-1 m-0 flex flex-col h-full overflow-hidden">
                <div className="h-10 border-b border-white/5 bg-white/5 flex items-center justify-between px-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <Globe className="size-3.5 text-indigo-400" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">server/routes/api.js</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="size-7 text-slate-400 hover:text-white" onClick={() => toast.success("Copied!")}>
                      <Copy className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-7 text-slate-400 hover:text-white">
                      <Save className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-6 font-mono text-sm">
                    {response ? (
                      <pre className="text-slate-300">
                        <code>{response}</code>
                      </pre>
                    ) : (
                      <div className="h-[400px] flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50">
                        <Terminal className="size-12" />
                        <p>Backend logic will appear here</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="test" className="flex-1 m-0 flex flex-col h-full bg-slate-900 overflow-hidden">
                 <div className="p-6 space-y-6">
                    <div className="rounded-2xl bg-slate-950 border border-white/10 p-4 flex items-center gap-4">
                       <Badge className="bg-emerald-500 hover:bg-emerald-600">POST</Badge>
                       <code className="text-sm text-slate-400 flex-1">/api/v1/auth/login</code>
                       <Button size="sm" className="bg-indigo-600 gap-2"><Play className="size-3.5" /> Send Request</Button>
                    </div>

                    <div className="grid grid-cols-2 gap-6 h-[400px]">
                       <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Request Body</label>
                          <div className="flex-1 rounded-2xl bg-slate-950 border border-white/10 p-4 font-mono text-xs text-indigo-400">
                            {"{\n  \"email\": \"admin@gotripo.com\",\n  \"password\": \"********\"\n}"}
                          </div>
                       </div>
                       <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Response</label>
                          <div className="flex-1 rounded-2xl bg-slate-950 border border-white/10 p-4 font-mono text-xs text-emerald-400">
                            {"{\n  \"status\": 200,\n  \"success\": true,\n  \"token\": \"eyJhbGciOiJIUzI1Ni...\"\n}"}
                          </div>
                       </div>
                    </div>
                 </div>
              </TabsContent>

              {isGenerating && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50">
                   <div className="flex flex-col items-center gap-6">
                      <div className="relative">
                        <div className="size-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 text-indigo-500 animate-pulse" />
                      </div>
                      <div className="flex flex-col items-center gap-1 text-center">
                        <span className="text-lg font-display font-bold text-white tracking-tight">Deploying Neural Backend</span>
                        <span className="text-sm text-slate-500 animate-pulse">Initializing serverless functions...</span>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </Tabs>

          <div className="grid grid-cols-3 gap-3">
             <Button variant="outline" className="rounded-xl h-12 bg-card border-border hover:bg-secondary font-bold gap-2">
                <Database className="size-4" /> Migration Script
             </Button>
             <Button variant="outline" className="rounded-xl h-12 bg-card border-border hover:bg-secondary font-bold gap-2">
                <ArrowRightLeft className="size-4" /> Type definitions
             </Button>
             <Button className="rounded-xl h-12 bg-indigo-600 hover:bg-indigo-500 font-bold shadow-lg shadow-indigo-500/20 gap-2">
                <Plus className="size-4" /> Push to Repository
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
