"use client";
import { useEffect, useState, useRef } from "react";
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
  ArrowLeft,
  Video,
  VideoOff,
  Loader2
} from "lucide-react";

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "");

export default function InterviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  // States
  const [isCalling, setIsCalling] = useState(false);
  const [isAssistantTalking, setIsAssistantTalking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isEnding, setIsEnding] = useState(false);

  // Toggle Camera Logic
  const toggleCamera = async () => {
    if (cameraActive) {
      // Turn off camera
      stream?.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    } else {
      // Turn on camera
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setCameraActive(true);
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }
  };

  useEffect(() => {
    vapi.on("call-end", () => {
      setIsCalling(false);
      setIsAssistantTalking(false);
      setTranscript("");
      // Ensure camera turns off when call ends
      stream?.getTracks().forEach(track => track.stop());
      setTimeout(() => router.push("/dashboard"), 2000);
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
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [router, stream]);

  const startInterview = () => {
    setIsCalling(true);
    vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "", {
      variableValues: { userId: user?.uid },
    });
  };

  const endInterview = () => {
  setIsEnding(true);
  vapi.stop();
};

//   return (
//     <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden">
//       {/* Background Glow */}
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

//       {/* Header Info */}
//       <div className="w-full max-w-5xl flex justify-between items-center z-10">
//         <Button 
//           variant="ghost" 
//           onClick={() => router.back()} 
//           className="text-zinc-500 hover:text-white transition-colors"
//         >
//           <ArrowLeft className="mr-2 h-4 w-4" /> Exit Room
//         </Button>
//         <div className="flex items-center gap-4">
//           <Badge variant="outline" className="border-zinc-800 text-zinc-500 gap-2 px-3 py-1">
//             <ShieldCheck size={14} className="text-emerald-500" /> Secure Session
//           </Badge>
//           {isCalling && (
//             <Badge className="bg-red-500/10 text-red-500 border-red-500/20 animate-pulse gap-2 px-3 py-1">
//               <CircleDot size={14} /> LIVE
//             </Badge>
//           )}
//         </div>
//       </div>

//       {/* Main Experience: The Neural Orb + Camera */}
//       <div className="relative flex flex-col items-center justify-center z-10 w-full max-w-4xl">
//         <div className="flex flex-col md:flex-row items-center gap-12">
          
//           <div className="relative">
//             {isCalling && (
//               <>
//                 <div className={`absolute inset-0 rounded-full border border-indigo-500/50 animate-ping duration-[3000ms] ${isAssistantTalking ? 'opacity-100' : 'opacity-0'}`} />
//                 <div className={`absolute inset-0 rounded-full border border-white/20 animate-pulse duration-[2000ms]`} />
//               </>
//             )}
            
//             <div className={`w-48 h-48 md:w-64 md:h-64 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-700 relative z-20 ${
//               isCalling 
//                 ? (isAssistantTalking ? "border-white bg-white/5 scale-110 shadow-[0_0_80px_rgba(255,255,255,0.1)]" : "border-indigo-500 bg-indigo-500/5 scale-100") 
//                 : "border-zinc-800 bg-zinc-900/20"
//             }`}>
//               {isCalling ? (
//                 isAssistantTalking ? <Waves className="h-10 w-10 text-white animate-bounce" /> : <Mic className="h-10 w-10 text-indigo-500 animate-pulse" />
//               ) : <MicOff className="h-10 w-10 text-zinc-700" />}
//               <p className="mt-4 text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">AI Senses</p>
//             </div>
//           </div>

//           {/* THE CAMERA PREVIEW */}
//           <div className={`relative group transition-all duration-700 ease-in-out ${cameraActive ? 'opacity-100 scale-100 w-64 h-48 md:w-80 md:h-60' : 'opacity-0 scale-95 w-0 h-0 overflow-hidden'}`}>
//             <video 
//               ref={videoRef} 
//               autoPlay 
//               playsInline 
//               muted 
//               className="w-full h-full object-cover rounded-[2rem] border-2 border-zinc-800 bg-zinc-900 shadow-2xl grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
//             />
//             <div className="absolute bottom-4 left-4">
//               <Badge className="bg-black/60 backdrop-blur-md border-zinc-700 text-[10px] text-zinc-300 px-3">Candidate Feed</Badge>
//             </div>
//           </div>
//         </div>

//         {/* Transcription Display */}
//         <div className={`mt-16 transition-all duration-500 max-w-xl text-center ${isCalling ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
//           <div className="bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl">
//             <p className="text-xl md:text-2xl font-medium text-zinc-200 leading-relaxed italic">
//               {transcript ? `"${transcript}"` : "Waiting for audio..."}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Controls Footer */}
//       <div className="w-full max-w-md flex flex-col gap-4 pb-6 z-10">
//         <div className="flex gap-3">
//           {/* CAMERA TOGGLE BUTTON */}
//           <Button 
//             variant="outline" 
//             onClick={toggleCamera}
//             className={`flex-1 h-14 rounded-2xl border-zinc-800 transition-all ${cameraActive ? 'bg-zinc-800 text-white' : 'bg-transparent text-zinc-500 hover:text-white'}`}
//           >
//             {cameraActive ? <Video size={20} className="mr-2 text-indigo-400" /> : <VideoOff size={20} className="mr-2" />}
//             {cameraActive ? "On" : "Off"}
//           </Button>

//           <Button 
//             onClick={isCalling ? () => vapi.stop() : startInterview}
//             className={`flex-[3] h-14 rounded-2xl font-bold text-lg transition-all ${isCalling ? 'bg-red-600 hover:bg-red-700' : 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_30px_rgba(255,255,255,0.1)]'}`}
//           >
//             {isCalling ? <><PhoneOff size={20} className="mr-2" /> END SESSION</> : "START INTERVIEW"}
//           </Button>
//         </div>
//         <p className="text-center text-zinc-600 text-[10px] tracking-widest uppercase font-medium">
//           Powered by MockWise Neural Engine v2.0
//         </p>
//       </div>
//     </div>
//   );
// }
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

      {/* Main Experience */}
      <div className="relative flex flex-col items-center justify-center z-10 w-full max-w-4xl">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="relative">
            {isCalling && (
              <>
                <div className={`absolute inset-0 rounded-full border border-indigo-500/50 animate-ping duration-[3000ms] ${isAssistantTalking ? 'opacity-100' : 'opacity-0'}`} />
                <div className={`absolute inset-0 rounded-full border border-white/20 animate-pulse duration-[2000ms]`} />
              </>
            )}
            
            <div className={`w-48 h-48 md:w-64 md:h-64 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-700 relative z-20 ${
              isCalling 
                ? (isAssistantTalking ? "border-white bg-white/5 scale-110 shadow-[0_0_80px_rgba(255,255,255,0.1)]" : "border-indigo-500 bg-indigo-500/5 scale-100") 
                : "border-zinc-800 bg-zinc-900/20"
            }`}>
              {isCalling ? (
                isAssistantTalking ? <Waves className="h-10 w-10 text-white animate-bounce" /> : <Mic className="h-10 w-10 text-indigo-500 animate-pulse" />
              ) : <MicOff className="h-10 w-10 text-zinc-700" />}
              <p className="mt-4 text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">AI Senses</p>
            </div>
          </div>

          <div className={`relative group transition-all duration-700 ease-in-out ${cameraActive ? 'opacity-100 scale-100 w-64 h-48 md:w-80 md:h-60' : 'opacity-0 scale-95 w-0 h-0 overflow-hidden'}`}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover rounded-[2rem] border-2 border-zinc-800 bg-zinc-900 shadow-2xl grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
            />
          </div>
        </div>

        {/* Transcription Display */}
        <div className={`mt-16 transition-all duration-500 max-w-xl text-center ${isCalling ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl">
            <p className="text-xl md:text-2xl font-medium text-zinc-200 leading-relaxed italic">
              {transcript ? `"${transcript}"` : "Waiting for audio..."}
            </p>
          </div>
        </div>
      </div>

      {/* Controls Footer */}
      <div className="w-full max-w-md flex flex-col gap-4 pb-6 z-10">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={toggleCamera}
            className={`flex-1 h-14 rounded-2xl border-zinc-800 transition-all ${cameraActive ? 'bg-zinc-800 text-white' : 'bg-transparent text-zinc-500 hover:text-white'}`}
          >
            {cameraActive ? <Video size={20} className="mr-2 text-indigo-400" /> : <VideoOff size={20} className="mr-2" />}
            {cameraActive ? "On" : "Off"}
          </Button>

          <Button 
            disabled={isEnding} // NEW: Button disables when ending
            onClick={isCalling ? endInterview : startInterview}
            className={`flex-[3] h-14 rounded-2xl font-bold text-lg transition-all ${isCalling ? 'bg-red-600 hover:bg-red-700' : 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_30px_rgba(255,255,255,0.1)]'}`}
          >
            {isEnding ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> ANALYZING...</>
            ) : (
              isCalling ? <><PhoneOff size={20} className="mr-2" /> END SESSION</> : "START INTERVIEW"
            )}
          </Button>
        </div>
        <p className="text-center text-zinc-600 text-[10px] tracking-widest uppercase font-medium">
          Powered by MockWise Neural Engine v2.0
        </p>
      </div>
    </div>
  );
}