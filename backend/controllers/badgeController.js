const { pool } = require('../config/db')

async function getUserBadges(req, res) {
    try {
        const userId = req.user.id

        // Sincronização proativa: garantir que selos antigos sejam liberados se o usuário já tiver pontos
        const userPointsResult = await pool.query('SELECT points FROM users WHERE id = $1', [userId])
        const currentPoints = userPointsResult.rows[0]?.points || 0
        await checkAndUnlockBadges(userId, currentPoints)

        // Fix: CASE syntax was slightly wrong in thought, corrected to CASE WHEN ... THEN ... ELSE ... END
        const { rows } = await pool.query(`
      SELECT 
        b.id, b.name, b.points_required as points, b.image_url as image, b.description,
        COALESCE(ub.claimed, FALSE) as claimed,
        ub.unlocked_at,
        ub.claimed_at,
        (ub.id IS NOT NULL) as unlocked
      FROM badges b
      LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = $1
      ORDER BY b.points_required ASC
    `, [userId])

        return res.json({ badges: rows })
    } catch (error) {
        console.error('getUserBadges error:', error)
        return res.status(500).json({ error: 'Erro ao buscar selos' })
    }
}

async function claimBadge(req, res) {
    try {
        const userId = req.user.id
        const badgeId = req.params.id

        const result = await pool.query(
            'UPDATE user_badges SET claimed = TRUE, claimed_at = NOW() WHERE user_id = $1 AND badge_id = $2 AND claimed = FALSE RETURNING *',
            [userId, badgeId]
        )

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Selo não encontrado ou já coletado' })
        }

        return res.json({ message: 'Selo coletado com sucesso!', badge: result.rows[0] })
    } catch (error) {
        console.error('claimBadge error:', error)
        return res.status(500).json({ error: 'Erro ao coletar selo' })
    }
}

async function checkAndUnlockBadges(userId, points) {
    try {
        console.log(`[Badges] Checking badges for user ${userId} with ${points} points`);
        // Buscar selos que o usuário ainda não desbloqueou mas tem pontos para tal
        const { rows: potentialBadges } = await pool.query(
            `SELECT id, name, points_required FROM badges 
       WHERE points_required <= $1 
       AND id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = $2)`,
            [points, userId]
        )

        console.log(`[Badges] Found ${potentialBadges.length} potential badges`);

        for (const badge of potentialBadges) {
            await pool.query(
                'INSERT INTO user_badges (user_id, badge_id, unlocked_at) VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING',
                [userId, badge.id]
            )
            console.log(`[Badges] Usuário ${userId} desbloqueou selo ${badge.id}`)
        }
    } catch (error) {
        console.error('checkAndUnlockBadges error:', error)
    }
}

module.exports = {
    getUserBadges,
    claimBadge,
    checkAndUnlockBadges
}
