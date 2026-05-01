import { motion, AnimatePresence } from "framer-motion";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Badge {
    id: string;
    title: string;
    points: number;
    image?: string;
}

interface BadgeClaimModalProps {
    badge: Badge | null;
    onClaim: (id: string) => void;
    onClose: () => void;
}

export default function BadgeClaimModal({ badge, onClaim, onClose }: BadgeClaimModalProps) {
    if (!badge) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-surface border border-border p-8 text-center shadow-2xl"
                >
                    {/* Background Glow */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-500/10 to-transparent" />

                    <motion.div
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.2
                        }}
                        className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-2xl border-2 border-yellow-400 bg-surface shadow-[0_0_30px_rgba(234,179,8,0.3)] overflow-hidden"
                    >
                        {badge.image ? (
                            <img src={badge.image} alt={badge.title} className="h-full w-full object-cover" />
                        ) : (
                            <Star className="h-16 w-16 text-yellow-500 fill-yellow-500" />
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="mb-2 text-2xl font-bold text-text-strong font-heading">
                            Selo Conquistado!
                        </h2>
                        <p className="mb-6 text-muted font-medium">
                            Parabéns! Você desbloqueou o selo <br />
                            <span className="text-accent font-bold">"{badge.title}"</span>
                        </p>

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => onClaim(badge.id)}
                                className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl shadow-lg transition-all group overflow-hidden relative"
                            >
                                <motion.span
                                    className="flex items-center justify-center gap-2"
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Check className="w-5 h-5" />
                                    COLETAR RECOMPENSA
                                </motion.span>

                                {/* Shine effect */}
                                <motion.div
                                    className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700"
                                />
                            </Button>

                            <button
                                onClick={onClose}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Ver depois
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
