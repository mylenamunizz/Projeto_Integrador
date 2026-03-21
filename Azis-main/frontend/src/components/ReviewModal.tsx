import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, Star, Calendar, User } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  points: number;
  deadline: string;
  evidence?: string;
  assignee_name: string;
  assignee_email: string;
}

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onReview: (action: "approve" | "reject") => void;
  loading?: boolean;
}

export default function ReviewModal({ open, onOpenChange, task, onReview, loading }: ReviewModalProps) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Revisar Tarefa</DialogTitle>
          <DialogDescription>
            Avalie o trabalho realizado e decida se aprova ou reprova a tarefa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="font-medium text-lg mb-2">{task.title}</h3>
            <p className="text-muted-foreground mb-4">{task.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{task.assignee_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium">{task.points} pontos</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(task.deadline).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <Badge variant="secondary" className="w-fit">
                {task.status}
              </Badge>
            </div>

            {task.evidence && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Evidências fornecidas:</h4>
                <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">
                  {task.evidence}
                </p>
              </div>
            )}
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onReview("reject")}
              disabled={loading}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <XCircle className="w-4 h-4 mr-2" />
              Reprovar
            </Button>
            <Button
              onClick={() => onReview("approve")}
              disabled={loading}
              className="bg-success hover:bg-success/90"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <CheckCircle className="w-4 h-4 mr-2" />
              Aprovar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}