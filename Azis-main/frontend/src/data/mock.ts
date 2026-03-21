// =====================
// TYPES
// =====================

export type TaskStatus = "todo" | "in_progress" | "done" | "approved" | "rejected";
export type MoodType = "very_happy" | "happy" | "neutral" | "sad" | "stressed";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "gestor" | "funcionario";
  nivel: 1 | 2 | 3;
  points: number;
  institution_id: string;
  position?: string;
  gestorId?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: User;
  status: TaskStatus;
  points: number;
  deadline: string;
  created_at: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  image: string;
  cost: number;
  available: number;
}

// =====================
// USERS
// =====================

export const users: User[] = [
  {
    id: "1",
    name: "Ana Silva",
    email: "ana@azis.com",
    avatar: "",
    role: "gestor",
    nivel: 2,
    points: 1250,
    institution_id: "1",
    position: "CEO",
    gestorId: null,
  },
  {
    id: "2",
    name: "Carlos Santos",
    email: "carlos@azis.com",
    avatar: "",
    role: "funcionario",
    nivel: 1,
    points: 980,
    institution_id: "1",
    position: "Frontend Developer",
    gestorId: "1",
  },
  {
    id: "3",
    name: "Maria Oliveira",
    email: "maria@azis.com",
    avatar: "",
    role: "funcionario",
    nivel: 1,
    points: 1100,
    institution_id: "1",
    position: "Backend Developer",
    gestorId: "1",
  },
  {
    id: "4",
    name: "Pedro Costa",
    email: "pedro@azis.com",
    avatar: "",
    role: "funcionario",
    nivel: 1,
    points: 750,
    institution_id: "1",
    position: "QA Engineer",
    gestorId: "3",
  },
  {
    id: "5",
    name: "Julia Lima",
    email: "julia@azis.com",
    avatar: "",
    role: "funcionario",
    nivel: 1,
    points: 890,
    institution_id: "1",
    position: "UX Designer",
    gestorId: "2",
  },
  {
    id: "6",
    name: "Rafael Souza",
    email: "rafael@azis.com",
    avatar: "",
    role: "funcionario",
    nivel: 1,
    points: 1350,
    institution_id: "1",
    position: "DevOps Engineer",
    gestorId: "1",
  },
  {
    id: "0",
    name: "Azis Admin",
    email: "admin@azis.dev",
    avatar: "",
    role: "admin",
    nivel: 3,
    points: 0,
    institution_id: "1",
    position: "Administrador",
    gestorId: null,
  },
];

// compatibilidade com páginas antigas
export const teamMembers = users;

// =====================
// PERSISTED DATA SUPPORT
// =====================

const USERS_STORAGE_KEY = "azis_users";

export function getActiveUsers(): User[] {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    const storedUser = localStorage.getItem("azis_user");
    const currentUserId = storedUser ? (JSON.parse(storedUser) as any)?.id : null;

    if (stored) {
      const parsed = JSON.parse(stored) as any[];
      if (Array.isArray(parsed)) {
        // Normalize older data shapes that used `gestor_id` instead of `gestorId`
        const normalized = parsed.map((u) => ({
          ...u,
          gestorId: u.gestorId ?? u.gestor_id ?? null,
        })) as User[];

        // If stored users are missing gestorId, merge from the default mock dataset
        const defaultById = new Map(users.map((u) => [u.id, u]));
        const normalizedWithManagers = normalized.map((u) => {
          if (u.gestorId === null || u.gestorId === undefined) {
            const fallback = defaultById.get(u.id) ?? users.find((m) => m.email === u.email);
            return {
              ...u,
              gestorId: fallback?.gestorId ?? null,
            };
          }
          return u;
        });

        // If the current user is a manager in the default data set but the stored list
        // does not include their subordinates, fallback to the default mock set.
        const currentUserHasSubordinatesInMock = users.some(
          (u) => u.gestorId?.toString() === currentUserId?.toString(),
        );
        const currentUserHasSubordinatesInStorage = normalizedWithManagers.some(
          (u) => u.gestorId?.toString() === currentUserId?.toString(),
        );

        if (currentUserId && currentUserHasSubordinatesInMock && !currentUserHasSubordinatesInStorage) {
          return users;
        }

        // If local storage only contains the current user, also fallback to default set.
        if (
          currentUserId &&
          normalizedWithManagers.length <= 1 &&
          normalizedWithManagers.some((u) => u.id?.toString() === currentUserId.toString())
        ) {
          return users;
        }

        // Normalize IDs to strings so comparisons always work even if backend returns numbers
        const normalizedWithStrings = normalizedWithManagers.map((u) => ({
          ...u,
          id: u.id?.toString(),
          gestorId: u.gestorId != null ? u.gestorId.toString() : null,
        }));

        return normalizedWithStrings;
      }
    }
  } catch (error) {
    console.error("getActiveUsers parse error:", error);
  }

  // Ensure default mock data uses string IDs as well
  return users.map((u) => ({
    ...u,
    id: u.id.toString(),
    gestorId: u.gestorId != null ? u.gestorId.toString() : null,
  }));
}

export function saveActiveUsers(activeUsers: User[]) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(activeUsers));
  } catch (error) {
    console.error("saveActiveUsers error:", error);
  }
}

export function resetActiveUsers() {
  localStorage.removeItem(USERS_STORAGE_KEY);
}

// =====================
// USER FUNCTIONS
// =====================

export function getUserById(id: string): User | undefined {
  const currentUsers = getActiveUsers();
  return currentUsers.find((u) => u.id === id);
}

export function getManagerName(gestorId?: string | null): string {
  if (!gestorId) return "Sem gestor";

  const currentUsers = getActiveUsers();
  const manager = currentUsers.find((u) => u.id === gestorId);
  return manager ? manager.name : "Gestor não encontrado";
}

export function getCurrentUser(): User {
  try {
    const stored = localStorage.getItem("azis_user");
    if (stored) {
      const parsed = JSON.parse(stored) as any;
      const current = {
        ...users[0],
        ...parsed,
        id: parsed.id != null ? parsed.id.toString() : users[0].id.toString(),
        name: parsed.name ?? users[0].name,
        email: parsed.email ?? users[0].email,
        avatar: parsed.avatar ?? users[0].avatar,
        role: parsed.role ?? users[0].role,
        institution_id: parsed.institution_id ?? users[0].institution_id,
        position: parsed.position ?? users[0].position,
        gestorId:
          parsed.gestorId != null
            ? parsed.gestorId.toString()
            : parsed.gestor_id != null
            ? parsed.gestor_id.toString()
            : users[0].gestorId?.toString() ?? null,
        points: typeof parsed.points === "number" ? parsed.points : users[0].points,
      };

      return current;
    }
  } catch (error) {
    console.error("getCurrentUser parse error:", error);
  }

  return {
    ...users[0],
    id: users[0].id.toString(),
    gestorId: users[0].gestorId?.toString() ?? null,
  };
}

// =====================
// TASKS
// =====================

export const mockTasks: Task[] = [
  {
    id: "t1",
    title: "Redesign da landing page",
    description: "Atualizar o design da página inicial",
    assignee: users[1],
    status: "todo",
    points: 50,
    deadline: "2026-03-15",
    created_at: "2026-03-01",
  },
  {
    id: "t2",
    title: "Implementar API de pagamentos",
    description: "Integrar gateway de pagamento",
    assignee: users[2],
    status: "in_progress",
    points: 80,
    deadline: "2026-03-20",
    created_at: "2026-03-02",
  },
  {
    id: "t3",
    title: "Testes de integração",
    description: "Criar testes automatizados",
    assignee: users[3],
    status: "done",
    points: 40,
    deadline: "2026-03-12",
    created_at: "2026-03-01",
  },
];

// =====================
// REWARDS
// =====================

export const mockRewards: Reward[] = [
  {
    id: "r1",
    name: "Day Off",
    description: "Um dia de folga extra",
    image: "🏖️",
    cost: 500,
    available: 3,
  },
  {
    id: "r2",
    name: "Vale Almoço",
    description: "Vale refeição",
    image: "🍽️",
    cost: 200,
    available: 10,
  },
  {
    id: "r3",
    name: "Curso Online",
    description: "Acesso a um curso na plataforma parceira",
    image: "📚",
    cost: 800,
    available: 5,
  },
];

// =====================
// MOOD
// =====================

export const moodLabels: Record<MoodType, { emoji: string; label: string }> = {
  very_happy: { emoji: "😄", label: "Muito Feliz" },
  happy: { emoji: "😊", label: "Feliz" },
  neutral: { emoji: "😐", label: "Neutro" },
  sad: { emoji: "😢", label: "Triste" },
  stressed: { emoji: "😤", label: "Estressado" },
};

export const weeklyMoodData = [
  { day: "Seg", happy: 4, neutral: 2, sad: 0 },
  { day: "Ter", happy: 3, neutral: 2, sad: 1 },
  { day: "Qua", happy: 5, neutral: 1, sad: 0 },
  { day: "Qui", happy: 3, neutral: 3, sad: 0 },
  { day: "Sex", happy: 4, neutral: 1, sad: 1 },
];

// =====================
// PRODUCTIVITY
// =====================

export const monthlyProductivity = [
  { month: "Jan", tasks: 42, points: 1250 },
  { month: "Fev", tasks: 38, points: 1100 },
  { month: "Mar", tasks: 55, points: 1680 },
];