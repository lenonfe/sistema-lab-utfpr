# Sistema Lab UTFPR

Sistema de gestão para laboratório da UTFPR, desenvolvido em Node.js com Fastify, Prisma e PostgreSQL. O projeto inclui autenticação, controle de chamados, reservas de equipamentos, vistoria de itens e solicitações de software.

## Visão geral

Este projeto foi pensado para auxiliar na administração do laboratório com os seguintes módulos:

- Login de usuários
- Cadastro e acompanhamento de chamados
- Gestão de equipamentos
- Reservas de itens do laboratório
- Vistorias com upload de mídia
- Solicitação de software para laboratórios
- Interface web em HTML, CSS e JavaScript

## Stack tecnológica

- Node.js
- Fastify
- Prisma ORM
- PostgreSQL
- Docker / Docker Compose
- Frontend em HTML, CSS e JavaScript

## Estrutura do repositório

```bash
.
├── frontend/              # Interface web do sistema
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── logo.png
├── prisma/
│   └── schema.prisma      # Modelos do banco de dados
├── uploads/              # Arquivos enviados pelo sistema
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
├── server.js             # Backend principal
└── README.md
```

## Funcionalidades principais

### 1. Autenticação

Endpoint:

- `POST /api/login`

Permite login com e-mail e senha. Usuários padrão são criados automaticamente ao iniciar o sistema pela primeira vez.

### 2. Chamados

Endpoints:

- `POST /api/chamados`
- `GET /api/chamados`
- `PUT /api/chamados/:id/status`

Permite registrar e acompanhar problemas ou solicitações no laboratório.

### 3. Equipamentos

Endpoint:

- `GET /api/equipamentos`

Lista os equipamentos disponíveis no sistema.

### 4. Reservas

Endpoints:

- `POST /api/reservas`
- `GET /api/reservas`
- `PUT /api/reservas/:id/analise`
- `GET /api/reservas/patrimonio/:codigo`

Gerencia reservas de equipamentos com aprovação e análise.

### 5. Vistorias

Endpoint:

- `POST /api/vistorias`

Permite registrar vistoria com upload de imagem ou vídeo associado a uma reserva.

### 6. Solicitações de software

Endpoints:

- `POST /api/software`
- `GET /api/software`
- `PUT /api/software/:id/status`

Gerencia solicitações de software para laboratórios.

## Pré-requisitos

Antes de rodar o projeto, certifique-se de ter instalado:

- Node.js 18+
- npm
- Docker
- Docker Compose

## Configuração do ambiente

### Opção 1: Usando Docker Compose (recomendado)

O projeto já inclui um arquivo `docker-compose.yml` com:

- serviço da aplicação
- banco PostgreSQL

Para iniciar:

```bash
docker-compose up --build
```

A aplicação ficará disponível em:

- http://localhost:3000

### Opção 2: Executando localmente

1. Instale as dependências:

```bash
npm install
```

2. Crie um arquivo `.env` na raiz do projeto com a URL do banco:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/lab_utfpr"
```

3. Gere o cliente Prisma:

```bash
npx prisma generate
```

4. Sincronize o banco de dados:

```bash
npx prisma db push
```

5. Inicie o servidor:

```bash
node server.js
```

## Usuários padrão

Ao iniciar o sistema pela primeira vez, usuários padrão são criados automaticamente:

- Lenon Aluno
  - e-mail: `lenon@alunos.utfpr.edu.br`
  - senha: `123`
- Carlos Staff
  - e-mail: `suporte@utfpr.edu.br`
  - senha: `123`
- Chefe Silva
  - e-mail: `chefe@utfpr.edu.br`
  - senha: `123`
- João Paulo
  - e-mail: `prof@utfpr.edu.br`
  - senha: `123`

## Banco de dados

O banco é modelado no arquivo:

- `prisma/schema.prisma`

Modelos principais:

- `Usuario`
- `Chamado`
- `Equipamento`
- `Reserva`
- `Vistoria`
- `SoftwareRequest`

## Uploads

Os arquivos enviados para vistorias são salvos na pasta:

- `./uploads`

Esses arquivos são servidos estaticamente pela aplicação em `/uploads/...`.

## Observações

- O backend principal está em `server.js`.
- A interface web está em `frontend/`.
- A aplicação usa `Fastify` e `Prisma` para lidar com API e banco de dados.
- O projeto foi desenvolvido para uso acadêmico/laboratorial e pode ser adaptado conforme a necessidade do ambiente.

## Comandos úteis

```bash
# instalar dependências
npm install

# iniciar backend
node server.js

# subir banco e app com Docker
docker-compose up --build

# gerar cliente Prisma
npx prisma generate

# sincronizar schema com o banco
npx prisma db push
```

## Licença

Este projeto não possui uma licença definida no repositório.

## Autor

- Lenon Fernandes

