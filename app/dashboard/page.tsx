/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import Link from "next/link";
import Cookies from "js-cookie";
import { useUser } from "@/hooks/use-user";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LogOut,
  PlusCircle,
  Trophy,
  ChevronRight,
  User,
  History,
  Loader2,
  Globe,
  Zap,
  SparklesIcon,
} from "lucide-react";
import Image from "next/image";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { userData } = useUser();
  
  const [interviews, setInterviews] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [communityStats, setCommunityStats] = useState({
    avgScore: 0,
    topStack: "Next.js",
    globalScores: [] as number[],
  });

  // --- 1. Authentication Guard ---
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  // --- 2. Data Fetching Logic ---
  useEffect(() => {
    const fetchData = async () => {
  if (!user?.uid) return;
  setFetching(true);
  
  try {
    // 1. User's Genuine Interviews
    const userInterviewsQuery = query(
      collection(db, "interviews"),
      where("userId", "==", user.uid),
      where("techStack", "!=", "General"), // Filters out dummy data
      orderBy("techStack"),
      orderBy("createdAt", "desc")
    );

    const uSnapshot = await getDocs(userInterviewsQuery);
    const userDocs = uSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setInterviews(userDocs);

    // 2. Community Benchmarks (Updated to handle Role)
    const communityQuery = query(
      collection(db, "interviews"),
      where("techStack", "!=", "General"),
      orderBy("techStack"),
      limit(100)
    );
    
    const cSnapshot = await getDocs(communityQuery);
    const cDocs = cSnapshot.docs.map((d) => d.data() as any);

    if (cDocs.length > 0) {
      const scores = cDocs.map((d) => Number(d.score) || 0);
      const total = scores.reduce((acc, curr) => acc + curr, 0);

      // Find the most frequent Tech Stack
      const stackCounts: Record<string, number> = {};
      cDocs.forEach((doc) => {
        const key = doc.techStack || "General";
        stackCounts[key] = (stackCounts[key] || 0) + 1;
      });
      
      const mostFrequentStack = Object.keys(stackCounts).reduce((a, b) => 
        stackCounts[a] > stackCounts[b] ? a : b
      );

      setCommunityStats({
        avgScore: Math.round(total / cDocs.length),
        topStack: mostFrequentStack,
        globalScores: scores,
      });
    }
  } catch (err: any) {
    console.error("Dashboard Fetch Error:", err.message);
    // REMINDER: If the screen is blank, check the F12 console for the Firebase Index link!
  } finally {
    setFetching(false);
  }
};

    if (!loading && user) fetchData();
  }, [user, loading]);

  // --- 3. Rank Calculation ---
  const standing = (() => {
    if (!interviews || interviews.length === 0) {
      return { label: "Not Ranked", value: 0, sub: "Complete a session to see rank" };
    }
    const userAvg = interviews.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0) / interviews.length;
    
    const peopleBeaten = communityStats.globalScores.filter(s => s < userAvg).length;
    const totalGlobal = communityStats.globalScores.length || 1;
    const percentile = Math.round((peopleBeaten / totalGlobal) * 100);
    const topPercent = Math.max(1, 100 - percentile);

    return {
      label: `Top ${topPercent}%`,
      value: percentile,
      sub: `Outperforming ${percentile}% of the community.`,
    };
  })();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Cookies.remove("session");
      Cookies.remove("uid");
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (loading || !user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-4" />
        <p className="text-zinc-500 animate-pulse font-medium">Loading Workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 selection:bg-indigo-500/30">
      
      {/* --- Navbar --- */}
      <header className="border-b border-slate-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <SparklesIcon size={24} className="text-indigo-500" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tighter italic text-white">MockWise</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/profile" className="flex items-center gap-2 text-slate-400 text-sm border-r border-slate-800 pr-4">
              <User size={14} className="text-slate-200" />
              <span className="font-medium text-slate-200 truncate max-w-[100px]">{userData?.name || "Dev"}</span>
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 gap-2 h-9 px-3">
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-10 space-y-12">
        
        {/* --- Hero Section --- */}
        <section className="flex flex-col lg:flex-row items-center gap-10 p-8 md:p-16 bg-gradient-to-br from-zinc-900 to-black rounded-[2.5rem] border border-slate-800 relative overflow-hidden">
          <div className="flex-1 text-center lg:text-left z-10">
            <Badge className="mb-4 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 py-1 px-4 text-xs">
              AI-Powered Feedback
            </Badge>
            <h2 className="text-3xl md:text-6xl font-bold mb-6 tracking-tight text-white leading-tight">
              Master your next <br />
              <span className="text-zinc-500 italic font-serif underline decoration-zinc-800 underline-offset-8">
                tech interview.
              </span>
            </h2>
            <Button
              size="lg"
              onClick={() => router.push("/interview")}
              className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 rounded-full px-8 py-7 text-md font-black transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/5"
            >
              <PlusCircle className="mr-2 h-5 w-5" /> START NEW INTERVIEW
            </Button>
          </div>
          <div className="relative shrink-0 w-full max-w-[300px] hidden md:block">
            <Image
              src="/robot.jpeg"
              alt="Interviewer"
              width={400}
              height={400}
              className="rounded-3xl border border-slate-800 object-cover shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500"
            />
          </div>
        </section>

        {/* --- Interviews Grid --- */}
        <section>
          <div className="flex items-center justify-between mb-8 px-2">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <History size={18} className="text-indigo-500" /> Recent Sessions
            </h3>
          </div>

          {fetching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-56 rounded-[2rem] bg-zinc-900/50 animate-pulse border border-zinc-800" />
              ))}
            </div>
          ) : interviews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviews.map((interview) => (
                <Card key={interview.id} className="bg-zinc-950 border-zinc-800 hover:border-indigo-500/40 transition-all group flex flex-col rounded-[2rem] overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="w-fit border-indigo-500/30 text-indigo-400 text-[10px] bg-indigo-500/5 px-2">
                        {interview.techStack || "General"}
                      </Badge>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{interview.role || "Developer"}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-white">{interview.score}</span>
                      <span className="text-[10px] text-zinc-600 block">/100</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-6">
                    <p className="text-zinc-400 text-sm line-clamp-3 italic leading-relaxed">
                      &quot;{interview.feedback || "Preparing your detailed analysis report..."}&quot;
                    </p>
                  </CardContent>
                  <CardFooter className="bg-zinc-900/50 p-4">
                    <Link href={`/dashboard/analysis/${interview.id}`} className="w-full">
                      <Button variant="ghost" className="w-full justify-between text-zinc-300 hover:text-white text-xs h-10 group/btn">
                        Detailed Report <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-zinc-800 rounded-[2.5rem] py-24 text-center bg-zinc-950/30">
              <Trophy className="mx-auto h-12 w-12 text-zinc-800 mb-4" />
              <p className="text-zinc-500 mb-6">Your interview history is empty.</p>
              <Button variant="outline" onClick={() => router.push("/interview")} className="border-zinc-800 text-zinc-400 rounded-xl hover:bg-zinc-900">
                Record your first session
              </Button>
            </div>
          )}
        </section>

        {/* --- Insights Footer --- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-zinc-950 border-zinc-800 p-8 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Globe className="text-indigo-500" size={20} /> Community Benchmarks
              </h4>
              <p className="text-sm text-zinc-500 max-w-sm">Comparing your performance against 2,000+ active candidates.</p>
              <div className="mt-8 flex gap-10">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Global Average</p>
                  <p className="text-3xl font-black text-white">{communityStats.avgScore}%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Trending Stack</p>
                  <p className="text-3xl font-black text-yellow-500 flex items-center gap-2">
                    <Zap size={18} fill="currentColor" /> {communityStats.topStack}
                  </p>
                </div>
              </div>
            </div>
            <Link href="/dashboard/community">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl px-8 py-6 font-bold shadow-lg shadow-indigo-600/20">
                Network Stats <ChevronRight size={18} className="ml-1" />
              </Button>
            </Link>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800 p-8 rounded-[2rem] flex flex-col justify-center">
            <p className="text-indigo-400 text-[10px] font-black uppercase mb-2 tracking-[0.2em]">User Standing</p>
            <h2 className="text-4xl font-black text-white mb-4">{standing.label}</h2>
            <Progress value={standing.value} className="h-1.5 bg-zinc-900" />
            <p className="text-zinc-600 text-[10px] mt-4 italic leading-relaxed">{standing.sub}</p>
          </Card>
        </section>

      </main>
    </div>
  );
}