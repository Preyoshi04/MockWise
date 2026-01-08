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
  History,
  Trophy,
  ChevronRight,
  User,
  Loader2,
  Globe,
  Zap,
  SparklesIcon,
} from "lucide-react";
import Image from "next/image";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { userData, loadingg } = useUser();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [communityStats, setCommunityStats] = useState({
    avgScore: 0,
    topStack: "Next.js",
    globalScores: [] as number[],
  });

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
        // ADD THE FIXED QUERY HERE
    const q = query(
      collection(db, "interviews"),
      where("userId", "==", user.uid),
      where("techStack", "!=", "General"), // This hides the dummy cards
      orderBy("techStack"),                // Required by Firestore for the != filter
      orderBy("createdAt", "desc")
    );
        const querySnapshot = await getDocs(q);
        const userDocs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInterviews(userDocs);

        const cq = query(
          collection(db, "interviews"),
          orderBy("createdAt", "desc"),
          limit(200)
        );
        const cSnapshot = await getDocs(cq);
        const cDocs = cSnapshot.docs.map((d) => d.data());

        if (cDocs.length > 0) {
          const scores = cDocs.map((d: any) => Number(d.score) || 0);
          const total = scores.reduce((acc, curr) => acc + curr, 0);

          setCommunityStats({
            avgScore: Math.round(total / cDocs.length),
            topStack: (cDocs[0] as any).techStack || "Next.js",
            globalScores: scores,
          });
        }
      } catch (err: any) {
        console.error("Data Error:", err.message);
      } finally {
        setFetching(false);
      }
    };
    if (!loading && user) fetchData();
  }, [user, loading]);

  const standing = (() => {
    if (!interviews || interviews.length === 0) {
      return {
        label: "Not Ranked",
        value: 0,
        sub: "Complete a session to see rank",
      };
    }
    const userAvg =
      interviews.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0) /
      interviews.length;
    if (userAvg === 0) {
      return {
        label: "Unranked",
        value: 0,
        sub: "Score above 0 to enter the leaderboards.",
      };
    }
    const peopleBeaten = communityStats.globalScores.filter(
      (score) => score < userAvg
    ).length;
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
      console.error("Error signing out:", error);
    }
  };

  if (loading || !user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white px-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-4" />
        <p className="text-zinc-500 animate-pulse font-medium">
          Authenticating Session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans">
      
      <header className="border-b border-slate-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
           <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
             {/* Logo Section */}
             <div className="flex items-center gap-2">
               <SparklesIcon size={24} className="md:w-[30px] md:h-[30px]" />
               <h1 className="text-xl md:text-4xl font-bold tracking-tighter italic text-white">
                 MockWise
               </h1>
             </div>
     
             {/* Actions Section */}
             <div className="flex items-center gap-3 md:gap-6">
               <Link
                 href="/dashboard/profile"
                 className="hover:opacity-80 transition-opacity"
               >
                 <div className="flex items-center gap-2 text-slate-400 text-sm border-r border-slate-800 pr-4">
                   <User size={14} className="text-slate-200" />
                   <span className="font-medium text-slate-200 truncate max-w-[100px]">
                     {userData?.name || "Dev"}
                   </span>
                 </div>
               </Link>
               <Button
                 variant="ghost"
                 onClick={handleLogout}
                 className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 gap-2 h-9 px-3"
               >
                 <LogOut size={16} />
                 <span className="text-sm sm:text-xs">Sign Out</span>
               </Button>
             </div>
           </div>
         </header>

      <main className="max-w-7xl mx-auto p-4 md:p-10 space-y-8 md:space-y-12">
        <section className="flex flex-col lg:flex-row items-center gap-8 md:gap-10 p-6 md:p-16 bg-gradient-to-br from-slate-900 to-black rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800 relative overflow-hidden">
          <div className="flex-1 text-center lg:text-left z-10">
            <Badge className="mb-4 bg-white text-black hover:bg-slate-200 py-1 px-4 text-xs">
              AI-Powered Analysis
            </Badge>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-white leading-tight">
              Ready to land your <br />
              <span className="text-slate-500 italic font-serif">
                dream job?
              </span>
            </h2>
            <Button
              size="lg"
              onClick={() => router.push("/interview")}
              className="w-full sm:w-auto bg-white text-black hover:bg-slate-200 rounded-full px-8 py-6 text-sm md:text-md font-bold transition-transform active:scale-95"
            >
              <PlusCircle className="mr-2 h-5 w-5" /> START NEW INTERVIEW
            </Button>
          </div>
          <div className="relative shrink-0 w-full sm:w-2/3 lg:w-1/3 max-w-[320px]">
            <Image
              src="/robot.jpeg"
              alt="Robot"
              width={500}
              height={500}
              className="rounded-2xl border border-slate-800 object-cover shadow-2xl"
            />
          </div>
        </section>

 <section className="mt-8">
  {fetching ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-48 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"
        />
      ))}
    </div>
  ) : interviews.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {interviews.map((interview) => (
        <Card
          key={interview.id}
          className="bg-slate-950 border-slate-800 hover:border-indigo-500/50 transition-all group flex flex-col"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="flex flex-col gap-1">
              <Badge
                variant="outline"
                className="w-fit border-indigo-500/30 text-indigo-400 text-[10px] bg-indigo-500/5"
              >
                {/* Updated to show techStack or fallback to role from your DB */}
                {interview.techStack || interview.role || "General"}
              </Badge>
              {/* Added a small label for the Role seen in your DB */}
              {interview.role && (
                 <span className="text-[9px] text-slate-500 uppercase tracking-wider px-1">
                   {interview.role}
                 </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl md:text-2xl font-bold text-white">
                {interview.score}
              </span>
              <span className="text-[10px] text-slate-500">/100</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-slate-400 text-xs md:text-sm line-clamp-3 italic leading-relaxed">
              &quot;{interview.feedback || "Processing AI insights..."}&quot;
            </p>
          </CardContent>
          <CardFooter className="pt-2">
            <Link
              href={`/dashboard/analysis/${interview.id}`}
              className="w-full"
            >
              <Button
                variant="secondary"
                className="w-full justify-between bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 text-xs h-9"
              >
                Detailed Analysis <ChevronRight size={14} />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  ) : (
    <div className="border border-dashed border-slate-800 rounded-[1.5rem] md:rounded-[2rem] py-16 md:py-20 text-center bg-slate-950/50 px-4">
      <Trophy className="mx-auto h-10 w-10 text-slate-700 mb-4" />
      <p className="text-slate-500 mb-6 text-sm">
        Your history is looking a bit empty.
      </p>
      <Button
        variant="outline"
        onClick={() => router.push("/dashboard/interview")}
        className="border-slate-700 text-slate-400 text-xs hover:bg-slate-900"
      >
        Record your first session
      </Button>
    </div>
  )}
</section>
        <section className="pt-6 border-t border-slate-900">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-slate-950 border-slate-800 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="w-full sm:w-auto">
                <h4 className="text-lg md:text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Globe className="text-indigo-500" size={18} /> Community
                  Insights
                </h4>
                <p className="text-xs md:text-sm text-slate-500 max-w-sm">
                  Global benchmark for 2026. See how your scores compare to
                  others.
                </p>
                <div className="mt-6 flex gap-6 md:gap-8">
                  <div>
                    <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-600 font-bold mb-1">
                      Global Avg
                    </p>
                    <p className="text-xl md:text-2xl font-black text-indigo-400">
                      {communityStats.avgScore}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-600 font-bold mb-1">
                      Trending Stack
                    </p>
                    <p className="text-xl md:text-2xl font-black text-yellow-500 flex items-center gap-1">
                      <Zap size={14} fill="currentColor" />{" "}
                      {communityStats.topStack}
                    </p>
                  </div>
                </div>
              </div>
              <Link href="/dashboard/community" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-5 md:py-0 text-xs md:text-sm">
                  Explore Network <ChevronRight size={16} />
                </Button>
              </Link>
            </Card>

            <Card
              className={`border-slate-800 p-6 md:p-8 flex flex-col justify-center transition-colors ${
                interviews.length > 0 ? "bg-slate-950" : "bg-slate-900/30"
              }`}
            >
              <p className="text-indigo-400 text-[10px] md:text-xs font-bold uppercase mb-2">
                Your Standing
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                {standing.label}
              </h2>
              <Progress value={standing.value} className="h-1 bg-slate-900" />
              <p className="text-slate-600 text-[9px] md:text-[10px] mt-4 italic">
                {standing.sub}
              </p>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}