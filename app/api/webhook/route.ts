// export const dynamic = 'force-dynamic';
// import { NextResponse } from "next/server";
// import { db } from "@/lib/firebase";
// import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     console.log("Incoming Webhook Type:", body.message?.type);

//     // THIS IS WHERE toolCall IS DEFINED
//     if (body.message?.type === "tool-calls") {
//       const toolCall = body.message.toolCalls[0]; // <--- It is defined here!
      
//       if (toolCall.function.name === "evaluate_interview") {
//         // Handle arguments whether they are string or object
//         const args = typeof toolCall.function.arguments === 'string' 
//           ? JSON.parse(toolCall.function.arguments) 
//           : toolCall.function.arguments;

//         console.log("FINAL ATTEMPT TO SAVE:", args);

//         const docData = {
//           userId: args.userId || "no-id-found",
//           role: args.role || "Technical Interview",
//           techStack: args.techStack || "General",
//           level: args.level || "Standard",
//           score: Number(args.score) || 0,
//           feedback: args.feedback || "No feedback provided.",
//           createdAt: serverTimestamp(),
//         };

//         const docRef = await addDoc(collection(db, "interviews"), docData);
//         console.log("SUCCESS! ID:", docRef.id);
        
//         return NextResponse.json({ success: true, id: docRef.id });
//       }
//     }

//     return NextResponse.json({ received: true });
//   } catch (error: any) {
//     console.error("WEBHOOK ERROR:", error.message);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // Use setDoc and doc

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Vapi usually sends the call object inside the message
    const callId = body.message?.call?.id || body.message?.callId; 
    
    console.log("Incoming Webhook Type:", body.message?.type);
    console.log("Call ID:", callId);

    if (body.message?.type === "tool-calls") {
      const toolCall = body.message.toolCalls[0];
      
      if (toolCall.function.name === "evaluate_interview") {
        const args = typeof toolCall.function.arguments === 'string' 
          ? JSON.parse(toolCall.function.arguments) 
          : toolCall.function.arguments;

        if (!callId) {
          throw new Error("No Call ID found. Cannot prevent duplicates.");
        }

        const docData = {
          userId: args.userId || "no-id-found",
          role: args.role || "Technical Interview",
          techStack: args.techStack || "General",
          level: args.level || "Standard",
          score: Number(args.score) || 0,
          feedback: args.feedback || "No feedback provided.",
          callId: callId, // Store the call ID for reference
          createdAt: serverTimestamp(),
        };

        // RESOLUTION: Use setDoc with callId as the document name
        // This ensures 1 Call = 1 Firestore Document
        const docRef = doc(db, "interviews", callId); 
        await setDoc(docRef, docData, { merge: true });

        console.log("SUCCESS! Idempotent Save with ID:", callId);
        
        return NextResponse.json({ success: true, id: callId });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("WEBHOOK ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}