"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Award, 
  BookOpen, 
  Target, 
  CheckCircle2, 
  Calendar, 
  Sparkles,
  Quote,
  Loader2
} from "lucide-react";

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

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-4" />
        <p className="text-zinc-500 animate-pulse">Generating Report...</p>
      </div>
    );
  }

  if (!data) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Analysis not found.</div>;

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6 md:p-12 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Navigation */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-10 text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all gap-2"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Button>

        {/* Top Section: Overview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          
          {/* Circular Score Badge */}
          <Card className="md:col-span-4 bg-zinc-950 border-zinc-800 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />
            <Award className="h-10 w-10 text-yellow-500 mb-4" />
            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">Performance Score</h3>
            <div className="relative">
                <p className="text-7xl font-black text-white tracking-tighter">{data.score}%</p>
                <div className="absolute -inset-4 bg-yellow-500/10 blur-2xl rounded-full -z-10" />
            </div>
          </Card>

          {/* Role Header */}
          <Card className="md:col-span-8 bg-zinc-950 border-zinc-800 p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-3 py-1">
                    Interview Analysis
                </Badge>
                <Badge variant="outline" className="border-zinc-800 text-zinc-500">
                    ID: {id?.toString().slice(0, 8)}
                </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
                {data.role || "Technical Interview"}
            </h1>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-zinc-400 bg-zinc-900/50 px-4 py-2 rounded-xl border border-zinc-800">
                <Target size={16} className="text-blue-400" />
                <span className="text-sm font-medium">{data.level}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 bg-zinc-900/50 px-4 py-2 rounded-xl border border-zinc-800">
                <BookOpen size={16} className="text-purple-400" />
                <span className="text-sm font-medium">{data.techStack}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 bg-zinc-900/50 px-4 py-2 rounded-xl border border-zinc-800">
                <Calendar size={16} className="text-zinc-500" />
                <span className="text-sm font-medium">
                    {data.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Feedback */}
        <Card className="bg-zinc-950 border-zinc-800 overflow-hidden shadow-2xl">
          <div className="bg-zinc-900/50 p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <CheckCircle2 className="text-emerald-500 h-5 w-5" />
                </div>
                <h2 className="font-bold text-xl text-white">Neural Feedback Report</h2>
            </div>
            <Sparkles className="text-zinc-700 h-5 w-5" />
          </div>
          
          <CardContent className="p-10 relative">
            <Quote className="absolute top-8 left-6 h-12 w-12 text-zinc-900 -z-0" />
            <div className="relative z-10">
                <p className="text-zinc-300 leading-[1.8] text-xl font-medium italic">
                {data.feedback || "The AI is still processing your response. Please check back in a moment."}
                </p>
                
                <Separator className="my-10 bg-zinc-800" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <Target size={14} className="text-indigo-400" /> Key Strengths
                        </h4>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            Based on your technical proficiency and communication style, the AI identified significant alignment with the {data.role} requirements.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <Sparkles size={14} className="text-purple-400" /> Next Steps
                        </h4>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            Review the transcript in your dashboard to identify specific phrases where tone or technical accuracy could be improved.
                        </p>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-12 text-center">
            <p className="text-zinc-700 text-[10px] font-bold tracking-[0.4em] uppercase">
                MockWise Neural Analysis &copy; 2026
            </p>
        </footer>
      </div>
    </div>
  );
}