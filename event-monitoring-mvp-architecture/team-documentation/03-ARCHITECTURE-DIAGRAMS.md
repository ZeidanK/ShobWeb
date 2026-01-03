# Architecture Diagrams

This document contains the key architectural diagrams for the Event Monitoring and Management Platform, illustrating the system design, data flows, and component interactions.

## Table of Contents
1. [System Context Diagram](#system-context-diagram)
2. [Container Architecture](#container-architecture)
3. [Component Architecture](#component-architecture)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Multi-Tenant Architecture](#multi-tenant-architecture)
6. [Mobile Integration Flow](#mobile-integration-flow)
7. [Real-time Communication](#real-time-communication)

## System Context Diagram

```mermaid
graph TB
    subgraph "External Systems"
        Citizen[Citizen Mobile App]
        Responder[First Responder App]
        Cameras[IP Cameras]
        VMS[Video Management System]
    end

    subgraph "Event Monitoring Platform"
        API[API Gateway]
        Auth[Authentication Service]
        Events[Event Management]
        Reports[Report Processing]
        Users[User Management]
        Companies[Company Management]
        AI[AI Detection Service]
        Dashboard[Web Dashboard]
    end

    subgraph "Infrastructure"
        MongoDB[(MongoDB)]
        Redis[(Redis Cache)]
        FileStore[(File Storage)]
    end

    Citizen --> API
    Responder --> API
    Cameras --> AI
    VMS --> API

    API --> Auth
    API --> Events
    API --> Reports
    API --> Users
    API --> Companies

    Events --> MongoDB
    Reports --> MongoDB
    Users --> MongoDB
    Companies --> MongoDB

    AI --> Events
    Dashboard --> API

    Events --> Redis
    Reports --> FileStore
```

## Container Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Browser<br/>React SPA]
        Mobile[Citizen/Responder<br/>Mobile Apps]
    end

    subgraph "API Gateway Layer"
        Gateway[API Gateway<br/>Express.js]
        Auth[Auth Middleware<br/>JWT/API Keys]
        RateLimit[Rate Limiting<br/>Redis]
        CORS[CORS Handling]
    end

    subgraph "Service Layer"
        EventSvc[Event Service<br/>Event Mgmt/Aggregation]
        ReportSvc[Report Service<br/>Submission/Validation]
        UserSvc[User Service<br/>Multi-tenant Users]
        CompanySvc[Company Service<br/>Tenant Management]
        AISvc[AI Service<br/>Detection Processing]
    end

    subgraph "Data Layer"
        MongoDB[(MongoDB<br/>Primary Database)]
        Redis[(Redis<br/>Cache/Session Store)]
        S3[(Object Storage<br/>Files/Media)]
    end

    Web --> Gateway
    Mobile --> Gateway

    Gateway --> Auth
    Gateway --> RateLimit
    Gateway --> CORS

    Auth --> EventSvc
    Auth --> ReportSvc
    Auth --> UserSvc
    Auth --> CompanySvc

    EventSvc --> AISvc

    EventSvc --> MongoDB
    ReportSvc --> MongoDB
    UserSvc --> MongoDB
    CompanySvc --> MongoDB

    EventSvc --> Redis
    ReportSvc --> S3
```

## Component Architecture

```mermaid
graph TB
    subgraph "Event Management Component"
        EventController[Event Controller<br/>REST Endpoints]
        EventService[Event Service<br/>Business Logic]
        EventModel[Event Model<br/>Mongoose Schema]
        EventValidation[Event Validation<br/>Joi Schemas]
    end

    subgraph "Report Processing Component"
        ReportController[Report Controller<br/>REST Endpoints]
        ReportService[Report Service<br/>Business Logic]
        ReportModel[Report Model<br/>Mongoose Schema]
        ReportValidation[Report Validation<br/>Joi Schemas]
    end

    subgraph "Authentication Component"
        AuthController[Auth Controller<br/>Login/Register]
        AuthService[Auth Service<br/>JWT/API Keys]
        AuthMiddleware[Auth Middleware<br/>Request Validation]
        SessionStore[Session Store<br/>Redis]
    end

    subgraph "Real-time Component"
        WebSocketServer[WebSocket Server<br/>Socket.io]
        EventEmitter[Event Emitter<br/>Real-time Updates]
        NotificationSvc[Notification Service<br/>Push Messages]
    end

    EventController --> EventService
    EventService --> EventModel
    EventService --> EventValidation

    ReportController --> ReportService
    ReportService --> ReportModel
    ReportService --> ReportValidation

    AuthController --> AuthService
    AuthService --> AuthMiddleware
    AuthService --> SessionStore

    WebSocketServer --> EventEmitter
    EventEmitter --> NotificationSvc

    EventService -.-> EventEmitter
    ReportService -.-> EventEmitter
```

## Data Flow Diagrams

### Event Creation Flow

```mermaid
sequenceDiagram
    participant Citizen as Citizen App
    participant API as API Gateway
    participant ReportSvc as Report Service
    participant EventSvc as Event Service
    participant DB as MongoDB
    participant WS as WebSocket

    Citizen->>API: POST /api/mobile/reports
    API->>API: Validate API Key
    API->>ReportSvc: Create Report
    ReportSvc->>DB: Save Report
    ReportSvc->>EventSvc: Check Auto-Creation Rules
    EventSvc->>DB: Create Event (if needed)
    EventSvc->>DB: Link Report to Event
    EventSvc->>WS: Broadcast Event Update
    WS->>Dashboard: Real-time Update
    API->>Citizen: Report Created Response
```

### Multi-Tenant Data Isolation

```mermaid
graph TD
    subgraph "Company A (API Key: abc123)"
        A_Users[(Users<br/>companyId: A)]
        A_Events[(Events<br/>companyId: A)]
        A_Reports[(Reports<br/>companyId: A)]
        A_Cameras[(Cameras<br/>companyId: A)]
    end

    subgraph "Company B (API Key: def456)"
        B_Users[(Users<br/>companyId: B)]
        B_Events[(Events<br/>companyId: B)]
        B_Reports[(Reports<br/>companyId: B)]
        B_Cameras[(Cameras<br/>companyId: B)]
    end

    subgraph "Shared/Global Data"
        EventTypes[(Event Types<br/>companyId: null)]
        GlobalSettings[(Global Settings)]
    end

    API[API Gateway] --> A_Users
    API --> A_Events
    API --> A_Reports
    API --> A_Cameras

    API --> B_Users
    API --> B_Events
    API --> B_Reports
    API --> B_Cameras

    API --> EventTypes
    API --> GlobalSettings
```

## Multi-Tenant Architecture

```mermaid
graph TB
    subgraph "Tenant Isolation Layers"
        APIKey[API Key Validation<br/>X-API-Key Header]
        CompanyCtx[Company Context<br/>Request.company]
        DataFilter[Data Filtering<br/>companyId: {$eq: ctx.companyId}]
        Permission[Permission Check<br/>Role + Company Scope]
    end

    subgraph "Database Collections"
        Companies[(Companies)]
        Users[(Users<br/>companyId indexed)]
        Events[(Events<br/>companyId indexed)]
        Reports[(Reports<br/>companyId indexed)]
        Cameras[(Cameras<br/>companyId indexed)]
        EventTypes[(Event Types<br/>companyId nullable)]
    end

    APIKey --> CompanyCtx
    CompanyCtx --> DataFilter
    CompanyCtx --> Permission

    DataFilter --> Users
    DataFilter --> Events
    DataFilter --> Reports
    DataFilter --> Cameras

    Permission --> Companies
    Permission --> EventTypes
```

## Mobile Integration Flow

```mermaid
sequenceDiagram
    participant Mobile as Mobile App
    participant API as API Gateway
    participant Auth as Auth Service
    participant ReportSvc as Report Service
    participant EventSvc as Event Service
    participant DB as Database

    Mobile->>API: Request with X-API-Key
    API->>Auth: Validate API Key
    Auth->>DB: Lookup Company
    Auth->>API: Company Context

    Mobile->>API: POST /api/mobile/reports
    API->>ReportSvc: Process Report
    ReportSvc->>DB: Validate Event Type
    ReportSvc->>DB: Save Report
    ReportSvc->>EventSvc: Check Auto-Creation
    EventSvc->>DB: Create/Link Event
    EventSvc->>API: Success Response
    API->>Mobile: Report ID + Event Status
```

## Real-time Communication

```mermaid
graph TD
    subgraph "WebSocket Architecture"
        Client[Web Dashboard<br/>Socket.io Client]
        Gateway[API Gateway<br/>Socket.io Server]
        Redis[Redis Adapter<br/>Cluster Support]
        EventBus[Event Bus<br/>Internal Events]
    end

    subgraph "Event Types"
        EventCreated[EVENT_CREATED<br/>New incident]
        EventUpdated[EVENT_UPDATED<br/>Status/location change]
        ReportSubmitted[REPORT_SUBMITTED<br/>New report]
        LocationUpdate[LOCATION_UPDATE<br/>Responder tracking]
        Notification[NOTIFICATION<br/>System alerts]
    end

    subgraph "Broadcast Groups"
        CompanyRoom[Company Room<br/>company_{id}]
        UserRoom[User Room<br/>user_{id}]
        GlobalRoom[Global Room<br/>system]
    end

    Client --> Gateway
    Gateway --> Redis
    Gateway --> EventBus

    EventBus --> EventCreated
    EventBus --> EventUpdated
    EventBus --> ReportSubmitted
    EventBus --> LocationUpdate
    EventBus --> Notification

    EventCreated --> CompanyRoom
    EventUpdated --> CompanyRoom
    ReportSubmitted --> CompanyRoom
    LocationUpdate --> UserRoom
    Notification --> GlobalRoom
```

## Database Schema Relationships

```mermaid
erDiagram
    Company ||--o{ User : has
    Company ||--o{ Event : owns
    Company ||--o{ Report : owns
    Company ||--o{ Camera : owns
    Company ||--o{ EventType : "may have custom"

    EventType ||--o{ Event : categorizes
    EventType ||--o{ Report : categorizes

    Event ||--o{ Report : "aggregates"
    Event }o--o{ User : "assigned to"

    User ||--o{ Report : submits
    User ||--o{ Event : "may create"

    Camera ||--o{ Report : generates

    Event {
        ObjectId _id
        ObjectId companyId
        ObjectId eventTypeId
        string title
        string status
        string priority
        Point location
        ObjectIdArray reports
        ObjectId assignedTo
        Date createdAt
    }

    Report {
        ObjectId _id
        ObjectId companyId
        ObjectId eventId
        ObjectId reporterId
        string reportType
        string title
        string description
        Point location
        ObjectIdArray attachments
        Date createdAt
    }

    User {
        ObjectId _id
        ObjectId companyId
        string email
        string phone
        string role
        boolean isActive
        Date lastLogin
    }

    Company {
        ObjectId _id
        string name
        string apiKey
        object subscription
        object settings
    }
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Load Balancer"
        Nginx[Nginx Reverse Proxy<br/>SSL Termination<br/>Rate Limiting]
    end

    subgraph "Application Layer"
        API1[API Server 1<br/>Node.js]
        API2[API Server 2<br/>Node.js]
        API3[API Server 3<br/>Node.js]
    end

    subgraph "Service Layer"
        AI1[AI Service 1<br/>Python]
        AI2[AI Service 2<br/>Python]
    end

    subgraph "Data Layer"
        MongoDB1[(MongoDB Primary)]
        MongoDB2[(MongoDB Secondary)]
        MongoDB3[(MongoDB Arbiter)]
        Redis[(Redis Cluster)]
    end

    subgraph "Storage"
        MinIO[MinIO S3<br/>File Storage]
    end

    Client[External Clients] --> Nginx
    Nginx --> API1
    Nginx --> API2
    Nginx --> API3

    API1 --> AI1
    API2 --> AI2
    API3 --> AI1

    API1 --> MongoDB1
    API2 --> MongoDB1
    API3 --> MongoDB1

    MongoDB1 --> MongoDB2
    MongoDB2 --> MongoDB3

    API1 --> Redis
    API2 --> Redis
    API3 --> Redis

    API1 --> MinIO
    API2 --> MinIO
    API3 --> MinIO
```

## Security Architecture

```mermaid
graph TD
    subgraph "Network Security"
        WAF[Web Application Firewall<br/>ModSecurity]
        DDoS[DDoS Protection<br/>CloudFlare]
        Firewall[Network Firewall<br/>IP Whitelisting]
    end

    subgraph "Application Security"
        Auth[Authentication<br/>JWT + API Keys]
        Authz[Authorization<br/>RBAC + Company Scope]
        InputVal[Input Validation<br/>Joi + Sanitization]
        Encryption[Data Encryption<br/>TLS + Field Encryption]
    end

    subgraph "Data Security"
        AccessCtrl[Access Control<br/>Query Filtering]
        Audit[Audit Logging<br/>All Operations]
        Backup[Encrypted Backups<br/>Daily Rotation]
        Retention[Data Retention<br/>Compliance Rules]
    end

    WAF --> Auth
    DDoS --> Auth
    Firewall --> Auth

    Auth --> Authz
    Authz --> InputVal
    InputVal --> Encryption

    Encryption --> AccessCtrl
    AccessCtrl --> Audit
    Audit --> Backup
    Backup --> Retention
```

## Performance Architecture

```mermaid
graph TD
    subgraph "Caching Layers"
        CDN[CDN<br/>Static Assets]
        AppCache[Application Cache<br/>Redis]
        DBCache[Database Cache<br/>MongoDB WiredTiger]
    end

    subgraph "Optimization Strategies"
        ConnectionPool[Connection Pooling<br/>MongoDB]
        QueryOptimization[Query Optimization<br/>Indexes + Aggregation]
        Compression[Response Compression<br/>Gzip]
        Pagination[Cursor Pagination<br/>Large Datasets]
    end

    subgraph "Monitoring"
        APM[Application Performance<br/>New Relic]
        Metrics[Custom Metrics<br/>Prometheus]
        Alerts[Alerting<br/>PagerDuty]
    end

    CDN --> AppCache
    AppCache --> DBCache

    ConnectionPool --> QueryOptimization
    QueryOptimization --> Compression
    Compression --> Pagination

    APM --> Metrics
    Metrics --> Alerts
```

These diagrams provide a comprehensive view of the Event Monitoring Platform's architecture, showing how components interact, data flows through the system, and how multi-tenant isolation is maintained across all layers.