import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getActiveUsers, getCurrentUser } from "@/data/mock";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  assignedTo: z.string().min(1, "Atribuição é obrigatória"),
  points: z.coerce
    .number()
    .min(1, "Pontos devem estar entre 1 e 1000")
    .max(1000, "Pontos devem estar entre 1 e 1000"),
});

type FormData = z.infer<typeof formSchema>;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  nivel?: number;
  gestorId?: string | null;
  managerEmail?: string | null;
}

interface TaskFormModalProps {
  trigger: React.ReactNode;
  onSubmit: (data: FormData) => void;
}

export default function TaskFormModal({ trigger, onSubmit }: TaskFormModalProps) {
  const [open, setOpen] = useState(false);

  const currentUser = getCurrentUser();
  const users = getActiveUsers();
  const usersLoading = false;
  const usersError = null;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      assignedTo: "",
      points: 10,
    },
  });

  const pointsValue = form.watch("points");
  const parsedPoints = typeof pointsValue === "number" ? pointsValue : Number(pointsValue);
  const currentPoints = Number.isFinite(parsedPoints) ? parsedPoints : 0;
  const isPointsInvalid = currentPoints < 1 || currentPoints > 1000;

  const subordinates = users
    ? users.filter((user) => {
        if (!currentUser || currentUser.role !== 'gestor') return false;

        const isDirectSubordinateById = user.gestorId?.toString() === currentUser.id?.toString();
        const isDirectSubordinateByEmail =
          user.managerEmail?.toString().toLowerCase() === currentUser.email?.toLowerCase();

        return Boolean(isDirectSubordinateById || isDirectSubordinateByEmail);
      })
    : [];

  const handleSubmit = (data: FormData) => {
    onSubmit(data);
    form.reset();
    setOpen(false);
    toast({
      title: "Tarefa criada",
      description: "A nova tarefa foi criada com sucesso.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Tarefa</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da nova tarefa no Kanban.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o título da tarefa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite a descrição da tarefa"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <FormLabel className="text-sm font-medium text-[color:var(--text)]">
                      Pontos da Tarefa
                    </FormLabel>
                    <span className="flex items-center gap-1 text-sm font-bold text-[#f59e0b]">
                      ⭐ {currentPoints || 0} pts
                    </span>
                  </div>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                      min="1"
                      max="1000"
                      placeholder="Digite os pontos (1–1000)"
                      className={`
                        mt-1 bg-[color:var(--surface2)] border text-[color:var(--text)] transition-colors
                        ${
                          isPointsInvalid
                            ? "border-red-500 focus-visible:ring-red-500"
                            : "border-[color:var(--accent)] focus-visible:ring-[color:var(--accent)]"
                        }
                      `}
                    />
                  </FormControl>
                  {isPointsInvalid ? (
                    <p className="text-xs text-red-500 mt-1">
                      ⚠️ O valor deve estar entre 1 e 1000 pontos.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">
                      Digite quantos pontos esta tarefa vale ao ser concluída.
                    </p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Atribuir para</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um subordinado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {usersLoading ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Carregando...</span>
                        </div>
                      ) : usersError ? (
                        <div className="p-2 text-sm text-destructive">
                          Erro ao carregar usuários
                        </div>
                      ) : subordinates.length > 0 ? (
                        subordinates.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">
                          Nenhum subordinado disponível para este gestor
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Criar Tarefa</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}