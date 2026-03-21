import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Users, Mail, UserMinus, UserPlus } from "lucide-react";
import { getActiveUsers, getCurrentUser } from "@/data/mock";
import { toast } from "sonner";
import { useState } from "react";

export default function Institution() {
  const [inviteEmail, setInviteEmail] = useState("");
  const currentUser = getCurrentUser();
  if (currentUser.role === "funcionario") {
    return (
      <div className="p-6 lg:p-8">
        <h1 className="text-2xl font-bold">Acesso restrito</h1>
        <p className="mt-2 text-muted-foreground">Você não tem permissão para visualizar esta página.</p>
      </div>
    );
  }
  const membrosVisiveis = getActiveUsers().filter((m) => m.nivel !== 3);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    toast.success(`Convite enviado para ${inviteEmail}`);
    setInviteEmail("");
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl">
      <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
        <Building2 className="w-8 h-8 text-primary" />
        Instituição
      </h1>
      {/* Institution Info */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Dados da Instituição</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome da Instituição</Label>
              <Input defaultValue="TechCorp LTDA" />
            </div>
          </div>
          <Button className="bg-gradient-primary text-primary-foreground">Salvar</Button>
        </CardContent>
      </Card>
      {/* Invite Members */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Convidar Membro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex gap-3">
            <Input placeholder="email@exemplo.com" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="flex-1" />
            <Button type="submit" className="bg-gradient-primary text-primary-foreground">
              <Mail className="w-4 h-4 mr-2" />
              Enviar Convite
            </Button>
          </form>
        </CardContent>
      </Card>
      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Membros ({getActiveUsers().length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {membrosVisiveis.map((member) => (
              <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-semibold text-sm">{member.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {member.role === "gestor" ? "Gestor" : member.role === "admin" ? "Admin" : "Membro"}
                </span>
                {currentUser.nivel >= 2 && member.nivel < 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => toast.info(`${member.name} removido`)}
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
