/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Cookies from "js-cookie";
import Link from "next/link";

// Shadcn + Lucide
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, Sparkles, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      Cookies.set("session", user.uid, { 
        expires: 7, 
        path: '/',
        secure: process.env.NODE_ENV === 'production' 
      });

      router.push("/dashboard");
      router.refresh(); 
      
    } catch (err: any) {
      console.error("Login Error:", err.code);
      setError("Invalid email or password combination.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs - Tinted Slate/Indigo */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-slate-800 rounded-full blur-[140px] opacity-40 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-950 rounded-full blur-[120px] opacity-30 pointer-events-none" />

      <Card className="w-full max-w-md bg-slate-900/40 border-slate-800/60 backdrop-blur-2xl relative z-10 shadow-2xl ring-1 ring-white/5">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="mx-auto w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(241,245,249,0.2)]">
            <Sparkles className="text-slate-950 h-7 w-7" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-slate-50">Welcome Back</CardTitle>
          <CardDescription className="text-slate-400 font-medium">
            Enter your credentials to access your workspace
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center font-semibold animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-400 ml-1 text-xs font-bold uppercase tracking-wider">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    required
                    className="bg-slate-950/50 border-slate-800 pl-11 text-slate-100 placeholder:text-slate-600 focus:ring-slate-700 focus:border-slate-600 h-12 rounded-xl transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-slate-400 text-xs font-bold uppercase tracking-wider">Password</Label>
                  <Link href="#" className="text-[10px] font-bold text-slate-500 hover:text-indigo-400 transition-colors">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="bg-slate-950/50 border-slate-800 pl-11 text-slate-100 placeholder:text-slate-600 focus:ring-slate-700 focus:border-slate-600 h-12 rounded-xl transition-all"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-50 text-slate-950 hover:bg-white h-12 rounded-xl font-black transition-all active:scale-[0.98] shadow-lg shadow-slate-950/20"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-6 pb-8">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold">
              <span className="bg-[#0f172a] px-3 text-slate-600">Secure Protocol</span>
            </div>
          </div>
          
          <p className="text-center text-slate-400 text-sm font-medium">
            New to the platform?{" "}
            <Link href="/auth/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors underline-offset-4 hover:underline">
              Create Account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}