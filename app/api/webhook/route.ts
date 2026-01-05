export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Incoming Webhook Type:", body.message?.type);

    if (body.message?.type === "tool-calls") {
      const toolCall = body.message.toolCalls[0];
      
      if (toolCall.function.name === "evaluate_interview") {
        // --- CHANGE START ---
        // Handle cases where arguments are already parsed as an object
        let args;
        if (typeof toolCall.function.arguments === 'string') {
          args = JSON.parse(toolCall.function.arguments);
        } else {
          args = toolCall.function.arguments;
        }
        // --- CHANGE END ---

        console.log("Saving data for User:", args.userId);

        const docRef = await addDoc(collection(db, "interviews"), {
          userId: args.userId || "unknown",
          role: args.role || "Technical Interview",
          techStack: args.techStack || "General",
          level: args.level || "Standard",
          score: Number(args.score) || 0,
          feedback: args.feedback || "No feedback provided.",
          createdAt: serverTimestamp(),
        });

        console.log("Document saved with ID:", docRef.id);
        return NextResponse.json({ success: true, id: docRef.id });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) { // Changed to 'any' to access .message
    console.error("WEBHOOK ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}