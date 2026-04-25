const { pool } = require('../config/db')

async function resetUserPoints() {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        console.log('🔄 Zerando pontos em users...')
        const updateUsersResult = await client.query('UPDATE users SET points = 0 WHERE points != 0')
        console.log(`✅ ${updateUsersResult.rowCount} usuários atualizados`)

        console.log('🔄 Limpando/zerando tabela user_points...')
        const deletePointsResult = await client.query('DELETE FROM user_points')
        console.log(`✅ ${deletePointsResult.rowCount} registros removidos de user_points`)

        console.log('🔄 Recriando user_points com zeros para todos os usuários...')
        const insertResult = await client.query(`
      INSERT INTO user_points (user_id, total_points, updated_at)
      SELECT id, 0, NOW() FROM users
      ON CONFLICT (user_id) DO UPDATE
      SET total_points = 0, updated_at = NOW()
    `)
        console.log(`✅ ${insertResult.rowCount} registros criados/atualizados em user_points`)

        console.log('🔄 Verificando consistência...')
        const consistencyCheck = await client.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.points AS users_points,
        COALESCE(up.total_points, 0) AS user_points_total
      FROM users u
      LEFT JOIN user_points up ON u.id = up.user_id
      WHERE u.points != 0 OR up.total_points != 0
    `)

        if (consistencyCheck.rows.length === 0) {
            console.log('✅ Todos os pontos foram zerados com sucesso!')
        } else {
            console.log('⚠️  Ainda há inconsistências:')
            console.table(consistencyCheck.rows)
        }

        await client.query('COMMIT')
        console.log('✨ Reset completo!')
        process.exit(0)
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('❌ Erro:', error.message)
        process.exit(1)
    } finally {
        client.release()
        await pool.end()
    }
}

resetUserPoints()
