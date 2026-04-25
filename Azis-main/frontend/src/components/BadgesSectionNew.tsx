import { motion } from "framer-motion";
import { Star, CheckCircle2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Badge {
  id: number;
  name: string;
  points_required: number;
  unlocked: boolean;
  unlocked_at?: string;
  image: string;
}

interface BadgesSectionNewProps {
  badges?: Badge[];
}

export default function BadgesSectionNew({ badges = [] }: BadgesSectionNewProps) {
  const unlockedBadges = badges.filter((badge) => badge.unlocked);
  const unlockedCount = unlockedBadges.length;
  const totalBadges = badges.length;
  const progressPercent = totalBadges > 0 ? (unlockedCount / totalBadges) * 100 : 0;
  const nextBadge = badges.find((badge) => !badge.unlocked);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold text-foreground">Selos de Conquista</h2>
        <div className="bg-secondary px-3 py-1 rounded-full text-sm font-medium text-foreground">
          {unlockedCount} de {totalBadges} desbloqueados
        </div>
      </div>

      <div className="space-y-2">
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.9 }}
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{unlockedCount} selos desbloqueados</span>
          {nextBadge && (
            <span>Próximo: {nextBadge.name} — {nextBadge.points_required} pts</span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        {badges.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum selo disponível no momento</p>
          </div>
        ) : (
        <div className="flex gap-4 min-w-max">
          {badges.map((badge, index) => (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-2 w-28 text-center">
                    <motion.div
                      className={`relative w-28 h-28 overflow-hidden rounded-xl flex items-center justify-center transition-all ${badge.unlocked ? 'border-2 border-yellow-400 shadow-[0_0_18px_rgba(249,215,31,0.3)]' : 'border-2 border-zinc-700'}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.35 }}
                    >
                      <img
                        src={badge.image}
                        alt={badge.name}
                        className={`absolute inset-0 h-full w-full object-cover ${badge.unlocked ? '' : 'grayscale'}`}
                      />
                      <div className="absolute inset-0 bg-black/10" />
                      {badge.unlocked && (
                        <div className="absolute top-1 right-1 rounded-full bg-zinc-950/90 p-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                      )}
                    </motion.div>
                    <div className="w-full">
                      <div className="text-xs font-semibold text-foreground leading-5 line-clamp-2">
                        {badge.name}
                      </div>
                      <div className="mt-1 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                        <Star className="w-3.5 h-3.5" />
                        {badge.points_required} pts
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{badge.name} — {badge.points_required} pts</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        )}
      </div>

      <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-yellow-400" />
          <span>Selo desbloqueado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-zinc-600" />
          <span>Bloqueado — passe o mouse para ver a prévia</span>
        </div>
      </div>
    </div>
  );
}
