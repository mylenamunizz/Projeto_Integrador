export type FeedEventType = "badge" | "task" | "streak" | "milestone";

export type PointsType = "gold" | "blue" | "purple";

export interface FeedReaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface FeedEvent {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userLevel: number;
  type: FeedEventType;
  description: string;
  stampEmoji: string;
  points: number;
  pointsType: PointsType;
  isNew: boolean;
  createdAt: string;
  reactions: FeedReaction[];
  isTeam?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  lastBadgeTitle: string;
  score: number;
}

export interface Badge {
  id: string;
  emoji: string;
  name: string;
  points: number;
  unlocked: boolean;
}

export interface Mission {
  id: string;
  name: string;
  bonusPoints: number;
  current: number;
  total: number;
  daysLeft: number;
  completed: boolean;
}

export interface OnlineUser {
  userId: string;
  name: string;
  avatar?: string;
}
