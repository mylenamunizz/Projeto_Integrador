import { useState, useRef, DragEvent } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveActiveUsers, getActiveUsers, getCurrentUser, type User } from "@/data/mock";
import { getApiUrl, getAuthHeaders } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { sanitizeCsvContent, normalizeHeaderName, normalizeDataValue } from "@/lib/csvSanitizer";
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
      let data: any[] = [];
      const ext = file.name.split(".").pop()?.toLowerCase();

      try {
        if (ext === "xlsx") {
          const binary = reader.result;
          const workbook = XLSX.read(binary, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        } else {
          let text = reader.result as string;
          // Sanitize CSV content to remove trailing delimiters (semicolons, commas)
          text = sanitizeCsvContent(text);
          const result = Papa.parse(text, { skipEmptyLines: true });
          data = result.data as any[][];

          // Fallback for CSV malformado como uma linha inteira entre aspas
          // Ex: "name,email,..." em vez de name,email,...
          if (
            data.length > 0 &&
            data[0].length === 1 &&
            typeof data[0][0] === 'string' &&
            data[0][0].includes(',')
          ) {
            data = (data as any[]).map((row) => {
              const rowText = String(row[0]).trim()
              const unquoted = rowText.startsWith('"') && rowText.endsWith('"')
                ? rowText.slice(1, -1).replace(/""/g, '"')
                : rowText
              return unquoted.split(',').map((col) => col.trim())
            })
          }
        }

        if (data.length < 2) {
          setSummary({ totalRows: 0, created: 0, errors: [{ row: 0, description: "Arquivo sem dados ou cabeçalho" }] });
          return;
        }

        // Find header row (first row with name-like or email-like column)
        let headerIndex = -1;
        const nameAliases = ["name", "nome", "usuario", "usuário", "user"];
        const emailAliases = ["email", "e-mail", "mail", "correio"];

        for (let i = 0; i < Math.min(data.length, 10); i++) {
          const row = (data[i] as any[]).map(c => normalizeHeaderName(String(c || "")));
          if (row.some(c => nameAliases.includes(c)) || row.some(c => emailAliases.includes(c))) {
            headerIndex = i;
            break;
          }
        }

        if (headerIndex === -1) headerIndex = 0; // fallback to first row

        const rawHeaders = (data[headerIndex] as any[]).map((h) => normalizeHeaderName(String(h || "")));

        // Map raw headers to normalized ones
        const headerMap: Record<string, number> = {};
        rawHeaders.forEach((h, idx) => {
          if (nameAliases.includes(h)) headerMap["name"] = idx;
          else if (emailAliases.includes(h)) headerMap["email"] = idx;
          else if (["role", "cargo", "função", "funcao"].includes(h)) headerMap["role"] = idx;
          else if (["position", "posição", "posicao", "setor"].includes(h)) headerMap["position"] = idx;
          else if (["points", "pontos", "saldo"].includes(h)) headerMap["points"] = idx;
          else if (["manageremail", "gestoremail", "emailgestor", "manager_email", "email_do_gestor"].includes(h)) headerMap["manageremail"] = idx;
          else if (["password", "senha"].includes(h)) headerMap["password"] = idx;
        });

        const missing = [];
        if (headerMap["name"] === undefined) missing.push("name");
        if (headerMap["email"] === undefined) missing.push("email");

        if (missing.length > 0) {
          setSummary({
            totalRows: 0,
            created: 0,
            errors: [{ row: 0, description: `Colunas obrigatórias ausentes ou não reconhecidas: ${missing.join(", ")}. Use: Nome, Email.` }],
          });
          return;
        }

        const rows = data.slice(headerIndex + 1);
        const createdUsers = [];
        const errors: { row: number; description: string }[] = [];

        for (let i = 0; i < rows.length; i += 1) {
          const rowNumber = i + headerIndex + 2;
          const columns = rows[i] as any[];
          if (!columns || columns.length === 0) continue;

          const getValue = (key: string) => {
            const idx = headerMap[key];
            return idx !== undefined && columns[idx] !== undefined ? normalizeDataValue(String(columns[idx])) : "";
          };

          const name = getValue("name");
          const email = getValue("email");

          if (!name || !email) {
            // Se a linha estiver totalmente vazia, ignore. Caso contrário, registre erro.
            if (columns.some(c => String(c || "").trim().length > 0)) {
              errors.push({ row: rowNumber, description: "Nome e e-mail são obrigatórios." });
            }
            continue;
          }

          const emailStr = email.toLowerCase();
          if (!/^\S+@\S+\.\S+$/.test(emailStr)) {
            errors.push({ row: rowNumber, description: `E-mail inválido: ${emailStr}` });
            continue;
          }

          const rawRole = getValue("role").toLowerCase();
          const role = rawRole === "manager" || rawRole === "gestor" || rawRole === "admin" ? (rawRole === "admin" ? "admin" : "gestor") : "funcionario";

          const newUser = {
            name: name,
            email: emailStr,
            role,
            position: getValue("position"),
            points: Number(getValue("points")) || 0,
            managerEmail: getValue("manageremail"),
            password: getValue("password") || "123456",
            __row: rowNumber
          };
          createdUsers.push(newUser);
        }

        if (createdUsers.length === 0 && errors.length > 0) {
          setSummary({ totalRows: rows.length, created: 0, errors });
          return;
        }

        // Send to backend API
        const response = await fetch(getApiUrl('/api/users'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(createdUsers),
        });

        const result = await response.json();

        if (!response.ok) {
          setSummary({
            totalRows: rows.length,
            created: 0,
            errors: [{ row: 0, description: `Erro no servidor: ${result.error || result.message || 'Erro desconhecido'}` }],
          });
          return;
        }

        setSummary({
          totalRows: rows.length,
          created: result.cadastrados || 0,
          errors: [
            ...errors,
            ...(Array.isArray(result.detalhes)
              ? result.detalhes
                .filter((d: any) => d.status === 'falha' || d.status === 'aviso' || d.status === 'duplicado')
                .map((d: any) => ({
                  row: d.linha || 0,
                  description: `${d.email ? `${d.email}: ` : ""}${d.status === 'duplicado' ? 'Usuário já existe' : d.motivo || d.status}`,
                }))
              : [])
          ],
        });

      } catch (err: any) {
        setSummary({ totalRows: 0, created: 0, errors: [{ row: 0, description: `Erro ao processar arquivo: ${err.message}` }] });
      }
    };

    if (file.name.endsWith(".xlsx")) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file, "UTF-8");
    }
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
            className={`border-2 border-dashed p-12 text-center mb-8 transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border"
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