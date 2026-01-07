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
  Zap
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
    ? new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        .format(userData.createdAt.toDate())
    : "Recently";

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-8 text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <header className="mb-12">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.1)]">
              <User size={48} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">{userData?.name || "Developer"}</h1>
              <p className="text-zinc-500 font-medium">Account Overview & Performance</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-xl rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Zap size={18} className="text-indigo-400" /> Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <Mail size={20} className="text-zinc-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-zinc-600">Email Address</p>
                  <p className="text-zinc-200 font-medium">{userData?.email || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <Calendar size={20} className="text-zinc-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-zinc-600">Member Since</p>
                  <p className="text-zinc-200 font-medium">{joinedDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-xl rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BarChart3 size={18} className="text-emerald-400" /> Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <CircleDot size={20} className="text-zinc-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-zinc-600">Total Interviews</p>
                  <p className="text-zinc-200 font-medium">{userData?.totalInterviews || 0} Sessions</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <Trophy size={20} className="text-yellow-500" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-zinc-600">Highest Score</p>
                  <p className="text-zinc-200 font-medium">{userData?.highestScore || 0}% Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Status */}
        <div className="mt-6 p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold">Current Plan: <span className="text-indigo-400 uppercase">{userData?.plan || "Free"}</span></h3>
            <p className="text-zinc-500 text-sm">Upgrade to Pro for unlimited AI-powered technical mock interviews.</p>
          </div>
          <Button className="bg-white text-black hover:bg-zinc-200 font-bold px-8 rounded-2xl h-12">
            Upgrade Plan
          </Button>
        </div>
      </div>
    </div>
  );
}

// Simple internal icon for this page
function CircleDot({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  );
}