/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, limit, orderBy, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Globe, BarChart3, ExternalLink, Newspaper, Loader2, ArrowLeft, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Cookies from "js-cookie";

export default function CommunityInsights() {
    const router = useRouter(); 
    const [stats, setStats] = useState({
        avgScore: 0,
        userAvgScore: 0,
        userSessionCount: 0,
        totalInterviews: 0,
        topStack: "Next.js",
        scoreDistribution: [] as { range: string; count: number }[],
        skillHeatmap: [] as { name: string; count: number }[],
        recentActivity: [] as any[],
        globalScores: [] as number[] 
    });

    const [trendingNews, setTrendingNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const formatTimeAgo = (dateString: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
        let interval = seconds / 3600;
        if (interval > 24) return Math.floor(interval / 24) + "d ago";
        if (interval >= 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        return Math.floor(interval) + "m ago";
    };

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const userId = Cookies.get("uid");
                
                const qGlobal = query(collection(db, "interviews"), orderBy("createdAt", "desc"), limit(200));
                const globalSnapshot = await getDocs(qGlobal);
                const globalDocs = globalSnapshot.docs.map(d => ({ ...d.data() } as any));
                const globalScores = globalDocs.map(d => Number(d.score) || 0);

                let userScores: number[] = [];
                if (userId) {
                    const qUser = query(collection(db, "interviews"), where("userId", "==", userId));
                    const userSnapshot = await getDocs(qUser);
                    userScores = userSnapshot.docs.map(d => Number(d.data().score) || 0);
                }

                const newsResponse = await fetch("https://hn.algolia.com/api/v1/search_by_date?tags=story&query=software,ai,coding,interview,companies&hitsPerPage=5");
                if (newsResponse.ok) {
                    const newsData = await newsResponse.json();
                    setTrendingNews(newsData.hits.map((story: any) => ({
                        id: story.objectID,
                        title: story.title,
                        url: story.url || `https://news.ycombinator.com/item?id=${story.objectID}`,
                        tag: story.author ? `@${story.author}` : "Tech",
                        time: formatTimeAgo(story.created_at)
                    })));
                }

                if (globalDocs.length > 0) {
                    const realAvg = Math.round(globalScores.reduce((a, b) => a + b, 0) / globalScores.length);
                    const userAvg = userScores.length > 0 ? Math.round(userScores.reduce((a, b) => a + b, 0) / userScores.length) : 0;

                    const distData = [
                        { range: "0-20", count: 0 }, { range: "20-40", count: 0 },
                        { range: "40-60", count: 0 }, { range: "60-80", count: 0 },
                        { range: "80-100", count: 0 },
                    ];
                    globalScores.forEach(s => {
                        const index = Math.min(Math.floor(s / 20.01), 4);
                        distData[index].count++;
                    });

                    const stacks: Record<string, number> = {};
                    globalDocs.forEach((doc: any) => {
                        const stack = doc.techStack || "General";
                        stacks[stack] = (stacks[stack] || 0) + 1;
                    });
                    const heatmap = Object.entries(stacks)
                        .map(([name, count]) => ({ name, count }))
                        .sort((a, b) => b.count - a.count).slice(0, 6);

                    setStats({
                        avgScore: realAvg,
                        userAvgScore: userAvg,
                        userSessionCount: userScores.length,
                        totalInterviews: globalDocs.length,
                        topStack: heatmap[0]?.name || "Next.js",
                        scoreDistribution: distData,
                        skillHeatmap: heatmap,
                        recentActivity: globalDocs.slice(0, 5),
                        globalScores: globalScores
                    });
                }
            } catch (error) {
                console.error("Data fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
    );

    return (
        <>
        <div className="p-4 md:p-10 bg-black min-h-screen text-white">
            <div className="max-w-7xl mx-auto">
                {/* Header - Stacks on mobile */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-white">Community Insights</h1>
                        <p className="text-slate-500 text-sm md:text-base">Real-time performance benchmarks and tech trends.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Badge variant="outline" className="hidden lg:flex border-slate-800 text-slate-400 gap-2 px-3 py-1 mr-2 whitespace-nowrap">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Stats
                        </Badge>
                        <Button onClick={() => router.push("/dashboard")} variant="outline" className="w-full sm:w-auto bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white rounded-xl gap-2 cursor-pointer h-10 px-4 text-sm">
                            <ArrowLeft size={16} /> Dashboard
                        </Button>
                    </div>
                </div>

                {/* Top Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10">
                    <Card className="bg-slate-950 border-slate-800 p-6 flex flex-col justify-between h-36 md:h-44">
                        <div>
                            <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2">Global Avg Score</p>
                            <h2 className="text-3xl md:text-4xl font-black text-indigo-500">{stats.avgScore}%</h2>
                        </div>
                        <Progress value={stats.avgScore} className="h-2 md:h-3 mt-4" />
                    </Card>
                    <Card className="bg-slate-950 border-slate-800 p-6 flex flex-col justify-between h-36 md:h-44">
                        <div>
                            <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Most Practiced</p>
                            <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                                <Zap size={20} className="text-amber-500 fill-amber-500" /> {stats.topStack}
                            </h2>
                        </div>
                        <p className="text-slate-500 text-[10px] md:text-xs tracking-tight">Leading community trend</p>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Chart Card */}
                        <Card className="bg-slate-950 border-slate-800 p-4 md:p-6">
                            <div className="flex items-center gap-2 mb-6 text-slate-400">
                                <BarChart3 size={18} />
                                <CardTitle className="text-xs md:text-sm font-medium uppercase">Score Distribution</CardTitle>
                            </div>
                            <div className="h-56 md:h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.scoreDistribution}>
                                        <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 10 }} />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                            {stats.scoreDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#6366f1' : '#18181b'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Recent Activity Card */}
                        <Card className="bg-slate-950 border-slate-800 p-4 md:p-6">
                             <CardTitle className="text-xs md:text-sm font-medium text-slate-500 uppercase mb-6 flex items-center gap-2">
                                <Globe size={16} /> Recent Global Activity
                             </CardTitle>
                             <div className="space-y-3 md:space-y-4 ">
                                {stats.recentActivity.map((activity, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800/50 gap-2 hover:bg-slate-800 p-2 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden ">
                                            <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-xs uppercase">{activity.techStack?.[0] || 'D'}</div>
                                            <div className="truncate font-sans">
                                                <p className="text-xs md:text-sm font-medium text-slate-200 truncate">{activity.techStack || 'Dev'} Interview</p>
                                                <p className="text-[10px] md:text-xs text-slate-500 italic">Score: {activity.score}%</p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="shrink-0 bg-slate-800 text-slate-400 text-[9px] md:text-[10px] uppercase px-2 py-0">
                                            {activity.createdAt?.seconds ? new Date(activity.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}
                                        </Badge>
                                    </div>
                                ))}
                             </div>
                        </Card>
                    </div>

                    {/* Sidebar News */}
                    <div className="space-y-6">
                        <Card className="bg-slate-950 border-slate-800 p-4 md:p-6 border-t-indigo-500/50 border-t-2">
                            <CardTitle className="text-xs md:text-sm font-medium text-slate-200 uppercase mb-6 flex items-center gap-2">
                                <Newspaper size={16} className="text-indigo-500" /> Trending Tech
                            </CardTitle>
                            <div className="space-y-5 md:space-y-6">
                                {trendingNews.map((news) => (
                                    <a key={news.id} href={news.url} target="_blank" rel="noopener noreferrer" className="block group cursor-pointer">
                                        <Badge className="mb-2 bg-slate-900 text-indigo-400 group-hover:bg-indigo-500/10 border-none text-[9px] transition-colors font-bold tracking-tight">
                                            {news.tag}
                                        </Badge>
                                        <h3 className="text-sm font-semibold text-slate-300 group-hover:text-indigo-400 transition-colors leading-snug">
                                            {news.title}
                                        </h3>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-[9px] text-slate-600 uppercase font-bold tracking-tighter">{news.time}</p>
                                            <ExternalLink size={10} className="text-slate-700 group-hover:text-indigo-500" />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}