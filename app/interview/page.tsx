/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/hooks/use-user"; 
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";

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
  ArrowLeft,
  Video,
  VideoOff,
  Loader2
} from "lucide-react";

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "");

export default function InterviewPage() {
  const { user } = useAuth();
  const { userData } = useUser(); 
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  // States
  const [isCalling, setIsCalling] = useState(false);
  const [isAssistantTalking, setIsAssistantTalking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isEnding, setIsEnding] = useState(false);

  const toggleCamera = async () => {
    if (isCalling) {
      toast.warning("Camera State Changed", {
        description: "Consistency is important for AI analysis.",
        duration: 3000,
      });
    }

    if (cameraActive) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
      setCameraActive(false);
    } else {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setCameraActive(true);
      } catch (err) {
        console.error("Camera access denied:", err);
        toast.error("Camera Error", {
          description: "Could not access camera. Please check permissions."
        });
      }
    }
  };

  useEffect(() => {
    vapi.on("call-end", () => {
      setIsCalling(false);
      setIsAssistantTalking(false);
      setTranscript("");
      setIsEnding(false);
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      toast.success("Interview Completed", { description: "Redirecting to your dashboard..." });
      setTimeout(() => router.push("/dashboard"), 2000);
    });

    vapi.on("speech-start", () => setIsAssistantTalking(true));
    vapi.on("speech-end", () => setIsAssistantTalking(false));

    vapi.on("message", (message) => {
      if (message.type === "transcript" && message.transcriptType === "partial") {
        setTranscript(message.transcript);
      }
    });

    vapi.on("error", (e) => {
      console.error("Vapi Error:", e);
      setIsEnding(false);
      toast.error("Connection Error", { description: "An error occurred with the AI assistant." });
    });

    return () => { 
      vapi.stop(); 
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [router, stream]); 

  const startInterview = () => {
    if (!user?.uid) {
      toast.error("Session Error", { description: "User not authenticated." });
      return;
    }

    setIsCalling(true);

    // Prepare greeting
    const firstName = userData?.name?.split(" ")[0] || "there";
    const assistantIdentifier = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";

    // The SDK expects the ID as the first argument, 
    // and an object for overrides/options as the second.
    vapi.start(assistantIdentifier, {
      firstMessage: `Hello ${firstName}, I am your AI interviewer today. I've reviewed your profile and I'm ready to begin. How are you doing today?`,
      variableValues: { 
        userId: user.uid,
        userName: userData?.name || "Developer" 
      },
    });
  };

  const endInterview = () => {
    setIsEnding(true);
    vapi.stop();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-between p-4 md:p-12 overflow-hidden">
      <Toaster position="top-center" theme="dark" richColors />

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-500/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

      {/* Header Info */}
      <div className="w-full max-w-5xl flex justify-between items-center z-10">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="text-zinc-500 hover:text-white transition-colors h-9 px-2 md:px-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> <span className="hidden xs:inline">Exit Room</span>
        </Button>
        <div className="flex items-center gap-2 md:gap-4">
          <Badge variant="outline" className="border-zinc-800 text-zinc-500 gap-1.5 px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs">
            <ShieldCheck size={12} className="text-emerald-500" /> Secure
          </Badge>
          {isCalling && (
            <Badge className="bg-red-500/10 text-red-500 border-red-500/20 animate-pulse gap-1.5 px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs">
              <CircleDot size={12} /> LIVE
            </Badge>
          )}
        </div>
      </div>

      {/* Main Experience */}
      <div className="relative flex flex-col items-center justify-center z-10 w-full max-w-4xl flex-1">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full">
          
          {/* Neural Orb Container */}
          <div className="relative">
            {isCalling && (
              <>
                <div className={`absolute inset-0 rounded-full border border-indigo-500/50 animate-ping duration-[3000ms] ${isAssistantTalking ? 'opacity-100' : 'opacity-0'}`} />
                <div className={`absolute inset-0 rounded-full border border-white/20 animate-pulse duration-[2000ms]`} />
              </>
            )}
            
            <div className={`w-32 h-32 md:w-64 md:h-64 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-700 relative z-20 ${
              isCalling 
                ? (isAssistantTalking ? "border-white bg-white/5 scale-105 md:scale-110 shadow-[0_0_80px_rgba(255,255,255,0.1)]" : "border-indigo-500 bg-indigo-500/5 scale-100") 
                : "border-zinc-800 bg-zinc-900/20"
            }`}>
              {isCalling ? (
                isAssistantTalking ? <Waves className="h-6 w-6 md:h-10 md:w-10 text-white animate-bounce" /> : <Mic className="h-6 w-6 md:h-10 md:w-10 text-indigo-500 animate-pulse" />
              ) : <MicOff className="h-6 w-6 md:h-10 md:w-10 text-zinc-700" />}
              <p className="mt-2 md:mt-4 text-[8px] md:text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">AI Senses</p>
            </div>
          </div>

          {/* Camera Feed Container */}
          <div className={`relative group transition-all duration-700 ease-in-out ${cameraActive ? 'opacity-100 scale-100 w-48 h-36 md:w-80 md:h-60' : 'opacity-0 scale-95 w-0 h-0 overflow-hidden'}`}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-zinc-800 bg-zinc-900 shadow-2xl transition-all duration-500"
            />
            <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4">
              <Badge className="bg-black/60 backdrop-blur-md border-zinc-700 text-[8px] md:text-[10px] text-zinc-300 px-2 md:px-3">Candidate Feed</Badge>
            </div>
          </div>
        </div>

        {/* Transcription Display */}
        <div className={`mt-8 md:mt-16 transition-all duration-500 w-full max-w-xl text-center px-2 ${isCalling ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl">
            <p className="text-base md:text-2xl font-medium text-zinc-200 leading-relaxed italic line-clamp-4 md:line-clamp-none">
              {transcript ? `"${transcript}"` : "The AI is listening..."}
            </p>
          </div>
        </div>
      </div>

      {/* Controls Footer */}
      <div className="w-full max-w-md flex flex-col gap-4 pb-4 md:pb-6 z-10">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={toggleCamera}
            className={`flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl border-zinc-800 transition-all ${cameraActive ? 'bg-zinc-800 text-white' : 'bg-transparent text-zinc-500 hover:text-white'}`}
          >
            {cameraActive ? <Video size={18} className="md:mr-2 text-indigo-400" /> : <VideoOff size={18} className="md:mr-2" />}
            <span className="hidden xs:inline">{cameraActive ? "On" : "Off"}</span>
          </Button>

          <Button 
            disabled={isEnding}
            onClick={isCalling ? endInterview : startInterview}
            className={`flex-[3] h-12 md:h-14 rounded-xl md:rounded-2xl font-bold text-sm md:text-lg transition-all ${isCalling ? 'bg-red-600 hover:bg-red-700' : 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_30px_rgba(255,255,255,0.1)]'}`}
          >
            {isEnding ? (
              <><Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" /> ANALYZING...</>
            ) : (
              isCalling ? <><PhoneOff size={18} className="mr-2" /> END</> : "START INTERVIEW"
            )}
          </Button>
        </div>
        <p className="text-center text-zinc-600 text-[8px] md:text-[10px] tracking-widest uppercase font-medium">
          Powered by MockWise Neural Engine
        </p>
      </div>
    </div>
  );
}