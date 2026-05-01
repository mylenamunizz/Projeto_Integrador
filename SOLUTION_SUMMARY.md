# Resolução do Problema de Parsing de CSV - Projeto Azis

## Resumo do Problema

O endpoint de importação CSV de usuários não estava lendo o campo `managerEmail` corretamente. O arquivo CSV tinha:
- Vírgula como delimitador principal
- Ponto-e-vírgulas extras ao final de cada linha (ex: `managerEmail;;;;;;;;;`)

Isso fazia com que o cabeçalho fosse parseado como `managerEmail;;;;;;;;;` em vez de `managerEmail`.

## Solução Implementada

A solução implementou sanitização em dois níveis (frontend e backend) com logging de warnings:

### 1. Frontend - Sanitização de CSV

**Arquivo criado:** `frontend/src/lib/csvSanitizer.ts`

Funções de sanitização:
- `sanitizeCsvContent()` - Remove delimitadores extras do conteúdo CSV
- `normalizeHeaderName()` - Normaliza nomes de headers (remove `;`, espaços, etc)
- `normalizeDataValue()` - Normaliza valores de dados (remove `;` e espaços extras)

**Arquivo atualizado:** `frontend/src/pages/UserImport.tsx`
- Importa as funções de sanitização
- Sanitiza o conteúdo CSV ANTES de fazer o parse com PapaParse
- Usa `normalizeHeaderName()` ao processar headers
- Usa `normalizeDataValue()` ao extrair valores das células

**Fluxo:**
1. Usuário upload CSV com delimitadores problemáticos
2. Frontend sanitiza o conteúdo antes do parse
3. Headers e valores são normalizados
4. Dados limpos são enviados ao backend

### 2. Backend - Sanitização e Logging

**Arquivo criado:** `backend/utils/sanitizer.js`

Funções de sanitização:
- `sanitizeUserData()` - Sanitiza um usuário individual
- `sanitizeUsers()` - Sanitiza um array de usuários

**Arquivo atualizado:** `backend/controllers/userController.js`

Melhorias:
1. Importa o módulo sanitizer
2. **Primeiro passo:** Sanitiza todos os dados de usuários ANTES do processamento
3. **Segundo passo:** Resolve vínculos de gestor como antes
4. **Logging melhorado:** Adiciona warnings detalhados quando um `managerEmail` não é encontrado
   - Formato: `⚠️ [IMPORT WARNING] Manager not found for user "Nome" (email): managerEmail="..." does not exist in database`

**Fluxo:**
1. Backend recebe JSON com usuários (já parseados e normalizados pelo frontend)
2. Primeiro: Sanitiza os dados para garantir remoção de delimitadores
3. Segundo: Cria usuários sem gestores
4. Terceiro: Resolve vínculos de gestor com queries case-insensitive
5. Quarto: Loga warnings para managers não encontrados

### 3. Testes de Integração

**Arquivo criado:** `backend/tests/import.unit.test.js`

Teste unitário que:
- Cria dados de teste com sanitização problemática (trailing semicolons)
- Chama `createUsers()` com mock de request/response
- Valida que todos os 3 usuários foram criados
- Verifica que os vínculos de gestor funcionam APESAR de sanitização
- Confirma que dados foram sanitizados corretamente
- Verifica logs de warning para managers não encontrados

**Arquivo criado:** `backend/tests/import.integration.test.js`

Teste integração que:
- Inicia servidor HTTP
- Cria admin de teste com JWT
- Faz POST request real para `/api/users`
- Valida resposta HTTP
- Consulta banco de dados para verificar dados persistidos
- Valida todos os relacionamentos de gestor
- Cleanup de dados após teste

**Arquivo criado:** `backend/tests/import-test-data.csv`

CSV de teste com os dados especificados:
```csv
name,email,password,role,position,points,managerEmail;;;;;;;;;
Linguine,linguine@azis.com,123456,Gestor,Onipresente,1213,linguine@azis.com;;;;;;;;;
Kaua,kaua@azis.com,123456,Funcionario,Fudido,1213,linguine@azis.com;;;;;;;;;
Karol,karol@azis.com,123456,Funcionario,Fudida,1213,kaua@azis.com;;;;;;;;;
```

**Arquivo criado:** `backend/tests/README.md`

Documentação dos testes com instruções de execução.

## Como Executar os Testes

### Teste Unitário (Recomendado - Mais rápido)

```bash
cd backend
node tests/import.unit.test.js
```

Saída esperada:
```
🧪 Starting CSV Import Unit Tests

1️⃣  Setting up test admin user...
   ✓ Admin created

2️⃣  Cleaning up existing test users...
   ✓ Test users cleaned

3️⃣  Testing createUsers with unsanitized data...
   ✓ Request successful (status 201)
   ✓ Created: 3
   ✓ Errors: 0

4️⃣  Validating user creation...
   ✓ All 3 users created successfully

5️⃣  Validating manager relationships (sanitization test)...
   ✓ Linguine created: name="Linguine", points=1213
   ✓ Kaua correctly linked to Linguine (despite trailing semicolons)
   ✓ Karol correctly linked to Kaua (despite trailing semicolons)

6️⃣  Verifying data sanitization...
   ✓ User "Linguine" data sanitized correctly
   ✓ User "Kaua" data sanitized correctly
   ✓ User "Karol" data sanitized correctly

✅ ALL TESTS PASSED!
```

### Teste Integração

```bash
cd backend
node tests/import.integration.test.js
```

## Validações Implementadas

### Primeiro Passo de Sanitização
- ✅ Remove trailing semicolons e commas de headers
- ✅ Remove trailing semicolons e commas de valores
- ✅ Faz trim de espaços em branco

### Segundo Passo: Dois Passos para Manager Assignment
- ✅ Primeiro passo: Cria todos os usuários SEM gestor
- ✅ Segundo passo: Busca cada `managerEmail` no banco e atribui `gestor_id`

### Logging de Warnings
- ✅ Log no console com formato: `⚠️ [IMPORT WARNING] Manager not found for user "Nome" (email): managerEmail="..." does not exist in database`
- ✅ Detalhes retornados na resposta JSON com `status: 'aviso'`
- ✅ Inclui nome do usuário, email do usuário, e email do gestor que não foi encontrado

### Padrão de Código Existente
- ✅ Express 5 (req/res)
- ✅ PostgreSQL com pool de conexões
- ✅ Controllers que retornam JSON
- ✅ Middlewares de autenticação mantidos
- ✅ Mesmo padrão de error handling (try/catch com status codes)
- ✅ Query builders com $1, $2, etc. para prepared statements

## Arquivos Modificados

1. `frontend/src/lib/csvSanitizer.ts` - ✅ CRIADO
2. `frontend/src/pages/UserImport.tsx` - ✅ ATUALIZADO (imports, sanitização, normalização)
3. `backend/utils/sanitizer.js` - ✅ CRIADO
4. `backend/controllers/userController.js` - ✅ ATUALIZADO (imports, sanitização, logging)
5. `backend/tests/import.unit.test.js` - ✅ CRIADO
6. `backend/tests/import.integration.test.js` - ✅ CRIADO
7. `backend/tests/import-test-data.csv` - ✅ CRIADO
8. `backend/tests/README.md` - ✅ CRIADO

## Resultados Esperados

Ao rodar o teste com os dados de exemplo:

**De entrada:**
- 3 usuários: Linguine, Kaua, Karol
- Headers e valores com trailing semicolons
- Relacionamentos de gestor especificados

**Saída esperada:**
- ✅ 3 usuários criados no banco de dados
- ✅ Linguine tem `gestor_id = NULL` (ou auto-atribuído)
- ✅ Kaua tem `gestor_id = linguine.id`
- ✅ Karol tem `gestor_id = kaua.id`
- ✅ Todos os dados sanitizados (sem trailing semicolons)
- ✅ Logs de warning se algum manager não for encontrado
- ✅ Resposta HTTP 201 com detalhes de sucesso

## Notas Importantes

1. **Defense in Depth:** A sanitização acontece em dois locais:
   - Frontend: Antes do parse (mais proativo)
   - Backend: Antes do processamento (mais defensivo)

2. **Performance:** A sanitização é rápida (string.replace + trim)

3. **Compatibilidade:** Mantém compatibilidade com:
   - CSV clean (sem delimitadores extras)
   - XLSX files (que não têm este problema)
   - Código existente (não quebra nada)

4. **Rastreabilidade:** Todos os warnings são logados tanto no console quanto na resposta JSON

## Próximos Passos (Opcional)

1. Adicionar mais testes para casos edge (managers não encontrados)
2. Adicionar validação de delimitador detectado
3. Criar endpoint para re-tentar vínculos de gestor
4. Adicionar histórico de imports com detalhes
