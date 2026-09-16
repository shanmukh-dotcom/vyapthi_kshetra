# System Architecture & Technical Specification
**Project:** VYAPTI KSHETRA ("Bridging Fields to Fair Markets")
**Document Type:** Software Architecture Document (SAD)
**Status:** Living Document

---

## 1. Executive Summary
Vyapti Kshetra is a comprehensive B2B agricultural marketplace connecting farmers directly with corporate buyers and food processors. The platform facilitates requirement matching, fair price discovery, AI-driven crop grading, and end-to-end supply chain logistics.

This document outlines both the **Current Prototype Architecture** (optimized for zero-latency local demonstration) and the **Target Production Architecture** (scalable, cloud-native enterprise system).

---

## 2. Current Prototype Architecture (Local-First Demonstration)

The current iteration is engineered as a high-fidelity, local-first web application. It is designed to prove the end-to-end data flow and real-time synchronization between the Farmer and Buyer nodes without backend latency.

### 2.1 Core Stack
*   **Presentation Layer:** HTML5, CSS3 (Native custom styling to guarantee pixel-perfect adherence to master visual references). No external CSS frameworks are used to prevent visual bloat.
*   **Logic Layer:** Vanilla JavaScript (ES6 Modules).
*   **Build System:** Vite (ESBuild-powered bundler for extremely fast HMR and lightweight production builds).

### 2.2 Real-Time State Engine (shared-state.js)
*   **Data Store:** window.localStorage acts as the persistent JSON document store (yapti_shared_db), maintaining normalized tables for Farmers, Supplies, Buyers, Requirements, and Orders.
*   **Event Bus:** The BroadcastChannel API creates an isolated messaging channel (yapti_channel). Cross-tab mutations emit yapti:data_changed events, triggering reactive re-renders in decoupled UI controllers (uyer-app.js, armer-integration.js).
*   **Matching Algorithm:** Runs entirely on the edge, calculating spatial constraints, volume thresholds, and grade matching synchronously.

---

## 3. Target Production Architecture (Cloud-Native Ecosystem)

To scale Vyapti Kshetra for millions of farmers and enterprise buyers, the architecture transitions to a distributed, microservices-based cloud ecosystem.

### 3.1 High-Level Architecture Diagram
`mermaid
graph TD
    %% Client Applications
    subgraph Clients
        FA[Farmer App (PWA / React Native)]
        BA[Buyer Portal (React / Next.js)]
        Admin[Admin Dashboard]
    end

    %% API Gateway & Load Balancing
    AGW[API Gateway / GraphQL Federation]

    %% Microservices Core
    subgraph Core Microservices
        US[User & Identity Service]
        CS[Crop & Supply Service]
        RM[Requirement & Matching Engine]
        LS[Logistics & Supply Journey Service]
        TS[Transaction & Payment Service]
    end

    %% Data Layer
    subgraph Data Persistence
        PG[(PostgreSQL - Relational)]
        RD[(Redis - Caching & Real-time)]
        ES[(ElasticSearch - Geospatial/Search)]
    end

    %% AI & Analytics
    subgraph Intelligence
        AIG[AI Grading Vision Model]
        PPM[Price Prediction Engine]
        DWH[(Snowflake/BigQuery - Analytics)]
    end

    %% Connections
    FA --> AGW
    BA --> AGW
    Admin --> AGW
    
    AGW --> US
    AGW --> CS
    AGW --> RM
    AGW --> LS
    AGW --> TS

    CS --> PG
    RM --> PG
    RM --> ES
    RM --> RD
    US --> PG
    TS --> PG
    
    CS --> AIG
    RM --> PPM
`

### 3.2 Frontend Frameworks (Production)
*   **Buyer/Consumer Portal:** **React.js / Next.js** (TypeScript). Ideal for heavy data tables, complex dashboards, and SEO/performance optimizations.
*   **Farmer Application:** **Progressive Web App (PWA) / React Native**. Farmers require offline-first capabilities, low data-bandwidth consumption, and access to native device features (Camera for AI grading, GPS for location).
*   **State Management:** **Redux Toolkit** or **Zustand** for complex client-side state, paired with **React Query** for server-state caching and synchronization.

### 3.3 Backend & Microservices
*   **Framework:** **Node.js (NestJS)** or **Go (Golang)**. Node.js provides excellent asynchronous I/O for real-time tracking, while Go offers high performance for the heavy computational load of the Matching Engine.
*   **API Gateway:** **GraphQL** (Apollo Federation) or a robust REST API Gateway (Kong/AWS API Gateway) to route requests, handle rate limiting, and aggregate data for the frontends.
*   **Communication:** Inter-service communication via **gRPC** (synchronous) and **Apache Kafka / RabbitMQ** (asynchronous event streaming).

### 3.4 Data & Storage Layer
*   **Primary Relational Database:** **PostgreSQL**. Handles structured, transactional data (Users, Orders, Financials) with ACID compliance. PostGIS extension used for geospatial querying (finding farmers within an 'x' km radius).
*   **Search & Matching Engine:** **Elasticsearch**. Used to index active supplies and requirements, enabling hyper-fast, complex querying (e.g., "Find all Grade A Tomatoes within 50km available next week").
*   **Caching & Pub/Sub:** **Redis**. Handles session management, temporary matching state, and powers WebSockets for real-time notifications.
*   **Object Storage:** **AWS S3 / Google Cloud Storage** for storing crop images, AI grading proofs, and legal documents.

### 3.5 Real-Time Communication
*   **WebSockets (Socket.io / AWS API Gateway WebSockets):** Replaces the prototype's BroadcastChannel. Pushes live updates to the Buyer dashboard the millisecond a Farmer updates their supply, and tracks logistics vehicles in real-time on the map.

### 3.6 AI & Machine Learning Pipeline
*   **Crop Grading (Computer Vision):** Models deployed via **TensorFlow Serving** or **PyTorch**. The farmer uploads a photo, the model assesses color, size uniformity, and defects, returning an "AI Verified Grade" directly to the Crop & Supply Service.
*   **Fair Price Engine:** **Python (FastAPI)** microservice running regression models trained on historical APMC data, weather forecasts, and current platform demand to output real-time dynamic pricing.

### 3.7 DevOps & Infrastructure
*   **Hosting:** AWS or Google Cloud Platform (GCP).
*   **Containerization:** **Docker** images orchestrated by **Kubernetes (K8s)** for automated scaling during harvest seasons.
*   **CI/CD:** **GitHub Actions** or **GitLab CI** for automated testing, linting, and zero-downtime deployments.
*   **Monitoring:** **Datadog** or **Prometheus/Grafana** for infrastructure health, paired with **Sentry** for frontend/backend error tracking.

---

## 4. Security & Compliance
*   **Authentication:** OAuth 2.0 / JWT tokens, with SMS OTP verification for farmers.
*   **Data Protection:** At-rest encryption (AES-256) for PII and financial records. TLS 1.3 for in-transit data.
*   **Compliance:** Architecture designed to comply with agricultural data protection standards and localized financial transaction regulations.
