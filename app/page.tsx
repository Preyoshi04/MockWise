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
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-800/20 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex justify-between items-center p-6 max-w-7xl mx-auto border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
           <SparklesIcon size={30} />
           <h1 className="text-4xl font-bold tracking-tighter italic">MockWise</h1>
        </div>
        
        <div className="flex items-center gap-6">
          {user ? (
            <Link href="/dashboard">
              <Button variant="outline" className="bg-slate-900 text-white hover:bg-slate-600 hover:text-white cursor-pointer rounded-full px-6 text-lg">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="text-lg font-medium text-zinc-400 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/auth/register">
                <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-6 font-bold">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center pt-32 pb-20 px-4 max-w-5xl mx-auto">
        <Badge variant="outline" className="mb-6 border-zinc-800 text-zinc-400 py-1 px-4 gap-2 rounded-full animate-fade-in">
          <Sparkles size={14} className="text-indigo-400" /> Powered by <b>VAPI</b>
        </Badge>
        
        <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[1.1]">
          Ace your Interviews<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
             with Confidence
          </span>
        </h2>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed font-medium">
          MockWise uses hyper-realistic voice AI to conduct industry-standard interviews. 
          Get instant scoring, deep feedback, and land your next role.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-black hover:bg-zinc-200 px-10 py-7 rounded-full text-lg font-bold cursor-pointer">
              Start Free Session <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full">
            <div className="p-8 rounded-[2rem] bg-slate-900 border border-zinc-900 text-left">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4 border border-indigo-500/20">
                    <Mic size={30} />
                </div>
                <h4 className="text-white font-bold mb-2 text-lg">Voice First</h4>
                <p className="text-zinc-500 text-md">Natural conversation with latency-free AI responders.</p>
            </div>
            <div className="p-8 rounded-[2rem] bg-slate-900 border border-zinc-900 text-left">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 border border-emerald-500/20">
                    <BarChart3 size={30} />
                </div>
                <h4 className="text-white font-bold mb-2 text-lg">Instant Scoring</h4>
                <p className="text-zinc-500 text-md">Receive a 0-100 score based on content, tone, and logic.</p>
            </div>
            <div className="p-8 rounded-[2rem] bg-slate-900 border border-zinc-900 text-left">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 border border-blue-500/20">
                    <ShieldCheck size={30} />
                </div>
                <h4 className="text-white font-bold mb-2 text-lg">Private & Secure</h4>
                <p className="text-zinc-500 text-md">Your data is encrypted and used only for your growth.</p>
            </div>
        </div>
      </section>

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
  );
}
