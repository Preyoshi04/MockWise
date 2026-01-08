/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  increment,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

// Shadcn + Lucide Components
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
  Mic,
  MicOff,
  ShieldCheck,
  CircleDot,
  ArrowLeft,
  Video,
  VideoOff,
  AlertTriangle,
} from "lucide-react";

// Initialize Vapi once
const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "");

export default function InterviewPage() {
  const { user } = useAuth();
  const { userData } = useUser();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- States ---
  const [isCalling, setIsCalling] = useState(false);
  const [isAssistantTalking, setIsAssistantTalking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isEnding, setIsEnding] = useState(false);

  // --- Modals & Guard Refs ---
  const [showAbortedModal, setShowAbortedModal] = useState(false);
  const sessionAborted = useRef(false);
  const hasSaved = useRef(false);
  const initialCameraState = useRef<boolean | null>(null);

  const userIdRef = useRef<string | null>(null);

  // --- 1. Camera Logic (With Manipulation Detection) ---
  const toggleCamera = async () => {
    // If the user tries to toggle camera while calling, they are manipulating the session
    if (isCalling) {
      handleManipulation();
      return;
    }

    if (cameraActive) {
      stopCamera();
    } else {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setStream(mediaStream);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
        setCameraActive(true);
      } catch (err) {
        toast.error("Camera Error", {
          description: "Please enable camera access.",
        });
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setCameraActive(false);
  };

  const handleManipulation = () => {
    sessionAborted.current = true;
    vapi.stop(); // Immediately end the Vapi call
    stopCamera();
    setShowAbortedModal(true);
    toast.error("Session Cancelled", {
      description: "Camera manipulation detected.",
    });
  };

  // --- 2. The Core Interview Logic (Vapi Listeners) ---
  useEffect(() => {
    const onCallEnd = async (vapiEvent?: any) => {
  setIsCalling(false);
  stopCamera();

  if (sessionAborted.current) return;

  // 1. Get the data from the event (fixes red squiggles)
  const vapiScore = vapiEvent?.analysis?.score || 0;
  const feedbackText = vapiEvent?.analysis?.summary || "No feedback generated.";
  const callId = vapiEvent?.id || "manual-id";
  const currentUid = user?.uid;

  if (currentUid && !hasSaved.current) {
    hasSaved.current = true;
    try {
      // 2. Save using the EXACT fields your index expects
      await addDoc(collection(db, "interviews"), {
        userId: currentUid,
        role: userData?.role || "Software Engineer",
        techStack: userData?.techStack || "Java",
        feedback: feedbackText,
        score: vapiScore,
        createdAt: serverTimestamp(),
        status: "Completed",
      });

      toast.success("Interview Saved!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Save Error:", error);
      hasSaved.current = false;
    }
  }
};
    // Attach Vapi Event Listeners
    vapi.on("call-end", onCallEnd);
    vapi.on("speech-start", () => setIsAssistantTalking(true));
    vapi.on("speech-end", () => setIsAssistantTalking(false));
    vapi.on("message", (msg: any) => {
      if (msg.type === "transcript" && msg.transcriptType === "partial") {
        setTranscript(msg.transcript);
      }
    });

    // Cleanup: Prevent multiple listeners from stacking
    return () => {
      vapi.off("call-end", onCallEnd);
      vapi.stop();
      stopCamera();
    };
  }, [user, userData, router]);

  // --- 3. Interview Controls ---
 const startInterview = () => {
  if (!user?.uid) return toast.error("Please log in first.");

  // LOCK the current user's ID so we have it when the call ends
  userIdRef.current = user.uid;
  console.log("Session started for User ID:", userIdRef.current);

  hasSaved.current = false;
  sessionAborted.current = false;
  initialCameraState.current = cameraActive;

  setIsCalling(true);
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";
  const name = userData?.name?.split(" ")[0] || "Candidate";

  vapi.start(assistantId, {
    firstMessage: `Hello ${name}, I am your AI interviewer. Let's begin the session.`,
    // THIS LINE IS THE FIX: It sends your UID to the Vapi Tool
    variableValues: {
      userId: user.uid,
    },
  });
};
  const endInterview = () => {
    setIsEnding(true);
    vapi.stop();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden">
      <Toaster position="top-center" richColors theme="dark" />

      {/* --- Aborted Modal --- */}
      <Dialog open={showAbortedModal} onOpenChange={setShowAbortedModal}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white rounded-[2rem]">
          <DialogHeader className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <DialogTitle className="text-2xl font-bold">
              Session Terminated
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-center text-base">
              Camera state manipulation detected. The interview session has been
              cancelled to ensure integrity.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-white text-black font-bold h-12 rounded-xl"
            >
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Header --- */}
      <div className="w-full max-w-5xl flex justify-between items-center z-10">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-zinc-500 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Exit Room
        </Button>
        <div className="flex gap-4">
          <Badge variant="outline" className="border-zinc-800 text-zinc-500">
            <ShieldCheck size={12} className="text-emerald-500 mr-1" /> Secure
            Session
          </Badge>
          {isCalling && (
            <Badge className="bg-red-500/10 text-red-500 border-red-500/20 animate-pulse">
              <CircleDot size={12} className="mr-1" /> LIVE
            </Badge>
          )}
        </div>
      </div>

      {/* --- UI Visuals (Logo/Camera) --- */}
      <div className="relative flex flex-col items-center justify-center z-10 w-full flex-1">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* AI Interface Circle */}
          <div className="relative">
            {isCalling && (
              <div
                className={`absolute inset-0 rounded-full border border-indigo-500/30 animate-ping ${
                  isAssistantTalking ? "opacity-100" : "opacity-0"
                }`}
              />
            )}
            <div
              className={`w-40 h-40 md:w-64 md:h-64 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${
                isCalling
                  ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_50px_rgba(99,102,241,0.2)]"
                  : "border-zinc-800"
              }`}
            >
              <Mic
                className={`h-12 w-12 ${
                  isCalling ? "text-indigo-500" : "text-zinc-700"
                }`}
              />
            </div>
          </div>

          {/* User Camera Preview */}
          <div
            className={`relative transition-all duration-700 ${
              cameraActive
                ? "opacity-100 w-80 h-60"
                : "opacity-0 w-0 h-0 overflow-hidden"
            }`}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-[2.5rem] border-2 border-zinc-800 bg-zinc-900"
            />
          </div>
        </div>

        {/* --- TRANSCRIPTION AREA --- */}
        <div
          className={`mt-12 transition-all duration-500 w-full max-w-xl text-center min-h-[100px] ${
            isCalling ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md p-6 rounded-[2rem]">
            <p className="text-lg text-zinc-300 italic leading-relaxed">
              {transcript || "The AI is listening..."}
            </p>
          </div>
        </div>
      </div>

      {/* --- Footer Controls --- */}
      <div className="w-full max-w-md flex flex-col gap-4 pb-10 z-10">
        <div className="flex gap-3">
          <Button
            onClick={toggleCamera}
            className={`flex-1 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 ${
              cameraActive
                ? "text-indigo-400 border-indigo-500/30"
                : "text-zinc-500"
            }`}
          >
            {cameraActive ? <Video size={20} /> : <VideoOff size={20} />}
          </Button>
          <Button
            disabled={isEnding}
            onClick={isCalling ? endInterview : startInterview}
            className={`flex-[3] h-14 rounded-2xl font-bold transition-all ${
              isCalling
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-white text-black hover:bg-zinc-200"
            }`}
          >
            {isEnding
              ? "PROCESSING..."
              : isCalling
              ? "END INTERVIEW"
              : "START INTERVIEW"}
          </Button>
        </div>
      </div>
    </div>
  );
}
