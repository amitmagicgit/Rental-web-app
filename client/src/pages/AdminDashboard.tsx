// app/(admin)/AdminDashboard.tsx
// Complete file – compact per-day histogram with dark-blue bars (#0F47AF) and NO axes.
// Install Recharts once:  npm i recharts

import { useState, useMemo, FormEvent, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { BarChart, Bar, Tooltip, ResponsiveContainer } from "recharts";

/* ——— Types returned by /api/admin/stats ——— */
interface StatsData {
  listingViews: Array<{
    date_created: string;
    telegram_chat_id: string;
    entry_count: number;
  }>;
  subscriptions: Array<{ date_created: string; subscription_count: number }>;
  totalUsers: number;
  dailyUserStats: Array<{
    date_created: string;
    daily_active_users: number;
    daily_views_per_user: number;
  }>;
  dailySentMessages: Array<{ date_sent: string; daily_sent: number }>;
  sourcePlatformStats: Array<{
    date_in: string;
    source_platform: string;
    count: number;
  }>;
}

/* ——— Build { day: { views: userCount } } ——— */
function buildViewHistogram(
  listingViews: StatsData["listingViews"],
): Record<string, Record<number, number>> {
  const totals: Record<string, Record<string, number>> = {};

  listingViews.forEach(({ date_created, telegram_chat_id, entry_count }) => {
    const day = date_created.slice(0, 10); // YYYY-MM-DD
    totals[day] ??= {};
    totals[day][telegram_chat_id] =
      (totals[day][telegram_chat_id] ?? 0) + entry_count;
  });

  const histogram: Record<string, Record<number, number>> = {};
  Object.entries(totals).forEach(([day, userMap]) => {
    histogram[day] = {};
    Object.values(userMap).forEach((views) => {
      histogram[day][views] = (histogram[day][views] ?? 0) + 1;
    });
  });

  return histogram;
}

/* ——— Component ——— */
export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check localStorage on initial load
    return localStorage.getItem('adminAuthenticated') === 'true';
  });
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({
    dailyUserStats: 1,
    dailySentMessages: 1,
    subscriptions: 1,
    sourcePlatformStats: 1
  });
  const { toast } = useToast();

  const ROWS_PER_PAGE = 10;

  /* -------- handle login -------- */
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('adminAuthenticated', 'true');
        fetchStats();
      } else {
        toast({
          title: "שגיאה",
          description: "סיסמה שגויה",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "שגיאה",
        description: "התרחשה שגיאה בעת ההתחברות",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* -------- fetch stats -------- */
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        setStats(await res.json());
      } else if (res.status === 401) {
        // Handle unauthorized - clear auth state
        setIsAuthenticated(false);
        localStorage.removeItem('adminAuthenticated');
        toast({
          title: "שגיאה",
          description: "ההרשאות שלך פגו, אנא התחבר מחדש",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "שגיאה",
        description: "התרחשה שגיאה בטעינת הנתונים",
        variant: "destructive",
      });
    }
  };

  // Add useEffect to fetch stats on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  /* -------- histogram memo -------- */
  const histogramByDay = useMemo(() => {
    if (!stats?.listingViews) return {};
    return buildViewHistogram(stats.listingViews);
  }, [stats?.listingViews]);

  const renderPagination = (dataKey: keyof typeof currentPage, dataLength: number) => {
    const totalPages = Math.ceil(dataLength / ROWS_PER_PAGE);
    const current = currentPage[dataKey];
    
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => ({ ...prev, [dataKey]: Math.max(1, current - 1) }))}
          disabled={current === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          עמוד {current} מתוך {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => ({ ...prev, [dataKey]: Math.min(totalPages, current + 1) }))}
          disabled={current === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const getPaginatedData = <T extends { date_created?: string; date_sent?: string; date_in?: string }>(
    data: T[] | undefined,
    dataKey: keyof typeof currentPage
  ) => {
    if (!data) return [];
    const start = (currentPage[dataKey] - 1) * ROWS_PER_PAGE;
    return data.slice(start, start + ROWS_PER_PAGE);
  };

  /* -------- unauth view -------- */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">כניסה למנהל</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-right"
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "כניסה"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* -------- dashboard -------- */
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">לוח בקרה</h1>
          {isAuthenticated && (
            <Button 
              onClick={() => {
                setRefreshing(true);
                fetchStats().finally(() => setRefreshing(false));
              }}
              disabled={refreshing}
            >
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {refreshing ? "מעדכן..." : "עדכן נתונים"}
            </Button>
          )}
        </div>

        {/* ——— total users ——— */}
        <Card>
          <CardHeader>
            <CardTitle>סה&quot;כ משתמשים</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats?.totalUsers ?? 0}</p>
          </CardContent>
        </Card>

        {/* ——— daily active users + histogram ——— */}
        <Card>
          <CardHeader>
            <CardTitle>משתמשים פעילים יומיים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-right p-2">תאריך</th>
                    <th className="text-right p-2">פעילים</th>
                    <th className="text-right p-2">צפיות למשתמש (AVG)</th>
                    <th className="text-right p-2">התפלגות צפיות ▶︎ משתמש</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(stats?.dailyUserStats, 'dailyUserStats').map((dayStat) => {
                    const dateKey = dayStat.date_created.slice(0, 10);
                    const histObj = histogramByDay[dateKey] ?? {};
                    const chartData = Object.entries(histObj)
                      .map(([views, users]) => ({
                        views: Number(views),
                        users,
                      }))
                      .sort((a, b) => a.views - b.views);

                    return (
                      <tr key={dayStat.date_created} className="border-t">
                        <td className="p-2">
                          {new Date(dateKey).toLocaleDateString("he-IL")}
                        </td>
                        <td className="p-2">{dayStat.daily_active_users}</td>
                        <td className="p-2">
                          {dayStat.daily_views_per_user.toFixed(2)}
                        </td>
                        <td className="p-2">
                          {chartData.length ? (
                            <ResponsiveContainer width={150} height={60}>
                              <BarChart data={chartData} margin={{ top: 4 }}>
                                <Tooltip
                                  contentStyle={{ fontSize: "0.75rem" }}
                                  formatter={(v) => [`${v} משתמשים`, "צפיות"]}
                                  labelFormatter={(l) => `‎${l} צפיות‎`}
                                />
                                <Bar
                                  dataKey="users"
                                  fill="#0F47AF"
                                  barSize={12}
                                  radius={[2, 2, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {renderPagination('dailyUserStats', stats?.dailyUserStats?.length ?? 0)}
          </CardContent>
        </Card>

        {/* ——— daily sent messages ——— */}
        <Card>
          <CardHeader>
            <CardTitle>הודעות שנשלחו יומיות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-right p-2">תאריך</th>
                    <th className="text-right p-2">מספר הודעות</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(stats?.dailySentMessages, 'dailySentMessages').map((stat) => (
                    <tr key={stat.date_sent} className="border-t">
                      <td className="p-2">
                        {new Date(stat.date_sent).toLocaleDateString("he-IL")}
                      </td>
                      <td className="p-2">{stat.daily_sent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination('dailySentMessages', stats?.dailySentMessages?.length ?? 0)}
          </CardContent>
        </Card>

        

        {/* ——— subscriptions ——— */}
        <Card>
          <CardHeader>
            <CardTitle>הרשמות לפי תאריך</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-right p-2">תאריך</th>
                    <th className="text-right p-2">מספר הרשמות</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(stats?.subscriptions, 'subscriptions').map((sub, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">
                        {new Date(sub.date_created).toLocaleDateString("he-IL")}
                      </td>
                      <td className="p-2">{sub.subscription_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination('subscriptions', stats?.subscriptions?.length ?? 0)}
          </CardContent>
        </Card>

        {/* ——— source-platform stats ——— */}
        <Card>
          <CardHeader>
            <CardTitle>סטטיסטיקות לפי פלטפורמה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-right p-2">תאריך</th>
                    <th className="text-right p-2">פלטפורמה</th>
                    <th className="text-right p-2">מספר מודעות</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(stats?.sourcePlatformStats, 'sourcePlatformStats').map((stat, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">
                        {new Date(stat.date_in).toLocaleDateString("he-IL")}
                      </td>
                      <td className="p-2">{stat.source_platform}</td>
                      <td className="p-2">{stat.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination('sourcePlatformStats', stats?.sourcePlatformStats?.length ?? 0)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
