# PanelAI — Autonomous Multi-Interviewer Voice AI Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![Agora](https://img.shields.io/badge/Agora-Conversational%20AI-099DFD?style=flat&logo=agora)](https://www.agora.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

**PanelAI** is an autonomous multi-interviewer voice AI platform that simulates real-world hiring panel interviews. Built on Agora's Conversational AI Engine, WebRTC SD-RTN, and Next.js 16, candidates undergo an end-to-end multi-round interview where specialized AI interviewers autonomously hand off rounds, share real-time cross-agent memory, probe with low-latency voice responses, and generate auditable recruiter scorecards with verbatim candidate quotes.

---

## 🌟 Key Features

### 🎙️ Autonomous Multi-Interviewer Panel
Candidates experience a realistic 3-stage hiring loop without manual intervention:
1. **Round 1: Technical Architecture (Alex Chen)**
   - System design, React component optimization, algorithmic complexity, and asynchronous patterns.
   - Distinct Persona: Analytical, technical, probing.
2. **Round 2: Product Strategy & Trade-offs (Sarah Lin)**
   - Customer empathy, feature prioritization, North Star metrics, and cross-functional engineering impact.
   - Distinct Persona: Product-focused, user-centric, strategic.
3. **Round 3: HR & Hiring Manager (Elena Rostova)**
   - Culture alignment, conflict resolution, leadership, and cross-functional ownership.
   - Distinct Persona: Warm, empathetic, leadership-oriented.

### ⚡ Ultra-Low Voice Latency Pipeline
- **Agora Chorus Audio Profile**: Utilizes Agora's low-latency interactive audio scenario (`audio_scenario: 'chorus'`).
- **Snappy Turnaround**: Streaming STT (Deepgram Nova-3) coupled with fast LLM response generation (GPT-4o-mini) and conversational Voice Activity Detection (380ms silence turnaround).
- **Direct RTC Track Streaming**: Real-time microphone capture and immediate remote audio playback via Agora RTC.

### 🧠 Shared Cross-Agent Memory (Local Database)
- Candidate answers and evidence extracted in earlier rounds are automatically synchronized into a local state repository (`data/memory-db.json`).
- Subsequent panelists reference past answers seamlessly (e.g., *"Building on the caching architecture you described to Alex earlier, how did you explain that trade-off to your product manager?"*).

### 🔄 Resilient Session Persistence
- **Reload Survival**: Refreshing the browser mid-interview maintains active session state, reconnects to the live RTC/RTM channel, and restores timers and current round progress without resetting to the home page.
- Automatic token refreshment and channel re-subscription ensure seamless continuity.

### 📊 Recruiter-Grade Evaluation Scorecard
- **Anti-Hallucination Verified Quotes**: Recruiter evidence stack strictly matches verbatim transcript audio captured from the candidate's microphone.
- **Monotonic Progression**: Candidate competence once demonstrated cannot be erroneously downgraded by unrelated answers.
- **Visual Competency Breakdown**: Quantitative ratings across Technical, Product, Behavioural, Problem Solving, Communication, and Ownership competencies.

---

## 🏗️ System Architecture

```
                                    Candidate (Browser)
                                            │
               ┌────────────────────────────┴────────────────────────────┐
               ▼                                                         ▼
       Agora WebRTC Audio                                       Agora RTM Signaling
  (Microphone Stream / Output)                              (Transcripts, Agent Events)
               │                                                         │
               └────────────────────────────┬────────────────────────────┘
                                            │
                                            ▼
                             Agora Conversational AI Cloud
                 ┌───────────────────────────────────────────────────────┐
                 │ Deepgram Nova-3 STT ──► GPT-4o-mini ──► Streaming TTS │
                 └───────────────────────────────────────────────────────┘
                                            ▲
                                            │ (Track Switches & Memory Context)
                                            ▼
                                  Next.js 16 Backend
                      ┌───────────────────────────────────────────┐
                      │ /api/generate-agora-token                 │
                      │ /api/invite-agent (Round-specific Agents) │
                      │ /api/stop-conversation                   │
                      │ /api/context-memory (Shared Memory DB)    │
                      └───────────────────────────────────────────┘
```

---

## 📋 Prerequisites

- **Node.js**: `v20.0.0` or higher (recommended `v22+`)
- **pnpm**: `v9.0.0` or higher
- **Agora Account**: Agora App ID and App Certificate from [Agora Console](https://console.agora.io/)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/SAHAJCSE/InterviewIQ.git
cd InterviewIQ
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Copy the example environment template:

```bash
cp env.local.example .env.local
```

Add your Agora project credentials in `.env.local`:

```env
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id_here
NEXT_AGORA_APP_CERTIFICATE=your_agora_app_certificate_here
```

*(Optional: Configure custom pipeline IDs for technical, product, or HR agents if using pre-configured Agora Cloud Agent pipelines)*

### 4. Run the Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the automated test suite to verify interview intelligence, quote validation, and contract integrity:

```bash
# Run interview intelligence & anti-hallucination unit tests
pnpm test

# Typecheck TypeScript code
pnpm run typecheck

# Lint source files
pnpm run lint

# Run production build
pnpm run build
```

---

## 📁 Repository Structure

```
PanelAI/
├── app/
│   ├── api/
│   │   ├── context-memory/       # Cross-round shared memory storage
│   │   ├── generate-agora-token/ # RTC & RTM token builder
│   │   ├── invite-agent/         # ConvoAI agent orchestrator & VAD config
│   │   └── stop-conversation/    # Graceful agent session termination
│   ├── layout.tsx                # App layout & font configurations
│   └── page.tsx                  # Main entry point
├── components/
│   ├── landing/                  # Minimal briefing & intake modal
│   ├── panel/                    # Live interview UI, visualizer, avatar & transcripts
│   ├── ConversationComponent.tsx # Real-time RTC audio, AgoraVoiceAI & RTM integration
│   └── LandingPage.tsx           # Session bootstrap, reload persistence & round coordinator
├── data/
│   ├── demo.ts                   # Panel rounds, interviewer personas, and mock candidate
│   └── memory-db.json            # Local persistent cross-agent context memory
├── lib/
│   ├── interview/
│   │   ├── context-memory.ts     # Memory synchronization across panel agents
│   │   ├── orchestrator.ts       # Turn intelligence & quote verification
│   │   ├── reliability-gate.ts   # 5-point Reliability Gate checks
│   │   ├── scorecard.ts          # Deterministic recommendation engine
│   │   └── system-prompt.ts      # Specialized panelist prompts & rules
│   └── agora.ts                  # Shared Agora constants and UIDs
└── tests/
    └── interview-intelligence.test.ts # Verbatim quote & progression test suite
```

---

## 🛡️ License

Distributed under the MIT License. See [LICENSE](./LICENSE) for details.
