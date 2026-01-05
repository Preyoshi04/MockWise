"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import Link from "next/link";
import Cookies from "js-cookie";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LogOut, PlusCircle, History, Trophy, ChevronRight, User, Loader2, Globe, Zap } from "lucide-react";
import Image from "next/image";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { userData, loadingg } = useUser();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [communityStats, setCommunityStats] = useState({ avgScore: 0, topStack: "Next.js" });

  // 1. Improved Redirect Logic
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setFetching(true);
      try {
        const q = query(collection(db, "interviews"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        setInterviews(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const cq = query(collection(db, "interviews"), limit(50));
        const cSnapshot = await getDocs(cq);
        const cDocs = cSnapshot.docs.map(d => d.data());
        if (cDocs.length > 0) {
          const total = cDocs.reduce((acc, curr: any) => acc + (Number(curr.score) || 0), 0);
          setCommunityStats({
            avgScore: Math.round(total / cDocs.length),
            topStack: (cDocs[0] as any).techStack || "Next.js",
          });
        }
      } catch (err: any) {
        console.error("Data Error:", err.message);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [user]);

  // 2. "Clean Slate" Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Cookies.remove("session");
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/"; // Force refresh to clear all states
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading || !user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-4" />
        <p className="text-zinc-500 animate-pulse font-medium">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans">
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-black rotate-45" />
            </div>
            <h1 className="text-xl font-bold tracking-tighter text-white">MockWise</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-zinc-400 text-sm border-r border-zinc-800 pr-6">
              <User size={14} />
              <span className="font-medium text-zinc-200">
                {userData?.name || "Developer"}
              </span>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10 gap-2 transition-all">
              <LogOut size={16} />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        <section className="flex flex-col md:flex-row items-center gap-10 p-8 md:p-16 bg-gradient-to-br from-zinc-900 to-black rounded-[2.5rem] border border-zinc-800 relative group overflow-hidden">
          <div className="flex-1 relative z-10">
            <Badge className="mb-4 bg-white text-black hover:bg-zinc-200 py-1 px-4">AI-Powered Analysis</Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white leading-tight">
              Ready to land your <br />
              <span className="text-zinc-500 italic font-serif">dream job?</span>
            </h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-md">
              Start a realistic mock interview. Get instant feedback on your tone, technical skills, and confidence.
            </p>
            <Button size="lg" onClick={() => router.push("/interview")} className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 py-6 text-md font-bold transition-transform active:scale-95">
              <PlusCircle className="mr-2 h-5 w-5" /> START NEW INTERVIEW
            </Button>
          </div>

          <div className="relative shrink-0 w-full md:w-1/3 max-w-[300px]">
            <div className="absolute inset-0 bg-indigo-500/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 rounded-2xl" />
            <Image src="/robot.jpeg" alt="Robot" width={500} height={500} className="rounded-2xl border border-zinc-800 object-cover shadow-2xl" />
          </div>
        </section>

        {/* RECENT SESSIONS SECTION */}
        <section>
           <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                <History size={20} className="text-zinc-400" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Recent Sessions</h3>
            </div>

          {fetching ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-2xl bg-zinc-900/50 animate-pulse border border-zinc-800" />)}
            </div>
          ) : interviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviews.map((interview) => (
                <Card key={interview.id} className="bg-zinc-950 border-zinc-800 hover:border-zinc-700 transition-all group overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Badge variant="outline" className="border-zinc-700 text-zinc-400 font-mono text-[10px] uppercase">{interview.role || "General"}</Badge>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">{interview.score}</span>
                      <span className="text-[10px] text-zinc-500">/100</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-zinc-400 text-sm line-clamp-3 italic leading-relaxed">&quot;{interview.feedback || "Processing AI insights..."}&quot;</p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Link href={`/dashboard/analysis/${interview.id}`} className="w-full">
                      <Button variant="secondary" className="w-full justify-between bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border-zinc-800">
                        Detailed Analysis <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-zinc-800 rounded-[2rem] py-20 text-center bg-zinc-950/50">
              <Trophy className="mx-auto h-12 w-12 text-zinc-700 mb-4" />
              <p className="text-zinc-500 mb-6">Your history is looking a bit empty.</p>
              <Button variant="outline" onClick={() => router.push("/interview")} className="border-zinc-700 text-zinc-400">Record your first session</Button>
            </div>
          )}
        </section>

        {/* COMMUNITY INSIGHTS SECTION */}
        <section className="pt-6 border-t border-zinc-900">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-zinc-950 border-zinc-800 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Globe className="text-indigo-500" size={20} /> Community Insights</h4>
                <p className="text-sm text-zinc-500 max-w-sm">Global benchmark for 2026. See how your scores compare to others.</p>
                <div className="mt-6 flex gap-8">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Global Avg</p>
                    <p className="text-2xl font-black text-indigo-400">{communityStats.avgScore}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Trending Stack</p>
                    <p className="text-2xl font-black text-yellow-500 flex items-center gap-1"><Zap size={16} fill="currentColor" /> {communityStats.topStack}</p>
                  </div>
                </div>
              </div>
              <Link href="/dashboard/community">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6">Explore Network <ChevronRight size={16} /></Button>
              </Link>
            </Card>
            <Card className="bg-zinc-950 border-zinc-800 p-8 flex flex-col justify-center">
              <p className="text-indigo-400 text-xs font-bold uppercase mb-2">Your Percentile</p>
              <h2 className="text-4xl font-black text-white mb-4">Top 12%</h2>
              <Progress value={88} className="h-1 bg-zinc-900" />
              <p className="text-zinc-600 text-[10px] mt-4 italic">Based on your last 3 technical sessions.</p>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}