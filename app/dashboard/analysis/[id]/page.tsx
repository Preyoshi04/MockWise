"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, Award, BookOpen, Target, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalysisPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) return;
      const docRef = doc(db, "interviews", id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setData(docSnap.data());
      }
      setLoading(false);
    };
    fetchAnalysis();
  }, [id]);

  if (loading) return <div className="flex h-screen items-center justify-center text-white">Loading Analysis...</div>;
  if (!data) return <div className="text-white">Analysis not found.</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-8 hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Score Card */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <Award className="h-12 w-12 text-yellow-500 mb-2" />
            <h3 className="text-zinc-400 text-sm uppercase tracking-wider">Overall Score</h3>
            <p className="text-5xl font-bold mt-2">{data.score}%</p>
          </div>

          {/* Details Card */}
          <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <h1 className="text-3xl font-bold mb-2">{data.role}</h1>
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 flex items-center gap-2">
                <Target className="h-4 w-4" /> {data.level}
              </span>
              <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20 flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> {data.techStack}
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="bg-zinc-800/50 p-4 border-b border-zinc-700 flex items-center gap-2">
            <CheckCircle2 className="text-green-500 h-5 w-5" />
            <h2 className="font-semibold text-lg">AI Detailed Feedback</h2>
          </div>
          <div className="p-8">
            <p className="text-zinc-300 leading-relaxed text-lg italic">
              "{data.feedback}"
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-zinc-500 text-sm mt-8 text-center">
          Interview conducted on {data.createdAt?.toDate().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}