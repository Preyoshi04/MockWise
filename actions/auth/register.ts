"use server";

import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!email || !password || !fullName) {
    return { error: "All fields are required" };
  }

  try {
    // 1. Create User in Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Save User Details to Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: fullName,
      email: email,
      createdAt: serverTimestamp(),
      totalInterviews: 0,
      plan: "free",
    });

    /** * CRITICAL: Firebase often auto-signs in the user on the current instance.
     * We sign out immediately to ensure no "ghost session" exists that 
     * would trigger the Middleware redirect to Dashboard.
     */
    await signOut(auth);

    // Return only plain serializable data
    return { success: true, uid: user.uid };
  } catch (error: any) {
    console.error("Registration Error:", error.code);
    return { error: error.message || "Failed to create account" };
  }
}