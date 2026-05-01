import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import mascotVideo from "@/assets/mascot.png";
import mascotVideoDark from "@/assets/mascot.png";
import { useTheme } from "@/hooks/use-theme";
import { ThemeToggle } from "@/components/ThemeToggle";
import logoLight from "@/assets/logo-azis.svg";
import logoDark from "@/assets/logo-azis-branco.svg";
import mockup from "@/assets/mockup.png";
import mockup2 from "@/assets/mockup2.png";
import medal from "@/assets/medal.png";
import rocket from "@/assets/Rocket.png";

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
  Star,
  Gift,
  Clock,
} from "lucide-react";

const features = [
  { icon: KanbanSquare, title: "Kanban Intuitivo", desc: "Organize tarefas com drag & drop, como Trello" },
  { icon: Trophy, title: "Gamificação", desc: "Pontos, ranking e recompensas para motivar a equipe" },
  { icon: BarChart3, title: "Dashboards", desc: "Relatórios de produtividade e satisfação em tempo real" },
  { icon: Users, title: "Gestão de Times", desc: "Convide membros, atribua tarefas e acompanhe progresso" },
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

            <ThemeToggle />

            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
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

            {/* 5. Badge Pontos (Flutuando em Baixo Direita - Frente de tudo) */}
            <div className="absolute bottom-[20%] right-[-5%] z-40">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, y: [-8, 8, -8] }}
                transition={{ opacity: { duration: 0.5 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                className="bg-background/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-border flex items-center gap-4"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-500 flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.4)]">
                  <Star className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs font-black tracking-wider text-muted-foreground uppercase leading-none mb-1">Pontos</span>
                  <span className="text-xl md:text-2xl font-bold leading-none text-foreground">12.450</span>
                </div>
              </motion.div>
            </div>
          {/* 6. Card de Mood - REMOVIDO */}
            
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

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
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

      {/* GAMIFICAÇÃO - SELOS */}
      <section className="py-20 px-6 bg-gradient-to-b from-background via-background to-primary/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs md:text-sm font-black tracking-wider text-primary uppercase mb-4 inline-block">
              Gamificação
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4 leading-tight">
              Selos que motivam<br />de verdade
            </h2>
            <p className="text-foreground text-lg max-w-2xl mx-auto">
              Cada conquista desbloqueada é uma celebração. Funcionários coletam selos, acumulam pontos e sobem no ranking.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                9 Selos Exclusivos
              </h3>
              <p className="text-foreground text-sm">
                De Mário a Zelda — cada um com título temático e pontuação própria.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                Missões Semanais
              </h3>
              <p className="text-foreground text-sm">
                Novos desafios toda semana para manter o engajamento sempre alto.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <Gift className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                Loja de Recompensas
              </h3>
              <p className="text-foreground text-sm">
                Pontos viram prêmios reais que a empresa define para sua equipe.
              </p>
            </motion.div>
          </div>

          {/* Rocket Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <img 
              src={rocket}
              alt="Rocket"
              className="w-40 h-40 object-contain"
            />
          </motion.div>
        </div>
      </section>

      {/* RANKING SECTION */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Ranking List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <span className="text-xs md:text-sm font-black tracking-wider text-primary uppercase mb-4 inline-block">
                Ranking
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2 leading-tight">
                Competição<br />saudável<br />entre colegas
              </h2>
              <p className="text-foreground text-lg mb-8">
                O feed ao vivo mostra em tempo real quem desbloqueou selos, completou tarefas e subiu no ranking.
              </p>

              <div className="space-y-4">
                {[
                  { name: "Ana Carolina", subtitle: "A Linda do Funcionário do Tempo", points: "1.000", color: "bg-yellow-400" },
                  { name: "Rafael Mendes", subtitle: "A Recompensa Contra-Ataca", points: "750", color: "bg-blue-500" },
                  { name: "Mariana Silva", subtitle: "Tomb Raider: A Origem das Entrega", points: "500", color: "bg-purple-500" },
                  { name: "Lucas Ferreira", subtitle: "A Câmara dos Segredos Produtivos", points: "300", color: "bg-gray-400" },
                  { name: "Pedro Alves", subtitle: "O Homem de Aço Ganhou Pontos", points: "150", color: "bg-gray-300" },
                ].map((user, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-all duration-300 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-full ${user.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-semibold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.subtitle}</p>
                      </div>
                    </div>
                    <span className="font-heading font-bold text-primary ml-3 flex-shrink-0">{user.points}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right - Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Card 1 - Pontos esta semana */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">📊</span>
                  <p className="text-sm font-semibold text-muted-foreground">Pontos esta semana</p>
                </div>
                <div className="flex gap-2 h-32 items-end justify-between">
                  {[
                    { name: "Ana", value: 85, color: "bg-yellow-400" },
                    { name: "Rafael", value: 65, color: "bg-blue-500" },
                    { name: "Mariana", value: 55, color: "bg-purple-500" },
                    { name: "Lucas", value: 40, color: "bg-gray-500" },
                    { name: "Pedro", value: 25, color: "bg-gray-400" },
                  ].map((bar, i) => (
                    <motion.div 
                      key={i} 
                      className="flex-1 flex flex-col items-center gap-2"
                      initial={{ height: 0, opacity: 0 }}
                      whileInView={{ height: "auto", opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className={`w-full ${bar.color} rounded-lg shadow-md hover:shadow-lg transition-shadow`} style={{ height: `${bar.value}px` }} />
                      <p className="text-xs font-bold text-foreground text-center">{bar.name}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Card 2 - Missão da Semana */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white border border-purple-500/30"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">⚡</span>
                  <p className="text-xs font-black tracking-wider uppercase">Missão da semana</p>
                </div>
                <h3 className="font-heading font-bold text-2xl mb-4">
                  Complete 5 tarefas e ganhe +50 pts bônus!
                </h3>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>3 dias restantes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>218 participando</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
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