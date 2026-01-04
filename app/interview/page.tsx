"use client";
import { useEffect, useState } from "react";
import Vapi from "@vapi-ai/web";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "");

export default function InterviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCalling, setIsCalling] = useState(false);
  const [isAssistantTalking, setIsAssistantTalking] = useState(false);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    // 1. Handle Call End
    vapi.on("call-end", () => {
      setIsCalling(false);
      setIsAssistantTalking(false);
      setTranscript("");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    });

    // 2. Handle Assistant Speaking State
    vapi.on("speech-start", () => setIsAssistantTalking(true));
    vapi.on("speech-end", () => setIsAssistantTalking(false));

    // 3. Handle Transcriptions
    vapi.on("message", (message) => {
      if (message.type === "transcript" && message.transcriptType === "partial") {
        setTranscript(message.transcript);
      }
    });

    return () => {
      vapi.stop();
    };
  }, [router]);

  const startInterview = () => {
    setIsCalling(true);
    vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "", {
      variableValues: {
        userId: user?.uid,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
      {/* Visual Orb */}
      <div
        className={`w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
          isCalling
            ? isAssistantTalking 
              ? "border-emerald-500 scale-105 shadow-[0_0_40px_rgba(16,185,129,0.2)]" 
              : "border-indigo-500 animate-pulse scale-110"
            : "border-slate-800"
        }`}
      >
        <span className="text-2xl font-bold uppercase tracking-widest text-center px-4">
          {!isCalling ? "Ready" : isAssistantTalking ? "Assistant Speaking" : "Listening"}
        </span>
      </div>

      {/* Action Button */}
      <button
        onClick={isCalling ? () => vapi.stop() : startInterview}
        className={`mt-12 px-10 py-4 rounded-2xl font-black transition-all active:scale-95 ${
          isCalling
            ? "bg-red-600 hover:bg-red-700"
            : "bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20"
        }`}
      >
        {isCalling ? "END INTERVIEW" : "START AI INTERVIEW"}
      </button>

      {/* Transcription Area */}
      {isCalling && (
        <div className="mt-8 max-w-lg w-full">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 text-center">
            Live Transcript
          </p>
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl min-h-[100px] text-center italic text-slate-300">
            {transcript || "Waiting for speech..."}
          </div>
        </div>
      )}
    </div>
  );
}