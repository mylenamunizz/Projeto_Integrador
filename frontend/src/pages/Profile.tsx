import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, Star, Award, Zap, Edit2 } from "lucide-react";
import { getCurrentUser } from "@/data/mock";
import { toast } from "sonner";

const AVAILABLE_EMOJIS = [
  "👩", "👩‍🦰", "👩‍🦱", "👩‍🦲", "👩‍🦳", "👨", "👨‍🦰", "👨‍🦱", "👨‍🦲", "👨‍🦳",
  "👧", "👦", "👴", "👵", "👨‍💼", "👩‍💼", "👨‍⚕️", "👩‍⚕️", "👨‍🍳", "👩‍🍳",
  "👨‍💻", "👩‍💻", "👨‍🎓", "👩‍🎓", "👨‍🎨", "👩‍🎨", "🧑‍🚀", "🧑‍🎬", "🧑‍🎤", "😊"
];

const pointsHistory = [
  { date: "06/03/2026", desc: "Setup CI/CD pipeline", points: 60, icon: "📊" },
  { date: "04/03/2026", desc: "Code review módulo auth", points: 25, icon: "🔍" },
  { date: "05/03/2026", desc: "Otimizar queries do banco", points: 45, icon: "⚙️" },
  { date: "03/03/2026", desc: "Documentação da API", points: 30, icon: "📚" },
  { date: "02/03/2026", desc: "Desbloqueou selo 'Velocidade'", points: 100, icon: "🏅" },
  { date: "01/03/2026", desc: "Primeira tarefa concluída", points: 15, icon: "✅" },
];

export default function Profile() {
  const currentUser = getCurrentUser();
  const [selectedEmoji, setSelectedEmoji] = useState("👩‍💼");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    cargo: "CEO",
    equipe: "Azis",
  });
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setShowEmojiPicker(false);
    toast.success("Avatar atualizado com sucesso!");
  };

  const handleSave = () => {
    toast.success("✓ Salvo");
    setTimeout(() => {}, 2000);
  };

  const stats = [
    { label: "Pontos", value: (currentUser.points ?? 0).toLocaleString(), icon: "⭐", color: "text-yellow-400" },
    { label: "Ranking", value: "#1", icon: "🏆", color: "text-purple-400" },
    { label: "Selos", value: "12", icon: "🎖️", color: "text-green-400" },
    { label: "Tarefas", value: "62", icon: "⚡", color: "text-blue-400" },
  ];

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-[color:var(--background)] flex flex-col">
      {/* BLOCO 1 - Hero Card + Dados Pessoais + Visibilidade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 flex-grow">
        {/* HERO CARD - Coluna Esquerda */}
        <Card className="border-[color:var(--border)] bg-[color:var(--card)] lg:col-span-1 relative overflow-hidden flex flex-col">
          {/* Glow Background */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl" />
          
          <CardContent className="p-6 relative z-10 flex-1 flex flex-col">
            {/* Avatar com Picker */}
            <div className="mb-6 flex justify-center relative">
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-gradient-primary flex items-center justify-center text-6xl border-4 border-purple-500/30 shadow-lg">
                  {selectedEmoji}
                </div>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute bottom-2 right-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full p-2 transition-colors"
                  title="Editar avatar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Emoji Picker Inline */}
              {showEmojiPicker && (
                <div
                  ref={pickerRef}
                  className="absolute top-40 left-1/2 -translate-x-1/2 bg-[color:var(--surface2)] border border-[color:var(--border)] rounded-[1rem] p-4 w-72 z-50 shadow-lg animate-in fade-in scale-95"
                >
                  <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                    {AVAILABLE_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="text-3xl hover:bg-[color:var(--surface)] rounded-lg p-2 transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Badge de Nível */}
              <div className="absolute -top-3 -right-3 bg-purple-500 px-3 py-1 rounded-full text-xs font-bold text-white hidden">
                Nível 5 — Especialista
              </div>
            </div>

            {/* Nome */}
            <h2 className="text-2xl font-heading font-bold text-foreground text-center mb-2">
              {currentUser.name}
            </h2>

            {/* Cargo como Pill */}
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/30">
                Gestor
              </span>
            </div>

            {/* Stats Grid 2x2 */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {stats.map((stat, i) => (
                <div key={i} className="rounded-lg bg-[color:var(--surface2)] p-3 text-center border border-[color:var(--border)]">
                  <div className={`text-2xl font-heading font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-[color:var(--muted)] font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Level Progress Bar */}
            <div className="space-y-2 mt-auto hidden">
              <div className="flex items-center justify-between text-xs text-[color:var(--muted)]">
                <span className="font-bold">Nível 5</span>
                <span className="font-bold">250 / 500 pts</span>
              </div>
              <div className="h-2 bg-[color:var(--surface2)] rounded-full overflow-hidden border border-[color:var(--border)]">
                <div className="h-full bg-gradient-primary w-1/2" />
              </div>
              <p className="text-xs text-[color:var(--muted)] text-center mt-2">
                Faltam 250 pontos para alcançar Nível 6
              </p>
            </div>
          </CardContent>
        </Card>

        {/* COLUNA DIREITA - 2 Cards Empilhados */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* Card Dados Pessoais */}
          <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
            <CardHeader>
              <CardTitle className="font-heading">Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[color:var(--muted)] uppercase">Nome</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-lg bg-[color:var(--surface2)] border-[color:var(--border)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[color:var(--muted)] uppercase">Email</Label>
                  <Input
                    value={formData.email}
                    type="email"
                    className="rounded-lg bg-[color:var(--surface2)] border-[color:var(--border)]"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[color:var(--muted)] uppercase">Cargo</Label>
                  <Input
                    value={formData.cargo}
                    className="rounded-lg bg-[color:var(--surface2)] border-[color:var(--border)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[color:var(--muted)] uppercase">Equipe</Label>
                  <Input
                    value={formData.equipe}
                    className="rounded-lg bg-[color:var(--surface2)] border-[color:var(--border)]"
                  />
                </div>
              </div>
              <Button
                onClick={handleSave}
                className="w-full bg-gradient-primary text-white rounded-lg font-bold"
              >
                Salvar alterações
              </Button>
            </CardContent>
          </Card>

          {/* Card Visibilidade */}
          <Card className="border-[color:var(--border)] bg-[color:var(--card)] flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="font-heading">Visibilidade</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: Trophy, label: "Aparecer no ranking", desc: "Outros podem ver sua posição no ranking geral" },
                  { icon: Star, label: "Pontuação pública", desc: "Mostrar seus pontos no perfil público" },
                  { icon: Zap, label: "Feed de conquistas", desc: "Compartilhar suas conquistas no feed de equipe" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Icon className="w-5 h-5 text-purple-400" />
                        <span className="inline-flex items-center rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-bold text-green-400">
                          Ativo
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-foreground mb-1">{item.label}</h4>
                      <p className="text-xs text-[color:var(--muted)]">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BLOCO 2 - Histórico de Pontos */}
      <Card className="border-[color:var(--border)] bg-[color:var(--card)] w-full">
        <CardHeader>
          <CardTitle className="font-heading">📋 Histórico de Pontos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pointsHistory.map((entry, i) => (
              <div key={i} className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface2)] p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-lg flex-shrink-0">
                    {entry.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{entry.desc}</p>
                    <p className="text-xs text-[color:var(--muted)]">{entry.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-heading font-bold text-purple-400">+{entry.points} ⭐</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
