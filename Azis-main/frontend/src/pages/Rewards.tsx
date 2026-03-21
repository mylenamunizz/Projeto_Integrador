import { motion } from "framer-motion";
import { Gift, Star, ShoppingCart, History, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/data/mock";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getApiUrl, getAuthHeaders } from "@/lib/api";

interface Reward {
  id: string;
  name: string;
  title?: string;
  description: string;
  cost: number;
  points_cost?: number;
  stock: number;
  quantity?: number;
  created_at: string;
  updated_at: string;
}

interface Redemption {
  id: string;
  reward_id: string;
  user_id: string;
  cost: number;
  voucher_code: string;
  status: string;
  created_at: string;
  reward_name: string;
  reward_description: string;
}

export default function Rewards() {
  const currentUser = getCurrentUser();
  const initialPoints = Number(currentUser.points ?? 0);
  const [points, setPoints] = useState(initialPoints);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newReward, setNewReward] = useState({ title: "", description: "", points_cost: 0, quantity: 0 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [editing, setEditing] = useState(false);
  const [editReward, setEditReward] = useState({ title: "", description: "", points_cost: 0, quantity: 0 });

  const loadUserPoints = async () => {
    try {
      const response = await fetch(getApiUrl("/api/users"), {
        headers: getAuthHeaders(),
      });
      if (!response.ok) return;
      const users = await response.json();
      const found = users.find(
        (u: any) =>
          u.id?.toString() === currentUser.id?.toString() ||
          u.email?.toLowerCase() === currentUser.email?.toLowerCase()
      );
      if (found && found.points != null) {
        setPoints(found.points);
        const stored = localStorage.getItem("azis_user");
        if (stored) {
          const curr = JSON.parse(stored);
          localStorage.setItem("azis_user", JSON.stringify({ ...curr, points: found.points }));
        }
      }
    } catch (error) {
      console.error("Error loading user points:", error);
    }
  };

  const loadRewards = async () => {
    try {
      const response = await fetch(getApiUrl("/api/rewards"), {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setRewards(data.data || data.rewards || []);
      }
    } catch (error) {
      console.error("Error loading rewards:", error);
      toast.error("Erro ao carregar recompensas");
    }
  };

  const loadRedemptions = async () => {
    try {
      const response = await fetch(getApiUrl("/api/rewards/my-redemptions"), {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setRedemptions(data.data || data.redemptions || []);
      } else if (response.status === 404) {
        try {
          const fallback = await fetch(getApiUrl("/api/rewards/history"), {
            headers: getAuthHeaders(),
          });
          if (fallback.ok) {
            const data = await fallback.json();
            setRedemptions(data.data || data.redemptions || []);
          }
        } catch (fallbackError) {
          console.error("Fallback history failed:", fallbackError);
        }
      }
    } catch (error) {
      console.error("Error loading redemptions:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadRewards(), loadRedemptions(), loadUserPoints()]);
    setLoading(false);
  };

  const handleRedeem = async (reward: Reward) => {
    if (points < reward.cost) {
      toast.error("Pontos insuficientes!");
      return;
    }

    setRedeeming(reward.id);
    try {
      const response = await fetch(getApiUrl(`/api/rewards/${reward.id}/redeem`), {
        method: "POST",
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (response.ok) {
        setPoints(data.userPoints ?? data.data?.remaining_points ?? (points - reward.cost));
        setRewards((prev) =>
          prev.map((r) => (r.id === reward.id ? { ...r, stock: Math.max(r.stock - 1, 0) } : r))
        );
        if (data.data?.reward || data.redemption) {
          setRedemptions((prev) => [data.data?.reward || data.redemption, ...prev]);
        }
        toast.success(`🎉 "${reward.name}" resgatado com sucesso!`);
      } else {
        toast.error(data.message || "Erro ao resgatar recompensa");
      }
    } catch (error) {
      console.error("Error redeeming reward:", error);
      toast.error("Erro ao resgatar recompensa");
    } finally {
      setRedeeming(null);
    }
  };

  const handleCreateReward = async () => {
    if (!newReward.title) {
      toast.error("Título é obrigatório");
      return;
    }
    if (newReward.points_cost <= 0) {
      toast.error("Custo deve ser maior que 0");
      return;
    }
    if (newReward.quantity < 0) {
      toast.error("Quantidade não pode ser negativa");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(getApiUrl("/api/rewards"), {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newReward.title,
          description: newReward.description,
          points_cost: newReward.points_cost,
          quantity: newReward.quantity,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setRewards((prev) => [data.data || data.reward, ...prev]);
        setIsCreateModalOpen(false);
        setNewReward({ title: "", description: "", points_cost: 0, quantity: 0 });
        toast.success("Recompensa criada com sucesso!");
      } else {
        toast.error(data.message || "Erro ao criar recompensa");
      }
    } catch (error) {
      console.error("Error creating reward:", error);
      toast.error("Erro ao criar recompensa. Verifique sua conexão e tente novamente.");
    }
  };

  const openEditModal = (reward: Reward) => {
    setEditingReward(reward);
    setEditReward({
      title: reward.title || reward.name || "",
      description: reward.description || "",
      points_cost: reward.points_cost || reward.cost || 0,
      quantity: reward.quantity || reward.stock || 0,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateReward = async () => {
    if (!editingReward) return;

    if (!editReward.title) {
      toast.error("Título é obrigatório");
      return;
    }
    if (editReward.points_cost <= 0) {
      toast.error("Custo deve ser maior que 0");
      return;
    }
    if (editReward.quantity < 0) {
      toast.error("Quantidade não pode ser negativa");
      return;
    }

    setEditing(true);
    try {
      const response = await fetch(getApiUrl(`/api/rewards/${editingReward.id}`), {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editReward.title,
          description: editReward.description,
          points_cost: editReward.points_cost,
          quantity: editReward.quantity,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setRewards((prev) =>
          prev.map((r) =>
            r.id === editingReward.id
              ? {
                  ...r,
                  title: editReward.title,
                  name: editReward.title,
                  description: editReward.description,
                  points_cost: editReward.points_cost,
                  cost: editReward.points_cost,
                  quantity: editReward.quantity,
                  stock: editReward.quantity,
                }
              : r
          )
        );
        setIsEditModalOpen(false);
        setEditingReward(null);
        toast.success("Recompensa atualizada com sucesso!");
      } else {
        toast.error(data.message || "Erro ao atualizar recompensa");
      }
    } catch (error) {
      console.error("Error updating reward:", error);
      toast.error("Erro ao atualizar recompensa. Tente novamente.");
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteReward = async (rewardId: string | number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta recompensa?")) return;
    try {
      const response = await fetch(getApiUrl(`/api/rewards/${rewardId}`), {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (response.ok) {
        setRewards((prev) => prev.filter((r) => r.id !== rewardId));
        toast.success("Recompensa excluída com sucesso!");
      } else {
        toast.error(data.message || "Erro ao excluir recompensa");
      }
    } catch (error) {
      console.error("Error deleting reward:", error);
      toast.error("Erro ao excluir recompensa");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
            <Gift className="w-8 h-8 text-accent" />
            Recompensas
          </h1>
          <p className="text-muted-foreground mt-1">Troque seus pontos por prêmios incríveis</p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.nivel === 3 && (
            <Button onClick={() => setIsCreateModalOpen(true)} size="sm" variant="secondary" className="mr-2">
              <Plus className="w-4 h-4 mr-1" /> Nova Recompensa
            </Button>
          )}
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-5 py-3">
            <Star className="w-5 h-5 text-warning" />
            <span className="text-2xl font-heading font-bold text-foreground">{points.toLocaleString()}</span>
            <span className="text-muted-foreground text-sm">pontos</span>
          </div>
        </div>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Recompensa</DialogTitle>
            <DialogDescription>Informe os dados para adicionar novo item ao catálogo</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-4">
            <div>
              <Label htmlFor="reward-title">Título</Label>
              <Input
                id="reward-title"
                value={newReward.title}
                onChange={(e) => setNewReward((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="reward-description">Descrição</Label>
              <Input
                id="reward-description"
                value={newReward.description}
                onChange={(e) => setNewReward((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="reward-cost">Custo de pontos</Label>
              <Input
                id="reward-cost"
                type="text"
                maxLength={6}
                placeholder="ex: 100"
                value={newReward.points_cost ? newReward.points_cost.toString() : ""}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^\d]/g, "").slice(0, 6);
                  const val = sanitized ? Number(sanitized) : 0;
                  setNewReward((prev) => ({ ...prev, points_cost: val }));
                }}
              />
            </div>
            <div>
              <Label htmlFor="reward-quantity">Quantidade</Label>
              <Input
                id="reward-quantity"
                type="text"
                maxLength={4}
                placeholder="ex: 5"
                value={newReward.quantity ? newReward.quantity.toString() : ""}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                  const val = sanitized ? Number(sanitized) : 0;
                  setNewReward((prev) => ({ ...prev, quantity: val }));
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsCreateModalOpen(false)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={handleCreateReward} disabled={creating}>
              {creating ? "Criando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Recompensa</DialogTitle>
            <DialogDescription>Atualize os dados da recompensa selecionada</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-4">
            <div>
              <Label htmlFor="edit-reward-title">Título</Label>
              <Input
                id="edit-reward-title"
                value={editReward.title}
                onChange={(e) => setEditReward((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-reward-description">Descrição</Label>
              <Input
                id="edit-reward-description"
                value={editReward.description}
                onChange={(e) => setEditReward((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-reward-cost">Custo de pontos</Label>
              <Input
                id="edit-reward-cost"
                type="text"
                maxLength={6}
                placeholder="ex: 100"
                value={editReward.points_cost ? editReward.points_cost.toString() : ""}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^\d]/g, "").slice(0, 6);
                  const val = sanitized ? Number(sanitized) : 0;
                  setEditReward((prev) => ({ ...prev, points_cost: val }));
                }}
              />
            </div>
            <div>
              <Label htmlFor="edit-reward-quantity">Quantidade</Label>
              <Input
                id="edit-reward-quantity"
                type="text"
                maxLength={4}
                placeholder="ex: 5"
                value={editReward.quantity ? editReward.quantity.toString() : ""}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                  const val = sanitized ? Number(sanitized) : 0;
                  setEditReward((prev) => ({ ...prev, quantity: val }));
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsEditModalOpen(false)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={handleUpdateReward} disabled={editing}>
              {editing ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="catalog" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="catalog">Catálogo</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando recompensas...</p>
              </div>
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma recompensa disponível no momento.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward, i) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all group">
                    <div className="h-32 bg-gradient-card flex items-center justify-center text-6xl">
                      🎁
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-heading font-semibold text-foreground">{reward.name || reward.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {(reward.stock ?? reward.quantity) || 0} restantes
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                      {currentUser.nivel === 3 && (
                        <div className="flex items-center justify-start gap-3 mb-4">
                          <Button
                            size="xs"
                            className="px-2 py-1 bg-gradient-primary text-primary-foreground hover:brightness-110"
                            onClick={() => openEditModal(reward)}
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="xs"
                            className="px-2 py-1 bg-destructive text-destructive-foreground hover:brightness-110"
                            onClick={() => handleDeleteReward(reward.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-warning" />
                          <span className="font-heading font-bold text-foreground">{reward.cost ?? reward.points_cost}</span>
                        </div>
                        <Button
                          size="sm"
                          disabled={
                            points < (reward.cost ?? reward.points_cost ?? 0) ||
                            (reward.stock ?? reward.quantity ?? 0) === 0 ||
                            redeeming === reward.id
                          }
                          onClick={() => handleRedeem(reward)}
                          className="bg-gradient-primary text-primary-foreground"
                        >
                          {redeeming === reward.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              Resgatar
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando histórico...</p>
              </div>
            </div>
          ) : redemptions.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Você ainda não resgatou nenhuma recompensa.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {redemptions.map((redemption) => (
                <Card key={redemption.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-card rounded-lg flex items-center justify-center text-2xl">
                        🎁
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-foreground">{redemption.reward_name}</h3>
                        <p className="text-sm text-muted-foreground">{redemption.reward_description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Resgatado em {new Date(redemption.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-4 h-4 text-warning" />
                        <span className="font-heading font-bold text-foreground">{redemption.cost}</span>
                      </div>
                      <Badge variant={redemption.status === "completed" ? "default" : "secondary"} className="text-xs">
                        {redemption.status === "completed" ? "Concluído" : redemption.status}
                      </Badge>
                      {redemption.voucher_code && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          Voucher: {redemption.voucher_code}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
