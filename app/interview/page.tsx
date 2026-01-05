"use client";
import { useEffect, useState } from "react";
import Vapi from "@vapi-ai/web";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Shadcn + Lucide
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  Waves, 
  ShieldCheck, 
  CircleDot,
  Loader2,
  ArrowLeft
} from "lucide-react";

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "");

export default function InterviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCalling, setIsCalling] = useState(false);
  const [isAssistantTalking, setIsAssistantTalking] = useState(false);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    vapi.on("call-end", () => {
      setIsCalling(false);
      setIsAssistantTalking(false);
      setTranscript("");
      setTimeout(() => router.push("/dashboard"), 2000);
    });

    vapi.on("speech-start", () => setIsAssistantTalking(true));
    vapi.on("speech-end", () => setIsAssistantTalking(false));

    vapi.on("message", (message) => {
      if (message.type === "transcript" && message.transcriptType === "partial") {
        setTranscript(message.transcript);
      }
    });

    return () => { vapi.stop(); };
  }, [router]);

  const startInterview = () => {
    setIsCalling(true);
    vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "", {
      variableValues: { userId: user?.uid },
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Info */}
      <div className="w-full max-w-5xl flex justify-between items-center z-10">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Exit Room
        </Button>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-zinc-800 text-zinc-500 gap-2 px-3 py-1">
            <ShieldCheck size={14} className="text-emerald-500" /> Secure Session
          </Badge>
          {isCalling && (
            <Badge className="bg-red-500/10 text-red-500 border-red-500/20 animate-pulse gap-2 px-3 py-1">
              <CircleDot size={14} /> LIVE
            </Badge>
          )}
        </div>
      </div>

      {/* Main Experience: The Neural Orb */}
      <div className="relative flex flex-col items-center justify-center z-10">
        <div className="relative">
          {/* Animated Rings */}
          {isCalling && (
            <>
              <div className={`absolute inset-0 rounded-full border border-indigo-500/50 animate-ping duration-[3000ms] ${isAssistantTalking ? 'opacity-100' : 'opacity-0'}`} />
              <div className={`absolute inset-0 rounded-full border border-white/20 animate-pulse duration-[2000ms]`} />
            </>
          )}
          
          <div className={`w-64 h-64 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-700 relative z-20 ${
            isCalling 
              ? (isAssistantTalking ? "border-white bg-white/5 scale-110 shadow-[0_0_80px_rgba(255,255,255,0.1)]" : "border-indigo-500 bg-indigo-500/5 scale-100") 
              : "border-zinc-800 bg-zinc-900/20"
          }`}>
            {isCalling ? (
              isAssistantTalking ? (
                <Waves className="h-12 w-12 text-white animate-bounce" />
              ) : (
                <Mic className="h-12 w-12 text-indigo-500 animate-pulse" />
              )
            ) : (
              <MicOff className="h-12 w-12 text-zinc-700" />
            )}
            <p className="mt-4 text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">
              {!isCalling ? "Offline" : isAssistantTalking ? "AI Speaking" : "Listening..."}
            </p>
          </div>
        </div>

        {/* Transcription Display */}
        <div className={`mt-16 transition-all duration-500 max-w-xl text-center ${isCalling ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">Real-time Analysis</p>
            <p className="text-xl md:text-2xl font-medium text-zinc-200 leading-relaxed italic">
              {transcript ? `"${transcript}"` : "The AI will guide your conversation here..."}
            </p>
          </div>
        </div>
      </div>

      {/* Controls Footer */}
      <div className="w-full max-w-md pb-6 z-10">
        {!isCalling ? (
          <Button 
            onClick={startInterview}
            className="w-full h-16 bg-white text-black hover:bg-zinc-200 rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-transform active:scale-95"
          >
            Enter Interview Space
          </Button>
        ) : (
          <Button 
            onClick={() => vapi.stop()}
            variant="destructive"
            className="w-full h-16 rounded-2xl font-bold text-lg flex items-center gap-3 transition-transform active:scale-95"
          >
            <PhoneOff size={20} /> END SESSION
          </Button>
        )}
        <p className="text-center text-zinc-600 text-[10px] mt-6 tracking-widest uppercase font-medium">
          Powered by MockWise Neural Engine v2.0
        </p>
      </div>
    </div>
  );
}