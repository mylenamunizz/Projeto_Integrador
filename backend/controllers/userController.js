const { pool } = require('../config/db')
const bcrypt = require('bcryptjs')
const { normalizeRole, getNivelFromRole, isRoleNivelConsistent } = require('../utils/roleUtils')
const { sanitizeUsers } = require('../utils/sanitizer')

async function getCurrentUser(req, res) {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.nivel, u.position, u.points, u.gestor_id AS "gestorId",
              COALESCE(up.total_points, 0) AS total_points
       FROM users u
       LEFT JOIN user_points up ON u.id = up.user_id
       WHERE u.id = $1`,
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const user = result.rows[0]
    user.role = normalizeRole(user.role)
    // Usar total_points como points para consistência
    user.points = user.total_points
    delete user.total_points

    return res.status(200).json(user)
  } catch (error) {
    console.error('getCurrentUser error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

async function getUsers(req, res) {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.nivel, u.position, u.points, u.gestor_id AS "gestorId",
              COALESCE(up.total_points, 0) AS total_points
       FROM users u
       LEFT JOIN user_points up ON u.id = up.user_id`
    )

    // Normalize roles for legacy data
    const users = result.rows.map((u) => {
      const user = { ...u, role: normalizeRole(u.role) }
      // Usar total_points como points para consistência
      user.points = user.total_points
      delete user.total_points
      return user
    })

    return res.status(200).json(users)
  } catch (error) {
    console.error('getUsers error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params
    const { gestorId } = req.body

    const userResult = await pool.query('SELECT id, nivel FROM users WHERE id = $1', [id])
    const user = userResult.rows[0]

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Somente gestores/admins podem alterar relações de hierarquia
    if (req.user?.nivel < 2) {
      return res.status(403).json({ error: 'Acesso negado: permissão insuficiente' })
    }

    // Não permitir alterar gestor de admin
    if (user.nivel === 3) {
      return res.status(403).json({ error: 'Usuários Admin não podem ser modificados' })
    }

    // Validar que o gestor existe e é gestor/adm
    if (gestorId) {
      const managerResult = await pool.query('SELECT id, nivel FROM users WHERE id = $1', [gestorId])
      const manager = managerResult.rows[0]
      if (!manager || manager.nivel < 2) {
        return res.status(400).json({ error: 'Gestor inválido' })
      }
    }

    await pool.query('UPDATE users SET gestor_id = $1 WHERE id = $2', [gestorId || null, id])

    const updated = await pool.query(
      'SELECT id, name, email, role, nivel, position, points, gestor_id AS "gestorId" FROM users WHERE id = $1',
      [id]
    )

    return res.status(200).json(updated.rows[0])
  } catch (error) {
    console.error('updateUser error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

async function deleteUserById(req, res) {
  try {
    const { id } = req.params

    const userResult = await pool.query('SELECT id, role, nivel FROM users WHERE id = $1', [id])
    const user = userResult.rows[0]

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    if (user.nivel === 3) {
      return res.status(403).json({ error: 'Usuários Admin não podem ser excluídos' })
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id])
    return res.status(200).json({ message: 'Usuário excluído com sucesso' })
  } catch (error) {
    console.error('deleteUserById error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

async function clearOrganization(req, res) {
  try {
    await pool.query('UPDATE users SET gestor_id = NULL WHERE nivel <> 3')
    return res.status(200).json({ message: 'Estrutura organizacional limpa com sucesso' })
  } catch (error) {
    console.error('clearOrganization error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

async function createUsers(req, res) {
  try {
    let users = req.body // array of users

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: 'Lista de usuários inválida' })
    }

    // First pass: sanitize all user data to remove trailing delimiters
    users = sanitizeUsers(users)

    // Remove duplicated emails already persistidos no banco (manter um registro por email)
    await pool.query(`
      WITH ranked AS (
        SELECT id, LOWER(email) AS email_lower,
               ROW_NUMBER() OVER (PARTITION BY LOWER(email) ORDER BY id) AS rn
        FROM users
      )
      DELETE FROM users WHERE id IN (SELECT id FROM ranked WHERE rn > 1)
    `)

    const createdUsers = []
    const errors = []

    // Pré-busca usuários existentes para evitar duplicatas
    const emailList = users
      .map((u) => (u.email || '').toString().trim().toLowerCase())
      .filter(Boolean)

    const existingRows = emailList.length
      ? await pool.query('SELECT id, email FROM users WHERE LOWER(email) = ANY($1)', [emailList])
      : { rows: [] }

    const existingByEmail = new Map(existingRows.rows.map((r) => [r.email.toLowerCase(), r.id]))
    const seenEmails = new Set()

    // Guardar links gestor -> subordinado para resolver depois
    const pendingManagerLinks = []

    for (const userData of users) {
      try {
        const { __row, name, email, role, position, managerEmail, points } = userData
        const row = __row ?? null
        const emailLower = (email || '').toString().trim().toLowerCase()

        if (!name || !emailLower) {
          errors.push({ linha: row, email: email || null, status: 'falha', motivo: 'Nome e email obrigatórios' })
          continue
        }

        // Ignorar duplicados no arquivo
        if (seenEmails.has(emailLower)) {
          errors.push({ linha: row, email, status: 'duplicado' })
          continue
        }
        seenEmails.add(emailLower)

        // Não criar usuário se já existir
        if (existingByEmail.has(emailLower)) {
          errors.push({ linha: row, email, status: 'duplicado' })
          continue
        }

        const normalizedRole = normalizeRole(role)
        const nivel = getNivelFromRole(normalizedRole)

        // Bloquear tentativa de criar admin via planilha
        if (normalizedRole === 'admin') {
          errors.push({ linha: row, email, status: 'falha', motivo: 'Não é permitido criar Admin via planilha' })
          continue
        }

        // Gerar senha padrão
        const defaultPassword = '123456'
        const hashedPassword = await bcrypt.hash(defaultPassword, 10)

        const insertResult = await pool.query(
          'INSERT INTO users (name, email, role, nivel, position, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, nivel, position',
          [name, email, normalizedRole, nivel, position || null, hashedPassword]
        )

        createdUsers.push({ ...insertResult.rows[0], managerEmail })

        if (managerEmail) {
          pendingManagerLinks.push({ email, managerEmail })
        }
      } catch (err) {
        console.error('Error creating user:', err)
        errors.push({ linha: userData.__row ?? null, email: userData.email, status: 'falha', motivo: err.message })
      }
    }

    // Passagem 2 — resolver vínculos de gestor
    for (const link of pendingManagerLinks) {
      const subordinate = await pool.query('SELECT id, name, email FROM users WHERE LOWER(email) = LOWER($1)', [link.email])
      const manager = await pool.query('SELECT id, email FROM users WHERE LOWER(email) = LOWER($1)', [link.managerEmail])

      if (subordinate.rows.length === 0) continue

      const subordinateRow = subordinate.rows[0]
      const managerRow = manager.rows[0]

      // Se managerEmail aponta para si mesmo, mantemos gestor_id como null para estruturar como root.
      if (managerRow && subordinateRow && subordinateRow.email.toLowerCase() === managerRow.email.toLowerCase()) {
        console.info(`ℹ️ [IMPORT INFO] Usuário '${subordinateRow.email}' não será vinculado como gestor de si mesmo`)
        continue
      }

      if (manager.rows.length > 0) {
        await pool.query('UPDATE users SET gestor_id = $1 WHERE id = $2', [manager.rows[0].id, subordinate.rows[0].id])
      } else {
        const subordinateName = subordinateRow?.name || 'Desconhecido'
        const warningMessage = `⚠️ [IMPORT WARNING] Manager not found for user "${subordinateName}" (${link.email}): managerEmail="${link.managerEmail}" does not exist in database`
        console.warn(warningMessage)
        errors.push({ 
          linha: null, 
          email: link.email, 
          status: 'aviso', 
          motivo: `Gestor '${link.managerEmail}' não encontrado — gestor_id não vinculado` 
        })
      }
    }

    const total = users.length
    const cadastrados = createdUsers.length
    const duplicados = errors.filter((e) => e.status === 'duplicado').length
    const falhas = errors.filter((e) => e.status === 'falha').length

    return res.status(201).json({
      message: 'Importação concluída',
      total,
      cadastrados,
      duplicados,
      falhas,
      detalhes: [...errors],
    })
  } catch (error) {
    console.error('createUsers error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

module.exports = {
  getUsers,
  getCurrentUser,
  createUsers,
  updateUser,
  deleteUserById,
  clearOrganization,
}