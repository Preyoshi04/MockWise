"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Mic, BarChart3, ShieldCheck, SparklesIcon } from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-800 text-white relative overflow-hidden">
      {/* Background Decor - Made responsive with percentages */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-10%] md:top-[-10%] w-[60%] md:w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-10%] md:bottom-[-10%] w-[60%] md:w-[40%] h-[40%] bg-zinc-800/20 rounded-full blur-[80px] md:blur-[120px]" />
      </div>

      {/* Navigation - Fixed mobile layout and spacing */}
      <nav className="relative z-50 flex flex-col sm:flex-row justify-between items-center gap-4 p-4 md:p-6 max-w-7xl mx-auto border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
           <SparklesIcon size={24} className="md:w-[30px] md:h-[30px]" />
           <h1 className="text-2xl md:text-4xl font-bold tracking-tighter italic">MockWise</h1>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          {user ? (
            <Link href="/dashboard">
              <Button variant="outline" className="bg-slate-900 text-white hover:bg-slate-600 hover:text-white cursor-pointer rounded-full px-4 md:px-6 text-sm md:text-lg h-9 md:h-11">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm md:text-lg font-medium text-zinc-400 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/auth/register">
                <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-4 md:px-6 h-9 md:h-11 font-bold text-sm md:text-base">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section - Fixed Typography and Spacing */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center pt-20 md:pt-32 pb-16 md:pb-20 px-6 max-w-5xl mx-auto">
        <Badge variant="outline" className="mb-6 border-zinc-800 text-zinc-400 py-1 px-4 gap-2 rounded-full animate-fade-in text-xs md:text-sm">
          <Sparkles size={14} className="text-indigo-400" /> Powered by <b>VAPI</b>
        </Badge>
        
        <h2 className="text-4xl sm:text-6xl md:text-8xl font-black mb-6 md:mb-8 tracking-tighter leading-[1.1]">
          Ace your Interviews<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
             with Confidence
          </span>
        </h2>
        
        <p className="text-base md:text-xl text-slate-400 max-w-2xl mb-10 md:mb-12 leading-relaxed font-medium">
          MockWise uses hyper-realistic voice AI to conduct industry-standard interviews. 
          Get instant scoring, deep feedback, and land your next role.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/auth/register" className="w-full">
            <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 px-8 md:px-10 py-6 md:py-7 rounded-full text-base md:text-lg font-bold cursor-pointer transition-transform active:scale-95">
              Start Free Session <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Feature Highlights - Responsive Grid (1 col mobile, 3 col desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-20 md:mt-32 w-full">
            <div className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-slate-900 border border-zinc-900 text-left transition-colors hover:border-zinc-700">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4 border border-indigo-500/20">
                    <Mic size={24} />
                </div>
                <h4 className="text-white font-bold mb-2 text-lg">Voice First</h4>
                <p className="text-zinc-500 text-sm md:text-md">Natural conversation with latency-free AI responders.</p>
            </div>
            <div className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-slate-900 border border-zinc-900 text-left transition-colors hover:border-zinc-700">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 border border-emerald-500/20">
                    <BarChart3 size={24} />
                </div>
                <h4 className="text-white font-bold mb-2 text-lg">Instant Scoring</h4>
                <p className="text-zinc-500 text-sm md:text-md">Receive a 0-100 score based on content, tone, and logic.</p>
            </div>
            <div className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-slate-900 border border-zinc-900 text-left transition-colors hover:border-zinc-700">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 border border-blue-500/20">
                    <ShieldCheck size={24} />
                </div>
                <h4 className="text-white font-bold mb-2 text-lg">Private & Secure</h4>
                <p className="text-zinc-500 text-sm md:text-md">Your data is encrypted and used only for your growth.</p>
            </div>
        </div>
      </section>

      {/* Footer Branding - Responsive Padding */}
      <footer className="py-12 md:py-20 border-t border-slate-900 text-center px-4">
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