import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import mascotVideo from "@/assets/mascot.png";
import mascotVideoDark from "@/assets/mascot.png";
import { useTheme } from "@/hooks/use-theme";
import logoLight from "@/assets/logo-azis.svg";
import logoDark from "@/assets/logo-azis-branco.svg";
import mockup from "@/assets/mockup.png";
import mockup2 from "@/assets/mockup2.png";
import medal from "@/assets/medal.png";

import {
  KanbanSquare,
  Trophy,
  Smile,
  BarChart3,
  Users,
  Zap,
  ArrowRight,
  CheckCircle2,
  Frown,
  Meh,
} from "lucide-react";

const features = [
  { icon: KanbanSquare, title: "Kanban Intuitivo", desc: "Organize tarefas com drag & drop, como Trello" },
  { icon: Trophy, title: "Gamificação", desc: "Pontos, ranking e recompensas para motivar a equipe" },
  { icon: Smile, title: "Humor da Equipe", desc: "Acompanhe o bem-estar diário dos colaboradores" },
  { icon: BarChart3, title: "Dashboards", desc: "Relatórios de produtividade e satisfação em tempo real" },
  { icon: Users, title: "Gestão de Times", desc: "Convide membros, atribua tarefas e acompanhe progresso" },
  { icon: Zap, title: "Feedback Mensal", desc: "Questionários automáticos para medir engajamento" },
];

export default function Landing() {
  const isDark = useTheme();
  const currentMascotVideo = isDark ? mascotVideoDark : mascotVideo;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img
                src={isDark ? logoDark : logoLight}
                alt="Azis logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <span className="font-heading font-bold text-xl text-foreground">Azis</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground text-foreground transition-colors">
              Funcionalidades
            </a>

            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>

            <Link to="/register">
              <Button size="sm">Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* TEXTO */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-sm font-medium mb-8">
                <Zap className="w-4 h-4" />
                Produtividade + Bem-estar
              </div>

              <h1 className="text-5xl md:text-6xl font-heading font-bold text-foreground leading-tight mb-6">
                Tarefas com{" "}
                <span className="text-gradient-primary">propósito</span>,{" "}
                equipe com{" "}
                <span className="text-gradient-accent">energia.</span>
              </h1>

              <p className="text-lg text-foreground mb-10">
                Gerencie tarefas, motive sua equipe com gamificação e acompanhe
                o humor dos colaboradores — tudo em uma plataforma.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow px-8">
                    Começar Gratuitamente
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>

                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Já tenho conta
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* COMPOSIÇÃO VISUAL (LADO DIREITO) */}
          <div className="relative w-full max-w-[500px] lg:max-w-[600px] aspect-square mx-auto mt-12 md:mt-0">
            {/* 1. Brilho de fundo (Aura Azul) */}
            <div className="glow-fundo" />

            {/* 2. Mascote (Centro) */}
            <div className="absolute top-[-20%] left-[-35%] z-20 pointer-events-none">
              <img
                src={mascotVideo}
                alt="Mascote Azis"
                className="w-[35%] md:w-[60%] object-contain drop-shadow-2xl"
              />
            </div>

            {/* 2. Medalha */}
            <div className="absolute top-[9%] left-[8%] z-30 pointer-events-none relative">
              {/* Brilho dourado (Glow) atrás da medalha */}
              <div className="absolute top-1/2 left-[9%] -translate-y-1/2 w-[25%] md:w-[20%] aspect-square bg-yellow-400/50 blur-[20px] rounded-full z-0" />

              {/* Imagem animada da Medalha */}
              <motion.img
                src={medal}
                alt="Medalha de Recompensa"
                className="relative z-10 w-[35%] md:w-[30%] object-contain drop-shadow-2xl"
                animate={{
                  scale: [1, 1.08, 1],
                  y: [-3, 3, -3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* 3. Mockup Dashboards (Flutuando no Topo Direito - Atrás) */}
            <div className="absolute top-[10%] right-[-5%] w-[90%] z-10">
             
                <img
                  src={mockup}
                  alt="Dashboard"
                  className="w-full h-auto rounded-xl shadow-2xl border border-white/10 bg-background"
                />
            </div>

            {/* 4. Mockup Kanban (Flutuando em Baixo Esquerda - Frente) */}
            <div className="absolute bottom-[15%] z-20">
                
                <img
                  src={mockup2}
                  alt="Kanban"
                  className="w-full h-auto rounded-xl shadow-2xl border border-white/10 bg-background"
                />
            </div>

            {/* 5. Badge Energy (Flutuando em Baixo Direita - Frente de tudo) */}
            <div className="absolute bottom-[20%] right-[-5%] z-40">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, y: [-8, 8, -8] }}
                transition={{ opacity: { duration: 0.5 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                className="bg-background/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-border flex items-center gap-4"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-orange-400 to-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                  <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs font-black tracking-wider text-muted-foreground uppercase leading-none mb-1">Energy</span>
                  <span className="text-xl md:text-2xl font-bold leading-none text-foreground">32.860</span>
                </div>
              </motion.div>
            </div>
          {/* 6. Card de Mood (Humor da Equipe) */}
          <div className="absolute bottom-[0%] right-[0%] z-40">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: [-8, 8, -8] 
              }}
              transition={{ 
                opacity: { duration: 0.5, delay: 0.8 }, 
                y: { duration: 5, repeat: Infinity, ease: "easeInOut" } 
              }}
              className="bg-background/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-border flex flex-col gap-4"
            >
              <span className="text-[10px] md:text-xs font-black tracking-wider text-muted-foreground uppercase leading-none">
                Team Mood
              </span>
              
              <div className="flex items-center gap-3">
                {/* Carinha Brava */}
                <div className="flex flex-col items-center gap-1 opacity-40">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <Frown className="w-4 h-4" />
                  </div>
                </div>

                {/* Carinha Feliz (Destaque) */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-green-400 to-emerald-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                    <Smile className="w-5 h-5" />
                  </div>
                  <div className="w-1 h-1 bg-emerald-500 rounded-full mt-1" />
                </div>
                
                {/* Carinha Neutra/Triste */}
                <div className="flex flex-col items-center gap-1 opacity-40">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <Meh className="w-4 h-4" />
                  </div>
                </div>

                
              </div>
                </motion.div>
          </div>
            
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Tudo que sua equipe precisa
            </h2>
            <p className="text-foreground text-lg">
              Funcionalidades pensadas para produtividade e bem-estar
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-6 border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-all">
                  <f.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                  {f.title}
                </h3>
                <p className="text-foreground text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img
                src={isDark ? logoDark : logoLight}
                alt="Azis logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <span className="font-heading font-semibold text-foreground">
              Azis
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Azis. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}