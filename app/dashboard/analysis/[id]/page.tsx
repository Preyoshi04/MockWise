"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Target,
  Cpu,
  Zap,
  ShieldCheck,
  Terminal,
  Activity,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function AnalysisPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) return;
      const docRef = doc(db, "interviews", id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setData(docSnap.data());
      }
      setLoading(false);
    };
    fetchAnalysis();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-white">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 border-t-2 border-indigo-500 rounded-full animate-spin" />
          <Cpu className="h-6 w-6 text-indigo-400 animate-pulse" />
        </div>
        <p className="mt-8 text-zinc-500 font-mono text-sm tracking-widest uppercase">
          Getting your analysis ready...
        </p>
      </div>
    );
  }

  if (!data)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        NO INTERVIEW DATA FOUND. PLEASE GIVE AN INTERVIEW TO GENERATE ANALYSIS.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Navigation */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4 -ml-4 text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all gap-2 font-mono text-xs uppercase tracking-tighter"
            >
              <ArrowLeft size={14} /> Go Back To Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Activity className="text-indigo-500 h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white uppercase">
                  {data.role}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Badge
              variant="outline"
              className="border-emerald-500/20 bg-emerald-500/5 text-emerald-500 font-mono"
            >
              COMPLETED
            </Badge>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Main Score Module */}
          <div className="md:col-span-4 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Circular Progress (SVG) */}
            <div className="relative h-48 w-48 flex items-center justify-center mb-6">
              <svg className="h-full w-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-zinc-800"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={552.92}
                  strokeDashoffset={552.92 - (552.92 * data.score) / 100}
                  className="text-indigo-500 transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-white">
                  {data.score}%
                </span>
                <span className="text-[10px] font-mono text-zinc-500 tracking-tighter uppercase">
                  Overall Score
                </span>
              </div>
            </div>

            <div className="w-full space-y-3">
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase">
                <span>Tech Confidence</span>
                <span>{data.score > 70 ? "High" : "Medium"}</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500"
                  style={{ width: `${data.score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Metadata & Quick Stats */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between">
              <ShieldCheck className="text-indigo-500 h-6 w-6 mb-4" />
              <div>
                <h4 className="text-zinc-500 text-xs font-mono uppercase mb-1">
                  EXPERIENCE LEVEL
                </h4>
                <p className="text-xl font-bold text-white uppercase">
                  {data.level}
                </p>
              </div>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between">
              <Terminal className="text-zinc-500 h-6 w-6 mb-4" />
              <div>
                <h4 className="text-zinc-500 text-xs font-mono uppercase mb-1">
                  TECHSTACK
                </h4>
                <p className="text-lg font-semibold text-white truncate">
                  {data.techStack || data.techstack}
                </p>
              </div>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:col-span-2 flex items-center justify-between group cursor-default">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="text-white font-bold">Improvement Strategy</h4>
                  <p className="text-zinc-500 text-xs font-mono">
                    AI generated growth roadmap
                  </p>
                </div>
              </div>
              <ChevronRight className="text-zinc-700" />
            </div>
          </div>

          {/* The Neural Report (The Feedback) */}
          <div className="md:col-span-12 mt-4 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
            <div className="px-8 py-6 border-b border-zinc-800 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400">
                YOUR FEEDBACK
              </h2>
            </div>

            <div className="p-8 md:p-12">
              <div className="max-w-3xl">
                <p className="text-xl md:text-2xl text-zinc-200 font-medium leading-relaxed mb-12">
                  {data.feedback}
                </p>

                <div className="border-t border-zinc-800 pt-12">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Target size={18} className="text-emerald-500" />
                      <h3 className="text-white font-bold tracking-tight">
                        What you nailed
                      </h3>
                    </div>
                    <p className="text-zinc-400 text-sm font-semibold leading-7">
                      Your explanation of the {data.role} workflow felt
                      incredibly authentic. You have a great way of breaking
                      down complex logic without getting lost in the weeds—it's
                      a rare skill that makes you stand out as a {data.level}{" "}
                      candidate.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Branding */}
        <footer className="py-20 border-t border-slate-900 text-center">
          <p className="text-slate-300 text-sm font-bold tracking-[0.4em] uppercase">
            Build for the future of hiring
          </p>
          <p className="text-slate-300 text-xs font-bold tracking-[0.4em] uppercase">
            &copy; 2026 MockWise
          </p>
        </footer>
      </div>
    </div>
  );
}
