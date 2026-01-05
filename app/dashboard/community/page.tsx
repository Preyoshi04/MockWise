/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, limit, orderBy } from "firebase/firestore";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, Zap, Globe, MessageSquare, BarChart3 } from "lucide-react";

export default function CommunityInsights() {
    const [stats, setStats] = useState({
        avgScore: 0,
        totalInterviews: 0,
        topStack: "Next.js",
        scoreDistribution: [0, 0, 0, 0, 0],
        skillHeatmap: [] as { name: string; count: number }[],
        recentActivity: [] as any[]
    });

const [trendingNews, setTrendingNews] = useState<any[]>([]);

useEffect(() => {
    const fetchCommunityStats = async () => {
        try {
            const q = query(
                collection(db, "interviews"),
                orderBy("createdAt", "desc"),
                limit(100)
            );
            const snapshot = await getDocs(q);
            const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            if (docs.length > 0) {
                const scores = docs.map(d => Number((d as any).score) || 0);
                const totalScore = scores.reduce((acc, curr) => acc + curr, 0);
                const realAvg = Math.round(totalScore / docs.length);

                const distribution = [0, 0, 0, 0, 0];
                scores.forEach(s => {
                    const index = Math.min(Math.floor(s / 20), 4);
                    distribution[index]++;
                });

                const stacks: Record<string, number> = {};
                docs.forEach((doc: any) => {
                    const stack = doc.techStack || "General";
                    stacks[stack] = (stacks[stack] || 0) + 1;
                });

                const heatmap = Object.entries(stacks)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 6);

                setStats({
                    avgScore: realAvg,
                    totalInterviews: docs.length,
                    topStack: heatmap[0]?.name || "Next.js",
                    scoreDistribution: distribution,
                    skillHeatmap: heatmap,
                    recentActivity: docs.slice(0, 5) 
                });
            }
        } catch (error) {
            console.error("Error fetching community stats:", error);
        }
    };

    const fetchLatestNews = async () => {
    try {
        // We add 'query=software+ai+dev' to filter for technical topics
        // 'tags=story' ensures we only get articles, not comments
        const response = await fetch(
            "https://hn.algolia.com/api/v1/search_by_date?tags=story&query=software+ai+coding+system&hitsPerPage=3"
        );

        if (!response.ok) throw new Error("API Limit reached or network error");

        const data = await response.json();
        
        if (data.hits && Array.isArray(data.hits)) {
            const formattedNews = data.hits.map((story: any) => ({
                id: story.objectID,
                title: story.title,
                url: story.url || `https://news.ycombinator.com/item?id=${story.objectID}`,
                score: story.points || 0,
                by: story.author
            }));
            
            setTrendingNews(formattedNews);
        }
    } catch (error) {
        console.error("Filtered Tech Fetch Error:", error);
    }
};

    fetchCommunityStats();
    fetchLatestNews();
}, []);

    return (
        <div className="p-6 md:p-10 bg-black min-h-screen text-white">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-black tracking-tight mb-2">Community Insights</h1>
                    <p className="text-zinc-500">How the MockWise network is performing globally.</p>
                </div>

                {/* Top Row: High-Level Stats & Percentile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <Card className="bg-zinc-950 border-zinc-800 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Globe size={80} /></div>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Global Avg Score</p>
                        <h2 className="text-4xl font-black text-indigo-500">{stats.avgScore}%</h2>
                        <Progress value={stats.avgScore} className="h-1 mt-4 bg-zinc-900" />
                    </Card>

                    <Card className="bg-zinc-950 border-zinc-800 p-6">
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Most Practiced</p>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Zap className="text-yellow-500" size={20} /> {stats.topStack}
                        </h2>
                        <p className="text-zinc-600 text-sm mt-2">Leading community trend</p>
                    </Card>

                    <Card className="bg-indigo-600 border-none p-6 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">Community Standing</p>
                        <h2 className="text-3xl font-black">Top 15%</h2>
                        <p className="text-indigo-100 text-sm mt-2 opacity-80">You are outperforming the majority of applicants.</p>
                    </Card>
                </div>

                {/* Second Row: Distribution & Heatmap */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    <Card className="lg:col-span-2 bg-zinc-950 border-zinc-800 p-6">
                        <div className="flex items-center gap-2 mb-6 text-zinc-400">
                            <BarChart3 size={18} />
                            <CardTitle className="text-sm font-medium uppercase">Global Score Distribution</CardTitle>
                        </div>
                        <div className="flex items-end gap-3 h-40">
                            {stats.scoreDistribution.map((count, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div 
                                        className="w-full bg-indigo-500/20 border-t-2 border-indigo-500 rounded-t-sm transition-all duration-700 ease-out group-hover:bg-indigo-500/40" 
                                        style={{ height: `${stats.totalInterviews > 0 ? (count / stats.totalInterviews) * 100 : 0}%` }}
                                    />
                                    <span className="text-[10px] text-zinc-600 font-bold">{i * 20}-{i * 20 + 20}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="bg-zinc-950 border-zinc-800 p-6">
                         <CardTitle className="text-sm font-medium text-zinc-500 uppercase mb-6">Skill Heatmap</CardTitle>
                         <div className="flex flex-col gap-3">
                            {stats.skillHeatmap.map((skill) => (
                                <div key={skill.name} className="flex items-center justify-between">
                                    <span className="text-sm text-zinc-300">{skill.name}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-24 bg-zinc-900 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-indigo-500" 
                                                style={{ width: `${(skill.count / (stats.skillHeatmap[0]?.count || 1)) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-zinc-500">{skill.count}</span>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </Card>
                </div>

                {/* Third Row: Activity & Dynamic News */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <section>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <TrendingUp className="text-indigo-400" size={18} /> Live Activity Feed
                        </h3>
                        <div className="space-y-4">
                            {stats.recentActivity.map((activity, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-sm">
                                            {activity.role?.[0] || "T"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{activity.role || "Technical Interview"}</p>
                                            <p className="text-xs text-zinc-500">{activity.techStack || "General"}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-emerald-400 border-emerald-500/20 bg-emerald-500/5">
                                        {activity.score || 0}%
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-indigo-600/5 rounded-3xl p-8 border border-indigo-500/10 flex flex-col">
                        <div className="flex items-center gap-2 mb-6 text-indigo-400">
                            <Globe size={20} className="animate-pulse" />
                            <h3 className="text-xl font-bold text-white">Latest Tech Feed</h3>
                        </div>
                        
                        <div className="space-y-6 flex-grow">
                            {trendingNews.length > 0 ? (
                                trendingNews.map((story) => (
                                    <div key={story.id} className="group">
                                        <a 
                                            href={story.url || `https://news.ycombinator.com/item?id=${story.id}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="block"
                                        >
                                            <p className="text-zinc-300 font-medium group-hover:text-white group-hover:underline transition-colors line-clamp-2">
                                                {story.title}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <Badge variant="secondary" className="bg-zinc-900 text-[10px] text-zinc-500 border-zinc-800">
                                                    {story.score || 0} pts
                                                </Badge>
                                                <span className="text-[10px] text-zinc-600">
                                                    by {story.by}
                                                </span>
                                            </div>
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <p className="text-zinc-500 text-sm italic">Gathering community news...</p>
                            )}
                        </div>

                        <div className="mt-8 pt-8 border-t border-indigo-500/10">
                            <MessageSquare className="text-indigo-500 mb-2" size={18} />
                            <p className="text-sm font-bold uppercase tracking-widest text-indigo-400">Pro Tip</p>
                            <p className="text-zinc-400 text-sm italic mt-1">
                                &quot;Explain your trade-offs clearly to boost your score above 85%.&quot;
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}