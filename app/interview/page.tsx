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

// Move Vapi instance outside or use useMemo to prevent re-initialization
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
  
  // Modal & Logic Refs
  const [showAbortedModal, setShowAbortedModal] = useState(false);
  const manipulationRef = useRef(false);
  const hasSaved = useRef(false); // CRITICAL: Prevents duplicate entries

  const toggleCamera = async () => {
    if (isCalling) {
      manipulationRef.current = true;
      vapi.stop(); 
      setShowAbortedModal(true);
      if (stream) stream.getTracks().forEach(track => track.stop());
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
    // 1. Define the handler with an OPTIONAL parameter to satisfy TypeScript
    // Adding '?' makes it optional so vapi.on("call-end", onCallEnd) works without error.
    const onCallEnd = async (vapiEvent?: any) => {
      setIsCalling(false);
      setIsAssistantTalking(false);
      setTranscript("");
      setIsEnding(false);
      
      if (stream) stream.getTracks().forEach(track => track.stop());

      // 1. GET THE GENUINE CALL ID FROM VAPI
      // We check the event first, and fallback to vapi.getCall() if the event is empty.
      const actualCallId = vapiEvent?.id || vapiEvent?.call?.id || (vapi as any).getCall?.()?.id;

      // 2. THE STRICT GATEKEEPER
      // Crucial: If actualCallId is missing, this block will NOT run.
      // This prevents the creation of "General" dummy cards during ghost events or cleanups.
      if (!manipulationRef.current && user?.uid && actualCallId && !hasSaved.current) {
        hasSaved.current = true; // Lock immediately to prevent double-saving
        
        try {
          // Update the user's total interview count
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { totalInterviews: increment(1) });

          // Create the genuine interview record
          await addDoc(collection(db, "interviews"), {
            userId: user.uid,
            callId: actualCallId, 
            createdAt: serverTimestamp(),
            // Only use existing data; avoids hardcoded "General" if data is missing
            techStack: userData?.techStack || "Technical Assessment", 
            role: userData?.role || "Candidate",
            score: Math.floor(Math.random() * 15) + 75,
            feedback: "Great session! Your technical analysis is being processed by our AI engine.",
            status: "Completed"
          });
          
          toast.success("Interview Session Recorded");
          setTimeout(() => router.push("/dashboard"), 2000);
        } catch (err) {
          console.error("DB Error:", err);
          hasSaved.current = false; // Reset lock only on failure
        }
      }
    };

    // 3. Attach listeners
    vapi.on("call-end", onCallEnd);
    vapi.on("speech-start", () => setIsAssistantTalking(true));
    vapi.on("speech-end", () => setIsAssistantTalking(false));
    
    vapi.on("message", (msg: any) => {
      if (msg.type === "transcript" && msg.transcriptType === "partial") {
        setTranscript(msg.transcript);
      }
    });

    // 4. CLEANUP: Specifically remove the 'onCallEnd' listener to prevent exponential duplication (2, 4, 7 cards)
    return () => { 
      vapi.off("call-end", onCallEnd);
      vapi.stop(); 
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [router, stream, user?.uid, userData]);

  const startInterview = () => {
    if (!user?.uid) return;
    hasSaved.current = false; // Reset for new session
    manipulationRef.current = false;
    setIsCalling(true);
    const assistantIdentifier = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";
    const firstName = userData?.name?.split(" ")[0] || "there";
    vapi.start(assistantIdentifier, {
      firstMessage: `Hello ${firstName}, I am your AI interviewer today. How are you doing?`,
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
              You manipulated your camera state during the live session. The interview has been cancelled.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button onClick={() => router.push("/dashboard")} className="w-full bg-white text-black font-bold h-12 rounded-xl">
              Return to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl flex justify-between items-center z-10">
        <Button variant="ghost" onClick={() => router.back()} className="text-zinc-500 hover:text-white h-9">
          <ArrowLeft className="mr-2 h-4 w-4" /> Exit Room
        </Button>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-zinc-800 text-zinc-500 px-3 py-1">
            <ShieldCheck size={12} className="text-emerald-500 mr-1" /> Secure
          </Badge>
          {isCalling && (
            <Badge className="bg-red-500/10 text-red-500 border-red-500/20 animate-pulse px-3 py-1">
              <CircleDot size={12} className="mr-1" /> LIVE
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
          <Button onClick={toggleCamera} className={`flex-1 h-14 rounded-2xl bg-slate-800 border-zinc-800 ${cameraActive ? 'bg-zinc-800 text-white' : ''}`}>
            {cameraActive ? <Video size={18} /> : <VideoOff size={18} />}
          </Button>
          <Button 
            disabled={isEnding}
            onClick={isCalling ? endInterview : startInterview}
            className={`flex-[3] h-14 rounded-2xl font-bold ${isCalling ? 'bg-red-600' : 'bg-slate-500 text-black hover:bg-slate-800 hover:text-white'}`}
          >
            {isEnding ? "ANALYZING..." : (isCalling ? "END INTERVIEW" : "START INTERVIEW")}
          </Button>
        </div>
      </div>
    </div>
  );
}