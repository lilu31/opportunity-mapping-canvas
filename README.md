# 🗺️ Opportunity Mapping Canvas

A collaborative SaaS tool for **Opportunity Mapping** based on an adapted version of [Teresa Torres](https://www.producttalk.org/) Continuous Discovery framework. Visually map out business & customer opportunities, define success metrics, and track targeted outcomes — all in a real-time, AI-powered interactive canvas.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![React Flow](https://img.shields.io/badge/React_Flow-Interactive_Canvas-06B6D4?style=flat-square)
![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_Realtime-3ECF8E?style=flat-square&logo=supabase)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai)

---

## ✨ Features

- **Interactive Canvas** — Drag, connect, and arrange opportunity nodes with React Flow
- **Two Opportunity Types** — Business (orange) and Customer (blue) with distinct visual themes
- **Nested Hierarchy** — Success Metrics and Targeted Outcomes live inside each Opportunity card
- **AI-Powered Refinement** — One-click "Improve with AI" (GPT-4o) to sharpen descriptions
- **Real-time Sync** — Supabase Realtime channels keep collaborative sessions in sync
- **Auto-Persistence** — Debounced save to PostgreSQL ensures no work is lost
- **Data Table View** — Toggle between canvas and a structured table showing all entities, their hierarchy, and edge connections
- **Multi-Map Workspace** — Create, rename, and manage multiple opportunity maps
- **Auth** — Supabase Auth with Google OAuth and email/password fallback

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| UI | Tailwind CSS, shadcn/ui, Lucide Icons |
| Canvas | React Flow (@xyflow/react) |
| State | Zustand |
| Database | Supabase (PostgreSQL + JSONB) |
| Auth | Supabase Auth (Google OAuth, Email/Password) |
| AI | OpenAI GPT-4o |
| Realtime | Supabase Realtime (Postgres Changes) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [OpenAI](https://platform.openai.com) API key

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/eternal-asteroid.git
cd eternal-asteroid
npm install
```

### 2. Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-key
```

### 3. Database Setup

Run the migration in your Supabase SQL Editor:

```bash
# Located at:
supabase/migrations/20260415234100_init.sql
```

This creates the `users`, `boards`, `nodes`, and `edges` tables with Row Level Security policies.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/improve/       # AI refinement endpoint (auth-protected)
│   ├── auth/callback/      # OAuth callback
│   ├── login/              # Login page
│   ├── map/
│   │   ├── [id]/           # Individual map view (canvas + table)
│   │   └── new/            # Map creation endpoint
│   └── page.tsx            # Dashboard / workspace
├── components/
│   ├── canvas/
│   │   ├── MappingCanvas   # React Flow canvas wrapper
│   │   ├── OpportunityNode # Compound node (metrics + outcomes)
│   │   └── RealtimeMapSync # Supabase realtime subscription
│   ├── dashboard/
│   │   └── MapCard         # Dashboard map card with delete modal
│   └── map/
│       └── TableView       # Structured data table
├── store/
│   ├── useCanvasStore      # Zustand state (nodes, edges, mutations)
│   └── useSupabasePersist  # Debounced DB persistence hook
└── utils/supabase/         # Supabase client/server/middleware
```

---

## 🎨 Data Model

Each **Opportunity** node contains nested sub-fields:

```
Opportunity (Business | Customer)
├── Title & Description
├── Success Metrics[]
│   ├── Title
│   └── Targeted Outcomes[]
│       ├── Title
│       └── Description
└── Canvas Edges (connections to other Opportunities)
```

Metrics and Outcomes are stored as JSONB within the node's `data` column — no separate tables needed.

---

## 📄 License

MIT
