import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  KanbanSquare,
  Gift,
  Trophy,
  Megaphone,
  Building2,
  HelpCircle,
  User,
  Upload,
  Network,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getApiUrl, getAuthHeaders } from "@/lib/api";
import { getCurrentUser } from "@/data/mock";
import logoDark from "@/assets/logo-azis-branco.svg";

function getNavItemsByRole(role: string) {
  const items = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/feed", icon: Megaphone, label: "Feed" },
    { to: "/kanban", icon: KanbanSquare, label: "Kanban" },
    { to: "/rewards", icon: Gift, label: "Recompensas" },
    { to: "/ranking", icon: Trophy, label: "Ranking" },
    { to: "/institution", icon: Building2, label: "Instituição", hideFor: "funcionario" },
    { to: "/profile", icon: User, label: "Perfil" },
    { to: "/help", icon: HelpCircle, label: "Ajuda" },
    { to: "/userimport", icon: Upload, label: "Importar Usuários", hideFor: "funcionario" },
    { to: "/orgstructure", icon: Network, label: "Estrutura Organizacional", hideFor: "funcionario" },
  ];
  return items.filter((item) => item.hideFor !== role);
}

function getRoleLabel(role: string) {
  if (role === "gestor") return "Gestor";
  if (role === "admin") return "Admin";
  return "Funcionário";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function AppSidebar() {
  const location = useLocation();
  const [feedBadgeCount, setFeedBadgeCount] = useState(0);
  const currentUser = getCurrentUser();
  const navItems = getNavItemsByRole(currentUser?.role ?? "funcionario");

  useEffect(() => {
    let isMounted = true;

    async function fetchFeedNotifications() {
      try {
        const response = await fetch(getApiUrl("/api/feed?limit=50"), { headers: getAuthHeaders() });
        if (!response.ok || !isMounted) return;
        const payload = await response.json();
        const raw = payload?.feed ?? payload;
        if (Array.isArray(raw)) {
          const count = raw.filter((item: any) => item.isNew || item.new || item.unread).length;
          setFeedBadgeCount(count);
        }
      } catch (error) {
        console.error("Error fetching feed notifications:", error);
      }
    }

    fetchFeedNotifications();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <aside className="flex flex-col h-screen w-[220px] bg-[color:var(--sidebar-background)] border-r border-[color:var(--sidebar-border)] text-[color:var(--sidebar-foreground)] sticky top-0">
      <div className="flex items-center gap-3 px-5 h-16 border-b border-[color:var(--sidebar-border)]">
        <img
          src={logoDark}
          alt="Azis logo"
          className="w-10 h-10 object-contain flex-shrink-0"
        />
        <span className="font-heading font-bold text-base text-[color:var(--sidebar-foreground)]">Azis</span>
      </div>

      <div className="px-5 pt-6 pb-4 overflow-y-auto flex-1">
        <div className="mb-4 text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Navegação
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-[color:var(--sidebar-accent)] text-[color:var(--sidebar-accent-foreground)]"
                    : "text-[color:var(--sidebar-foreground)] hover:bg-[color:var(--sidebar-accent)]"
                }`}
              >
                {typeof item.icon === "string" ? (
                <span className="text-lg">{item.icon}</span>
              ) : (
                <item.icon className="w-5 h-5 flex-shrink-0" />
              )}
              <span>{item.label}</span>
              {item.to === "/feed" && feedBadgeCount > 0 && (
                <span className="ml-auto rounded-full bg-[rgba(124,58,237,0.15)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--accent-soft)]">
                  {feedBadgeCount}
                </span>
              )}
            </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-5 pb-5">
        <div className="bg-[color:var(--surface2)] border border-[color:var(--border)] rounded-3xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--accent2)] flex items-center justify-center text-sm font-semibold text-white">
            {getInitials(currentUser.name)}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-[color:var(--text-strong)] truncate">{currentUser.name}</div>
            <div className="text-[11px] text-[color:var(--muted)]">{getRoleLabel(currentUser.role)}</div>
          </div>
        </div>
        <Link
          to="/"
          className="mt-4 block text-sm font-medium text-[color:var(--muted)] hover:text-[color:var(--text)]"
        >
          Sair
        </Link>
      </div>
    </aside>
  );
}
