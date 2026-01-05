import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export function useUser() {
  const [userData, setUserData] = useState<any>(null);
  const [loadingg, setLoadingg] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoadingg(true); // Start loading when state changes
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (err) {
          console.error("Hook Error:", err);
        }
      } else {
        setUserData(null);
      }
      setLoadingg(false); // End loading regardless
    });

    return () => unsubscribe();
  }, []);

  return { userData, loadingg };
}