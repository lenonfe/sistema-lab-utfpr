# Diagramas do Sistema Lab UTFPR

Este documento reúne diagramas de arquitetura, dados e fluxos de uso do sistema. Os diagramas são escritos em Mermaid e podem ser visualizados em visualizadores compatíveis.

## Arquitetura

```mermaid
flowchart LR
    U[Usuário] --> B[Navegador]
    B --> FE[Frontend<br/>HTML, CSS e JavaScript]
    FE -->|Requisições HTTP para /api| API[Backend<br/>Node.js + Fastify]
    API --> ORM[Prisma ORM]
    ORM --> DB[(PostgreSQL)]
    FE -->|Upload de mídia| API
    API -->|Salva e disponibiliza arquivos| UP[(Diretório uploads)]
    B -->|Acessa mídia em /uploads/| API
```

## Modelo de dados

```mermaid
erDiagram
    USUARIO {
        int id PK
        string nome
        string email UK
        string senha
        string perfil
        datetime createdAt
    }

    CHAMADO {
        int id PK
        string local
        string descricao
        string midiaUrl
        string status
        string prioridade
        int usuarioId FK
        datetime createdAt
    }

    EQUIPAMENTO {
        int id PK
        string nome
        string tipo
        string patrimonio UK
        string status
    }

    RESERVA {
        int id PK
        datetime dataRetirada
        datetime dataDevolucao
        string status
        string justificativa
        int usuarioId FK
        int equipamentoId FK
        datetime createdAt
    }

    VISTORIA {
        int id PK
        string tipo
        string midiaUrl
        int reservaId FK
        datetime createdAt
    }

    SOFTWARE_REQUEST {
        int id PK
        string nome
        string labsDestino
        datetime dataLimite
        string status
        int usuarioId FK
        datetime createdAt
    }

    USUARIO ||--o{ CHAMADO : registra
    USUARIO ||--o{ RESERVA : solicita
    USUARIO o|--o{ SOFTWARE_REQUEST : solicita
    EQUIPAMENTO ||--o{ RESERVA : reservado_em
    RESERVA ||--o{ VISTORIA : documentada_por
```

## Fluxo de reserva de equipamento

```mermaid
flowchart TD
    A[Usuário acessa o sistema] --> B[Seleciona Reservar Equipamento]
    B --> C[Escolhe equipamento]
    C --> D[Informa retirada e devolução]
    D --> E[Envia solicitação]
    E --> F[Reserva Pendente]
    F --> G{Chefe analisa}
    G -->|Aprova| H[Reserva Aprovada]
    G -->|Recusa e registra motivo| I[Reserva Recusada]
    H --> J[Equipe faz vistoria de retirada]
    J --> K[Reserva Em Uso]
    K --> L[Equipe faz vistoria de devolução]
    L --> M[Reserva Concluída]
```

> **Observação:** o código atual da interface exibe o envio da vistoria como simulação. O fluxo de vistoria acima descreve a sequência pretendida, não confirma que o envio esteja efetivamente persistido pela interface.

## Fluxo de chamado técnico

```mermaid
flowchart TD
    A[Usuário abre Abrir Chamado] --> B[Seleciona laboratório ou sala]
    B --> C[Descreve o problema]
    C --> D[Envia chamado]
    D --> E[Chamado Pendente]
    E --> F[Equipe assume o chamado]
    F --> G[Chamado Em Andamento]
    G --> H[Equipe conclui o atendimento]
    H --> I[Chamado Concluído]
```

## Fluxo de solicitação de software

```mermaid
flowchart TD
    A[Chefe ou Professor informa software, laboratório e prazo] --> B[Envia solicitação]
    B --> C[Solicitação Pendente]
    C --> D[Equipe realiza a instalação]
    D --> E[Equipe marca como Instalado]
```
