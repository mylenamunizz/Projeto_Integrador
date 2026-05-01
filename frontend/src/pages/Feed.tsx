import { useEffect, useMemo, useRef, useState } from "react";
import { getApiUrl, getAuthHeaders } from "@/lib/api";
import { getCurrentUser, getActiveUsers } from "@/data/mock";
import type { Badge, FeedEvent, LeaderboardEntry, Mission, OnlineUser } from "@/types/feed";

const FEED_TABS = [
  { id: "all", label: "🏆 Tudo" },
  { id: "badge", label: "🏅 Selos" },
  { id: "task", label: "⚡ Tarefas" },
  { id: "team", label: "👥 Minha equipe" },
];

const FEED_FALLBACK: FeedEvent[] = [
  {
    id: "f1",
    userId: "1",
    userName: "Ana Silva",
    userAvatar: "👩‍💼",
    userLevel: 5,
    type: "badge",
    description: "Desbloqueou o selo \"Super Tarefa Bros!\".",
    stampEmoji: "🏅",
    points: 0,
    pointsType: "gold",
    isNew: true,
    createdAt: "2026-04-10T10:42:00Z",
    reactions: [
      { emoji: "🎉", count: 12, reacted: false },
      { emoji: "👏", count: 8, reacted: false },
    ],
    isTeam: true,
  },
  {
    id: "f2",
    userId: "2",
    userName: "Bruno Duarte",
    userAvatar: "🧑‍🔧",
    userLevel: 3,
    type: "task",
    description: "Concluiu a tarefa \"Ajuste no Kanban de Clientes\".",
    stampEmoji: "⚡",
    points: 0,
    pointsType: "blue",
    isNew: false,
    createdAt: "2026-04-10T09:10:00Z",
    reactions: [
      { emoji: "🔥", count: 6, reacted: false },
    ],
    isTeam: true,
  },
  {
    id: "f3",
    userId: "1",
    userName: "Ana Silva",
    userAvatar: "👩‍💼",
    userLevel: 5,
    type: "milestone",
    description: "Alcançou o marco \"Semana de Alta Produtividade\" e desbloqueou um novo selo.",
    stampEmoji: "⭐",
    points: 0,
    pointsType: "purple",
    isNew: true,
    createdAt: "2026-04-09T18:22:00Z",
    reactions: [
      { emoji: "👏", count: 14, reacted: false },
      { emoji: "🎉", count: 9, reacted: false },
    ],
    isTeam: true,
  },
  {
    id: "f4",
    userId: "3",
    userName: "Carla Mendes",
    userAvatar: "👩‍💻",
    userLevel: 2,
    type: "task",
    description: "Atualizou o progresso da missão \"Onboarding do Cliente X\" para 4/5 etapas.",
    stampEmoji: "📄",
    points: 0,
    pointsType: "blue",
    isNew: false,
    createdAt: "2026-04-09T15:40:00Z",
    reactions: [
      { emoji: "👏", count: 3, reacted: false },
    ],
    isTeam: true,
  },
  {
    id: "f5",
    userId: "4",
    userName: "Daniel Reis",
    userAvatar: "🧑‍🚀",
    userLevel: 4,
    type: "badge",
    description: "Ganhou o selo \"A Origem das Entregas\".",
    stampEmoji: "🏅",
    points: 0,
    pointsType: "purple",
    isNew: false,
    createdAt: "2026-04-08T13:15:00Z",
    reactions: [
      { emoji: "🎉", count: 7, reacted: false },
    ],
    isTeam: true,
  },
];

const LEADERBOARD_FALLBACK: LeaderboardEntry[] = [
  { rank: 1, userId: "1", name: "Ana Silva", avatar: "👩‍💼", lastBadgeTitle: "Super Tarefa Bros!", score: 0 },
  { rank: 2, userId: "2", name: "Bruno Duarte", avatar: "🧑‍🔧", lastBadgeTitle: "Velocidade de Entrega", score: 0 },
  { rank: 3, userId: "3", name: "Carla Mendes", avatar: "👩‍💻", lastBadgeTitle: "O Homem de Aço", score: 0 },
  { rank: 4, userId: "4", name: "Daniel Reis", avatar: "🧑‍🚀", lastBadgeTitle: "A Origem das Entregas", score: 0 },
  { rank: 5, userId: "5", name: "Eduarda Costa", avatar: "👩‍🎨", lastBadgeTitle: "A Lenda do Funcionário", score: 0 },
];

const BADGES_FALLBACK: Badge[] = [
  { id: "b1", emoji: "🏆", name: "Primeiro Check-in", points: 0, unlocked: true },
  { id: "b2", emoji: "🫘", name: "Meta Diária", points: 0, unlocked: true },
  { id: "b3", emoji: "⚡", name: "Bônus Semanal", points: 0, unlocked: false },
  { id: "b4", emoji: "⭐", name: "Especial de Time", points: 0, unlocked: false },
  { id: "b5", emoji: "🎯", name: "Missão Cumprida", points: 0, unlocked: false },
];

const MISSIONS_FALLBACK: Mission[] = [
  { id: "m1", name: "Aprimorar o Relatório", bonusPoints: 0, current: 3, total: 5, daysLeft: 2, completed: false },
  { id: "m2", name: "Revisar metas semanais", bonusPoints: 0, current: 5, total: 5, daysLeft: 0, completed: true },
  { id: "m3", name: "Enviar feedback", bonusPoints: 0, current: 2, total: 4, daysLeft: 3, completed: false },
];

const ONLINE_USERS_FALLBACK: OnlineUser[] = [
  { userId: "1", name: "Ana Silva", avatar: "👩‍💼" },
  { userId: "2", name: "Bruno Duarte", avatar: "🧑‍🔧" },
  { userId: "3", name: "Carla Mendes", avatar: "👩‍💻" },
  { userId: "4", name: "Daniel Reis", avatar: "🧑‍🚀" },
  { userId: "5", name: "Eduarda Costa", avatar: "👩‍🎨" },
];

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h atrás`;
  const days = Math.floor(hours / 24);
  return `${days} d atrás`;
}

function formatUserAvatar(name: string, avatar?: string) {
  if (avatar) return avatar;
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function Feed() {
  const currentUser = getCurrentUser();
  const [activeTab, setActiveTab] = useState("all");
  const [feedEvents, setFeedEvents] = useState<FeedEvent[]>(FEED_FALLBACK);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(LEADERBOARD_FALLBACK);
  const [badges, setBadges] = useState<Badge[]>(BADGES_FALLBACK);
  const [missions, setMissions] = useState<Mission[]>(MISSIONS_FALLBACK);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>(ONLINE_USERS_FALLBACK);
  const [onlineCount, setOnlineCount] = useState(24);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showNewButton, setShowNewButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(feedEvents.filter((event) => event.isNew).length);
  const latestFeedIdRef = useRef<string | null>(feedEvents[0]?.id ?? null);

  const teamIds = useMemo(() => {
    const activeUsers = getActiveUsers();
    const teamMembers = activeUsers.filter((user) => user.gestorId === currentUser.id.toString() || user.id === currentUser.id.toString());
    return teamMembers.map((user) => user.id);
  }, [currentUser.id]);

  const filteredEvents = useMemo(() => {
    if (activeTab === "badge") return feedEvents.filter((event) => event.type === "badge");
    if (activeTab === "task") return feedEvents.filter((event) => event.type === "task");
    if (activeTab === "team") return feedEvents.filter((event) => event.isTeam || teamIds.includes(event.userId));
    return feedEvents;
  }, [activeTab, feedEvents, teamIds]);

  const fetchFeedData = async (pageToLoad = 1) => {
    try {
      const [feedResponse, leaderboardResponse, badgesResponse, missionsResponse, onlineResponse, onlineCountResponse] = await Promise.allSettled([
        fetch(getApiUrl(`/api/feed?limit=10&page=${pageToLoad}`), { headers: getAuthHeaders() }),
        fetch(getApiUrl("/api/leaderboard"), { headers: getAuthHeaders() }),
        fetch(getApiUrl("/api/badges/me"), { headers: getAuthHeaders() }),
        fetch(getApiUrl("/api/missions/active"), { headers: getAuthHeaders() }),
        fetch(getApiUrl("/api/users/online"), { headers: getAuthHeaders() }),
        fetch(getApiUrl("/api/users/online-count"), { headers: getAuthHeaders() }),
      ]);

      if (feedResponse.status === "fulfilled" && feedResponse.value.ok) {
        const payload = await feedResponse.value.json();
        const raw = payload?.feed ?? payload;
        if (Array.isArray(raw)) {
          const parsed = raw.map((item: any, index: number) => ({
            id: item.id?.toString() ?? `feed-${pageToLoad}-${index}`,
            userId: item.userId?.toString() ?? item.user?.id?.toString() ?? `u-${index}`,
            userName: item.userName ?? item.user?.name ?? "Usuário",
            userAvatar: item.userAvatar ?? item.user?.avatar ?? undefined,
            userLevel: Number(item.userLevel ?? item.level ?? 1),
            type: item.type ?? "task",
            description: item.description ?? item.text ?? "Concluiu uma ação.",
            stampEmoji: item.stampEmoji ?? item.emoji ?? "🏅",
            points: Number(item.points ?? item.value ?? 0),
            pointsType: item.pointsType ?? item.points_type ?? "gold",
            isNew: Boolean(item.isNew ?? item.new ?? item.unread),
            createdAt: item.createdAt ?? item.created_at ?? new Date().toISOString(),
            reactions: Array.isArray(item.reactions)
              ? item.reactions.map((reaction: any) => ({
                  emoji: reaction.emoji ?? "❤️",
                  count: Number(reaction.count ?? 0),
                  reacted: Boolean(reaction.reacted ?? reaction.active ?? false),
                }))
              : [],
            isTeam: Boolean(item.isTeam ?? item.team ?? true),
          })) as FeedEvent[];
          setFeedEvents((prev) => (pageToLoad === 1 ? parsed : [...prev, ...parsed]));
          setHasMore(parsed.length >= 10);
        }
      }

      if (leaderboardResponse.status === "fulfilled" && leaderboardResponse.value.ok) {
        const payload = await leaderboardResponse.value.json();
        const raw = payload?.leaderboard ?? payload;
        if (Array.isArray(raw)) {
          setLeaderboard(
            raw.slice(0, 5).map((item: any, index: number) => ({
              rank: item.rank ?? index + 1,
              userId: item.userId?.toString() ?? item.id?.toString() ?? `lb-${index}`,
              name: item.name ?? item.fullName ?? "Usuário",
              avatar: item.avatar ?? undefined,
              lastBadgeTitle: item.lastBadgeTitle ?? item.badgeTitle ?? "Selo recente",
              score: Number(item.score ?? item.points ?? 0),
            })),
          );
        }
      }

      if (badgesResponse.status === "fulfilled" && badgesResponse.value.ok) {
        const payload = await badgesResponse.value.json();
        const raw = payload?.badges ?? payload;
        if (Array.isArray(raw)) {
          setBadges(
            raw.map((item: any, index: number) => ({
              id: item.id?.toString() ?? `badge-${index}`,
              emoji: item.emoji ?? item.symbol ?? "🏅",
              name: item.name ?? item.title ?? "Selo",
              points: Number(item.points ?? item.cost ?? 0),
              unlocked: Boolean(item.unlocked ?? item.active ?? false),
            })),
          );
        }
      }

      if (missionsResponse.status === "fulfilled" && missionsResponse.value.ok) {
        const payload = await missionsResponse.value.json();
        const raw = payload?.missions ?? payload;
        if (Array.isArray(raw)) {
          setMissions(
            raw.map((item: any, index: number) => ({
              id: item.id?.toString() ?? `mission-${index}`,
              name: item.name ?? item.title ?? "Missão",
              bonusPoints: Number(item.bonusPoints ?? item.points ?? 0),
              current: Number(item.current ?? item.progress ?? 0),
              total: Number(item.total ?? item.goal ?? 1),
              daysLeft: Number(item.daysLeft ?? item.remainingDays ?? 0),
              completed: Boolean(item.completed ?? item.done ?? false),
            })),
          );
        }
      }

      if (onlineResponse.status === "fulfilled" && onlineResponse.value.ok) {
        const payload = await onlineResponse.value.json();
        const raw = payload?.users ?? payload;
        if (Array.isArray(raw)) {
          setOnlineUsers(
            raw.slice(0, 20).map((item: any, index: number) => ({
              userId: item.userId?.toString() ?? item.id?.toString() ?? `online-${index}`,
              name: item.name ?? item.fullName ?? "Usuário",
              avatar: item.avatar ?? undefined,
            })),
          );
        }
      }

      if (onlineCountResponse.status === "fulfilled" && onlineCountResponse.value.ok) {
        const payload = await onlineCountResponse.value.json();
        setOnlineCount(Number(payload?.count ?? payload?.onlineCount ?? payload ?? 24));
      }
    } catch (error) {
      console.error("Feed data load error:", error);
    } finally {
      setUnreadCount(feedEvents.filter((event) => event.isNew).length);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    latestFeedIdRef.current = feedEvents[0]?.id ?? null;
  }, [feedEvents]);

  useEffect(() => {
    fetchFeedData(1);
    const interval = window.setInterval(async () => {
      try {
        const response = await fetch(getApiUrl("/api/feed?limit=1"), { headers: getAuthHeaders() });
        if (!response.ok) return;
        const payload = await response.json();
        const raw = payload?.feed ?? payload;
        if (Array.isArray(raw) && raw.length > 0) {
          const latestId = raw[0].id?.toString();
          if (latestId && latestId !== latestFeedIdRef.current) {
            setShowNewButton(true);
          }
        }
      } catch {
        // ignore polling errors
      }
    }, 30000);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setUnreadCount(feedEvents.filter((event) => event.isNew).length);
  }, [feedEvents]);

  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore || !hasMore) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 220) {
        setIsLoadingMore(true);
        setPage((prev) => {
          const nextPage = prev + 1;
          fetchFeedData(nextPage);
          return nextPage;
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoadingMore]);

  const now = new Date();
  const dateLabel = now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).toUpperCase();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[color:var(--feed-bg)] text-[color:var(--feed-text)]">
      <div className="feed-scrollbar">
        <main className="xl:mr-[var(--feed-widgets-w)] px-[24px] py-[28px]">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5">
            <div>
              <h1 className="font-[Orbitron] text-[16px] font-[900] uppercase tracking-[1px] text-[color:var(--feed-text)]">📣 Feed de Conquistas</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[color:var(--feed-green)] feed-live-dot" />
              <span className="text-[12px] font-[700] text-[color:var(--feed-green)] font-[Nunito]">Ao vivo · {onlineCount} online agora</span>
            </div>
          </div>

          <div className="mb-5 inline-flex rounded-[12px] bg-[color:var(--feed-bg3)] p-[4px]">
            {FEED_TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              const badge = tab.id === "all" ? unreadCount : undefined;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative rounded-[9px] px-4 py-2 text-[13px] font-[700] font-[Nunito] transition ${
                    isActive
                      ? "bg-[color:var(--feed-card)] text-[color:var(--feed-text)] shadow-feed"
                      : "text-[color:var(--feed-text3)]"
                  }`}
                >
                  {tab.label}
                  {badge ? (
                    <span className="ml-2 inline-flex rounded-full bg-[color:var(--feed-purple)] px-2 py-0.5 text-[10px] font-[800] text-white">{badge}</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <section className="mb-5 overflow-hidden rounded-[18px] bg-gradient-to-r from-[color:var(--feed-blue)] to-[color:var(--feed-purple)] p-6 text-white relative overflow-hidden">
            <div className="absolute -top-6 -right-10 h-28 w-28 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 left-4 h-24 w-24 rounded-full bg-white/5" />
            <div className="flex flex-wrap gap-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/20 text-[24px]">{formatUserAvatar(currentUser.name)}</div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-[700] uppercase tracking-[1px] opacity-75">⚡ Seu progresso hoje</div>
                <h2 className="mt-2 text-[24px] font-[900] font-[Orbitron]">{currentUser.points ?? 0} pts</h2>
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-[3px] bg-white/20">
                  <div
                    className="h-full rounded-[3px] bg-white/70 mp-fill"
                    style={{ width: "68%" }}
                  />
                </div>
                <p className="mt-3 text-[12px] font-[700] opacity-80">🎯 Faltam 180 pts para desbloquear o próximo selo</p>
              </div>
              <div className="rounded-[20px] bg-white/15 px-4 py-2 text-[12px] font-[700] uppercase tracking-[0.5px] font-[Orbitron]">Nível 4 — Mestre</div>
            </div>
          </section>

          <div className="mb-4 flex items-center gap-3 text-[11px] font-[700] uppercase tracking-[1px] text-[color:var(--feed-text3)]">
            <span className="flex-1 h-px bg-[color:var(--feed-divider)]" />
            <span>{dateLabel}</span>
            <span className="flex-1 h-px bg-[color:var(--feed-divider)]" />
          </div>

          <div className="space-y-3">
            {filteredEvents.map((event, index) => (
              <article
                key={event.id}
                className="relative overflow-hidden rounded-[18px] border border-[color:var(--feed-card-border)] bg-[color:var(--feed-card)] p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:border-[color:var(--feed-purple)] hover:shadow-[var(--feed-glow-purple)] feed-card-slide"
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                {event.isNew && (
                  <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-[color:var(--feed-purple)] to-[color:var(--feed-blue)] px-3 py-1 text-[10px] font-[800] text-white feed-badge-glow">Novo</span>
                )}
                <div className={`absolute left-0 top-4 bottom-4 w-1.5 rounded-r-[3px] ${
                  event.pointsType === "gold"
                    ? "bg-gradient-to-b from-[color:var(--feed-yellow)] to-[#e8a500]"
                    : event.pointsType === "blue"
                    ? "bg-gradient-to-b from-[color:var(--feed-blue)] to-[#1e56c7]"
                    : "bg-gradient-to-b from-[color:var(--feed-purple)] to-[#6b2fa0]"
                }`} />
                <div className="flex items-start gap-4 ml-4">
                  <div className="relative h-12 w-12 rounded-[14px] border border-[color:var(--feed-card-border)] bg-[color:var(--feed-bg2)] text-[20px] flex items-center justify-center text-[color:var(--feed-text)] transition hover:border-[color:var(--feed-purple)]">
                    {formatUserAvatar(event.userName, event.userAvatar)}
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-[6px] bg-[color:var(--feed-yellow)] text-[10px] font-[900] text-[#1a1200] border-[2px] border-[color:var(--feed-card)]">{event.userLevel}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-[800] font-[Nunito] text-[color:var(--feed-text)]">{event.userName}</div>
                    <p className="mt-1 text-[13px] leading-6 text-[color:var(--feed-text2)]">
                      {event.description.replace(/\*\*/g, "")}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[color:var(--feed-text3)]">
                      <span>{formatRelativeDate(event.createdAt)}</span>
                      <span className="inline-flex items-center rounded-full border border-[color:var(--feed-divider)] bg-[color:var(--feed-bg3)] px-2.5 py-1">{event.stampEmoji}</span>
                      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-[700] ${
                        event.pointsType === "gold"
                          ? "bg-[color:var(--feed-yellow-soft)] text-[color:var(--feed-yellow)] border border-[rgba(245,200,0,0.2)]"
                          : event.pointsType === "blue"
                          ? "bg-[color:var(--feed-blue-soft)] text-[color:var(--feed-blue)] border border-[rgba(79,142,247,0.2)]"
                          : "bg-[color:var(--feed-purple-soft)] text-[color:var(--feed-purple)] border border-[rgba(155,95,224,0.2)]"
                      }`}>
                        +{event.points} pts
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-[color:var(--feed-divider)] pt-3 text-[12px] text-[color:var(--feed-text2)]">
                      {event.reactions.map((reaction) => (
                        <button
                          key={reaction.emoji}
                          type="button"
                          className={`inline-flex items-center gap-1 rounded-full border border-[color:var(--feed-card-border)] bg-[color:var(--feed-bg2)] px-3 py-2 font-[700] text-[color:var(--feed-text2)] transition hover:border-[color:var(--feed-purple)] hover:text-[color:var(--feed-purple)]`}
                        >
                          <span>{reaction.emoji}</span>
                          <span>{reaction.count}</span>
                        </button>
                      ))}
                      <button type="button" className="ml-auto text-[14px] font-[700] text-[color:var(--feed-blue)] hover:text-[color:var(--feed-purple)]">
                        Compartilhar
                      </button>
                    </div>
                  </div>
                  <div className="flex h-[56px] w-[60px] items-center justify-center rounded-[8px] border border-[color:var(--feed-card-border)] bg-[color:var(--feed-bg3)] text-[28px]">
                    {event.stampEmoji}
                  </div>
                </div>
              </article>
            ))}
            {isLoadingMore && (
              <div className="rounded-[18px] border border-[color:var(--feed-card-border)] bg-[color:var(--feed-card)] p-5 text-center text-[color:var(--feed-text2)]">
                Carregando mais feed...
              </div>
            )}
          </div>
        </main>

        <aside className="hidden xl:block fixed top-[60px] right-0 h-[calc(100vh-60px)] w-[var(--feed-widgets-w)] border-l border-[color:var(--feed-card-border)] bg-[color:var(--feed-bg)] px-5 py-6 overflow-y-auto feed-scrollbar">
          <div className="space-y-5">
            <section className="rounded-[18px] border border-[color:var(--feed-card-border)] bg-[color:var(--feed-card)] p-5">
              <div className="mb-4 flex items-center gap-3 text-[11px] font-[700] uppercase tracking-[1px] text-[color:var(--feed-text3)] font-[Orbitron]">
                <span>🏆 Top Ranking</span>
                <span className="flex-1 h-px bg-[color:var(--feed-divider)]" />
              </div>
              <div className="space-y-2">
                {leaderboard.map((player) => (
                  <button
                    key={player.userId}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2 transition hover:bg-[color:var(--feed-bg2)]"
                  >
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-[10px] text-[12px] font-[700] ${
                      player.rank === 1 ? "bg-[color:var(--feed-yellow)] text-[#1a1200]" : player.rank === 2 ? "text-[color:var(--feed-text3)]" : player.rank === 3 ? "text-[#cd7f32]" : "text-[color:var(--feed-text2)]"
                    }`}>
                      {player.rank}
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[color:var(--feed-bg2)] text-[16px]">{player.avatar ?? formatUserAvatar(player.name)}</div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="text-[12px] font-[800] text-[color:var(--feed-text)]">{player.name}</div>
                      <div className="truncate text-[10px] text-[color:var(--feed-text3)]">{player.lastBadgeTitle}</div>
                    </div>
                    <div className={`text-[12px] font-[700] ${player.rank <= 3 ? "text-[color:var(--feed-blue)]" : "text-[color:var(--feed-text2)]"}`}>
                      {player.score}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[18px] border border-[color:var(--feed-card-border)] bg-[color:var(--feed-card)] p-5">
              <div className="mb-4 flex items-center gap-3 text-[11px] font-[700] uppercase tracking-[1px] text-[color:var(--feed-text3)] font-[Orbitron]">
                <span>🏅 Seus Selos</span>
                <span className="flex-1 h-px bg-[color:var(--feed-divider)]" />
              </div>
              <div className="grid grid-cols-5 gap-2">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    title={`${badge.name} — ${badge.points} pts`}
                    className={`aspect-square rounded-[10px] border border-[color:var(--feed-card-border)] bg-[color:var(--feed-bg2)] flex items-center justify-center text-[18px] transition ${badge.unlocked ? "border-[color:var(--feed-yellow)] bg-[color:var(--feed-yellow-soft)]" : "filter grayscale opacity-70 hover:filter-none hover:opacity-100"}`}
                  >
                    {badge.emoji}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-center text-[11px] font-[700] text-[color:var(--feed-text3)]">{badges.filter((badge) => badge.unlocked).length} de {badges.length} desbloqueados</div>
            </section>

            <section className="rounded-[18px] border border-[color:var(--feed-card-border)] bg-[color:var(--feed-card)] p-5">
              <div className="mb-4 flex items-center gap-3 text-[11px] font-[700] uppercase tracking-[1px] text-[color:var(--feed-text3)] font-[Orbitron]">
                <span>🎯 Missões da Semana</span>
                <span className="flex-1 h-px bg-[color:var(--feed-divider)]" />
              </div>
              <div className="space-y-2">
                {missions.map((mission) => {
                  const progress = mission.total > 0 ? Math.min(100, (mission.current / mission.total) * 100) : 0;
                  return (
                    <div key={mission.id} className="rounded-[12px] border border-[color:var(--feed-card-border)] bg-[color:var(--feed-bg2)] p-3 transition hover:border-[color:var(--feed-blue)]">
                      <div className="flex items-center justify-between gap-2 text-[12px] font-[800] text-[color:var(--feed-text)]">
                        <span>{mission.name}</span>
                        <span className="rounded-full bg-[color:var(--feed-yellow-soft)] px-2 py-0.5 text-[11px] font-[800] text-[color:var(--feed-yellow)]">+{mission.bonusPoints}</span>
                      </div>
                      <div className="mt-3 h-1 rounded-[2px] bg-[color:var(--feed-card)] overflow-hidden">
                        <div className="h-full rounded-[2px] bg-gradient-to-r from-[color:var(--feed-blue)] to-[color:var(--feed-purple)]" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="mt-2 text-[10px] font-[700] text-[color:var(--feed-text3)]">{mission.current} de {mission.total} · {mission.daysLeft} dias restantes</div>
                      {mission.completed && <div className="mt-2 text-[11px] font-[700] text-[color:var(--feed-green)]">✅ Concluída!</div>}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[18px] border border-[color:var(--feed-card-border)] bg-[color:var(--feed-card)] p-5">
              <div className="mb-4 flex items-center gap-3 text-[11px] font-[700] uppercase tracking-[1px] text-[color:var(--feed-text3)] font-[Orbitron]">
                <span>🟢 Online agora</span>
                <span className="flex-1 h-px bg-[color:var(--feed-divider)]" />
              </div>
              <div className="space-y-2">
                {onlineUsers.slice(0, 4).map((user) => (
                  <div key={user.userId} className="relative flex items-center gap-2 py-1 text-[12px] font-[700] text-[color:var(--feed-text2)]">
                    <div className="relative h-6 w-6 rounded-[8px] border border-[color:var(--feed-green)] bg-[color:var(--feed-bg2)] flex items-center justify-center text-[13px]">
                      {formatUserAvatar(user.name, user.avatar)}
                      <span className="absolute -bottom-1 -right-0.5 h-[7px] w-[7px] rounded-full bg-[color:var(--feed-green)] border-[1.5px] border-[color:var(--feed-card)]" />
                    </div>
                    <span>{user.name}</span>
                  </div>
                ))}
              </div>
              {onlineCount > 4 && (
                <div className="mt-2 pl-4 text-[11px] font-[700] text-[color:var(--feed-text3)]">+ {onlineCount - 4} outros funcionários online</div>
              )}
            </section>
          </div>
        </aside>
      </div>

      {showNewButton && (
        <button
          type="button"
          onClick={() => {
            setShowNewButton(false);
            fetchFeedData(1);
          }}
          className="feed-float-btn fixed left-1/2 top-[80px] z-50 -translate-x-1/2 rounded-[24px] bg-gradient-to-r from-[color:var(--feed-purple)] to-[color:var(--feed-blue)] px-5 py-2 text-[13px] font-[800] text-white shadow-[0_4px_20px_rgba(155,95,224,0.45)]"
        >
          Novos eventos disponíveis • Atualizar agora
        </button>
      )}
    </div>
  );
}
