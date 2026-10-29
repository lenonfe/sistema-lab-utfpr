# Sistema de Gestão para Laboratório da UTFPR

## 1. Introdução

O presente projeto consiste em um sistema de gestão para laboratórios acadêmicos da UTFPR, desenvolvido com foco em automatizar e centralizar atividades relacionadas ao controle de manutenção, reserva de equipamentos, registros de chamados e gestão de solicitações de software.

A aplicação foi concebida para atender a um ambiente acadêmico em que diversos usuários, com perfis distintos, necessitam acessar e registrar informações de forma organizada, segura e eficiente. O sistema integra backend em Node.js, interface web em HTML/CSS/JavaScript e persistência em banco de dados PostgreSQL por meio do Prisma ORM.

## 2. Objetivo

O objetivo principal do sistema é oferecer uma plataforma digital para:

- autenticação de usuários;
- registro e acompanhamento de chamados;
- gestão de equipamentos e reservas;
- controle de vistorias com mídia;
- acompanhamento de solicitações de software para laboratórios.

## 3. Contexto e funcionalidades

O sistema foi estruturado para apoiar a rotina administrativa e operacional de um laboratório acadêmico, contemplando os seguintes módulos:

### 3.1 Autenticação

Os usuários podem realizar login por meio do endpoint de autenticação, com validação de e-mail e senha. A aplicação organiza o acesso por perfis, permitindo diferentes níveis de uso e responsabilidade operacional.

### 3.2 Chamados

O módulo de chamados permite registrar solicitações de manutenção, suporte técnico ou demandas do laboratório, incluindo informações sobre o local e a descrição da ocorrência. Cada chamado pode ser atualizado conforme seu status.

### 3.3 Equipamentos

A plataforma mantém um cadastro de equipamentos disponíveis no laboratório, permitindo consulta por categoria e patrimônio. Essa funcionalidade suporta controle físico e acompanhamento do patrimônio do ambiente.

### 3.4 Reservas

O sistema permite criar, listar e analisar reservas de equipamentos. A funcionalidade de aprovação e justificativa permite controlar o uso de itens por usuários e monitorar o estado de cada reserva.

### 3.5 Vistorias

A etapa de vistoria permite registrar inspeções relacionadas a uma reserva, incluindo upload de mídia, como imagem ou vídeo. Esse recurso é relevante para documentar a etapa de retirada, devolução ou inspeção do item.

### 3.6 Solicitação de software

O módulo de software permite registrar pedidos de software para laboratórios, informando destino, prazo e responsável pela solicitação. Também oferece acompanhamento do status da demanda.

## 4. Arquitetura do sistema

A aplicação é composta por:

- backend em Node.js utilizando Fastify;
- interface web em HTML, CSS e JavaScript;
- ORM Prisma para acesso ao banco de dados;
- banco PostgreSQL como mecanismo de persistência;
- contenção de arquivos enviados em diretório local de uploads;
- conteinerização com Docker e Docker Compose.

## 5. Estrutura do repositório

```bash
.
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── logo.png
├── prisma/
│   └── schema.prisma
├── uploads/
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
├── server.js
├── README.md
└── .vscode/
```

## 6. Tecnologias utilizadas

- Node.js
- Fastify
- Prisma ORM
- PostgreSQL
- Docker
- Docker Compose
- HTML
- CSS
- JavaScript

## 7. Modelagem de dados

A modelagem do banco de dados está definida no arquivo `prisma/schema.prisma` e inclui os principais modelos:

- `Usuario`
- `Chamado`
- `Equipamento`
- `Reserva`
- `Vistoria`
- `SoftwareRequest`

Esses modelos estruturam o relacionamento entre usuários, equipamentos, solicitações e registros de uso e acompanhamento.

## 8. Requisitos para execução

Os seguintes itens são necessários para rodar o projeto localmente:

- Node.js 18 ou superior
- npm
- Docker e Docker Compose
- PostgreSQL, caso a execução seja feita sem containerização

## 9. Configuração e execução

### 9.1 Execução com Docker Compose

A forma mais prática de execução é por meio do arquivo `docker-compose.yml`, que já disponibiliza os serviços da aplicação e do banco de dados.

```bash
docker-compose up --build
```

Após a inicialização, a aplicação fica disponível em:

- http://localhost:3000

### 9.2 Execução local

1. Instalar dependências:

```bash
npm install
```

2. Configurar a variável de ambiente `DATABASE_URL`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/lab_utfpr"
```

3. Gerar o cliente Prisma:

```bash
npx prisma generate
```

4. Sincronizar o schema com o banco:

```bash
npx prisma db push
```

5. Iniciar a aplicação:

```bash
node server.js
```

## 10. Usuários padrão

Ao iniciar o sistema pela primeira vez, o banco é populado automaticamente com usuários de exemplo:

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

## 11. Endpoints principais

### Autenticação

- `POST /api/login`

### Chamados

- `POST /api/chamados`
- `GET /api/chamados`
- `PUT /api/chamados/:id/status`

### Equipamentos

- `GET /api/equipamentos`

### Reservas

- `POST /api/reservas`
- `GET /api/reservas`
- `PUT /api/reservas/:id/analise`
- `GET /api/reservas/patrimonio/:codigo`

### Vistorias

- `POST /api/vistorias`

### Solicitação de software

- `POST /api/software`
- `GET /api/software`
- `PUT /api/software/:id/status`

## 12. Arquivos enviados

Arquivos recebidos pelo sistema, como imagens e vídeos, são armazenados na pasta `uploads` e servidos pela aplicação em rotas estáticas sob o prefixo `/uploads/`.

## 13. Considerações finais

O Sistema Lab UTFPR representa uma solução prática para o gerenciamento de atividades acadêmicas em laboratório, integrando processos administrativos, operacionais e de logística em uma única plataforma. A estrutura modular e a utilização de tecnologias atuais favorecem a manutenção, extensão e adaptação do sistema a novas demandas do ambiente universitário.

## 14. Licença

Este repositório não possui licença definida no momento.

## 15. Autor

- Lenon Fernandes
