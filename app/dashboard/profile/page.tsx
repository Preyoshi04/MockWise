"use client";

import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { userData, loadingg } = useUser();

  if (loadingg) {
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

  // Highest score
  const highestScore =
    interviews.length > 0
      ? Math.max(...interviews.map((i) => Number(i.score) || 0))
      : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <Button
          onClick={() => router.back()}
          className="mb-8 text-slate-500 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <header className="mb-12 bg-slate-900/40 border border-slate-800/60 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 flex items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.1)]">
              <User size={48} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">
                {userData?.name || "Developer"}
              </h1>
              <p className="text-slate-500 font-medium mt-2">
                Welcome To Your Profile
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card className="bg-slate-900/40 border-slate-800/50 backdrop-blur-xl rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="text-lg text-slate-300 font-bold flex items-center gap-2">
                <Contact size={30} className="text-slate-300" /> IDENTITY
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <Mail size={20} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-600">
                    Email Address
                  </p>
                  <p className="text-slate-200 font-medium">
                    {userData?.email || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <Calendar size={20} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-600">
                    Member Since
                  </p>
                  <p className="text-slate-200 font-medium">{joinedDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="bg-slate-900/40 border-slate-800/50 backdrop-blur-xl rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="text-lg text-slate-300 font-bold flex items-center gap-2">
                <BarChart3 size={30} className="text-slate-300" /> PERFORMANCE
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <MessageCircleCode size={20} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-600">
                    Total Interviews
                  </p>
                  <p className="text-slate-200 font-medium">
                    {userData?.totalInterviews || 0} Sessions
                  </p>
                </div>
              </div>

              <Card className="bg-zinc-950 border-zinc-800 p-6 flex flex-col items-center justify-center">
                <div className="p-3 bg-yellow-500/10 rounded-full mb-3">
                  <Trophy className="text-yellow-500 h-6 w-6" />
                </div>
                <p className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-1">
                  Personal Best
                </p>
                <h3 className="text-3xl font-black text-white">
                  {highestScore}
                  <span className="text-sm text-zinc-500 ml-1">/100</span>
                </h3>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* Plan Status */}
        <div className="mt-6 p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold">
              Current Plan:{" "}
              <span className="text-indigo-400 uppercase">
                {userData?.plan || "Free"}
              </span>
            </h3>
          </div>
          <Button className="bg-white text-black hover:bg-slate-200 text-xs p-3 rounded-2xl">
            More Upgrades Coming Soon...
          </Button>
        </div>
      </div>
      {/* Footer Branding - Responsive Padding */}
      <footer className="py-12 md:py-20 border-t border-slate-900 text-center px-4 fixed bottom-0 w-full">
        <p className="text-slate-300 text-[10px] md:text-sm font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase mb-2">
          Build for the future of hiring
        </p>
        <p className="text-slate-300 text-[10px] md:text-xs font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase">
          &copy; 2026 MockWise
        </p>
      </footer>
    </div>
  );
}
