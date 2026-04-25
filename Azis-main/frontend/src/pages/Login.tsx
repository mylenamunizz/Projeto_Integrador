import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoDark from "@/assets/logo-azis-branco.svg";
import loginBg from "@/assets/Login-bg.mp4";
import { toast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const apiUrl = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Erro no login",
          description: data.error || "Não foi possível entrar.",
        });
        return;
      }

      localStorage.setItem("azis_token", data.token);
      localStorage.setItem("azis_user", JSON.stringify(data.user));

      toast({
        title: "Login realizado",
        description: "Bem-vindo de volta!",
      });

      navigate("/dashboard");
    } catch (err) {
      toast({
        title: "Erro no login",
        description: "Não foi possível se conectar ao servidor.",
      });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
        <source src={loginBg} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl rounded-[32px] border border-white/10 bg-slate-950/80 p-4 shadow-[0_40px_120px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:p-6 md:p-8">
          <div className="relative overflow-hidden rounded-[32px]">
            <div className="pointer-events-none absolute -left-24 top-10 h-52 w-52 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-10 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />

            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="flex flex-col justify-center gap-6 border-r border-white/10 pl-10 pr-8 text-slate-100">
                <div className="flex items-center gap-3">
                  <img src={logoDark} alt="Azis logo" className="w-12 h-12 object-contain" />
                  <span className="text-sm uppercase tracking-[0.24em] text-white/80">Azis</span>
                </div>
                <div>
                  <h2 className="text-4xl font-heading font-bold text-white">Bem-vindo de volta ao Azis</h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300/90">
                    Gerencie tarefas, acompanhe o humor da equipe e motive seus colaboradores com um painel moderno e seguro.
                  </p>
                </div>
              </div>

              <div className="px-4 py-6 sm:px-8 sm:py-10">
                <div className="mb-8 flex items-center gap-3 lg:hidden">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <img src={logoDark} alt="Azis logo" className="w-10 h-10 object-contain" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-white/80">Azis</p>
                    <h1 className="text-3xl font-heading font-bold text-white">Bem-vindo de volta</h1>
                  </div>
                </div>

                <h1 className="text-3xl font-heading font-bold text-white mb-2">Entrar</h1>
                <p className="text-sm text-slate-300 mb-8">Digite suas credenciais para acessar</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-200">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ana@azis.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-100 text-slate-900 placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="password" className="text-slate-200">Senha</Label>
                      <Link to="/forgot-password" className="text-sm text-sky-400 hover:underline">Esqueceu a senha?</Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-slate-100 text-slate-900 placeholder:text-slate-500"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground">
                    Entrar
                  </Button>
                </form>

                <p className="text-center text-sm text-slate-300 mt-6">
                  Não tem conta?{' '}
                  <Link to="/register" className="text-primary font-medium hover:underline">Criar conta</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
