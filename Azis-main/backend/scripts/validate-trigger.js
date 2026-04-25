/**
 * Script de Validação: trigger trg_sync_user_points
 * 
 * Executa queries para validar:
 * 1. Se o trigger foi criado na tabela user_points
 * 2. Se a função sync_user_points() existe
 * 3. Se o trigger dispara corretamente (INSERT e UPDATE)
 */

const { pool } = require('../config/db')

async function validateTrigger() {
  try {
    console.log('\n========================================')
    console.log('Validando Trigger: trg_sync_user_points')
    console.log('========================================\n')

    // 1. Verificar se o trigger existe
    console.log('1. Verificando existência do trigger...')
    const triggerResult = await pool.query(`
      SELECT trigger_name, event_manipulation, event_object_table
      FROM information_schema.triggers
      WHERE trigger_name = 'trg_sync_user_points'
      ORDER BY event_manipulation
    `)

    if (triggerResult.rows.length === 0) {
      console.log('❌ ERRO: Trigger não encontrado!\n')
      return false
    }

    console.log('✅ Trigger encontrado:')
    triggerResult.rows.forEach((row) => {
      console.log(`   - Event: ${row.event_manipulation} | Table: ${row.event_object_table}`)
    })
    console.log()

    // 2. Verificar se a função existe
    console.log('2. Verificando existência da função sync_user_points...')
    const functionResult = await pool.query(`
      SELECT proname, pronargs
      FROM pg_proc
      WHERE proname = 'sync_user_points'
      AND pg_get_function_identity_arguments(oid) = ''
    `)

    if (functionResult.rows.length === 0) {
      console.log('❌ ERRO: Função não encontrada!\n')
      return false
    }

    console.log('✅ Função encontrada:')
    console.log(`   - Nome: ${functionResult.rows[0].proname}`)
    console.log(`   - Args: 0 (é uma TRIGGER FUNCTION)\n`)

    // 3. Test: atualizar user_points e verificar se users.points foi atualizado
    console.log('3. Testando sincronização (INSERT/UPDATE)...')
    
    // Criar ou obter um usuário de teste
    const userResult = await pool.query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      ['test-trigger@azis.dev']
    )

    let testUserId
    if (userResult.rows.length === 0) {
      const createResult = await pool.query(
        `INSERT INTO users (name, email, password, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id`,
        ['Test Trigger', 'test-trigger@azis.dev', 'test123', 'funcionario']
      )
      testUserId = createResult.rows[0].id
      console.log(`   Usuário de teste criado: ID ${testUserId}`)
    } else {
      testUserId = userResult.rows[0].id
      console.log(`   Usuário de teste existente: ID ${testUserId}`)
    }

    // Testar INSERT na user_points
    await pool.query(
      `INSERT INTO user_points (user_id, total_points) 
       VALUES ($1, 100) 
       ON CONFLICT (user_id) DO UPDATE SET total_points = 100`,
      [testUserId]
    )

    // Verificar se points foi sincronizado
    const syncCheckResult = await pool.query(
      `SELECT points FROM users WHERE id = $1`,
      [testUserId]
    )

    const pointsInUsers = syncCheckResult.rows[0].points

    if (pointsInUsers === 100) {
      console.log('✅ Sincronização funcionando corretamente!')
      console.log(`   users.points foi atualizado para: ${pointsInUsers}\n`)
    } else {
      console.log(`❌ ERRO: Sincronização falhou!`)
      console.log(`   Esperado: 100, Obtido: ${pointsInUsers}\n`)
      return false
    }

    // 4. Testar UPDATE
    console.log('4. Testando trigger na operação UPDATE...')
    await pool.query(
      `UPDATE user_points SET total_points = 250 WHERE user_id = $1`,
      [testUserId]
    )

    const updateCheckResult = await pool.query(
      `SELECT points FROM users WHERE id = $1`,
      [testUserId]
    )

    const pointsAfterUpdate = updateCheckResult.rows[0].points

    if (pointsAfterUpdate === 250) {
      console.log('✅ UPDATE sincronizado corretamente!')
      console.log(`   users.points foi atualizado para: ${pointsAfterUpdate}\n`)
    } else {
      console.log(`❌ ERRO: UPDATE não sincronizou!`)
      console.log(`   Esperado: 250, Obtido: ${pointsAfterUpdate}\n`)
      return false
    }

    console.log('========================================')
    console.log('✅ Todas as validações passaram!')
    console.log('========================================\n')

    return true
  } catch (error) {
    console.error('❌ Erro durante validação:', error.message)
    return false
  } finally {
    await pool.end()
  }
}

// Executar validação
validateTrigger().then((success) => {
  process.exit(success ? 0 : 1)
})
