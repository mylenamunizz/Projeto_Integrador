const roleToNivel = {
  admin: 3,
  gestor: 2,
  funcionario: 1,
}

const nivelToRole = {
  3: 'admin',
  2: 'gestor',
  1: 'funcionario',
}

const csvRoleToInternal = {
  manager: 'gestor',
  gestor: 'gestor',
  member: 'funcionario',
  funcionario: 'funcionario',
  admin: 'admin',
}

/**
 * Normaliza valores vindos de CSV ou de clientes antigos.
 * Retorna um role interno válido (admin|gestor|funcionario).
 */
function normalizeRole(input) {
  if (!input || typeof input !== 'string') return 'funcionario'
  const key = input.trim().toLowerCase()
  return csvRoleToInternal[key] || 'funcionario'
}

/**
 * Retorna o nivel numérico correspondente ao role.
 * Padrão: 1 (funcionário)
 */
function getNivelFromRole(role) {
  return roleToNivel[role] || 1
}

/**
 * Retorna o role correspondente ao nivel.
 * Padrão: 'funcionario'
 */
function getRoleFromNivel(nivel) {
  return nivelToRole[nivel] || 'funcionario'
}

/**
 * Retorna true se role e nivel forem consistentes entre si.
 */
function isRoleNivelConsistent(role, nivel) {
  return roleToNivel[role] === nivel
}

module.exports = {
  normalizeRole,
  getNivelFromRole,
  getRoleFromNivel,
  isRoleNivelConsistent,
}
