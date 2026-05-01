import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      <AppSidebar />
      <main className="flex-1 min-h-screen overflow-auto bg-[color:var(--bg)] text-[color:var(--text)]">
        <Outlet />
      </main>
    </div>
  );
}
