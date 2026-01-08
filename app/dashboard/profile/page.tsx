"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  User,
  Mail,
  Calendar,
  BarChart3,
  Trophy,
  ArrowLeft,
  Loader2,
  Crown,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { userData, loadingg: userLoading } = useUser();
  const { user } = useAuth();
  const router = useRouter();

  const [interviews, setInterviews] = useState<any[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(true);

  useEffect(() => {
    const fetchUserInterviews = async () => {
      if (!user?.uid) return;
      try {
        const q = query(
          collection(db, "interviews"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInterviews(data);
      } catch (error) {
        console.error("Error fetching interviews:", error);
      } finally {
        setLoadingInterviews(false);
      }
    };

    fetchUserInterviews();
  }, [user]);

  const highestScore =
    interviews.length > 0
      ? Math.max(...interviews.map((i) => Number(i.score) || 0))
      : 0;

  if (userLoading || loadingInterviews) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const joinedDate = userData?.createdAt?.toDate
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(userData.createdAt.toDate())
    : "Recently";

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        {/* Navigation */}
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="mb-12 text-zinc-500 hover:text-white hover:bg-zinc-900/50 rounded-full pr-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        {/* --- HERO SECTION --- */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-16">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative w-32 h-32 md:w-40 md:h-40 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 shadow-2xl">
              <User size={60} className="text-zinc-700" />
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-indigo-500 rounded-full border-4 border-[#050505]">
              <Crown size={16} className="text-white" />
            </div>
          </div>

          <div className="text-center md:text-left space-y-2 flex-1">
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/5 mb-2">
              {userData?.plan || "Standard"} User
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter italic">
              {userData?.name || "Developer"}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-zinc-500 text-sm">
              <div className="flex items-center gap-2">
                <Mail size={14} /> {userData?.email}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} /> Joined {joinedDate}
              </div>
            </div>
          </div>
        </div>

        {/* --- STATS BENTO GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          {/* Total Sessions Card */}
          <Card className="md:col-span-2 bg-zinc-900/40 border-zinc-800/50 backdrop-blur-md overflow-hidden group">
            <CardContent className="p-8 relative">
              <BarChart3 className="absolute -right-4 -bottom-4 size-24 text-white/5 group-hover:text-indigo-500/10 transition-colors" />
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">Activity</p>
              <h3 className="text-5xl font-black italic">{userData?.totalInterviews || 0}</h3>
              <p className="text-zinc-400 text-sm mt-2">Total Interviews Conducted</p>
            </CardContent>
          </Card>

          {/* Highest Score Card */}
          <Card className="md:col-span-4 bg-zinc-900/40 border-zinc-800/50 backdrop-blur-md overflow-hidden group">
            <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Peak Performance</p>
                <h3 className="text-5xl font-black italic text-indigo-400">
                  {highestScore}<span className="text-2xl text-zinc-600 font-normal ml-1 not-italic">/100</span>
                </h3>
                <p className="text-zinc-400 text-sm">Highest rating achieved across all sessions</p>
              </div>
              <div className="p-6 bg-indigo-500/10 rounded-3xl border border-indigo-500/20">
                <Trophy className="text-indigo-400" size={48} />
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Card - Modern CTA */}
          <div className="md:col-span-6 relative rounded-[2.5rem] p-1 bg-gradient-to-r from-zinc-800 via-indigo-500/50 to-zinc-800">
             <div className="bg-[#0a0a0a] rounded-[2.4rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                    <Zap className="text-white fill-white" size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Unleash the Pro within.</h3>
                    <p className="text-zinc-500">Advanced AI feedback and unlimited custom tech-stacks.</p>
                  </div>
                </div>
                <Button className="w-full md:w-auto h-14 px-10 bg-white text-black hover:bg-zinc-200 font-bold rounded-2xl transition-all hover:scale-105">
                  More Upgrades Coming Soon...
                </Button>
             </div>
          </div>
        </div>

        {/* Footer Credit */}
        <p className="text-center text-zinc-600 text-[10px] uppercase tracking-widest mt-12">
          MockWise Profile Dashboard • 2026 Stable Build
        </p>
      </div>
    </div>
  );
}