const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const importRoutes = require('./routes/importRoutes')
const taskRoutes = require('./routes/taskRoutes')
const rewardRoutes = require('./routes/rewardRoutes')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/users/import', importRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/rewards', rewardRoutes)

app.get('/api/hello', (req, res) => {
  res.json({ message: 'API funcionando 🚀' })
})

module.exports = app

// rota de healthcheck
app.get('/health', (req, res) => {
  res.sendStatus(200); // retorna status 200 OK
});

// iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
