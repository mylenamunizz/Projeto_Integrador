import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import logoLight from "@/assets/logo-azis.svg";
import logoDark from "@/assets/logo-azis-branco.svg";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    institution: "",
  });

  const navigate = useNavigate();
  const isDark = useTheme(); // corrigido: hook chamado dentro do componente

  const apiUrl =
    (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Erro no cadastro",
          description: data.error || "Não foi possível criar sua conta.",
        });
        return;
      }

      toast({
        title: "Conta criada",
        description: "Você já pode entrar com suas credenciais.",
      });

      navigate("/login");
    } catch (err) {
      toast({
        title: "Erro no cadastro",
        description: "Não foi possível se conectar ao servidor.",
      });
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo para desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12">
        <div className="max-w-md">
          <div className="rounded-xl flex items-center justify-center mb-8">
            <img
              src={isDark ? logoDark : logoLight}
              alt="Azis logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <h2 className="text-4xl font-heading font-bold text-primary-foreground mb-4">
            Comece a transformar sua equipe
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            Crie sua conta e organize tarefas com gamificação e acompanhamento
            de humor.
          </p>
        </div>
      </div>

      {/* Lado direito - formulário */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo para mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="rounded-xl flex items-center justify-center mb-8">
              <img
                src={isDark ? logoDark : logoLight}
                alt="Azis logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <span className="font-heading font-bold text-xl text-foreground">
              Azis
            </span>
          </div>

          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Criar conta
          </h1>
          <p className="text-muted-foreground mb-8">
            Preencha os dados para começar
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                placeholder="Seu nome"
                value={form.name}
                onChange={update("name")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={update("email")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution">Instituição</Label>
              <Input
                id="institution"
                placeholder="Nome da sua empresa"
                value={form.institution}
                onChange={update("institution")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={update("password")}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary text-primary-foreground"
            >
              Criar Conta
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem conta?{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
