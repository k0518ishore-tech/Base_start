# Artificial Intelligence & Machine Learning Architecture in GSEE

This document provides a comprehensive technical breakdown of all **Artificial Intelligence (AI)**, **Machine Learning (ML)**, **Natural Language Processing (NLP)**, and **Information Retrieval (IR)** models and techniques integrated into the **Government Scheme Eligibility Engine (GSEE)**, including **what models are used**, **how they work**, and **why they were chosen**.

---

## Executive Summary of AI / ML Components

| Component / Feature | Model / Algorithm | Primary Library / Provider | Purpose & Role |
| :--- | :--- | :--- | :--- |
| **Conversational Scheme Assistant** | **Qwen 2.5 Instruct** (`7B` & `72B`) | Alibaba Cloud / OpenRouter API / Hugging Face | Natural-language multi-turn conversational AI for citizen query resolution |
| **Grounded Response Generation** | **RAG (Retrieval-Augmented Generation)** | Custom In-Memory IR + MongoDB Full-Text Retrieval | Eliminates LLM hallucinations by injecting verified database scheme facts |
| **Personalized Scheme Discovery** | **Hybrid RAG Recommender Engine** | TF-IDF-inspired Keyword Tokenizer + Demographic Vectorization | Recommends schemes based on user search history, viewed schemes, and profile |
| **Eligibility Assessment Engine** | **Deterministic Symbolic AI (Expert System)** | Custom 10-Operator Rule Evaluation Engine | 100% auditable, transparent eligibility verification without black-box errors |
| **Citizen Grievance Analysis** | **Unsupervised Semantic Topic Clustering** | NLP Keyword Normalization + Frequency Threshold Engine | Aggregates repeated citizen complaints ($N \ge 5$) to advise policy adjustments |

---

## 1. Large Language Model (LLM): Qwen 2.5 Instruct

### Model Specification:
- **Primary Model**: `qwen/qwen-2.5-7b-instruct` (via OpenRouter API)
- **High-Capacity Fallback**: `Qwen/Qwen2.5-72B-Instruct` (via Hugging Face Inference API)
- **Architecture**: Decoder-only Autoregressive Transformer with RoPE (Rotary Position Embeddings), SwiGLU activations, and Grouped-Query Attention (GQA).
- **Execution Parameter Tuning**:
  - `temperature: 0.3` (Low temperature to enforce factual precision and prevent creative deviation)
  - `max_tokens: 1024` (Concise, structured responses)

### Why We Used Qwen 2.5:
1. **Superior Multilingual & Indian Domain Performance**:
   - Compared to standard English-centric models, Qwen 2.5 has demonstrated state-of-the-art benchmarks on multilingual reasoning, particularly on South Asian regional contexts, Indian terminology (e.g., *Yojana, Gramin, Tehsil, Aadhaar, DBT, Khasra*), and government administrative naming.
2. **High Instruction-Following Fidelity**:
   - Government citizen portals cannot tolerate conversational drift. Qwen 2.5 excels at adhering to strict negative constraints (e.g., *"Only answer based on the provided database context. If unknown, state to visit the official department portal"*).
3. **Low Latency & High Cost-Efficiency**:
   - The 7B model delivers sub-second token generation times suitable for real-time web chat interfaces without requiring heavy server GPU hosting.

---

## 2. RAG (Retrieval-Augmented Generation) Architecture

```
 Citizen Query: "I'm a farmer in Maharashtra with 2 acres land. Any subsidy?"
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │ 1. RETRIEVER (MongoDB Vector & Keyword Match)│
        │    - Indian Stop-word filtering              │
        │    - State & Demographic constraints         │
        │    - Rules, Benefits & Portal URL fetching   │
        └──────────────────────┬───────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │ 2. CONTEXT INJECTION (System Prompt)         │
        │    - Verified DB Records for PM-KISAN, etc.  │
        │    - Logged-in citizen profile facts         │
        └──────────────────────┬───────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │ 3. GENERATOR (Qwen 2.5 Instruct LLM)         │
        │    - Temperature: 0.3                        │
        │    - Cites official ministry & direct links  │
        └──────────────────────┬───────────────────────┘
                               │
                               ▼
 Verified, hallucination-free response with official application links
```

### Why We Used RAG:
1. **Elimination of Hallucinations**:
   - Standard generative AI frequently fabricates non-existent schemes or hallucinates obsolete financial grants. By grounding the LLM in real-time MongoDB scheme documents, the assistant only references active government policies.
2. **Dynamic Data Updates Without Retraining**:
   - When administrators add, verify, or update a scheme in the database, the conversational assistant immediately gains awareness of the changes without expensive model fine-tuning.
3. **Privacy & Offline Grounded Fallback**:
   - If cloud APIs are unreachable, the local rule-grounded fallback synthesizer (`generateGroundedResponse`) extracts structured scheme benefits directly without breaking the user experience.

---

## 3. Hybrid RAG Personalized Scheme Recommender Engine

### Algorithm & Technique:
- **Type**: Content-Based Filtering combined with Search History Vectorization & Hard Constraint Pruning.
- **Implementation File**: [`backend/src/services/recommendation/ragRecommenderService.js`](file:///c:/Users/k0518/OneDrive/Desktop/SEM%205/mini%20project%203/from_base/backend/src/services/recommendation/ragRecommenderService.js)

### How It Works:
1. **Keyword Extraction & Query Normalization**:
   - Parses the citizen's recent 15 search interactions (`SearchHistory`) and viewed schemes.
   - Filters domain stop-words (`yojana`, `scheme`, `apply`, `portal`, `online`, etc.) to isolate high-intent semantic keywords.
2. **Candidate Multi-Field Retrieval**:
   - Queries MongoDB across scheme titles, categories, short descriptions, target beneficiaries, and objectives.
3. **Hard Constraint Gating**:
   - Applies strict state residency matching (`applicableStates`).
   - Runs candidate schemes through the **Deterministic Rule Engine**. Schemes that the user is not qualified for are discarded before ranking.
4. **Scoring & Ranking**:
   - Ranks candidates using relevance density formula:
     $$\text{Score} = (\text{Keyword Hits} \times 10) + (\text{Unviewed Bonus: } 5)$$

### Why We Used It:
- **Overcoming User Vocabulary Gaps**: Citizens rarely know exact bureaucratic titles (e.g., they search for *"college laptop"* rather than *"Chief Minister Digital Empowerment Initiative"*). This engine bridges user intent to official scheme entities.
- **Recommending Only Eligible Schemes**: Unlike e-commerce recommenders that suggest products anyone can buy, government recommendations must ensure the citizen actually meets the statutory age, income, and community criteria.

---

## 4. Unsupervised Feedback Clustering & Policy Escalation Engine

### Algorithm & Technique:
- **Type**: Unsupervised Keyword Categorization & Frequency-Triggered Anomaly Detection.
- **Implementation File**: [`backend/src/services/recommendation/feedbackClusterService.js`](file:///c:/Users/k0518/OneDrive/Desktop/SEM%205/mini%20project%203/from_base/backend/src/services/recommendation/feedbackClusterService.js)

### How It Works:
1. When citizens file feedback or report eligibility discrepancies, natural language terms are analyzed and mapped to canonical operational categories:
   - `income_limit` (keywords: *income, salary, earning, ceiling*)
   - `age_criteria` (keywords: *age, dob, birth, senior*)
   - `land_holding` (keywords: *land, khasra, patta, acre, hectare*)
   - `documentation` (keywords: *aadhaar, certificate, proof, ration*)
   - `community_category` (keywords: *caste, obc, sc, st, ews*)
2. Groups feedback by `(Scheme_ID + Feedback_Type + Canonical_Topic)`.
3. When the distinct citizen threshold ($N \ge 5$) is crossed, the system automatically creates an **Admin Recommendation** recommending specific policy action (e.g., *"5 distinct citizens reported income threshold too strict for PM-KISAN. Review rule in Rule Builder"*).

### Why We Used It:
- Eliminates manual reading of thousands of grievance tickets.
- Provides government administrators with evidence-backed, clustered policy recommendations to adjust threshold conditions dynamically.

---

## 5. Deterministic Rule-Based Assessment Engine (Symbolic AI)

### Algorithm & Technique:
- **Type**: Symbolic Artificial Intelligence / Expert Rule Engine.
- **Implementation File**: [`backend/src/services/eligibility/engine.js`](file:///c:/Users/k0518/OneDrive/Desktop/SEM%205/mini%20project%203/from_base/backend/src/services/eligibility/engine.js)
- **Supported Operators**: `==`, `!=`, `>`, `>=`, `<`, `<=`, `IN`, `NOT_IN`, `BETWEEN`, `EXISTS`.
- **Deterministic Output States**: `ELIGIBLE`, `NOT_ELIGIBLE`, `INCOMPLETE`.

### Why We Used Symbolic AI (Instead of Black-Box Machine Learning):
1. **Legal & Administrative Accountability**:
   - Government welfare allocation cannot legally rely on probabilistic ML predictions (e.g. Random Forests or Neural Networks) where an applicant is told: *"You have an 82% probability of eligibility."*
   - Citizens have a legal right to know **exact reasons** (e.g., *"Failed: Required annual income <= ₹2,50,000, but your profile indicates ₹3,00,000"*).
2. **100% Precision & Auditability**:
   - Every evaluated rule produces an immutable audit record with expected vs. actual values, guaranteeing fairness, transparency, and non-discrimination.

---

## Summary of Benefits for Citizens & Administrators

```
┌────────────────────────────────────────────────────────────────────────┐
│                   GOVERNMENT CITIZEN EXPERIENCE                        │
│                                                                        │
│   [ Natural Language Inquiry ]   ──▶   Qwen 2.5 + RAG (Truthful AI)    │
│   [ Personalized Discovery ]    ──▶   Hybrid RAG Recommender Engine    │
│   [ Transparent Assessment ]    ──▶   Symbolic Rule-Based Engine       │
│   [ Continuous Governance ]     ──▶   Unsupervised Grievance Cluster   │
└────────────────────────────────────────────────────────────────────────┘
```
