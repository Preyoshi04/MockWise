"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Mic, BarChart3, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-800/20 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex justify-between items-center p-6 max-w-7xl mx-auto border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <div className="w-4 h-4 bg-black rotate-45" />
           </div>
           <h1 className="text-xl font-bold tracking-tighter italic">MockWise</h1>
        </div>
        
        <div className="flex items-center gap-6">
          {user ? (
            <Link href="/dashboard">
              <Button variant="outline" className="border-zinc-800 bg-transparent text-white hover:bg-zinc-900 rounded-full px-6">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/auth/register">
                <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-6 font-bold">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center pt-32 pb-20 px-4 max-w-5xl mx-auto">
        <Badge variant="outline" className="mb-6 border-zinc-800 text-zinc-400 py-1 px-4 gap-2 rounded-full animate-fade-in">
          <Sparkles size={14} className="text-indigo-400" /> Powered by VAPI
        </Badge>
        
        <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[1.1]">
          Master your <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
            Interview Game.
          </span>
        </h2>
        
        <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mb-12 leading-relaxed font-medium">
          MockWise uses hyper-realistic voice AI to conduct industry-standard interviews. 
          Get instant scoring, deep feedback, and land your next role.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-black hover:bg-zinc-200 px-10 py-7 rounded-full text-lg font-bold shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-transform active:scale-95">
              Start Free Session <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full">
            <div className="p-8 rounded-[2rem] bg-zinc-950 border border-zinc-900 text-left">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4 border border-indigo-500/20">
                    <Mic className="text-indigo-400" size={20} />
                </div>
                <h4 className="text-white font-bold mb-2">Voice First</h4>
                <p className="text-zinc-500 text-sm">Natural conversation with latency-free AI responders.</p>
            </div>
            <div className="p-8 rounded-[2rem] bg-zinc-950 border border-zinc-900 text-left">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 border border-emerald-500/20">
                    <BarChart3 className="text-emerald-400" size={20} />
                </div>
                <h4 className="text-white font-bold mb-2">Instant Scoring</h4>
                <p className="text-zinc-500 text-sm">Receive a 0-100 score based on content, tone, and logic.</p>
            </div>
            <div className="p-8 rounded-[2rem] bg-zinc-950 border border-zinc-900 text-left">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 border border-blue-500/20">
                    <ShieldCheck className="text-blue-400" size={20} />
                </div>
                <h4 className="text-white font-bold mb-2">Private & Secure</h4>
                <p className="text-zinc-500 text-sm">Your data is encrypted and used only for your growth.</p>
            </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-20 border-t border-zinc-900 text-center">
        <p className="text-zinc-700 text-xs font-bold tracking-[0.4em] uppercase">
          Build for the future of hiring
        </p>
      </footer>
    </div>
  );
}
