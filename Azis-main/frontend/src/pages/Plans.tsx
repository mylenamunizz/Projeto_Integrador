import { CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const plans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    features: ["Até 10 usuários", "Kanban básico", "Registro de humor", "Ranking simples"],
    current: false,
  },
  {
    name: "Premium",
    price: "R$ 49",
    period: "/mês",
    features: ["Usuários ilimitados", "Dashboards avançados", "Recompensas customizadas", "Relatórios de feedback", "Personalização completa", "Suporte prioritário", "Avatares personalizáveis"],
    current: true,
  },
];

export default function Plans() {
  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Planos de Assinatura</h1>
        <p className="text-muted-foreground">Escolha o plano ideal para sua equipe</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={`p-8 ${plan.current ? "border-2 border-primary shadow-glow" : ""}`}>
            {plan.current && (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground text-xs font-semibold mb-4">
                <Zap className="w-3 h-3" />
                Plano Atual
              </div>
            )}
            <h3 className="font-heading font-bold text-2xl text-foreground">{plan.name}</h3>
            <div className="mt-3 mb-6">
              <span className="text-4xl font-heading font-bold text-foreground">{plan.price}</span>
              {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button className={`w-full ${plan.current ? "" : "bg-gradient-primary text-primary-foreground"}`} variant={plan.current ? "outline" : "default"} disabled={plan.current}>
              {plan.current ? "Plano Atual" : "Fazer Upgrade"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
