import { useState } from "react";
import { motion } from "framer-motion";
import { Smile, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { moodLabels, MoodType, weeklyMoodData } from "@/data/mock";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const moodKeys: MoodType[] = ["very_happy", "happy", "neutral", "sad", "stressed"];

export default function Mood() {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [registered, setRegistered] = useState(false);

  const handleRegister = () => {
    if (!selectedMood) return;
    setRegistered(true);
    toast.success(`Humor registrado: ${moodLabels[selectedMood].emoji} ${moodLabels[selectedMood].label}`);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
          <Smile className="w-8 h-8 text-accent" />
          Registro de Humor
        </h1>
        <p className="text-muted-foreground mt-1">Como você está se sentindo hoje?</p>
      </div>

      {/* Daily Mood Registration */}
      <Card>
        <CardContent className="p-6">
          {registered ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">{moodLabels[selectedMood!].emoji}</div>
              <h3 className="font-heading font-bold text-xl text-foreground mb-2">Humor registrado!</h3>
              <p className="text-muted-foreground">Obrigado por compartilhar como você está se sentindo.</p>
            </div>
          ) : (
            <>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-6 text-center">
                Selecione seu humor de hoje
              </h3>
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                {moodKeys.map((mood) => (
                  <motion.button
                    key={mood}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMood(mood)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all min-w-[100px] ${
                      selectedMood === mood
                        ? "border-primary bg-primary/10 shadow-glow"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <span className="text-4xl">{moodLabels[mood].emoji}</span>
                    <span className="text-xs font-medium text-foreground">{moodLabels[mood].label}</span>
                  </motion.button>
                ))}
              </div>
              <div className="text-center">
                <Button
                  onClick={handleRegister}
                  disabled={!selectedMood}
                  className="bg-gradient-primary text-primary-foreground px-8"
                >
                  Registrar Humor
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Humor Semanal da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyMoodData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="happy" fill="hsl(142, 72%, 45%)" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="neutral" fill="hsl(38, 92%, 50%)" radius={[0, 0, 0, 0]} stackId="a" />
                <Bar dataKey="sad" fill="hsl(0, 72%, 55%)" radius={[0, 0, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mood Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Resumo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <span className="text-sm text-foreground">Média de satisfação</span>
              <span className="font-heading font-bold text-primary">4.2/5</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <span className="text-sm text-foreground">Humor predominante</span>
              <span className="text-lg">😊 Feliz</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <span className="text-sm text-foreground">Tendência</span>
              <div className="flex items-center gap-1 text-primary">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Em alta</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <span className="text-sm text-foreground">Registros hoje</span>
              <span className="font-heading font-bold text-foreground">4/6</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
