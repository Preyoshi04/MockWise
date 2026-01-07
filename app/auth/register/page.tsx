"use client";
import { registerUser } from "@/actions/auth/register";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Zap, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function clientAction(formData: FormData) {
    setLoading(true);
    setError("");
    
    // Call the Server Action
    const result = await registerUser(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      // 1. Ensure any lingering session cookies are destroyed
      Cookies.remove("session");
      
      toast.success("Account created!", {
        description: "Please log in with your credentials."
      });

      // 2. Redirect to Login Page
      // Because there is no cookie, Middleware will allow this.
      router.push("/auth/login");
    } else {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 border border-slate-800/60 shadow-2xl relative z-10 ring-1 ring-white/5">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-50 rounded-2xl mb-4 shadow-[0_0_30px_rgba(241,245,249,0.15)]">
             <Zap className="text-slate-950 fill-slate-950" size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-50 tracking-tight">MockWise</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium italic">Join the elite network</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 text-red-400 text-xs font-bold rounded-2xl border border-red-500/20 text-center">
            {error}
          </div>
        )}

        <form action={clientAction} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
            <input
              name="fullName"
              type="text"
              placeholder="John Doe"
              required
              className="w-full p-4 bg-slate-950/50 border border-slate-800 text-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-slate-700 transition-all placeholder:text-slate-700"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
            <input
              name="email"
              type="email"
              placeholder="name@company.com"
              required
              className="w-full p-4 bg-slate-950/50 border border-slate-800 text-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-slate-700 transition-all placeholder:text-slate-700"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full p-4 bg-slate-950/50 border border-slate-800 text-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-slate-700 transition-all placeholder:text-slate-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-50 text-slate-950 py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-white transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Get Started"}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 text-sm font-medium">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}