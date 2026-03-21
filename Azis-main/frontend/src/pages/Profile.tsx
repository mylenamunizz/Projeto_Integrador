import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Star, Trophy, History, Shield } from "lucide-react";
import { getCurrentUser } from "@/data/mock";

const pointsHistory = [
  { date: "06/03/2026", desc: "Setup CI/CD pipeline", points: 60 },
  { date: "05/03/2026", desc: "Otimizar queries do banco", points: 45 },
  { date: "04/03/2026", desc: "Code review módulo auth", points: 25 },
  { date: "03/03/2026", desc: "Documentação da API", points: 30 },
];

export default function Profile() {
  const currentUser = getCurrentUser();
  const isExampleUser = currentUser.email === "ana@azis.com";

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl">
      <h1 className="text-3xl font-heading font-bold text-foreground">Meu Perfil</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Avatar & Stats */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-primary mx-auto flex items-center justify-center mb-4">
              <span className="text-primary-foreground font-heading font-bold text-3xl">
                {currentUser.name.charAt(0)}
              </span>
            </div>
            <h2 className="font-heading font-bold text-xl text-foreground">{currentUser.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">{currentUser.role === "gestor" ? "Gestor" : currentUser.role === "admin" ? "Admin" : "Membro"}</p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 text-warning" />
                  <span className="font-heading font-bold text-foreground">{(currentUser.points ?? 0).toLocaleString()}</span>
                </div>
                <span className="text-xs text-muted-foreground">Pontos</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Trophy className="w-4 h-4 text-accent" />
                  <span className="font-heading font-bold text-foreground">{isExampleUser ? "#2" : "—"}</span>
                </div>
                <span className="text-xs text-muted-foreground">Ranking</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading">Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input defaultValue={currentUser.name} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={currentUser.email} type="email" />
              </div>
            </div>
            <Button className="bg-gradient-primary text-primary-foreground">Salvar Alterações</Button>
          </CardContent>
        </Card>
      </div>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Privacidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Aparecer no ranking</p>
              <p className="text-xs text-muted-foreground">Outros podem ver sua posição</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Pontuação pública</p>
              <p className="text-xs text-muted-foreground">Mostrar pontos no perfil público</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Points History */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <History className="w-5 h-5 text-warning" />
            Histórico de Pontos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pointsHistory.map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{entry.desc}</p>
                  <p className="text-xs text-muted-foreground">{entry.date}</p>
                </div>
                <div className="flex items-center gap-1 text-primary font-heading font-bold">
                  +{entry.points}
                  <Star className="w-3.5 h-3.5 text-warning" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
