import { HelpCircle, Mail, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Como funciona o sistema de pontos?", a: "Cada tarefa concluída gera pontos. Os pontos podem ser acumulados e trocados por recompensas definidas pelo gestor da sua instituição." },
  { q: "Como registro meu humor diário?", a: "Acesse a página 'Humor' no menu lateral e selecione o emoji que melhor representa como você está se sentindo hoje." },
  { q: "Posso ocultar minha posição no ranking?", a: "Sim! Acesse seu perfil e desative a opção 'Aparecer no ranking' nas configurações de privacidade." },
  { q: "Como resgatar recompensas?", a: "Vá até a página de Recompensas, escolha o prêmio desejado e clique em 'Resgatar'. Os pontos serão descontados automaticamente." },
  { q: "O que é o feedback mensal?", a: "Todo mês, você receberá um questionário rápido sobre produtividade, motivação e bem-estar. Seus dados são anônimos para o gestor." },
  { q: "Como convido membros para minha equipe?", a: "Na página 'Instituição', use o formulário de convite por email. O convidado receberá um link para criar sua conta." },
];

export default function Help() {
  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold text-foreground flex items-center justify-center gap-3">
          <HelpCircle className="w-8 h-8 text-primary" />
          Central de Ajuda
        </h1>
        <p className="text-muted-foreground mt-1">Encontre respostas para suas dúvidas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-sm font-medium text-foreground text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Mail className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-foreground mb-2">Email</h3>
            <p className="text-sm text-muted-foreground mb-4">suporte@azis.com</p>
            <Button variant="outline" className="w-full">Enviar Email</Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-10 h-10 text-accent mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-foreground mb-2">Chat ao Vivo</h3>
            <p className="text-sm text-muted-foreground mb-4">Seg a Sex, 9h às 18h</p>
            <Button variant="outline" className="w-full">Iniciar Chat</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
