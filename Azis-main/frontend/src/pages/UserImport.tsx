import { useState, useRef, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveActiveUsers, getActiveUsers, getCurrentUser, type User } from "@/data/mock";
import { getApiUrl, getAuthHeaders } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ImportSummary {
  totalRows: number;
  created: number;
  errors: { row: number; description: string }[];
}


export default function UserImport() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = getCurrentUser();

  const handleFile = (file: File) => {
    if (currentUser.nivel < 3) {
      toast({
        title: "Acesso negado",
        description: "Somente admins (nível 3) podem importar usuários.",
        variant: "destructive",
      });
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "xlsx") return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async () => {
      const text = reader.result;
      if (typeof text !== "string") return;

      const lines = text
        .trim()
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        setSummary({ totalRows: 0, created: 0, errors: [{ row: 0, description: "Arquivo sem dados" }] });
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const required = ["name", "email"];
      const optional = ["role", "position", "points", "manageremail", "password"];
      const missing = required.filter((h) => !headers.includes(h));

      if (missing.length > 0) {
        setSummary({
          totalRows: 0,
          created: 0,
          errors: [{ row: 0, description: `Colunas obrigatórias ausentes: ${missing.join(", ")}` }],
        });
        return;
      }

      const rows = lines.slice(1);
      const createdUsers = [];
      const errors: { row: number; description: string }[] = [];

      const existingUsers = getActiveUsers();
      const emailSet = new Set(existingUsers.map((u) => u.email.toLowerCase()));

      for (let i = 0; i < rows.length; i += 1) {
        const rowNumber = i + 2;
        const columns = rows[i].split(",").map((cell) => cell.trim());
        const rowData: Record<string, string> = {};

        headers.forEach((header, index) => {
          rowData[header] = columns[index] ?? "";
        });

        if (!rowData.name || !rowData.email || !rowData.role) {
          errors.push({ row: rowNumber, description: "Campos obrigatórios faltando (name/email/role)." });
          continue;
        }

        if (!/^\S+@\S+\.\S+$/.test(rowData.email)) {
          errors.push({ row: rowNumber, description: "Formato de e-mail inválido." });
          continue;
        }

        const emailLower = rowData.email.toLowerCase();

        if (emailSet.has(emailLower)) {
          errors.push({ row: rowNumber, description: "Usuário já existe" });
          continue;
        }

        emailSet.add(emailLower);

        const csvRole = rowData.role.toLowerCase().trim();
        const role = csvRole === "manager" || csvRole === "gestor" ? "gestor" : "funcionario";

        const newUser = {
          __row: rowNumber,
          id: `${Date.now()}-${i}`,
          name: rowData.name,
          email: rowData.email,
          avatar: "",
          role,
          nivel: role === "gestor" ? 2 : 1,
          points: Number(rowData.points ?? 0) || 0,
          institution_id: "1",
          position: rowData.position ?? "",
          gestorId: null,
          managerEmail: rowData.manageremail ?? "",
          password: rowData.password ?? "123456", // default password if not provided
        };
        createdUsers.push(newUser);
      }

      const finalUsers = [...existingUsers, ...createdUsers];

      const emailToId = new Map(finalUsers.map((u) => [u.email.toLowerCase(), u.id]));
      const resolvedUsers = finalUsers.map((u) => {
        const managerEmail = ((u as any).managerEmail as string)?.trim?.().toLowerCase();
        const managerIdFromEmail = managerEmail && emailToId.has(managerEmail) ? emailToId.get(managerEmail) ?? null : null;

        const resolvedUser = {
          ...u,
          gestorId: managerIdFromEmail ?? u.gestorId ?? null,
        } as User & { managerEmail?: string; password?: string };

        // remover campo temporário de importação
        if ((resolvedUser as any).managerEmail) delete (resolvedUser as any).managerEmail;

        return resolvedUser as User & { password?: string };
      });

      const apiUrl = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

      // Send to backend API
      const response = await fetch(getApiUrl('/api/users'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(resolvedUsers),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSummary({
          totalRows: rows.length,
          created: 0,
          errors: [{ row: 0, description: `Erro ao salvar no servidor: ${errorData.error || 'Erro desconhecido'}` }],
        });
        return;
      }

      const result = await response.json();

      // Also save to localStorage for frontend compatibility
      saveActiveUsers(resolvedUsers);

      setSummary({
        totalRows: rows.length,
        created: result.created || 0,
        errors:
          Array.isArray(result.errors) && result.errors.length > 0
            ? result.errors.map((err: any) => ({
                row: err.row ?? 0,
                description: `${err.email ? `${err.email}: ` : ""}${err.error ?? err}`,
              }))
            : [],
      });
    };

    reader.readAsText(file, "UTF-8");
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDownloadTemplate = () => {
    const csv = "name,email,password,role,position,points,managerEmail\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* HEADER PADRONIZADO */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Importar Usuários
          </h1>
          <p className="text-muted-foreground mt-1">
            Envie uma planilha CSV ou XLSX para cadastrar usuários em massa
          </p>
        </div>
      </div>

      {currentUser.nivel < 3 ? (
        <Card className="p-6 mb-8">
          <p className="text-sm text-muted-foreground">
            Apenas admins (nível 3) podem importar usuários via planilha. Você pode visualizar o histórico de importações.
          </p>
        </Card>
      ) : (
        <>
          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-3 mb-6">
            <Button onClick={() => fileInputRef.current?.click()}>
              Upload File
            </Button>

            <Button variant="outline" onClick={handleDownloadTemplate}>
              Download Spreadsheet Template
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>

          {/* DROP AREA */}
          <Card
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed p-12 text-center mb-8 transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <p className="text-sm text-muted-foreground">
              {fileName
                ? `Selected: ${fileName}`
                : "Drag and drop a .csv or .xlsx file here, or click Upload File"}
            </p>
          </Card>
        </>
      )}

      {/* SUMMARY */}
      {summary && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Import Summary
            </h2>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Rows Processed
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {summary.totalRows}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Successfully Created
                </p>
                <p className="text-2xl font-semibold text-success">
                  {summary.created}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Rows with Errors
                </p>
                <p className="text-2xl font-semibold text-destructive">
                  {summary.errors.length}
                </p>
              </div>
            </div>
          </Card>

          {/* ERROR TABLE */}
          {summary.errors.length > 0 && (
            <Card>
              <div className="p-4 border-b">
                <h3 className="text-sm font-semibold text-foreground">
                  Error Details
                </h3>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Row</TableHead>
                    <TableHead>Error Description</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {summary.errors.map((err, idx) => (
                    <TableRow key={`${err.row}-${idx}`}>
                      <TableCell className="font-medium">{err.row}</TableCell>
                      <TableCell className="text-destructive">{err.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}