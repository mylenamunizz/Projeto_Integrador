const app = require('./app')
const { initDB } = require('./config/db')

const PORT = process.env.PORT || 3000

initDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`))
  })
  .catch((err) => {
    console.error('Erro ao conectar no banco:', err)
    process.exit(1)
  })
