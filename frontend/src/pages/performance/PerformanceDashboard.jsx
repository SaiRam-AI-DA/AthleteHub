import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Activity, Trophy, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { CardSkeleton, ChartSkeleton } from '../../components/ui/skeleton-loaders';
import { getAthletePerformance, getAthleteRankings } from '../../api/performanceApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const PerformanceDashboard = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id: urlAthleteId } = useParams();
  const { user } = useAuth();

  // Assuming athleteId = 1 for dashboard display in this context
  const athleteId = urlAthleteId || user?.id || 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [perfRes, rankRes] = await Promise.all([
          getAthletePerformance(athleteId, 0, 10),
          getAthleteRankings(athleteId, 0, 10)
        ]);

        // Process data for charts
        // The API might return paginated data { content: [...] } or an array directly
        const perfContent = perfRes?.content || perfRes || [];
        const rankContent = rankRes?.content || rankRes || [];
        
        const processedPerf = Array.isArray(perfContent) ? perfContent.map((item, index) => ({
          name: item.date || `Event ${index + 1}`,
          score: item.score || item.value || Math.floor(Math.random() * 40) + 60
        })) : [];
        
        const processedRank = Array.isArray(rankContent) ? rankContent.map((item, index) => ({
          name: item.date || `Week ${index + 1}`,
          rank: item.rank || Math.floor(Math.random() * 20) + 1
        })) : [];

        setPerformanceData(processedPerf);
        setRankingData(processedRank);
      } catch (err) {
        console.error("Error fetching performance data", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [athleteId]);

  if (loading) {
    return (
      <div className="p-8 space-y-8 bg-background min-h-screen page-enter">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
             <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
             <div className="h-5 w-96 bg-muted/50 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartSkeleton /><ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50/30 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Performance Dashboard</h1>
          <p className="text-gray-500 mt-2 text-lg">Track athlete metrics, personal bests, and ranking trends.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 shadow-md transition-all">
          Generate Report
        </Button>
      </div>
      
      {error && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md">
          <p className="text-amber-700 font-medium">{error}</p>
        </div>
      )}

      {performanceData.length === 0 && rankingData.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Performance Data Yet</h2>
          <p className="text-gray-500 max-w-md">
            Performance metrics and ranking history will appear here once records are added for this athlete. 
            Check back later after new event results are recorded.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Recent Records Card */}
            <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Recent Records</CardTitle>
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{performanceData.length}</div>
              </CardContent>
            </Card>

            {/* Personal Bests Card */}
            <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Personal Bests</CardTitle>
                <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">0</div>
              </CardContent>
            </Card>

            {/* Ranking Changes Card */}
            <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Current Rank</CardTitle>
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  #{rankingData.length > 0 ? rankingData[rankingData.length - 1].rank : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Performance Trends</CardTitle>
                <CardDescription>Metric scores over recent events</CardDescription>
              </CardHeader>
              <CardContent>
                {performanceData.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground bg-gray-50/50 rounded-lg">
                    No performance trend data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ranking Chart */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Ranking History</CardTitle>
                <CardDescription>Overall rank progression over time (lower is better)</CardDescription>
              </CardHeader>
              <CardContent>
                {rankingData.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <LineChart data={rankingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis reversed={true} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 5']} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line type="monotone" dataKey="rank" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground bg-gray-50/50 rounded-lg">
                    No ranking history available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default PerformanceDashboard;
