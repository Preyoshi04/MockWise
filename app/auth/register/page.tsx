"use client";
import { registerUser } from "@/actions/auth/register";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Zap } from "lucide-react";
import Cookies from "js-cookie"; // Make sure to install this: npm install js-cookie

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function clientAction(formData: FormData) {
    setLoading(true);
    setError("");
    
    const result = await registerUser(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.uid) {
      // 1. We check for result.uid specifically to satisfy TypeScript
      Cookies.set("session", result.uid, { expires: 7 }); 

      // 2. Now it's safe to redirect
      router.push("/dashboard");
    } else {
      // Fallback if something weird happens
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full bg-zinc-950/50 backdrop-blur-xl rounded-[2.5rem] p-10 border border-zinc-800 shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-500/10 rounded-xl mb-4">
             <Zap className="text-indigo-500" size={24} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">MockWise</h1>
          <p className="text-zinc-500 mt-2 text-sm font-medium">Join the elite network of developers</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 text-red-400 text-xs font-bold rounded-2xl border border-red-500/20 text-center animate-pulse">
            {error}
          </div>
        )}

        <form action={clientAction} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
            <input
              name="fullName"
              type="text"
              placeholder="John Doe"
              required
              className="w-full p-4 bg-zinc-900/50 border border-zinc-800 text-white rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-700"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="name@company.com"
              required
              className="w-full p-4 bg-zinc-900/50 border border-zinc-800 text-white rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-700"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full p-4 bg-zinc-900/50 border border-zinc-800 text-white rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:bg-indigo-500 hover:shadow-indigo-500/40 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : "Get Started"}
          </button>
        </form>

        <p className="text-center mt-8 text-zinc-500 text-xs">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}