import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface StatsData {
  listingViews: Array<{
    date_created: string;
    telegram_chat_id: string;
    entry_count: number;
  }>;
  subscriptions: Array<{
    date_created: string;
    subscription_count: number;
  }>;
  totalUsers: number;
  dailyUserStats: Array<{ date_created: string; daily_active_users: number; daily_views_per_user: number }>;
  dailySentMessages: Array<{ date_sent: string; daily_sent: number }>;
}

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
        fetchStats();
      } else {
        toast({
          title: "שגיאה",
          description: "סיסמה שגויה",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "שגיאה",
        description: "התרחשה שגיאה בעת ההתחברות",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched stats:", data);
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        title: "שגיאה",
        description: "התרחשה שגיאה בטעינת הנתונים",
        variant: "destructive",
      });
    }
  };

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
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "כניסה"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">לוח בקרה</h1>
        
        {/* Total Users Card */}
        <Card>
          <CardHeader>
            <CardTitle>סה"כ משתמשים</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats?.totalUsers || 0}</p>
          </CardContent>
        </Card>

        {/* Daily Active Users Table */}
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
                    <th className="text-right p-2">משתמשים פעילים</th>
                    <th className="text-right p-2">צפיות למשתמש</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.dailyUserStats || []).map((stat) => (
                    <tr key={stat.date_created} className="border-t">
                      <td className="p-2">{new Date(stat.date_created).toLocaleDateString('he-IL')}</td>
                      <td className="p-2">{stat.daily_active_users}</td>
                      <td className="p-2">{stat.daily_views_per_user.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Daily Sent Messages Table */}
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
                  {(stats?.dailySentMessages || []).map((stat) => (
                    <tr key={stat.date_sent} className="border-t">
                      <td className="p-2">{new Date(stat.date_sent).toLocaleDateString('he-IL')}</td>
                      <td className="p-2">{stat.daily_sent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Listing Views Table */}
        <Card>
          <CardHeader>
            <CardTitle>צפיות בדירות לפי תאריך ומשתמש</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-right p-2">תאריך</th>
                    <th className="text-right p-2">מזהה טלגרם</th>
                    <th className="text-right p-2">מספר צפיות</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.listingViews || []).map((view, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{new Date(view.date_created).toLocaleDateString('he-IL')}</td>
                      <td className="p-2">{view.telegram_chat_id}</td>
                      <td className="p-2">{view.entry_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions Table */}
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
                  {(stats?.subscriptions || []).map((sub, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{new Date(sub.date_created).toLocaleDateString('he-IL')}</td>
                      <td className="p-2">{sub.subscription_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 