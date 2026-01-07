/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/hooks/use-user"; 
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { db } from "@/lib/firebase"; 
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from "firebase/firestore";

// Shadcn + Lucide
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Mic, MicOff, PhoneOff, Waves, ShieldCheck, 
  CircleDot, ArrowLeft, Video, VideoOff, Loader2, AlertTriangle 
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
  
  // Modal State
  const [showAbortedModal, setShowAbortedModal] = useState(false);
  const manipulationRef = useRef(false);

  const toggleCamera = async () => {
    if (isCalling) {
      manipulationRef.current = true;
      vapi.stop(); 
      
      setShowAbortedModal(true);

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
      setCameraActive(false);
      return;
    }

    if (cameraActive) {
      if (stream) stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    } else {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
        setCameraActive(true);
      } catch (err) {
        toast.error("Camera Error", { description: "Could not access camera." });
      }
    }
  };

  useEffect(() => {
    vapi.on("call-end", async () => {
      setIsCalling(false);
      setIsAssistantTalking(false);
      setTranscript("");
      setIsEnding(false);
      
      if (stream) stream.getTracks().forEach(track => track.stop());
      
      if (!manipulationRef.current && user?.uid) {
        try {
          // 1. UPDATE TOTAL COUNT IN USER PROFILE
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { totalInterviews: increment(1) });

          // 2. CREATE THE INTERVIEW RECORD (THE CARD)
          await addDoc(collection(db, "interviews"), {
            userId: user.uid,
            createdAt: serverTimestamp(),
            score: Math.floor(Math.random() * 15) + 75, // Placeholder score
            techStack: userData?.techStack || "General",
            feedback: "Great session! Your communication skills are strong. Analysis is being processed.",
            status: "Completed"
          });
          
          toast.success("Interview Completed", { 
            description: "Session recorded successfully." 
          });
          
          setTimeout(() => router.push("/dashboard"), 2000);
        } catch (err) {
          console.error("DB Update failed:", err);
        }
      }
    });

    vapi.on("speech-start", () => setIsAssistantTalking(true));
    vapi.on("speech-end", () => setIsAssistantTalking(false));

    vapi.on("message", (message) => {
      if (message.type === "transcript" && message.transcriptType === "partial") {
        setTranscript(message.transcript);
      }
    });

    return () => { 
      vapi.stop(); 
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [router, stream, user?.uid, userData]); 

  const startInterview = () => {
    if (!user?.uid) return;
    manipulationRef.current = false;
    setIsCalling(true);
    const assistantIdentifier = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";
    vapi.start(assistantIdentifier, {
      firstMessage: `Hello there, I am your AI interviewer. How are you?`,
    });
  };

  const endInterview = () => {
    setIsEnding(true);
    manipulationRef.current = false; 
    vapi.stop();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-between p-4 md:p-12 overflow-hidden">
      <Toaster position="top-center" theme="dark" richColors />

      <Dialog open={showAbortedModal} onOpenChange={setShowAbortedModal}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white rounded-[2rem]">
          <DialogHeader className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">Interview Terminated</DialogTitle>
            <DialogDescription className="text-zinc-400 text-center text-base">
              You manipulated your camera state during the live session. For security and fairness, the interview has been cancelled and will not be recorded.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
              onClick={() => router.push("/dashboard")}
              className="w-full bg-white text-black hover:bg-zinc-200 font-bold h-12 rounded-xl"
            >
              Return to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl flex justify-between items-center z-10">
        <Button variant="ghost" onClick={() => router.back()} className="text-zinc-500 hover:text-white transition-colors h-9">
          <ArrowLeft className="mr-2 h-4 w-4" /> Exit Room
        </Button>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-zinc-800 text-zinc-500 gap-1.5 px-3 py-1">
            <ShieldCheck size={12} className="text-emerald-500" /> Secure
          </Badge>
          {isCalling && (
            <Badge className="bg-red-500/10 text-red-500 border-red-500/20 animate-pulse gap-1.5 px-3 py-1">
              <CircleDot size={12} /> LIVE
            </Badge>
          )}
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center z-10 w-full max-w-4xl flex-1">
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full">
          <div className="relative">
            {isCalling && (
              <div className={`absolute inset-0 rounded-full border border-indigo-500/50 animate-ping ${isAssistantTalking ? 'opacity-100' : 'opacity-0'}`} />
            )}
            <div className={`w-32 h-32 md:w-64 md:h-64 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-700 ${isCalling ? "border-indigo-500 bg-indigo-500/5" : "border-zinc-800"}`}>
              {isCalling ? <Mic className="h-10 w-10 text-indigo-500" /> : <MicOff className="h-10 w-10 text-zinc-700" />}
            </div>
          </div>

          <div className={`relative transition-all duration-700 ${cameraActive ? 'opacity-100 w-80 h-60' : 'opacity-0 w-0 h-0 overflow-hidden'}`}>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-[2.5rem] border-2 border-zinc-800 bg-zinc-900 shadow-2xl" />
          </div>
        </div>

        <div className={`mt-16 transition-all duration-500 w-full max-w-xl text-center ${isCalling ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md p-8 rounded-[2.5rem]">
            <p className="text-xl text-zinc-200 italic">
              {transcript || "The AI is listening..."}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col gap-4 pb-6 z-10">
        <div className="flex gap-3">
          <Button onClick={toggleCamera} className={`flex-1 h-14 rounded-2xl bg-slate-800 border-zinc-800 cursor-pointer ${cameraActive ? 'bg-zinc-800 text-white' : ''}`}>
            {cameraActive ? <Video size={18} /> : <VideoOff size={18} />}
          </Button>
          <Button 
            disabled={isEnding}
            onClick={isCalling ? endInterview : startInterview}
            className={`flex-[3] h-14 rounded-2xl cursor-pointer font-bold ${isCalling ? 'bg-red-600' : 'bg-slate-500 text-black hover:bg-slate-800 hover:text-white'}`}
          >
            {isEnding ? "ANALYZING..." : (isCalling ? "END INTERVIEW" : "START INTERVIEW")}
          </Button>
        </div>
      </div>
    </div>
  );
}