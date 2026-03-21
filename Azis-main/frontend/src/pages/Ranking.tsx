import { motion } from "framer-motion";
import { Trophy, Star, Medal, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getActiveUsers } from "@/data/mock";

const podiumColors = [
  "from-[hsl(43,100%,65%)] to-[hsl(43,100%,65%)]",
  "from-[hsl(0,0%,75%)] to-[hsl(0,0%,75%)]",
  "from-[hsl(38,97%,33%)] to-[hsl(38,97%,33%)]",
];

export default function Ranking() {
  const sorted = [...getActiveUsers()].filter((u) => u.nivel !== 3).sort((a, b) => b.points - a.points);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
          <Trophy className="w-8 h-8 text-warning" />
          Ranking de Produtividade
        </h1>
        <p className="text-muted-foreground mt-1">Os membros mais produtivos da equipe</p>
      </div>

      {/* Top 3 */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {[sorted[1], sorted[0], sorted[2]].map((member, i) => {
          const pos = i === 0 ? 2 : i === 1 ? 1 : 3;
          const isFirst = pos === 1;
          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`text-center ${isFirst ? "-mt-4" : "mt-4"}`}
            >
              <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${podiumColors[pos - 1]} flex items-center justify-center mb-3 ${isFirst ? "w-24 h-24 ring-4 ring-warning/30" : ""}`}>
                <span className="font-heading font-bold text-2xl text-foreground">
                  {member.name.charAt(0)}
                </span>
              </div>
              <div className="flex items-center justify-center gap-1 mb-1">
                {pos === 1 && <Medal className="w-5 h-5 text-warning" />}
                <span className="font-heading font-bold text-lg text-foreground">#{pos}</span>
              </div>
              <p className="text-sm font-medium text-foreground">{member.name.split(" ")[0]}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Star className="w-3.5 h-3.5 text-warning" />
                <span className="text-sm font-semibold text-foreground">{member.points}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full List */}
      <Card>
        <CardContent className="p-0">
          {sorted.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-4 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
            >
              <span className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm flex-shrink-0 ${
                i === 0 ? "bg-warning text-warning-foreground" : i === 1 ? "bg-secondary text-muted-foreground" : i === 2 ? "bg-warning/40 text-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i + 1}
              </span>
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-semibold text-sm">
                  {member.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.role === "gestor" ? "Gestor" : member.role === "admin" ? "Admin" : "Membro"}</p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-warning" />
                  <span className="font-heading font-bold text-foreground">{member.points}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
