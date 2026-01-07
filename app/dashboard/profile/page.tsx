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
  Contact,
  MessageCircleCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { userData, loadingg: userLoading } = useUser();
  const { user } = useAuth();
  const router = useRouter();

  // States for fetching interviews
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(true);

  // Fetch the interview data specifically for this user to calculate high score
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

  // Calculate highest score from local state
  const highestScore =
    interviews.length > 0
      ? Math.max(...interviews.map((i) => Number(i.score) || 0))
      : 0;

  // Loading state
  if (userLoading || loadingInterviews) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Format the Firebase timestamp
  const joinedDate = userData?.createdAt?.toDate
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(userData.createdAt.toDate())
    : "Recently";

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="mb-8 text-slate-400 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
              <CardContent className="pt-6 text-center">
                <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                  <User size={40} className="text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {userData?.name || "Developer"}
                </h2>
                <p className="text-sm text-zinc-500 mb-4">{userData?.email}</p>
                <div className="flex justify-center gap-2">
                  <div className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Pro Member
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-400">
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-zinc-600" />
                  <span className="text-zinc-300 truncate">{userData?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-zinc-600" />
                  <span className="text-zinc-300">Joined {joinedDate}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Grid */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                      <BarChart3 className="text-indigo-400" size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">
                      Total Sessions
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white">
                    {userData?.totalInterviews || 0}
                  </h3>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                      <Trophy className="text-yellow-500" size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">
                      Highest Score
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white">
                    {highestScore}
                    <span className="text-sm text-zinc-500 ml-1">/100</span>
                  </h3>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Bio & Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400 leading-relaxed italic">
                  &quot;Preparing for top-tier technical roles. Focused on mastering system design and advanced problem-solving.&quot;
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["React", "Node.js", "System Design", "Next.js"].map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-xs text-indigo-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}