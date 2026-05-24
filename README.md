<div align="center">

# ⚡ FitnessTracker AI SaaS Platform ⚡

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=20&pause=1000&color=F97316&center=true&vCenter=true&width=500&lines=FitCoach+AI+Fitness+Intelligence;Secure+SaaS+Subscription+Platform;Modular+Django+REST+Architecture;High-Fidelity+React+UI+Experience)](https://git.io/typing-svg)

*An enterprise-ready, production-grade AI-powered fitness telemetry and coaching SaaS application.*

---

[![React Version](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![Django Version](https://img.shields.io/badge/Django-5.1-092E20?style=for-the-badge&logo=django)](https://djangoproject.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql)](https://postgresql.org)
[![Docker Support](https://img.shields.io/badge/Docker-Enabled-0db7ed?style=for-the-badge&logo=docker)](https://docker.com)
[![LLM Partner](https://img.shields.io/badge/Groq_Cloud-Llama_3.3_70B-orange?style=for-the-badge)](https://console.groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## 📖 Executive Summary & Features Overview

FitnessTracker is a SaaS ecosystem combining telemetry progress logging, master training programs, billing workflows, and live AI fitness/nutrition coaching. The system consists of a modular **Django REST Framework (DRF)** backend API and a **React (Vite) Single Page Application** featuring custom dark-mode aesthetics, custom modals, toasts, and skeleton loaders.

### Key Capabilities

*   **🔒 Secure JWT Auth System**: Implements a robust state manager with automatic token refresh, token rotation, and refresh token blacklisting.
*   **📊 Weight Intelligence & Telemetry**: Track weights, calculate body fat percentages, and analyze lean-to-fat mass conversion with interactive chart interfaces.
*   **🏋️ Training Hub & Workouts Catalog**: Direct integrations with exercise blueprint catalogs, program search filter interfaces, and locked log checks.
*   **💳 Self-Checkout Subscription Flows**: Nile Instapay and mobile cash receipt screenshot uploads matching payment ledger records.
*   **🧠 FitCoach AI Assistant Suite**: Conversational coaching sessions, macro calculators, and structured diet recommendations generated via the ultra-fast Groq API.
*   **🛠️ Modular Admin Panel**: Unified workspace to oversee analytics, promote roles, review billing receipts, change plan features, and check AI costs.

---

## 🛠️ Technology Stack Overview

### Frontend
- **Framework & Build**: React 19, Vite, Rolldown (fast bundling)
- **Styling & UI**: Vanilla CSS variables, dark-theme panels, HSL glassmorphism
- **Animations**: Framer Motion (page transitions, sidebar spring physics)
- **Charts**: Recharts (responsive line charts, telemetry grids)
- **Icons**: Lucide React

### Backend
- **Framework**: Django 5.1, Django REST Framework (DRF)
- **Auth**: SimpleJWT (JSON Web Token rotation & blacklisting)
- **AI Inference Engine**: Groq Cloud SDK (Llama 3.3 70B & Mixtral 8x7B models)
- **Database**: PostgreSQL 16
- **Routing**: DRF DefaultRouter under versioned `/api/v1/`
- **Rate Limiting**: DRF Throttles (60/min Anon, 1000/day User, 5/min AI)

### Containerization & Deployment
- **Orchestration**: Docker & Docker Compose
- **Web Server & Reverse Proxy**: Nginx (serving React SPA & proxying API traffic)
- **WSGI Server**: Gunicorn (multi-threaded concurrent workers)

---

## 📐 System & Database Architecture

The platform operates on a split-origin architecture, with the frontend React application running independently and communicating with the Django REST API via CORS-verified requests.

### Database Entity-Relationship Overview

The relational structure leverages **UUID primary keys** across all tables to protect system statistics.

```
                  ┌────────────────────────┐
                  │       users_user       │
                  └───────────┬────────────┘
                              │
         ┌────────────┬───────┴───────┬────────────┐
         │ (1-to-1)   │ (1-to-Many)   │ (1-to-Many)│ (1-to-Many)
         ▼            ▼               ▼            ▼
┌──────────────┐┌───────────┐  ┌─────────────┐┌──────────────┐
│users_profile ││ progress_  │  │  workouts_  ││  payments_   │
│              ││  prog_log │  │   workout   ││   payment    │
└──────────────┘└───────────┘  └─────────────┘└──────────────┘
                              │              │
                              │ (1-to-Many)  │ (1-to-Many)
                              ▼              ▼
                       ┌─────────────┐┌──────────────┐
                       │  workouts_  ││subscriptions_│
                       │ workout_log ││ subscription │
                       └─────────────┘└──────────────┘
```

---

## 🎨 UI/UX Features & Gated Capabilities

<details>
<summary><b>🤖 FitCoach AI Intelligence & Chat (Click to expand)</b></summary>

The AI engine includes three dedicated feature routes:
1.  **AI Coach (`/ai/coach`)**: Renders custom training suggestions and fitness advice.
2.  **AI Chat (`/ai/chat`)**: Multi-turn chat workspace with thread sidebars, auto-saving titles, and character warnings.
3.  **AI Nutrition (`/ai/nutrition`)**: BMR and TDEE calorie calculator that outputs customized nutrition spreadsheets via LLM.

- **Security Checks**: Sanitizes prompts to strip HTML tags, limits prompts to 2000 characters, and runs 9 regex checks to detect injection or jailbreak attempts.
- **Subscription Gates**: AI endpoints require an active subscription plan with the `ai_limit` capability set. Standard limit levels: Basic (10 prompts/mo), Premium (50 prompts/mo), Elite (200 prompts/mo).

</details>

<details>
<summary><b>💳 Instapay & Cash Checkout Approval Loop (Click to expand)</b></summary>

1.  **Selection**: Users choose a subscription plan tier.
2.  **Telemetry Receipt**: Users upload a screenshot image (`proof_image`) of the transaction and enter a transaction reference code.
3.  **Hold State**: The system creates a `subscriptions_subscription` record with status `PENDING_APPROVAL`.
4.  **Admin Ledger**: The admin inspects the receipt screenshot image, checks validation codes, and clicks **Approve** to activate the subscription immediately.

</details>

<details>
<summary><b>🛠️ Unified Administrative command panel (Click to expand)</b></summary>

Features 9 sub-directories restricted strictly to `ADMIN` roles:
-   **Dashboard (`/admin`)**: Registration growth curves and pending approvals checklist.
-   **Users (`/admin/users`)**: Promotion toggles, account suspension controls, and data views.
-   **Subscriptions (`/admin/subscriptions`)**: screenshot validation grids and manual activations.
-   **Plans (`/admin/plans`)**: CRUD editor for limits, durations, and pricing.
-   **AI Usage (`/admin/ai`)**: Cumulative API dollar cost telemetry and latency tracking graphs.

</details>

---

## 📂 Project Directory Structure

```
FitnessTracker/
├── backend/                    # Django REST Framework backend
│   ├── apps/                   # Modular Django applications
│   │   ├── users/              # Auth, profiles, registration
│   │   ├── workouts/           # Exercise catalogue, workouts, and logging
│   │   ├── progress/           # Weight and metrics tracking
│   │   ├── subscriptions/      # Subscription plans and active memberships
│   │   ├── payments/           # Financial transactions and receipt proofs
│   │   ├── notifications/      # System notifications and logs
│   │   ├── ai/                 # Groq client, chats, and usages tracking
│   │   └── common/             # Shared helpers, permissions, and throttles
│   ├── config/                 # Settings routing & environment splits
│   └── manage.py
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── app/                # Layout structures, routing entries
│   │   ├── features/           # Feature workspaces (auth, progress, admin)
│   │   ├── shared/             # Reusable elements (custom modals, skeletons)
│   │   └── main.jsx
│   └── vite.config.js
├── docker-compose.yml          # Container configuration
└── .gitignore                  # Git publishing configuration
```

---

## ⚙️ Installation & Local Development

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL 16+

### 1. Database Setup
Ensure PostgreSQL is active and create the application database:
```sql
CREATE DATABASE fitnesstracker_db;
```

### 2. Backend Installation & Start
1.  Navigate into `/backend`.
2.  Create and activate a python virtual environment:
    ```bash
    python -m venv .venv
    # Windows:
    .venv\Scripts\activate
    # Linux/Mac:
    source .venv/bin/activate
    ```
3.  Install requirements:
    ```bash
    pip install -r requirements.txt
    ```
4.  Create a `.env` file from the example template:
    ```bash
    cp .env.example .env
    ```
5.  Configure database credentials and the Groq API key inside `.env`.
6.  Run backend migrations:
    ```bash
    python manage.py migrate
    ```
7.  Bootstrap the default system admin user:
    ```bash
    python manage.py create_admin
    ```
8.  Start the DRF development server:
    ```bash
    python manage.py runserver
    ```

### 3. Frontend Installation & Start
1.  Navigate into `/frontend`.
2.  Install packages:
    ```bash
    npm install
    ```
3.  Start the Vite developer server:
    ```bash
    npm run dev
    ```
    The application will load at `http://localhost:5173`.

---

## 🐳 Docker Deployment & Port Configurations

Run the entire suite inside isolated multi-stage Docker containers using Docker Compose.

### Port Mappings
- **Frontend SPA / Nginx**: Listens on port `80` (mapped to `http://localhost:80` or `http://localhost`).
- **Backend DRF API**: Listens internally on port `8000`.
- **PostgreSQL Database**: Listens internally on port `5432` with a persistent named volume `postgres_data`.

### Build & Run Commands
```bash
# Build all multi-stage containers
docker compose build

# Start the environment in background mode
docker compose up -d

# Check service container status
docker compose ps

# View backend logs in real-time
docker compose logs -f backend
```

---

## 🔒 Security Architecture Highlights

We applied high-fidelity security controls to protect user data and resources:

1.  **Split Header COOP Handling**: Disables automatic `Cross-Origin-Opener-Policy: same-origin` headers on API endpoints to prevent CORS cross-origin blocks, while enforcing it strictly on HTML admin resources.
2.  **Anti-Jailbreak Prompt Sanitization**: Blocks 9 regex-identified injection strings and restricts prompt inputs to 2000 characters.
3.  **JWT Rotation & Blacklisting**: Enforces 15-minute token expirations, rotates refresh tokens, and blacklists used tokens immediately.
4.  **Rotating Logging System**: Restricts disk storage leaks by rotating log outputs every 5MB, maintaining up to 5 generations of files.
5.  **Strict File Upload Gating**: Validates media upload file types using magic-header bytes and maps random hashes to uploaded billing files.

---

## 💡 Challenges Faced & Solutions Implemented

### 1. Cross-Origin Rejections (CORS / CSRF)
- **Challenge**: The React frontend failed to login with CORS blocks even with OPTIONS returning 200.
- **Solution**: Traced Django's middleware chain. We found `CsrfViewMiddleware` was rejecting POST payloads on origin mismatch and `SecurityMiddleware` was forcing `COOP: same-origin` on JSON outputs. We configured `CSRF_TRUSTED_ORIGINS` to match allowed CORS origins, disabled default COOP in local configurations, and handled it selectively inside a custom `SecurityHeadersMiddleware`.

### 2. Telemetry Log Integrity (Locked Logs)
- **Challenge**: Users could manipulate history logs after receiving AI progress insights, which distorted cumulative trend curves.
- **Solution**: Developed a locking database system. When a log is processed by the AI insights generator, `is_locked` is flagged `True`. Further PUT/DELETE operations are blocked by custom serializer validation rules.

---

## 🛣️ Roadmap & Future Scopes
- [ ] Direct integration with Stripe payment gateways.
- [ ] Integration of WebSockets for instant AI chat responses.
- [ ] Integration of push notification alerts for mobile web browsers.
- [ ] User custom training program templates.

---

## 📄 License & Author

- **License**: Distributed under the MIT License. See `LICENSE` for more details.
- **Author**: Hussein A-H
