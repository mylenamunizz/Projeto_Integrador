const app = require('./app')
const { initDB } = require('./config/db')

const PORT = process.env.PORT || 3000
const MAX_RETRIES = Number(process.env.DB_INIT_RETRIES || 10)
const RETRY_DELAY_MS = Number(process.env.DB_INIT_RETRY_DELAY_MS || 5000)

async function startServer(attempt = 1) {
  try {
    console.log(`Tentativa ${attempt} de inicialização do DB`)
    await initDB()
    app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`))
  } catch (err) {
    console.error(`Erro ao conectar no banco (tentativa ${attempt}):`, err.message || err)

    if (attempt >= MAX_RETRIES) {
      console.error('Máximo de tentativas de conexão atingido. Abortando.')
      process.exit(1)
    }

    console.log(`Aguardando ${RETRY_DELAY_MS}ms antes de nova tentativa...`)
    setTimeout(() => {
      startServer(attempt + 1)
    }, RETRY_DELAY_MS)
  }
}

startServer()
