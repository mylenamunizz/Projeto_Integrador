import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  evidence: z.string().min(1, "Evidências são obrigatórias para marcar como concluída"),
});

type FormData = z.infer<typeof formSchema>;

interface EvidenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (evidence: string) => void;
  loading?: boolean;
}

export default function EvidenceModal({ open, onOpenChange, onSubmit, loading }: EvidenceModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      evidence: "",
    },
  });

  const handleSubmit = (data: FormData) => {
    onSubmit(data.evidence);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Marcar Tarefa como Concluída</DialogTitle>
          <DialogDescription>
            Forneça evidências do trabalho realizado para que seu gestor possa revisar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="evidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evidências</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o que foi realizado, links, prints, etc."
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Enviar para Revisão
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}