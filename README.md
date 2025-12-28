# DecisionLens 🧠

DecisionLens is an AI-powered decision explainer designed to provide **structured reasoning**
instead of generic or purely conversational AI answers.

The goal is to make complex decisions more transparent by breaking them down into
clear reasoning steps, explicit trade-offs, risks, missing information, and actionable next steps.

Unlike typical AI assistants, DecisionLens is intentionally built to **surface uncertainty**
and highlight what information is missing, rather than inventing assumptions.

---

## 🔗 Live Demo

👉 https://decisionlens.vercel.app

---

## 🚀 Features

- Structured AI output (JSON-based)
- Clear recommendation with justification
- Pros & Cons comparison
- Risk analysis
- Missing information detection (anti-hallucination)
- 7-day actionable plan
- Confidence scoring with explanation

---

## 🧠 Example Use Cases

- Career decisions (job offers, role trade-offs)
- Learning paths & skill prioritization
- Resume or ATS optimization
- Product, startup, or business decisions
- Any scenario where trade-offs and uncertainty matter

---

## 🛠 Tech Stack

- **Frontend:** React + Vite
- **Backend:** Serverless Functions (Vercel)
- **AI:** OpenAI API (LLM-powered)
- **Language:** JavaScript

---

## 🧩 Architecture Overview

DecisionLens follows a production-oriented architecture:

- React frontend consumes a serverless API
- Backend enforces structured JSON outputs from the LLM
- Guardrails prevent hallucinated assumptions
- Responses explicitly include missing information and risk factors
- Designed for predictable downstream consumption (not just text output)

---

## ⚙️ Run Locally

```bash
npm install
npm run dev
