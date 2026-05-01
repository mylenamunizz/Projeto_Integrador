# Sincronização de Pontos - Documentação Técnica

## Visão Geral

O sistema de pontos do Azis utiliza uma arquitetura de **fonte de verdade única** com **sincronização automática via triggers PostgreSQL**.

## Arquitetura

### Tabelas Envolvidas

| Tabela | Coluna | Propósito |
|--------|--------|----------|
| `user_points` | `total_points` | **Fonte da verdade** - registro dinâmico de pontos |
| `users` | `points` | **Cópia sincronizada** - usado para queries rápidas e relatórios |

### Vantagens desta Abordagem

✅ **Atomicidade**: A fonte de verdade garante consistência  
✅ **Performance**: Campo desnormalizado em `users` evita JOINs frequentes  
✅ **Automação**: Trigger PostgreSQL garante sincronização sem código  
✅ **Auditoria**: `user_points` mantém histórico de mudanças  

### O Que Não Fazer

❌ Atualizar `users.points` diretamente (será sobrescrito pelo trigger)  
❌ Confiar em `users.points` como fonte de verdade  
❌ Usar `user_points` como cache (use `users` para performance)  

## Fluxo de Dados

```
┌─────────────────────────────────────┐
│ Operação de Pontos                  │
│ (Task concluída, Reward resgatada)  │
└────────────┬────────────────────────┘
             │
             ├─→ INSERT/UPDATE user_points
             │   └─→ total_points = X
             │       user_id = Y
             │
             └─→ Trigger: trg_sync_user_points
                 └─→ Função: sync_user_points()
                     └─→ UPDATE users
                         SET points = X
                         WHERE id = Y
```

## Exemplos de Uso

### Inserir pontos para um novo usuário

```sql
INSERT INTO user_points (user_id, total_points)
VALUES (42, 0)
-- O trigger sincroniza automaticamente: users.points = 0
```

### Adicionar pontos (geralmente via lógica de aplicação)

```sql
UPDATE user_points
SET total_points = total_points + 50
WHERE user_id = 42
-- O trigger sincroniza: users.points agora = 50
```

### Deduzir pontos (resgate de reward)

```sql
UPDATE user_points
SET total_points = total_points - 30
WHERE user_id = 42
-- O trigger sincroniza: users.points agora = 20
```

### Query para listar usuários por pontos (usar users, não user_points!)

```sql
SELECT id, name, email, points
FROM users
ORDER BY points DESC
LIMIT 10
-- Rápida porque points é coluna local em users
```

## Validação da Syncronização

### Verificar se o trigger existe

```bash
node backend/scripts/validate-trigger.js
```

### Query manual para validar trigger

```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trg_sync_user_points';
```

Esperado: 2 linhas (INSERT e UPDATE)

### Testar sincronização manual

```sql
-- 1. Criar/atualizar points para um usuário
UPDATE user_points
SET total_points = 999
WHERE user_id = 1;

-- 2. Verificar se foi sincronizado em users
SELECT points FROM users WHERE id = 1;
-- Deve retornar 999
```

## Manutenção

### Se o trigger precisar ser modificado

1. Editar `backend/src/migrations/004_add_sync_user_points_trigger.sql`
2. Executar a migration novamente:
   ```bash
   psql -U postgres -d projeto -f backend/src/migrations/004_add_sync_user_points_trigger.sql
   ```
3. Validar:
   ```bash
   node backend/scripts/validate-trigger.js
   ```

### Se surgir inconsistência entre user_points e users

```sql
-- Sincronizar manualmente (atualizar users com base em user_points)
UPDATE users u
SET points = up.total_points
FROM user_points up
WHERE u.id = up.user_id;
```

## Roadmap Futuro (Opcional)

- [ ] Adicionar `audit_log` para rastrear mudanças de pontos
- [ ] Criar função de "corregir consistency" automática
- [ ] Adicionar soft-delete em user_points (manter histórico)
- [ ] Implementar limite máximo de pontos por usuário
