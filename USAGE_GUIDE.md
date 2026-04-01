# How to Use Qyro

> Qyro generates unique, high-quality Q&A sets on any CS topic using AI. This guide walks you through everything from first visit to downloading your questions.

---

## Table of Contents

1. [First Visit — Getting Started](#1-first-visit--getting-started)
2. [Step 1 — Add Your API Keys](#2-step-1--add-your-api-keys)
3. [Step 2 — Generate Questions](#3-step-2--generate-questions)
4. [Step 3 — Read Your Results](#4-step-3--read-your-results)
5. [Chat History](#5-chat-history)
6. [Tips & Best Practices](#6-tips--best-practices)
7. [FAQ](#7-faq)

---

## 1. First Visit — Getting Started

Open the site at **[https://qyro-ten.vercel.app](https://qyro-ten.vercel.app)**.

- On first load, Qyro automatically creates an **anonymous account** for you using a UUID stored in your browser. You don't need to sign up or log in.
- Your session and history are tied to this browser. **Don't clear your browser storage** or you'll lose your history.

> [!IMPORTANT]
> The site requires **your own API keys** to generate questions (see Step 1). Nothing works without them.

---

## 2. Step 1 — Add Your API Keys

Before generating anything, you must add your API keys. Qyro uses a **"bring your own keys"** model — your keys are stored only in the app's database under your anonymous ID, never shared.

### How to open Settings

Click the **⚙ gear icon** in the top-right corner of the interface.

### Keys you need

| Key | Where to get it | Required? |
|---|---|---|
| **Gemini API Key** | [aistudio.google.com](https://aistudio.google.com) → Get API key | ✅ Yes |
| **Gemini API Key 2** | Same as above — a second key to split load | Optional |
| **Groq API Key** | [console.groq.com](https://console.groq.com) → API Keys | ✅ Yes |
| **Groq API Key 2** | Same, a second Groq key | Optional |
| **HuggingFace Token** | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) → New token (read) | ✅ Yes |
| **Custom Database URI** | A hosted PostgreSQL string (e.g. from [Neon](https://neon.tech)) | Optional |

### Steps

1. Paste each key into its field.
2. Click **Save**.
3. Close the settings panel.

> [!TIP]
> **Why two keys for Gemini/Groq?** The agent runs multiple parallel pipelines simultaneously. Having two keys prevents hitting rate limits during big generation runs.

> [!NOTE]
> **Custom Database URI** — If you provide your own hosted PostgreSQL URI (like from [Neon](https://neon.tech) or Supabase), Qyro saves generated Q&As directly to your database. **`localhost` strings will NOT work** because the cloud app cannot reach your personal computer. If left blank, questions are saved to Qyro's shared database.

---

## 3. Step 2 — Generate Questions

Once your keys are saved, use the form in the main chat area to configure your generation run.

### Configuration fields

#### Subject
Pick from a categorized list of CS topics:

| Category | Example Subjects |
|---|---|
| Core CS | DSA, DBMS, Operating Systems, Computer Networks |
| Software Engineering | OOP, System Design, Software Engineering |
| Web & Mobile | Web Development, Mobile App Development |
| AI & Data | Machine Learning, Data Science, AI |
| Infrastructure | DevOps, Cloud Computing |
| Security & Web3 | Cybersecurity, Blockchain |

#### Difficulty
Choose how hard the questions should be:
- **Easy** — Recall and basic concept questions
- **Medium** — Requires understanding of internals and trade-offs
- **Hard** — Deep analysis, edge cases, and production-level reasoning

#### Bloom's Taxonomy Level
Controls the *cognitive depth* of questions. Leave blank for a mix.

| Level | What it tests |
|---|---|
| L1 — Recall | Can you remember the fact? |
| L2 — Understand | Can you explain it? |
| L3 — Apply | Can you use it in a scenario? |
| L4 — Analyze | Can you break it down and compare? |
| L5 — Evaluate | Can you judge and justify? |
| L6 — Create | Can you design something using it? |
| L7 — Innovate | Can you propose something new? |
| Mixed Bloom | Automatically distributes across levels |

#### Number of Questions (N)

How many questions to generate **per parallel run**. Start with `5` if you're testing.

#### Parallel Workflows

How many independent generation pipelines to run simultaneously. `2` parallel workflows with `N=5` will attempt to produce up to 10 questions (duplicates are automatically removed).

> [!TIP]
> **Recommendation:** Start with `N=5`, `Parallel Workflows=2`. Increase once you're familiar with generation time.

### Start generation

Click **Generate** (or press Enter). The button will be disabled while generation is in progress.

---

## 4. Step 3 — Read Your Results

Generation happens in real time — you'll see status messages appear in the chat as the agent works:

```text
Starting generation...
Generating questions...
Checking for duplicates...
Generating answers...
Done! X questions generated.
```

### Question cards

Each generated question appears as a card with:

| Field | Description |
|---|---|
| **Question** | The full question text |
| **Options** (A/B/C/D) | Multiple choice options |
| **Correct Answer** | The right option, highlighted |
| **Answer Explanation** | A detailed, dense explanation |
| **Bloom Level** | The cognitive level this question targets |
| **Difficulty** | Easy / Medium / Hard |
| **Topic Tags** | Specific sub-topics this question covers |

Click on a card to expand the full answer and explanation.

---

## 5. Chat History

Every generation run is saved as a **chat session** in the left sidebar, labeled with the subject you chose.

### Navigating history

- Click any session in the sidebar to reload that conversation.
- Sessions are ordered **newest first**.
- Each session shows the subject name and how many questions were generated (`Q: 5`).

> 💡 History is tied to your anonymous browser session. It persists across page refreshes as long as you don't clear your browser's local storage.

---

## 6. Tips & Best Practices

### Getting the best questions

- **Be specific with subject** — "Data Structures & Algorithms" will generate more focused questions than a broad topic.
- **Use a subject description** — If the form has a description field, add context like *"Focus on graph algorithms and dynamic programming"* to guide the LLM.
- **Match difficulty to your goal** — Use `easy` to review fundamentals, `hard` to prepare for technical interviews.
- **Use Mixed Bloom for comprehensive sets** — A Mixed Bloom run produces variety from recall (L1) up to creative (L6/L7).

### Rate limiting

- You can only start a new generation **once every 2 minutes** (per IP). This is intentional to prevent API key exhaustion.
- If you see a *"Please wait X seconds"* message, just wait before trying again.

### Using two API keys

- If generation is slow or fails with rate limit errors, go to ⚙ Settings and add a **second Gemini key** and a **second Groq key**.
- The agent automatically alternates between key 1 and key 2 across parallel runs.

---

## 7. FAQ

**Q: Do I need to create an account?**
No. Qyro uses anonymous UUID-based sessions. Your identity is stored in your browser.

**Q: Where are my API keys stored?**
In Qyro's PostgreSQL database, linked to your anonymous UUID. They are never logged, printed, or shared.

**Q: Why does generation take 30–90 seconds?**
The agent runs multiple LLM calls in parallel (question generation, duplicate checking, answer generation) and waits for all of them to complete before returning results. This is normal.

**Q: I got fewer questions than I asked for — why?**
The deduplication pipeline removes questions that are too similar to ones already in the database OR similar to each other within the same run. This is by design — quality over quantity.

**Q: Can I use `localhost` as my database?**
Only if you are running the **Agent (Backend) locally** on your computer. If your Agent is hosted on **Railway**, it cannot see your `localhost` (it will try to connect to itself on Railway's server). For the Cloud Agent, you must use a hosted database like **Neon**, **Supabase**, or **Railway's PostgreSQL**.

**Q: Can I use Qyro for subjects other than CS?**
The subject list is currently fixed to CS topics. Custom subject input may be added in future versions.
