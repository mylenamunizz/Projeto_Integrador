const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
const { getNivelFromRole } = require('../utils/roleUtils')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'projeto',
})

async function initDB() {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      institution VARCHAR(255),
      role VARCHAR(20) NOT NULL DEFAULT 'funcionario',
      nivel INTEGER NOT NULL DEFAULT 1,
      password VARCHAR(255) NOT NULL,
      points INTEGER NOT NULL DEFAULT 0,
      position VARCHAR(255),
      gestor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `

  await pool.query(createTableSql)

  // Novas tabelas do sistema (idempotente)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'todo',
      points INTEGER NOT NULL DEFAULT 10,
      deadline DATE,
      assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      gestor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      evidence TEXT,
      reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      reviewed_at TIMESTAMP,
      credited BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `)

  // Garantir colunas necessárias caso tabela tasks já exista (migração incremental)
  await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL")
  await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT")
  await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS evidence TEXT")
  await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reviewed_by INTEGER")
  await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP")
  await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS credited BOOLEAN NOT NULL DEFAULT FALSE")

  // Recompensas, resgates e pontos de usuário (conforme contexto solicitado)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_points (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      total_points INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id)
    );
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS rewards (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      points_cost INTEGER NOT NULL CHECK (points_cost > 0),
      quantity INTEGER NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS redemptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reward_id INTEGER NOT NULL REFERENCES rewards(id),
      points_spent INTEGER NOT NULL,
      redeemed_at TIMESTAMP DEFAULT NOW()
    );
  `)

  // Garantir colunas de rewards em caso de tabela existente (compatibilidade retroativa)
  await pool.query("ALTER TABLE rewards ADD COLUMN IF NOT EXISTS title VARCHAR(255)")
  await pool.query("ALTER TABLE rewards ADD COLUMN IF NOT EXISTS description TEXT")
  await pool.query("ALTER TABLE rewards ADD COLUMN IF NOT EXISTS points_cost INTEGER")
  await pool.query("ALTER TABLE rewards ADD COLUMN IF NOT EXISTS quantity INTEGER")
  await pool.query("ALTER TABLE rewards ADD COLUMN IF NOT EXISTS active BOOLEAN")
  await pool.query("ALTER TABLE rewards ADD COLUMN IF NOT EXISTS created_by INTEGER")
  await pool.query("ALTER TABLE rewards ADD COLUMN IF NOT EXISTS created_at TIMESTAMP")

  // Migração de dados: sincronizar title <-> name, points_cost <-> cost, quantity <-> stock
  await pool.query("UPDATE rewards SET title = COALESCE(title, name) WHERE title IS NULL OR title = ''")
  await pool.query("UPDATE rewards SET name = COALESCE(name, title) WHERE name IS NULL OR name = ''")
  await pool.query("UPDATE rewards SET points_cost = COALESCE(points_cost, cost) WHERE points_cost IS NULL")
  await pool.query("UPDATE rewards SET cost = COALESCE(cost, points_cost) WHERE cost IS NULL")
  await pool.query("UPDATE rewards SET quantity = COALESCE(quantity, stock) WHERE quantity IS NULL")
  await pool.query("UPDATE rewards SET stock = COALESCE(stock, quantity) WHERE stock IS NULL")

  await pool.query("ALTER TABLE redemptions ADD COLUMN IF NOT EXISTS reward_id INTEGER")
  await pool.query("ALTER TABLE redemptions ADD COLUMN IF NOT EXISTS user_id INTEGER")
  await pool.query("ALTER TABLE redemptions ADD COLUMN IF NOT EXISTS cost INTEGER NOT NULL")
  await pool.query("ALTER TABLE redemptions ADD COLUMN IF NOT EXISTS voucher_code VARCHAR(100) NOT NULL")
  await pool.query("ALTER TABLE redemptions ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending'")
  await pool.query("ALTER TABLE redemptions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()")
  await pool.query("ALTER TABLE redemptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()")
  await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'todo'")
  await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 10")
  await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deadline DATE")
  await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_id INTEGER")
  await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by INTEGER")
  await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS gestor_id INTEGER")
  await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()")
  await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()")

  // Garantir colunas necessárias caso tabela já exista
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'funcionario'")
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS nivel INTEGER NOT NULL DEFAULT 1")
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL")
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0")
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS position VARCHAR(255)")
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS gestor_id INTEGER")

  // Linha removida: não existe coluna manager_id na tabela users

  // Conta Admin fixa (não criada pelo frontend)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@azis.dev'
  const adminPassword = process.env.ADMIN_PASSWORD || 'azis@admin2024'
  const adminName = process.env.ADMIN_NAME || 'Azis Admin'
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)

  await pool.query(
    `INSERT INTO users (name, email, password, role, nivel) VALUES ($1, $2, $3, 'admin', 3) ON CONFLICT (email) DO NOTHING`,
    [adminName, adminEmail, hashedAdminPassword]
  )

  const seedUsers = [
    { name: 'Ana Silva', email: 'ana@azis.com', institution: 'Azis', role: 'gestor', points: 1250, position: 'CEO', managerEmail: null },
    { name: 'Carlos Santos', email: 'carlos@azis.com', institution: 'Azis', role: 'funcionario', points: 980, position: 'Frontend Developer', managerEmail: 'ana@azis.com' },
    { name: 'Maria Oliveira', email: 'maria@azis.com', institution: 'Azis', role: 'funcionario', points: 1100, position: 'Backend Developer', managerEmail: 'ana@azis.com' },
    { name: 'Pedro Costa', email: 'pedro@azis.com', institution: 'Azis', role: 'funcionario', points: 750, position: 'QA Engineer', managerEmail: 'maria@azis.com' },
    { name: 'Julia Lima', email: 'julia@azis.com', institution: 'Azis', role: 'funcionario', points: 890, position: 'UX Designer', managerEmail: 'carlos@azis.com' },
    { name: 'Rafael Souza', email: 'rafael@azis.com', institution: 'Azis', role: 'funcionario', points: 1350, position: 'DevOps Engineer', managerEmail: 'ana@azis.com' },
  ]

  const defaultPassword = '123456'
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  for (const user of seedUsers) {
    const nivel = getNivelFromRole(user.role)

    let userId;
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [user.email])
    if (existing.rows.length === 0) {
      const insertResult = await pool.query(
        'INSERT INTO users (name, email, institution, role, nivel, points, position, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
        [user.name, user.email, user.institution, user.role, nivel, user.points, user.position, hashedPassword]
      )
      userId = insertResult.rows[0].id
    } else {
      userId = existing.rows[0].id
      await pool.query(
        'UPDATE users SET role = $1, nivel = $2, points = $3, position = $4 WHERE id = $5',
        [user.role, nivel, user.points, user.position, userId]
      )
    }

    if (user.managerEmail) {
      const manager = await pool.query('SELECT id FROM users WHERE email = $1', [user.managerEmail])
      if (manager.rows.length > 0) {
        await pool.query('UPDATE users SET gestor_id = $1 WHERE id = $2', [manager.rows[0].id, userId])
      }
    }
  }
}

module.exports = { pool, initDB }
