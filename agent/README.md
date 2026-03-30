# Qyro — AI-Powered Q&A Generation Agent

> **Qyro** is a full-stack AI application that generates high-quality, curriculum-aligned Q&A pairs for any CS subject. It uses a parallel LangGraph agent pipeline with multi-stage deduplication to ensure every question is unique, well-structured, and stored persistently.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Agent Pipeline (LangGraph)](#agent-pipeline-langgraph)
6. [API Reference](#api-reference)
7. [Database Schema](#database-schema)
8. [Environment Variables](#environment-variables)
9. [Getting Started](#getting-started)
   - [Local Development](#local-development)
   - [Docker Setup](#docker-setup)
10. [Frontend (Client)](#frontend-client)
11. [Deployment](#deployment)

---

## Overview

Qyro allows users to generate batches of multiple-choice and analytical questions on any computer science topic. The system is designed around three core principles:

- **No duplicates** — A multi-stage deduplication pipeline (vector similarity + LLM validation + cross-batch comparison) guarantees unique questions every run.
- **Bloom's Taxonomy alignment** — Questions are tagged with Bloom levels (L1–L7), enabling targeted learning experiences from basic recall to creative synthesis.
- **Bring Your Own Keys** — All AI API keys (Gemini, Groq, HuggingFace) are stored per-user in the database. No keys are hard-coded.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React Frontend                       │
│        (Vite + JSX, chat-style UI, streaming output)        │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP / SSE Streaming
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend (Python)                   │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │  /v1/generate│  │  /v1/metadata │  │   /v1/chats      │  │
│  └──────┬───────┘  └───────────────┘  └──────────────────┘  │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────┐                            │
│  │    LangGraph Agent Graph    │                            │
│  │  (parallel fan-out/fan-in)  │                            │
│  └──────────────┬──────────────┘                            │
└─────────────────┼───────────────────────────────────────────┘
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
┌─────────────┐     ┌──────────────────┐
│  PostgreSQL │     │  Pinecone Vector │
│  (SQLAlchemy│     │  DB (embeddings) │
│  / Alembic) │     └──────────────────┘
└─────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), plain CSS |
| **Backend** | FastAPI, Python 3.11 |
| **Agent Orchestration** | LangGraph |
| **LLM – Question Gen** | Google Gemini (`gemini-3.1-flash-lite-preview`) |
| **LLM – Answer Gen** | Google Gemini (secondary key) |
| **LLM – Duplicate Check** | Groq (`llama-3.1-8b-instant`) |
| **Embeddings** | HuggingFace (`sentence-transformers/all-MiniLM-L6-v2`) |
| **Vector DB** | Pinecone |
| **Relational DB** | PostgreSQL 15 |
| **ORM & Migrations** | SQLAlchemy + Alembic |
| **Containerization** | Docker + Docker Compose |
| **Deployment** | Railway (backend), Vercel (frontend) |

---

## Project Structure

```
questionAgent/
├── docker-compose.yml          # Orchestrates the agent + PostgreSQL containers
│
├── agent/                      # FastAPI backend
│   ├── main.py                 # App entrypoint, CORS config, router registration
│   ├── Dockerfile              # Python 3.11-slim container, runs alembic + uvicorn
│   ├── requirements.txt        # Python dependencies
│   ├── alembic.ini             # Alembic migration config
│   │
│   ├── graph/
│   │   └── graph.py            # LangGraph StateGraph definition (node + edge wiring)
│   │
│   ├── state/
│   │   └── state.py            # TypedDict State — shared data flowing through the graph
│   │
│   ├── services/               # Core agent logic (each node maps to a service)
│   │   ├── generate_question.py   # Calls Gemini to produce a QuestionSet
│   │   ├── generate_answers.py    # Calls Gemini to produce answers for all questions
│   │   ├── check_duplicate.py     # 3-stage dupe check (vector → cosine → LLM)
│   │   ├── cross_deduplication.py # Intra-batch dupe removal after fan-in
│   │   ├── create_memory.py       # Saves unique Q&As to PostgreSQL + Pinecone
│   │   ├── embeddings.py          # HuggingFace embeddings factory
│   │   ├── vector_store.py        # Pinecone vector store factory
│   │   └── llm.py                 # Shared LLM utilities
│   │
│   ├── fan_in/
│   │   ├── start_router.py        # Initializes parallel run metadata
│   │   └── after_duplicate_check.py  # Fan-in: merges results after per-Q dupe check
│   │
│   ├── parallel_workflows/
│   │   ├── fan_outs_runs.py          # Fan-out: splits into N parallel runs
│   │   └── fan_out_duplicate_check.py # Fan-out: spawns one dupe-check per question
│   │
│   ├── routes/v1/
│   │   ├── q_a.py              # POST /v1/generate/stream — streaming Q&A generation
│   │   ├── metadata.py         # GET /v1/metadata/* — subjects, difficulties, bloom levels
│   │   └── chats.py            # CRUD for users, sessions, messages, and settings
│   │
│   ├── models/
│   │   ├── models.py           # SQLAlchemy ORM models (QATable, User, Session, Message…)
│   │   ├── questions.py        # Pydantic models for Question & QuestionSet
│   │   └── answers.py          # Pydantic models for Answer & AnswerSet
│   │
│   ├── schemas/
│   │   └── initial_state.py    # Pydantic schema for the /stream request body
│   │
│   ├── prompts/                # System & user prompts for each LLM call
│   ├── db/
│   │   └── db.py               # SQLAlchemy engine + Session factory
│   └── alembic/                # Migration scripts
│
└── client/                     # React frontend
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx             # Main app (routing, chat UI, settings panel)
        ├── index.css           # Global styles (dark theme, animations)
        └── main.jsx            # React entry point
```

---

## Agent Pipeline (LangGraph)

The heart of Qyro is a **parallel LangGraph StateGraph** that fans out across multiple independent generation runs and then fans in to produce a deduplicated, high-quality question set.

### Graph Topology

```
START
  │
  ▼
start_router          ← initializes run metadata
  │
  ├─── (fan-out: N parallel runs) ─────────────────────┐
  │                                                     │
  ▼                                                     ▼
generate_question (run 0)             generate_question (run 1)  …
  │                                                     │
  ├─ (fan-out: one branch per Q) ──┐  (same per run)   │
  │                                │                   │
  ▼                                ▼                   │
check_duplicates (Q1)   check_duplicates (Q2)  …       │
  │                                │                   │
  └────────────── (fan-in) ────────┘                   │
  ▼                                                     │
after_duplicate_check                                   │
  │                                                     │
  ▼                                                     │
generate_answer                                         │
  │                                                     │
  └──────────────────── (fan-in all runs) ──────────────┘
  ▼
cross_batch_deduplicate   ← removes intra-batch duplicates
  │
  ▼
create_memory             ← saves unique Q&As to PostgreSQL + Pinecone
  │
  ▼
END
```

### Nodes Explained

| Node | Description |
|---|---|
| `start_router` | Initializes the `run_id` counter and sets up parallel workflow metadata. |
| `generate_question` | Calls Gemini with a structured prompt to produce `N` questions (MCQ or analytical) tagged with Bloom level, difficulty, and topic tags. |
| `check_duplicates` | **3-stage deduplication per question:** ① Vector search in Pinecone (retrieves nearest neighbor by subject). ② Cosine similarity check: `< 0.6` → unique (skip LLM), `> 0.9` → duplicate (skip LLM). ③ Borderline (`0.6–0.9`): calls Groq LLM for a structured `QuestionExists` judgment. Falls back to embedding score if LLM fails. |
| `after_duplicate_check` | Fan-in node that merges duplicate check results from all per-question branches. |
| `generate_answer` | Calls Gemini (secondary key) to generate explanatory answers for all questions in the current run. |
| `cross_batch_deduplicate` | After all runs fan-in, embeds all questions and runs a greedy cosine-similarity check across the **combined batch** (threshold: `0.82`). Drops later duplicates found within the same generation run. |
| `create_memory` | Filters out all flagged duplicates, saves remaining Q&A pairs to PostgreSQL, and batch-inserts their embeddings into Pinecone. Supports a user-provided custom `database_uri`. |

---

## API Reference

### Base URL
- **Local:** `http://localhost:8000`
- **Production:** deployed on Railway

---

### `GET /`
Health check.

**Response:**
```json
{ "message": "Qyro backend is running!" }
```

---

### `POST /v1/generate/stream`
Starts Q&A generation. Returns a **streaming response** (newline-delimited JSON).

**Rate limit:** Once per 120 seconds per IP.

**Request Body:**
```json
{
  "user_id": "uuid-string",
  "subject": "Data Structures & Algorithms (DSA)",
  "subject_description": "Optional extra context",
  "difficulty": "medium",
  "bloom_level": "L3 - Apply",
  "N": 5,
  "parallel_workflows": 2
}
```

| Field | Type | Description |
|---|---|---|
| `user_id` | `string` | UUID identifying the user (for API key lookup) |
| `subject` | `string` | Question subject |
| `subject_description` | `string?` | Optional context for the LLM |
| `difficulty` | `string` | `easy`, `medium`, or `hard` |
| `bloom_level` | `string?` | Bloom taxonomy level (e.g. `L3 - Apply`). If omitted, generates mixed levels. |
| `N` | `int` | Number of questions per parallel run |
| `parallel_workflows` | `int` | Number of parallel generation runs |

**Stream Events (newline-delimited JSON):**

```
{"step": "started"}
{"step": "progress", "data": "..."}
{"step": "result", "result": [...]}
{"step": "completed"}
// or on error:
{"step": "error", "message": "..."}
```

**Result item schema:**
```json
{
  "id": 1,
  "question_text": "Which data structure uses LIFO ordering?",
  "difficulty": "medium",
  "bloom_level": "L1 - Recall",
  "topic_tags": ["Stack", "LIFO"],
  "options": { "A": "Queue", "B": "Stack", "C": "Deque", "D": "Heap" },
  "correct_option": "B",
  "answer": "A Stack uses Last-In-First-Out (LIFO) ordering..."
}
```

> **⚠️ Prerequisite:** The user must have Gemini, Groq, and HuggingFace API keys saved in their settings before calling this endpoint.

---

### `GET /v1/metadata/all`
Returns all subjects, difficulties, and Bloom taxonomy levels. Seeds defaults if tables are empty.

**Response:**
```json
{
  "subjects": [{ "id": 1, "group": "Core Computer Science", "name": "DSA", "description": "..." }],
  "difficulties": [{ "id": 1, "name": "easy" }],
  "bloom_levels": [{ "id": 1, "name": "L1 - Recall" }]
}
```

Other metadata endpoints: `GET /v1/metadata/subjects`, `GET /v1/metadata/difficulties`, `GET /v1/metadata/bloom_levels`

---

### `POST /v1/chats/init_user`
Creates or retrieves an anonymous user session (UUID-based).

**Request Body:**
```json
{ "user_id": "existing-uuid-or-null" }
```
**Response:** `{ "user_id": "uuid" }`

---

### `GET /v1/chats/settings/{user_id}`
Retrieves saved API keys for a user.

**Response:**
```json
{
  "gemini_api_key": "...",
  "gemini_api_key_2": "...",
  "groq_api_key": "...",
  "groq_api_key_2": "...",
  "huggingfacehub_api_token": "...",
  "database_uri": "..."
}
```

---

### `PUT /v1/chats/settings/{user_id}`
Saves or updates API keys for a user.

**Request Body:** Same fields as above (all optional).

---

### `POST /v1/chats/sessions`
Creates or updates a chat session.

**Request Body:**
```json
{
  "id": "session-uuid",
  "user_id": "user-uuid",
  "label": "DSA - hard",
  "q_count": 5
}
```

---

### `GET /v1/chats/sessions/{user_id}`
Returns all unique chat sessions for a user (deduplicated by label, newest first).

**Response:**
```json
[{ "id": "...", "label": "DSA - hard", "qCount": 5 }]
```

---

### `POST /v1/chats/messages`
Upserts a chat message in a session.

**Request Body:**
```json
{
  "id": "message-uuid",
  "session_id": "session-uuid",
  "type": "assistant",
  "payload": { ... }
}
```

---

### `GET /v1/chats/sessions/{session_id}/messages`
Returns all messages in a session, ordered chronologically.

---

## Database Schema

All tables are managed by **Alembic** migrations.

```
┌─────────────────┐     ┌───────────────────┐
│     users       │     │   user_settings    │
├─────────────────┤     ├───────────────────┤
│ id (PK, UUID)   │──┐  │ user_id (PK, FK)  │
│ created_at      │  │  │ gemini_api_key    │
└─────────────────┘  │  │ gemini_api_key_2  │
                     │  │ groq_api_key      │
                     │  │ groq_api_key_2    │
                     │  │ huggingfacehub_..│
                     │  │ database_uri      │
                     │  │ updated_at        │
                     │  └───────────────────┘
                     │
                     │  ┌───────────────────┐     ┌──────────────────┐
                     └─►│  chat_sessions    │     │  chat_messages   │
                        ├───────────────────┤     ├──────────────────┤
                        │ id (PK, UUID)     │──┐  │ id (PK, UUID)    │
                        │ user_id (FK)      │  │  │ session_id (FK)  │
                        │ label             │  └─►│ type             │
                        │ q_count           │     │ payload (JSON)   │
                        │ created_at        │     │ created_at       │
                        └───────────────────┘     └──────────────────┘

┌──────────────────────────┐
│        qa_table          │   ← Generated Q&A pairs
├──────────────────────────┤
│ question_id (PK, String) │
│ question_text (Text)     │
│ answer_text (Text)       │
│ subject                  │
│ difficulty               │
│ bloom_level              │
│ topic_tags (Array)       │
└──────────────────────────┘

┌───────────────┐  ┌────────────────┐  ┌───────────────────┐
│   subjects    │  │  difficulties  │  │  bloom_taxonomies │
├───────────────┤  ├────────────────┤  ├───────────────────┤
│ id (PK)       │  │ id (PK)        │  │ id (PK)           │
│ name          │  │ name           │  │ name              │
│ description   │  └────────────────┘  └───────────────────┘
│ subject_group │
└───────────────┘
```

---

## Environment Variables

Create `agent/.env` with the following variables:

```env
# Primary Database (used if user doesn't supply their own)
DATABASE_URI=postgresql://postgres:1234@localhost:5432/q&a_dataset

# Pinecone (the only service key that lives in .env, not per-user DB)
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=your_index_name

# Optional: fallback HF token (user-provided key takes precedence)
HUGGINGFACEHUB_API_TOKEN=hf_...
```

> **Note:** All Gemini and Groq API keys are stored **per-user in the database**, not in `.env`. This enables the "bring your own keys" model.

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (or Docker)
- A [Pinecone](https://pinecone.io) account and index
- API keys for: [Google Gemini](https://aistudio.google.com), [Groq](https://console.groq.com), [HuggingFace](https://huggingface.co/settings/tokens)

---

### Local Development

#### 1. Backend

```bash
cd agent

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env  # then edit with your values

# Run database migrations
alembic upgrade head

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

#### 2. Frontend

```bash
cd client

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

### Docker Setup

The easiest way to run the full stack locally is with Docker Compose.

```bash
# From the project root
docker compose up --build
```

This starts:
- **`qyro_db`** — PostgreSQL 15 on port `5432`
- **`qyro_agent`** — FastAPI backend on port `8000` (runs `alembic upgrade head` on startup)

> Make sure `agent/.env` contains your `PINECONE_API_KEY` and other variables before running.

---

## Frontend (Client)

The frontend is a React (Vite) single-page application with a **chat-style UI**.

### Key Features

- **Chat Sessions** — Each generation run is saved as a named chat session, accessible from a sidebar history.
- **Streaming UI** — The generation stream (SSE/newline-delimited JSON) is consumed in real time, showing progress steps as they arrive.
- **Settings Panel** — Users can enter and save their Gemini, Groq, HuggingFace API keys, and optionally a custom PostgreSQL URI.
- **Anonymous Auth** — A UUID is generated on first visit and stored in `localStorage`, persisting the user identity across sessions.
- **Q&A Cards** — Generated questions are displayed as expandable cards showing question text, options, correct answer, Bloom level, and topic tags.

### Building for Production

```bash
cd client
npm run build
```

Output will be in `client/dist/`.

---

## Deployment

### Backend (Railway)

The `agent/Dockerfile` is configured for Railway:

- Listens on `${PORT:-8000}` (Railway injects `$PORT` dynamically).
- Runs `alembic upgrade head` automatically on container start.
- Set the following environment variables in Railway:
  - `DATABASE_URI` — PostgreSQL connection string (use Railway's PostgreSQL plugin)
  - `PINECONE_API_KEY`
  - `PINECONE_INDEX_NAME`

### Frontend (Vercel)

- Connect the `client/` directory to a Vercel project.
- Set the build command to `npm run build` and output directory to `dist`.
- Update the CORS `origins` list in `agent/main.py` to include your Vercel deployment URL.

---

## Key Design Decisions

### Why LangGraph?
LangGraph's `StateGraph` makes it straightforward to express complex parallel fan-out/fan-in workflows as a declarative graph, rather than manually managing threads or async tasks.

### Why 3-stage deduplication?
- **Stage 1 (Vector search):** Cheap and fast — filters obviously unique questions without any ML inference.
- **Stage 2 (Cosine similarity):** Catches near-duplicates without an expensive LLM call for clear-cut cases.
- **Stage 3 (LLM):** Reserved only for the ambiguous `0.6–0.9` similarity range, where semantic nuance matters.
- **Stage 4 (Cross-batch):** Catches duplicates *within the same generation run* that the vector DB (which only contains past questions) would miss.

### Why "Bring Your Own Keys"?
This lets users point Qyro at their own Gemini/Groq quotas and even their own PostgreSQL instance, making the system fully self-hostable without relying on a shared API budget.
