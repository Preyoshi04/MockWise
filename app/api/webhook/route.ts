import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Webhook Received:", body.message.type);

    // Vapi sends 'tool-calls' when the AI uses your custom tool
    if (body.message.type === "tool-calls") {
      const toolCall = body.message.toolCalls[0]; 
      
      if (toolCall.function.name === "evaluate_interview") {
        // This parses the data the AI sent
        const data = JSON.parse(toolCall.function.arguments);

        // SAVE TO FIRESTORE
        await addDoc(collection(db, "interviews"), {
          userId: data.userId,
          role: data.role || "Technical Interview",
          techStack: data.techStack || "General",
          level: data.level || "Unknown",
          score: Number(data.score) || 0,
          feedback: data.feedback || "No feedback provided.",
          createdAt: serverTimestamp(),
        });

        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ message: "Received" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}