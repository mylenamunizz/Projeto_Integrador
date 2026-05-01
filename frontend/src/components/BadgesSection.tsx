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

interface BadgesSectionProps {
  badges?: Badge[];
}

export default function BadgesSection({ badges = [] }: BadgesSectionProps) {
  const unlockedBadges = badges.filter(b => b.unlocked);
  const unlockedCount = unlockedBadges.length;
  const totalBadges = badges.length;
  const progressPercent = totalBadges > 0 ? (unlockedCount / totalBadges) * 100 : 0;
  const nextBadge = badges.find(b => !b.unlocked);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold text-foreground">Selos de Conquista</h2>
        <div className="bg-secondary px-3 py-1 rounded-full text-sm font-medium text-foreground">
          {unlockedCount} de {totalBadges} desbloqueados
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-secondary rounded-full h-2">
          <motion.div
            className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{unlockedCount} selos desbloqueados</span>
          {nextBadge && (
            <span>Próximo: {nextBadge.name} — {nextBadge.points_required} pts</span>
          )}
        </div>
      </div>

      {/* Badges Grid */}
      {badges.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nenhum selo disponível no momento</p>
        </div>
      ) : (
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {badges.map((badge, index) => (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-2 w-28">
                    <motion.div
                      className={`relative w-28 h-28 overflow-hidden bg-secondary rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                        badge.unlocked ? 'border-2 border-yellow-400' : 'border-2 border-gray-500'
                      }`}
                      style={{
                        clipPath: 'polygon(0% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)',
                        filter: badge.unlocked ? 'none' : 'grayscale(100%)',
                      }}
                      initial={badge.unlocked ? { scale: 0.8, boxShadow: '0 0 0 rgba(255, 215, 0, 0)' } : {}}
                      animate={badge.unlocked ? { scale: 1, boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)' } : {}}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      <img
                        src={badge.image}
                        alt={badge.name}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      {badge.unlocked && (
                        <CheckCircle2 className="absolute top-1 right-1 w-4 h-4 text-green-500 bg-white rounded-full" />
                      )}
                    </motion.div>
                    <div className="w-full text-center">
                      <div className="text-xs font-semibold text-foreground leading-4 line-clamp-2">
                        {badge.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1 mt-1">
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
      </div>
      )}

      {/* Legend */}
      <div className="flex gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
          <span>Selo desbloqueado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-500 rounded"></div>
          <span>Bloqueado — passe o mouse para ver a prévia</span>
        </div>
      </div>
    </div>
  );
}