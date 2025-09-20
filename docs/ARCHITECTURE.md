# Architecture Overview

## System Architecture

### High-Level Overview
```mermaid
graph TD
    subgraph "Frontend Layer"
        A[React UI] --> B[State Management]
        B --> C[API Client]
    end
    
    subgraph "API Layer"
        D[Nginx] --> E[FastAPI]
        E --> F[Authentication]
        E --> G[RBAC]
        E --> H[Business Logic]
    end
    
    subgraph "Data Layer"
        I[(MongoDB)] --> H
        J[Redis Cache] --> H
    end
    
    subgraph "AI Layer"
        K[Local LLM] --> H
        L[Cloud AI] --> H
    end

    C --> D
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#bbf,stroke:#333,stroke-width:2px
    style I fill:#ddb,stroke:#333,stroke-width:2px
    style K fill:#bfb,stroke:#333,stroke-width:2px
```

### Deployment Architecture
```mermaid
graph TD
    subgraph "Client Layer"
        A[Browser] --> B[CDN]
        C[Mobile App] --> D[API Gateway]
    end
    
    subgraph "Application Layer"
        E[Load Balancer] --> F1[App Server 1]
        E --> F2[App Server 2]
        G[Redis Cluster]
    end
    
    subgraph "Database Layer"
        H[(Primary DB)] --> I[(Secondary DB)]
        J[(Backup DB)]
    end
    
    B --> E
    D --> E
    F1 --> G
    F2 --> G
    F1 --> H
    F2 --> H
    
    style E fill:#f9f,stroke:#333,stroke-width:2px
    style H fill:#bbf,stroke:#333,stroke-width:2px

```mermaid
graph TD
    A[Frontend - React/Vite] --> B[Nginx Reverse Proxy]
    B --> C[Backend - FastAPI]
    C --> D[(MongoDB)]
    C --> E[Local LLM Service]
    C --> F[External APIs]
    G[WebSocket Server] --> C
    H[Authentication Service] --> C
    I[RBAC Service] --> C
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style D fill:#ddb,stroke:#333,stroke-width:2px
```

## Component Architecture

```mermaid
graph LR
    A[Frontend] --> B[Components]
    B --> C[Pages]
    B --> D[Shared]
    B --> E[Widgets]
    
    F[Backend] --> G[Routes]
    F --> H[Services]
    F --> I[Models]
    F --> J[Utils]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#bbf,stroke:#333,stroke-width:2px
```

## Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database
    participant L as LLM

    U->>F: Interact with UI
    F->>A: API Request
    A->>D: Query Data
    D-->>A: Return Data
    A->>L: AI Analysis
    L-->>A: AI Response
    A-->>F: API Response
    F-->>U: Update UI
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth Service
    participant D as Database
    participant E as Email Service

    U->>F: Enter Email & Tenant
    F->>A: Request OTP
    A->>E: Send OTP Email
    E-->>U: Receive OTP
    U->>F: Enter OTP
    F->>A: Verify OTP
    A->>D: Validate User
    D-->>A: User Data
    A-->>F: JWT Token
    F-->>U: Access Granted
```

## RBAC Structure

```mermaid
graph TD
    A[Super Admin] --> B[Tenant Owner]
    B --> C[Admin]
    C --> D[Analyst]
    D --> E[Viewer]
    
    style A fill:#f00,stroke:#333,stroke-width:2px,color:#fff
    style B fill:#f90,stroke:#333,stroke-width:2px
    style C fill:#ff0,stroke:#333,stroke-width:2px
    style D fill:#0f0,stroke:#333,stroke-width:2px
    style E fill:#09f,stroke:#333,stroke-width:2px
```

## Directory Structure

```plaintext
JupiterEmerge/
├── backend/
│   ├── ai_routes.py
│   ├── ai_services.py
│   ├── server.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── DEVELOPMENT.md
└── docker-compose.yml
```
