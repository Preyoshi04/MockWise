"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import Link from "next/link";
import Cookies from "js-cookie";

// UI Components (Shadcn)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { 
  LogOut, 
  PlusCircle, 
  History, 
  TrendingUp, 
  Trophy, 
  ChevronRight,
  User,
  Loader2
} from "lucide-react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchUserInterviews = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "interviews"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInterviews(data);
      } catch (err) {
        console.error("Error fetching interviews:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchUserInterviews();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Cookies.remove("session"); // CRITICAL for your middleware!
      window.location.href = "/"; 
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading || !user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-4" />
        <p className="text-zinc-500 animate-pulse">Initializing Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      {/* Premium Navbar */}
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
              {user.email}
            </div>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10 gap-2 transition-all"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        
        {/* Modern Hero CTA */}
        <section className="relative group overflow-hidden rounded-[2.5rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black p-8 md:p-16">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={200} />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <Badge className="mb-4 bg-white text-black hover:bg-zinc-200 py-1 px-4">AI-Powered Analysis</Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white leading-tight">
              Ready to land your <br /> 
              <span className="text-zinc-500 italic font-serif">dream job?</span>
            </h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-md">
              Start a realistic mock interview. Get instant feedback on your tone, technical skills, and confidence.
            </p>
            <Button 
              size="lg"
              onClick={() => router.push("/interview")}
              className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 py-6 text-md font-bold transition-transform active:scale-95"
            >
              <PlusCircle className="mr-2 h-5 w-5" /> START NEW INTERVIEW
            </Button>
          </div>
        </section>

        {/* History Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                <History size={20} className="text-zinc-400" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Recent Sessions</h3>
            </div>
          </div>

          {fetching ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-zinc-900/50 animate-pulse border border-zinc-800" />
              ))}
            </div>
          ) : interviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviews.map((interview) => (
                <Card key={interview.id} className="bg-zinc-950 border-zinc-800 hover:border-zinc-700 transition-all group overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Badge variant="outline" className="border-zinc-700 text-zinc-400 font-mono text-[10px] uppercase">
                      {interview.role || "General"}
                    </Badge>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">{interview.score}</span>
                      <span className="text-[10px] text-zinc-500">/100</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-zinc-400 text-sm line-clamp-3 italic leading-relaxed">
                      "{interview.feedback || "Processing AI insights..."}"
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Link href={`/dashboard/analysis/${interview.id}`} className="w-full">
                      <Button variant="secondary" className="w-full justify-between bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border-zinc-800">
                        Detailed Analysis
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
              <Button variant="outline" onClick={() => router.push("/interview")} className="border-zinc-700 text-zinc-400">
                Record your first session
              </Button>
            </div>
          )}
        </section>

        {/* Status Section */}
        <section className="pt-6 border-t border-zinc-900">
          <Card className="bg-zinc-900/30 border-zinc-900">
            <CardContent className="flex flex-col md:flex-row items-center justify-between p-8">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h4 className="text-lg font-semibold text-white">Community Insights</h4>
                <p className="text-sm text-zinc-500">Benchmark your progress against thousands of candidates.</p>
              </div>
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 border-zinc-700 px-4 py-1">
                Coming Q1 2026
              </Badge>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}