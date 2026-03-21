# Projeto Integrador

Plataforma web desenvolvida como projeto integrador da faculdade.

O projeto utiliza:
- Frontend: React + Vite
- Containers: Docker
- Gerenciamento de containers: Docker Compose

---

# Tecnologias utilizadas

- Node.js
- React
- Vite
- Docker
- Docker Compose

---

# Estrutura do projeto

projeto-integrador
│
├── frontend
├── backend
├── database
└── docker-compose.yml

---

# Pré-requisitos

Antes de rodar o projeto é necessário instalar:

- Docker Desktop

Download:
https://www.docker.com/products/docker-desktop/

---

# Como rodar o projeto

1 - Clonar o repositório

git clone URL_DO_REPOSITORIO

2 - Entrar na pasta do projeto

cd projeto-integrador

3 - Rodar o ambiente com Docker

docker compose up --build

---

# Acessar o projeto

Depois que os containers iniciarem, acessar:

http://localhost:8080

---

# Parar o projeto

Para parar os containers:

docker compose down

---

# Fluxo de trabalho do grupo

1 - Atualizar projeto

git pull

2 - Fazer alterações

3 - Subir alterações

git add .
git commit -m "descrição da alteração"
git push

---

# Observações

O projeto utiliza Docker para garantir que todos os membros do grupo utilizem o mesmo ambiente de desenvolvimento, evitando problemas de compatibilidade de versões.