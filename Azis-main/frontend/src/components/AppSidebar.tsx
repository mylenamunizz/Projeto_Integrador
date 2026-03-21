import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  KanbanSquare,
  Gift,
  Trophy,
  Smile,
  Building2,
  HelpCircle,
  User,
  LogOut,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Upload,
  Network,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "@/hooks/use-theme";
import logoLight from "@/assets/logo-azis.svg";
import logoDark from "@/assets/logo-azis-branco.svg";
import { getCurrentUser } from "@/data/mock";



function getNavItemsByRole(role) {
  const items = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/kanban", icon: KanbanSquare, label: "Kanban" },
    { to: "/rewards", icon: Gift, label: "Recompensas" },
    { to: "/ranking", icon: Trophy, label: "Ranking" },
    { to: "/mood", icon: Smile, label: "Humor" },
    { to: "/institution", icon: Building2, label: "Instituição", hideFor: "funcionario" },
    { to: "/profile", icon: User, label: "Perfil" },
    { to: "/help", icon: HelpCircle, label: "Ajuda" },
    { to: "/userimport", icon: Upload, label: "Importar Usuários", hideFor: "funcionario" },
    { to: "/orgstructure", icon: Network, label: "Estrutura Organizacional", hideFor: "funcionario" },
  ];
  return items.filter((item) => item.hideFor !== role);
}

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const isDark = useTheme();

  const currentUser = getCurrentUser();
  const navItems = getNavItemsByRole(currentUser?.role ?? "funcionario");
  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-card border-r border-border transition-all duration-300 sticky top-0",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img
                  src={isDark ? logoDark : logoLight}
                  alt="Azis logo"
                  className="w-12 h-12 object-contain"
                />
            </div>
        {!collapsed && (
          <span className="font-heading font-bold text-lg text-foreground">Azis</span>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 space-y-1">
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary w-full transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>Recolher</span>}
        </button>
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-secondary w-full transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </Link>
      </div>
    </aside>
  );
}
