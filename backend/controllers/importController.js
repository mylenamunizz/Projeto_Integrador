const { createUsers } = require('./userController')

// Re-export createUsers with a name that matches the import route semantics.
async function importUsers(req, res) {
  return createUsers(req, res)
}

module.exports = { importUsers }
