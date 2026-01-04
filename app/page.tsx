"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-indigo-600">MockWise</h1>
        <div className="space-x-4">
          {user ? (
            <Link href="/dashboard" className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium">Dashboard</Link>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-600 hover:text-indigo-600">Login</Link>
              <Link href="/auth/register" className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium">Register</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-4">
        <h2 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Master Your <span className="text-indigo-600">Interview</span> <br /> With Real AI.
        </h2>
        <p className="text-xl text-gray-500 max-w-2xl mb-10">
          MockWise uses advanced voice AI to conduct realistic interviews, 
          providing instant feedback and performance scoring.
        </p>
        <Link href="/auth/register" className="bg-indigo-600 text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-indigo-700 shadow-xl transition-all">
          Start Practicing for Free
        </Link>
      </section>
    </div>
  );
}