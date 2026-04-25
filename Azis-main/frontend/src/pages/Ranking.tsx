import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { getApiUrl, getAuthHeaders } from "@/lib/api";
import RocketPodium from "@/components/RocketPodium";

interface RankingUser {
  id: string;
  name: string;
  points: number;
  role: string;
  avColor?: string;
}

function getAvatarColor(char: string): string {
  const colors = [
    '#7c5cbf', '#5a4a9f', '#3a3a8f', '#6b4c8a', '#8a5a7f',
    '#5038a0', '#6a48aa', '#7a58ba', '#4a38a0', '#9a6abb'
  ];
  return colors[char.charCodeAt(0) % colors.length];
}

export default function Ranking() {
  const [users, setUsers] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRanking() {
      try {
        setLoading(true);
        const res = await fetch(getApiUrl("/api/rewards/leaderboard"), {
          headers: getAuthHeaders(),
        });

        if (!res.ok) throw new Error("Erro ao buscar ranking");

        const json = await res.json();
        const data: Array<{ user_id: number; name: string; total_points: number }> =
          json.data ?? [];

        const mapped: RankingUser[] = data.map((u) => ({
          id: String(u.user_id),
          name: u.name,
          points: u.total_points,
          role: "membro",
          avColor: getAvatarColor(u.name.charAt(0)),
        }));

        setUsers(mapped);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar o ranking.");
      } finally {
        setLoading(false);
      }
    }

    fetchRanking();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando ranking...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (users.length < 3) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          São necessários pelo menos 3 usuários com pontos para exibir o ranking.
        </p>
      </div>
    );
  }

  const top3: [RankingUser, RankingUser, RankingUser] = [
    users[1], // 2º lugar (posição esquerda no pódio)
    users[0], // 1º lugar (centro)
    users[2], // 3º lugar (direita)
  ];

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      <div className="p-6 lg:p-8">
        <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
              <Trophy className="w-8 h-8 text-[color:var(--gold)]" />
              Ranking de Produtividade
            </h1>
            <p className="text-muted-foreground mt-1">
              Os membros mais produtivos da equipe
            </p>
          </div>

          <RocketPodium
            top3={top3}
            fullList={users}
            currentUserId={undefined}
          />
        </div>
      </div>
    </div>
  );
}
