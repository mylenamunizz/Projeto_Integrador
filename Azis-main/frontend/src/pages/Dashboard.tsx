import { motion } from "framer-motion";
import { KanbanSquare, Trophy, Smile, Star, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, getActiveUsers, weeklyMoodData, monthlyProductivity } from "@/data/mock";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useState, useEffect } from "react";
import { getApiUrl, getAuthHeaders } from "@/lib/api";

export default function Dashboard() {
  const currentUser = getCurrentUser();
  console.log("[Dashboard] currentUser:", currentUser);

  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksResponse, usersResponse] = await Promise.all([
        fetch(getApiUrl("/api/tasks"), { headers: getAuthHeaders() }),
        fetch(getApiUrl("/api/users"), { headers: getAuthHeaders() }),
      ]);

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData.tasks || []);
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData || []);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeUsers = users.length > 0 ? users : getActiveUsers();
  const visibleTeamUsers = activeUsers.filter((u) => u.nivel !== 3);
  const isExampleUser = currentUser.email === "ana@azis.com";
  const userPoints = Number(currentUser.points ?? 0);
  const userName = currentUser.name?.split(" ")[0] ?? "Usuário";

  const completedTasks = tasks.filter((t) => t.status === "approved" || t.status === "done").length;
  const myTasks = currentUser.nivel === 1
    ? tasks.filter((t) => t.assignee_id === currentUser.id)
    : tasks.filter((t) => t.gestor_id === currentUser.id);

  const stats = [
    { label: "Tarefas Concluídas", value: completedTasks.toString(), icon: CheckCircle2, color: "text-primary" },
    { label: "Pontos Totais", value: userPoints.toLocaleString(), icon: Star, color: "text-warning" },
    {
      label: "Ranking",
      value: visibleTeamUsers.length > 0
        ? `#${Math.max(1, [...visibleTeamUsers].sort((a, b) => b.points - a.points).findIndex((u) => u.id === currentUser.id) + 1)}`
        : "#—",
      icon: Trophy,
      color: "text-accent",
    },
    { label: "Humor Hoje", value: isExampleUser ? "😊" : "—", icon: Smile, color: "text-mood-good" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Olá, {userName}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Aqui está o resumo do seu dia</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-heading font-bold text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Productivity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <KanbanSquare className="w-5 h-5 text-primary" />
              Produtividade Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyProductivity}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip />
                <Bar dataKey="tasks" fill="hsl(221, 83%, 53%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mood Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <Smile className="w-5 h-5 text-accent" />
              Humor da Equipe (Semana)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyMoodData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="happy" stroke="hsl(221, 83%, 53%)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="neutral" stroke="hsl(244, 75%, 59%)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="sad" stroke="hsl(43, 100%, 65%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Ranking Preview */}
      {currentUser.nivel >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Ranking da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...visibleTeamUsers]
                .sort((a, b) => b.points - a.points)
                .slice(0, 5)
                .map((member, i) => (
                  <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-sm ${
                      i === 0 ? "bg-warning text-warning-foreground" : i === 1 ? "bg-muted text-muted-foreground" : i === 2 ? "bg-warning/60 text-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.role === "gestor" ? "Gestor" : member.role === "admin" ? "Admin" : "Membro"}</div>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                      <Star className="w-4 h-4 text-warning" />
                      {member.points}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
