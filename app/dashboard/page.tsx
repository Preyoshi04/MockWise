"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  // 1. Protect the Route
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // 2. Fetch User Interviews from Firestore
  useEffect(() => {
    const fetchUserInterviews = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "interviews"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInterviews(data);
      } catch (err) {
        console.error("Error fetching interviews:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchUserInterviews();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading || !user) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-black text-indigo-600 tracking-tighter">MockWise</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600 hidden md:block">{user.email}</span>
          <button 
            onClick={handleLogout}
            className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-12 space-y-12">
        {/* Call to Action Section */}
        <section className="bg-indigo-600 rounded-[2rem] p-8 md:p-12 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
          <div className="relative z-10 max-w-lg">
            <h2 className="text-4xl font-bold mb-4">Start a new Mock Interview</h2>
            <p className="text-indigo-100 mb-8">Practice with our AI and get a detailed score report in minutes.</p>
            <button 
              onClick={() => router.push("/interview")}
              className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black hover:scale-105 transition-transform"
            >
              + GO TO INTERVIEW ROOM
            </button>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
        </section>

        {/* User Interview List */}
        <section>
          <h3 className="text-2xl font-bold mb-6 text-gray-800">Your Recent Activity</h3>
          {fetching ? (
            <p className="text-gray-400">Loading your sessions...</p>
          ) : interviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviews.map((interview) => (
                <div key={interview.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase">
                      {interview.role || "General"}
                    </span>
                    <span className="text-2xl font-black text-gray-800">{interview.score}<span className="text-xs text-gray-400">/100</span></span>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">{interview.feedback || "No feedback generated yet."}</p>
                  <button className="w-full py-3 rounded-xl border border-gray-200 font-bold text-sm text-gray-700 hover:bg-gray-50">
                    View Full Analysis
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
              <p className="text-gray-400 mb-4">You haven't completed any interviews yet.</p>
              <button onClick={() => router.push("/interview")} className="text-indigo-600 font-bold">Start your first one now →</button>
            </div>
          )}
        </section>

        {/* Community Section */}
        <section className="border-t pt-12">
          <h3 className="text-2xl font-bold mb-2 text-gray-800">Community Spotlight</h3>
          <p className="text-gray-500 mb-8">See how other candidates are scoring across different industries.</p>
          <div className="bg-white rounded-3xl p-8 border border-gray-100 flex items-center justify-center italic text-gray-400">
            Community leaderboards coming soon!
          </div>
        </section>
      </main>
    </div>
  );
}