export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Incoming Webhook Type:", body.message?.type);

    // Vapi sends 'tool-calls' when the assistant triggers your function
    if (body.message?.type === "tool-calls") {
      const toolCall = body.message.toolCalls[0];
      
      if (toolCall.function.name === "evaluate_interview") {
        // AI sends arguments as a string, we MUST parse it
        const args = JSON.parse(toolCall.function.arguments);
        console.log("Parsed Arguments:", args);

        // Save to Firestore
        const docRef = await addDoc(collection(db, "interviews"), {
          userId: args.userId,
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
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}