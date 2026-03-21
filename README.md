<p align="center">
  <strong>✦ R E A V E S</strong>
</p>

<h3 align="center">Research Evaluation and Verification Expert System</h3>

<p align="center">
  <em>A Cognitive Research Architecture bridging raw data and verified academic insight.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Gemini_2.5_Flash-AI-4285F4?style=flat-square&logo=google" alt="Gemini" />
  <img src="https://img.shields.io/badge/Chrome_Extension-MV3-4285F4?style=flat-square&logo=googlechrome" alt="Chrome Extension" />
  <img src="https://img.shields.io/badge/Design-Lakers_Protocol-FDB927?style=flat-square" alt="Lakers Protocol" />
</p>

---

## 🧠 The Vision

**REAVES** is not just a browser extension — it is a **Cognitive Research Architecture** built for the modern academic. It sits at the intersection of AI synthesis, real-time credibility scoring, and contextual knowledge retrieval.

Traditional research workflows break at scale. A student reads a paper, questions a claim, and loses 30 minutes context-switching between tabs, Google Scholar, and citation databases. REAVES compresses that entire pipeline into a single side panel — always present, always aware of what you're reading.

> **Design Philosophy:** REAVES follows the **Lakers Color Protocol** — a dual-tone visual system inspired by the Los Angeles Lakers. **Gold (#FDB927)** represents ground-truth, document-locked analysis. **Purple (#552583 / #a855f7)** represents expansive, boundary-free global synthesis.

---

## ⚡ Feature Modules

### 🛡️ Dual-Mode Analyze Chat — *The Command Center*

The crown jewel of REAVES. A context-aware AI chat that operates in two distinct cognitive modes:

| Mode | Color | Codename | Behavior |
|------|-------|----------|----------|
| **Local Page** | 🟡 Lakers Gold | `DOCUMENT-LOCKED` | The AI acts as a **Document Auditor**. Knowledge is strictly limited to the text of the current page. Every claim is grounded in the article. If the answer isn't in the document, it says so. |
| **Global Web** | 🟣 Cyber Purple | `GLOBAL SYNTHESIS` | The AI becomes a **Senior Research Consultant**. It uses its full training data to answer — history, science, sports, culture. Page content becomes *optional reference*. Ask about LeBron, quantum physics, or the French Revolution and it delivers. |

**How It Works:**
1. The extension extracts the current page's text via DOM traversal (selectors: `article`, `main`, `[role="main"]`, `.content`, `body`)
2. In **Local Mode**, the text is labeled `PAGE_CONTENT (THE ONLY SOURCE OF TRUTH)` and sent with `RAG_SYSTEM_PROMPT` — the AI is a strict evidence engine
3. In **Global Mode**, the text is labeled `OPTIONAL_REFERENCE_CONTEXT` and sent with `GLOBAL_SYSTEM_PROMPT` — the AI is free to synthesize broadly
4. The `mode` flag travels through the API to ensure the server uses the correct prompt routing

---

### 🔍 Google Search Grader — *Heuristic-AI Hybrid*

REAVES injects **floating credibility pills** directly into Google Search results. Every result gets graded before you click.

**The Edge-Tier Credibility System:**

| Tier | Badge | Color | Meaning |
|------|-------|-------|---------|
| **A** | ✦ HIGH TRUST | 🟢 Emerald | Peer-reviewed, institutional, or gold-standard source |
| **B** | ✓ REPUTABLE | 🔵 Blue | Established publication with good editorial standards |
| **C** | ⚠ CAUTION | 🟡 Amber | Mixed credibility — read with critical eye |
| **D/F** | ✖ UNVERIFIED | 🔴 Red | Unverified, potentially unreliable |

**Technical Architecture:**
- **Shadow DOM Isolation:** Each pill is wrapped in a Shadow DOM to prevent Google's CSS from flipping or inverting the badge (Google applies `transform` and `direction` overrides)
- **Zero-Size Wrapper Pattern:** The pill host has `width:0; height:0` — taking zero layout space. The pill itself floats via `position: absolute; top: -12px` in the negative margin zone above each card
- **CSP Bypass:** Google's Content Security Policy blocks direct `fetch()` from content scripts. REAVES routes all grading requests through the background service worker, which proxies to `localhost:3000/api/grade`
- **Request Stagger:** 1.5s delay between grading calls to avoid API rate-limits

---

### 📖 Smart Glossary — *Contextual Extraction Engine*

Hover over any academic term on any webpage and REAVES defines it for you — no click required.

**The Hover Protocol:**
1. User selects text (≤5 words)
2. A **1.5-second dwell timer** starts (prevents false triggers from casual selections)
3. If the selection holds, REAVES first checks a **local JARGON_MAP** dictionary (instant, zero-network lookup for terms like *synthesis*, *DOI*, *peer-reviewed*, *qualitative*, *quantitative*)
4. Cache miss → falls through to `/api/define` on the Next.js backend (Gemini-powered)
5. A compact dark popup appears above the selection with the short definition
6. Simultaneously, the full detailed explanation is pushed to the sidebar via `SHOW_DETAILED_DEF` message

**Dual-Action Architecture:**
- **Page Popup:** Minimal floating card — appears near the selection, disappears on click/scroll
- **Sidebar Card:** Full glossary panel with detailed academic explanation, pinned until dismissed

---

### 🔎 Ask & Search — *AI-Clarified Academic Discovery*

The Ask tab is a research query pipeline with built-in AI clarification:

1. **Input:** Paste highlighted text or type a free-form research question
2. **AI Clarifier:** Ambiguous queries are refined via `/api/clarify` — the AI asks a disambiguating question and offers refined search options
3. **Source Search:** Queries are dispatched to `/api/search` for academic source discovery
4. **Trust Scoring:** Each source displays a trust score with a visual gradient bar
5. **Notebook Save:** Sources can be saved to named notebooks for later organization and export

---

### 📓 Notebook System — *Organized Evidence Collection*

- Create, name, and manage multiple research notebooks
- Save sources directly from search results with one click
- Tag entries and add personal research notes
- Portable data — notebooks persist in `chrome.storage.local` and bridge to the web app via `localStorage`

---

### 🖍️ Evidence Highlighter — *Visual Anchoring*

When the Document Auditor finds evidence, the exact `evidence_snippet` is injected as a `<mark>` element on the live page:

- **Literal Match Rule:** The AI's snippet must be a 100% byte-for-byte match against the page content
- **Server-Side Guard:** The API validates the snippet against the cleaned context before returning it. Hallucinated snippets are nullified
- **Smooth Scroll:** The highlight auto-scrolls into view with `behavior: 'smooth'`

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CHROME EXTENSION (MV3)                      │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ Content Script│  │Google Grader │  │  Sidebar (React SPA)  │  │
│  │              │  │              │  │                       │  │
│  │ • Ask Bubble │  │ • Shadow DOM │  │ • Ask Tab             │  │
│  │ • Glossary   │  │ • Tier Pills │  │ • Analyze Tab (Chat)  │  │
│  │ • Highlighter│  │ • CSP Bypass │  │ • Notebook Tab        │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘  │
│         │                 │                      │              │
│         └────────┬────────┴──────────────────────┘              │
│                  │                                              │
│         ┌────────▼────────┐                                     │
│         │   Background    │                                     │
│         │ Service Worker  │                                     │
│         │                 │                                     │
│         │ • Message Router│                                     │
│         │ • API Proxy     │                                     │
│         │ • Jargon Cache  │                                     │
│         │ • Session Mgmt  │                                     │
│         └────────┬────────┘                                     │
└──────────────────┼──────────────────────────────────────────────┘
                   │ HTTP (localhost:3000)
┌──────────────────▼──────────────────────────────────────────────┐
│                     NEXT.JS WEB APP                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   API Routes                            │    │
│  │                                                         │    │
│  │  /api/page-search  → RAG Evidence Engine (Local Mode)   │    │
│  │                    → Research Consultant (Global Mode)   │    │
│  │  /api/grade        → Source Credibility Scorer           │    │
│  │  /api/define       → Smart Glossary (AI definitions)    │    │
│  │  /api/clarify      → Query Disambiguation               │    │
│  │  /api/search       → Academic Source Discovery           │    │
│  │  /api/synthesize   → Multi-Source Synthesis              │    │
│  │  /api/compare      → Side-by-Side Source Comparison      │    │
│  │  /api/bias         → Bias Detection                      │    │
│  │  /api/thesis       → Thesis Generator                    │    │
│  │  /api/followup     → Follow-up Question Generator        │    │
│  └─────────────────────────┬───────────────────────────────┘    │
│                            │                                    │
│                  ┌─────────▼─────────┐                          │
│                  │  Gemini 2.5 Flash │                          │
│                  │  (Google AI SDK)  │                          │
│                  │                   │                          │
│                  │  • JSON Mode      │                          │
│                  │  • Low Temp (0.2) │                          │
│                  │  • System Prompts │                          │
│                  └───────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Design System

REAVES follows a **Glassmorphism + Lakers Protocol** design language:

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#0a0a0f` | Deep space black background |
| `--surface` | `#111118` | Card surfaces |
| `--surface2` | `#18181f` | Elevated surfaces |
| `--violet` | `#7c3aed` | Primary brand accent |
| Lakers Gold | `#FDB927` | Local Mode — document-locked |
| Lakers Purple | `#a855f7` | Global Mode — synthesis |
| Emerald | `#10b981` | High trust / success |
| Amber | `#f59e0b` | Caution / medium scores |
| Rose | `#f43f5e` | Errors / low trust |

**Visual Effects:**
- Glassmorphism — `backdrop-filter: blur(12px)` on all chat bubbles
- Mode-aware container glow — `box-shadow: 0 0 20px` with Gold/Purple radiance
- Micro-animations — `fadeUp`, `spin`, element transitions on 0.2-0.3s curves
- Typography — [Inter](https://fonts.google.com/specimen/Inter) with 0.04em letter-spacing headers

---

## 🛠️ Technical Stack

| Layer | Technology |
|-------|-----------|
| **Extension Frontend** | React 18 · TypeScript · Vite · CSS |
| **Extension Shell** | Chrome Extension Manifest V3 · Side Panel API · Shadow DOM |
| **Backend** | Next.js 15 · App Router · API Routes |
| **AI Engine** | Google Gemini 2.5 Flash (via `@google/generative-ai` SDK) |
| **Prompt Engineering** | Dual System Prompts (RAG + Global) · JSON Response Mode |
| **Design** | Glassmorphism · Lakers Color Protocol · Inter Font |

---

## 🔄 Resilience Architecture — *Waterfall Failover*

REAVES is engineered for **zero-downtime** under adverse conditions:

```
Request Flow (Smart Glossary Example):

  User selects "peer-reviewed"
         │
         ▼
  ┌─── TIER 1: Local Jargon Map ───┐
  │  JARGON_MAP["peer-reviewed"]   │ ←── Instant (0ms). No network.
  │  Found? → Return immediately   │
  └────────────┬───────────────────┘
               │ Miss
               ▼
  ┌─── TIER 2: Next.js Backend ────┐
  │  POST /api/define              │ ←── Gemini 2.5 Flash (~300ms)
  │  Available? → Return           │
  └────────────┬───────────────────┘
               │ Error / Timeout
               ▼
  ┌─── TIER 3: Graceful Degrade ───┐
  │  Popup dismissed silently.     │ ←── No error shown to user.
  │  Core browsing unaffected.     │
  └────────────────────────────────┘
```

**Key Principles:**
- **Background Service Worker Proxy:** All API calls are routed through `background.js`, which catches `fetch()` errors and returns graceful fallbacks
- **Staggered Requests:** The Google Grader spaces API calls 1.5s apart to avoid rate-limiting
- **Toggle Guards:** Both Glossary and Grader check `chrome.storage.local` toggles before activating — users can disable features instantly from the sidebar header

---

## 🚀 Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [Google Chrome](https://www.google.com/chrome/) (latest)
- A [Gemini API Key](https://aistudio.google.com/apikey) (free tier)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/reaves.git
cd reaves
```

### 2. Start the Backend

```bash
cd reaves
cp .env.example .env.local
# Add your Gemini API key to .env.local:
#   GEMINI_API_KEY=your_key_here

npm install
npm run dev
```

The Next.js server will start at `http://localhost:3000`.

### 3. Build the Extension

```bash
cd reaves-extension
npm install
npm run build
```

### 4. Load into Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer Mode** (top-right toggle)
3. Click **"Load unpacked"**
4. Select the `reaves-extension/dist/` folder
5. The REAVES icon (✦) appears in your toolbar

### 5. Start Using

1. Click the **✦ REAVES** icon to open the side panel
2. Navigate to any article or research paper
3. Use the **Analyze** tab to chat with the page (Gold) or the world (Purple)
4. Highlight text on any page to trigger the **Smart Glossary** and **Ask REAVES** bubble
5. Search Google to see **credibility pills** on every result

---

## 📁 Project Structure

```
Reaves/
├── reaves/                      # Next.js web application
│   ├── app/
│   │   └── api/                 # 12 AI-powered API routes
│   │       ├── page-search/     # Dual-mode RAG / Global analysis
│   │       ├── grade/           # Source credibility scoring
│   │       ├── define/          # Smart Glossary definitions
│   │       ├── clarify/         # Query disambiguation
│   │       ├── search/          # Academic source discovery
│   │       ├── synthesize/      # Multi-source synthesis
│   │       ├── compare/         # Side-by-side comparison
│   │       ├── bias/            # Bias detection
│   │       ├── thesis/          # Thesis generation
│   │       └── followup/        # Follow-up questions
│   ├── prompts/
│   │   └── rag.ts               # RAG + Global system prompts
│   └── lib/
│       └── anthropic.ts         # Gemini AI client wrapper
│
├── reaves-extension/            # Chrome Extension (Manifest V3)
│   ├── src/
│   │   ├── views/
│   │   │   ├── AnalyzePage.tsx   # Dual-Mode chat (Gold/Purple)
│   │   │   ├── AskView.tsx       # Search & clarify pipeline
│   │   │   ├── NotebookView.tsx  # Notebook management
│   │   │   ├── GlossaryCard.tsx  # Sidebar glossary panel
│   │   │   └── PageSearchView.tsx
│   │   ├── App.tsx               # Sidebar shell & navigation
│   │   ├── api.ts                # Chrome message API helpers
│   │   └── index.css             # Full design system
│   ├── background.js             # Service worker (message router)
│   ├── content_script.js         # Page injection (bubble, glossary, highlights)
│   └── public/
│       └── google_grader.js      # Google Search credibility pills
│
└── README.md
```

---

## 📄 License

This project is developed for academic and research purposes.

---

<p align="center">
  <strong>✦ REAVES</strong> — <em>Where Every Source is Verified, Every Claim is Grounded.</em>
</p>

<p align="center">
  Built with 🟡💜 in the Lakers Protocol
</p>
