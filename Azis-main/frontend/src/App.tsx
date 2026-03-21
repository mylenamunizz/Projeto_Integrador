import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Kanban from "@/pages/Kanban";
import Rewards from "@/pages/Rewards";
import Ranking from "@/pages/Ranking";
import Mood from "@/pages/Mood";
import Profile from "@/pages/Profile";
import Institution from "@/pages/Institution";
import Help from "@/pages/Help";
import NotFound from "@/pages/NotFound";
import UserImport from "./pages/UserImport";
import OrgStructure from "./pages/OrgStructure";
import { getCurrentUser } from "@/data/mock";

const queryClient = new QueryClient();


const App = () => {
  const currentUser = getCurrentUser();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/kanban" element={<Kanban />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/mood" element={<Mood />} />
              <Route path="/profile" element={<Profile />} />
              {currentUser.role !== "funcionario" && <Route path="/institution" element={<Institution />} />}
              <Route path="/help" element={<Help />} />
              {currentUser.role !== "funcionario" && <Route path="/userimport" element={<UserImport />} />}
              {currentUser.role !== "funcionario" && <Route path="/orgstructure" element={<OrgStructure />} />}
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
