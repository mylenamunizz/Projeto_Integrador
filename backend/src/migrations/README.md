# Migrations - Azis Project

## Visão Geral

Esta pasta contém os arquivos SQL de migration que são executados automaticamente durante a inicialização do banco de dados via `initDB()` em `backend/config/db.js`.

## Arquivos de Migration

### 004_add_sync_user_points_trigger.sql

**Propósito**: Criar um trigger de sincronização automática entre as tabelas `user_points` e `users`.

**O que faz**:
- Cria a função PL/pgSQL `sync_user_points()` que sincroniza o campo `total_points` da tabela `user_points` para o campo `points` na tabela `users`
- Cria o trigger `trg_sync_user_points` que dispara após INSERT ou UPDATE na tabela `user_points`
- Garante que a coluna `points` existe em `users` com valor padrão 0

**Idempotência**:
- O arquivo usa `DROP TRIGGER IF EXISTS` para remover triggers antigos
- O arquivo usa `CREATE OR REPLACE` para funções (quando aplicável)
- Pode ser executado múltiplas vezes sem erros

**Benefícios**:
- A tabela `user_points` permanece como fonte da verdade
- Os pontos em `users` ficam sempre sincronizados automaticamente
- Não há necessidade de lógica de sincronização no aplicativo

## Como Executar Manualmente

Se precisar executar uma migration manualmente via `psql`:

```bash
psql -U postgres -d projeto -f backend/src/migrations/004_add_sync_user_points_trigger.sql
```

## Validação

Para validar se o trigger foi criado corretamente, execute o script:

```bash
cd backend
node scripts/validate-trigger.js
```

Ou execute a query SQL diretamente:

```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trg_sync_user_points'
ORDER BY event_manipulation;
```

O resultado deve mostrar 2 linhas (INSERT e UPDATE) para a tabela `user_points`.

## Estrutura de Execução

As migrations são executadas em `backend/config/db.js` na função `initDB()`:

1. Criar tabelas (CREATE TABLE IF NOT EXISTS)
2. Adicionar colunas faltantes (ALTER TABLE ADD COLUMN IF NOT EXISTS)
3. **Executar migrations SQL** ← arquivos desta pasta
4. Seed de dados padrão

## Adicionando Novas Migrations

Ao adicionar uma nova migration:

1. Crie um arquivo SQL em sequência: `005_*.sql`, `006_*.sql`, etc.
2. Adicione comentários explicando o propósito
3. Use DROP/CREATE OR REPLACE para idempotência
4. Atualize `backend/config/db.js` para incluir a nova migration no `initDB()`
5. Crie um script de validação em `backend/scripts/validate-*.js`

## Notas Importantes

- As migrations são executadas **após** a criação de todas as tabelas e colunas
- Erros durante a execução são logados mas não interrompem o `initDB()`
- Sempre faça backup do banco antes de testar migrations em produção
