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
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs for that "Premium" look */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-900 rounded-full blur-[120px] opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-800 rounded-full blur-[120px] opacity-30" />

      <Card className="w-full max-w-md bg-zinc-950/50 border-zinc-800 backdrop-blur-xl relative z-10 shadow-2xl">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="mx-auto w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <Sparkles className="text-black h-6 w-6" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-white">Welcome Back</CardTitle>
          <CardDescription className="text-zinc-500">
            Enter your credentials to access your workspace
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg text-center font-medium animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-400 ml-1">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ENTER YOUR EMAIL ADDRESS"
                    required
                    className="bg-zinc-900/50 border-zinc-800 pl-10 text-white placeholder:text-zinc-700 focus:ring-zinc-700 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-zinc-400">Password</Label>
                  <Link href="#" className="text-[10px] text-zinc-600 hover:text-zinc-400">Forgot?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="ENTER YOUR PASSWORD"
                    required
                    className="bg-zinc-900/50 border-zinc-800 pl-10 text-white placeholder:text-zinc-700 focus:ring-zinc-700 h-11"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black hover:bg-zinc-200 h-12 rounded-xl font-bold transition-all active:scale-[0.98]"
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

        <CardFooter className="flex flex-col space-y-4 pb-8">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-900" /></div>
            <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-zinc-950 px-2 text-zinc-600">Secure Access</span></div>
          </div>
          
          <p className="text-center text-zinc-500 text-sm">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-white font-bold hover:text-zinc-300 transition-colors">
              Join MockWise
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}