# Comprehensive Functional Specification & End-to-End Workflow Engineering Report

**Project Title:** Government Scheme Eligibility Engine (GSEE)  
**System Classification:** Full-Stack Intelligent e-Governance Decision Support Platform  
**Live Production Deployments:**
- **Citizen Portal (Frontend):** [https://base-start-red.vercel.app](https://base-start-red.vercel.app)
- **Backend API Server:** [https://base-start.onrender.com](https://base-start.onrender.com)
- **Cloud Database:** MongoDB Atlas (`government_scheme_db`)

---

## Table of Contents
1. [Executive Summary & Purpose](#1-executive-summary--purpose)
2. [Global System Architecture Diagram](#2-global-system-architecture-diagram)
3. [Module-by-Module Detailed Functional Specifications](#3-module-by-module-detailed-functional-specifications)
4. [Master End-to-End Workflow Diagrams](#4-master-end-to-end-workflow-diagrams)
   - [Workflow 1: Citizen Onboarding & Profile Setup](#workflow-1-citizen-onboarding--profile-setup)
   - [Workflow 2: Scheme Discovery & Multi-Facet Filtering](#workflow-2-scheme-discovery--multi-facet-filtering)
   - [Workflow 3: Deterministic Eligibility Evaluation (Single & Batch)](#workflow-3-deterministic-eligibility-evaluation-single--batch)
   - [Workflow 4: Conversational Scheme Assistant (RAG Pipeline)](#workflow-4-conversational-scheme-assistant-rag-pipeline)
   - [Workflow 5: Hybrid Personalized Scheme Recommendation](#workflow-5-hybrid-personalized-scheme-recommendation)
   - [Workflow 6: Application Reminder & Automated Cron Notification](#workflow-6-application-reminder--automated-cron-notification)
   - [Workflow 7: Citizen Grievance Clustering & Policy Escalation](#workflow-7-citizen-grievance-clustering--policy-escalation)
   - [Workflow 8: Admin Scheme Publishing & Visual Rule Configuration](#workflow-8-admin-scheme-publishing--visual-rule-configuration)
5. [State Transition Lifecycle Models](#5-state-transition-lifecycle-models)
6. [Complete Database Entity-Relationship (ER) Model](#6-complete-database-entity-relationship-er-model)
7. [Role-Based Access Control (RBAC) Interaction Matrix](#7-role-based-access-control-rbac-interaction-matrix)
8. [Fault Tolerance, Edge Cases & Resilience Mechanisms](#8-fault-tolerance-edge-cases--resilience-mechanisms)

---

## 1. Executive Summary & Purpose

The **Government Scheme Eligibility Engine (GSEE)** is designed to eliminate information fragmentation in Indian welfare administration. In traditional systems, citizens must navigate disconnected department websites, decipher complex gazette eligibility rules, and frequently miss critical application deadlines.

GSEE solves these challenges through a unified platform featuring:
1. **A verified catalog of 1,062 Central and State government schemes** organized by administering ministries and departments.
2. **A 100% deterministic Symbolic Rule Engine** assessing citizen eligibility with transparent, mathematical explanations.
3. **An AI Scheme Assistant** powered by Alibaba's **Qwen 2.5 Instruct LLM** utilizing **Retrieval-Augmented Generation (RAG)** to provide factual, non-hallucinated answers.
4. **A Hybrid Personalized Recommender** tailoring welfare discovery based on user search patterns and demographic criteria.
5. **An Automated Background Cron Scheduler** managing deadline sweeps and in-portal citizen alerts.
6. **An Unsupervised Grievance Clustering Engine** detecting policy bottlenecks when repeated citizen complaints are filed.

---

## 2. Global System Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientTier["1. Presentation Tier (Client Single Page Application - Vercel)"]
        UI["React 18 + Vite + Tailwind CSS"]
        UI_Nav["Responsive Government Navigation Bar"]
        UI_WM["National Emblem Watermark Background (#879bb4)"]
        UI_Pages["Pages: Catalog, Eligibility Checker, Recommendations, AI Assistant, Admin Console"]
    end

    subgraph APITier["2. Application & Logic Tier (Express REST API - Render)"]
        App["Node.js / Express Application Server"]
        Middleware["Security Middlewares: Helmet, CORS, Morgan, JWT Auth"]
        
        subgraph CoreEngines["Core Computational & AI Services"]
            Engine_Rule["Symbolic Rule Assessment Engine (10 Operators)"]
            Engine_RAG["RAG In-Memory Retrieval & Context Grounding"]
            Engine_Rec["Hybrid Recommender & Keyword Tokenizer"]
            Engine_Cron["Node-Cron Background Scheduler (Every Minute Sweep)"]
            Engine_Cluster["Unsupervised Grievance Topic Clustering Engine"]
        end
    end

    subgraph DataTier["3. Data & Persistence Tier (MongoDB Atlas Cloud)"]
        DB[("MongoDB Atlas Database Cluster")]
        Col_Schemes[("schemes (1,062 docs)")]
        Col_Rules[("eligibilityrules (3,133 docs)")]
        Col_Depts[("departments (17 docs)")]
        Col_Users[("users & userprofiles")]
        Col_Telemetry[("searchhistories, bookmarks, notifications, feedback")]
    end

    subgraph ExternalServices["4. External Cloud Intelligence Tier"]
        OpenRouter["OpenRouter Cloud Inference (Qwen 2.5-7B)"]
        HuggingFace["Hugging Face Inference API (Qwen 2.5-72B Fallback)"]
    end

    UI -->|HTTPS / REST API Requests| App
    App --> Middleware
    Middleware --> CoreEngines
    CoreEngines <-->|Mongoose ODM Queries| DB
    Engine_RAG -->|Grounded Prompt Payloads| OpenRouter
    OpenRouter -.->|Fallback on Outage| HuggingFace
```

---

## 3. Module-by-Module Detailed Functional Specifications

### Module 1: Authentication, Security & Citizen Profile Parameterization
- **Purpose**: Authenticates citizens and administrators while maintaining an auditable demographic profile used for automated assessments.
- **Key Operations**:
  - `POST /api/auth/register`: Creates citizen account with bcrypt salted password hashing (rounds = 10).
  - `POST /api/auth/login`: Issues a signed JSON Web Token (JWT) with standard expiration.
  - `GET /api/profiles/me` & `PUT /api/profiles/me`: Manages 10 citizen parameters:
    - `dateOfBirth`: Used to dynamically derive real-time age.
    - `gender`: Male / Female / Transgender.
    - `state` & `district`: Geographic residency matching.
    - `annualFamilyIncome`: Numeric threshold comparison against statutory limits.
    - `education` & `occupation`: Target beneficiary alignment (e.g., Student, Small Farmer).
    - `employmentStatus`: Employed, Self-Employed, Unemployed, etc.
    - `community`: General, OBC, SC, ST, EWS, Minority.
    - `disabilityStatus`: Boolean indicator for Divyangjan benefits.
    - `otherDetails`: Flexible store for land ownership and document proofs.

---

### Module 2: Scheme & Department Catalog Discovery Module
- **Purpose**: High-performance, multi-parameter directory of **1,062 Central & State initiatives** linked directly to **17 government departments**.
- **Key Operations**:
  - `GET /api/schemes`: Paginated and filtered search supporting:
    - Text search over `schemeName`, `category`, `shortDescription`, `ministry`, `targetBeneficiaries`.
    - Dropdown filters for `departmentId`, `category`, `state`, `schemeLevel` (Central vs. State), and `beneficiary`.
    - Sorting by `newest`, `oldest`, `name_asc` (A-Z), and `name_desc` (Z-A).
  - `GET /api/schemes/:id`: Comprehensive details including structured financial benefits, eligibility criteria summary, required documents list, application process steps, and direct official application URL.
  - `GET /api/departments`: Directory of parent ministries, contact details, official web portals, and associated schemes count.

---

### Module 3: Deterministic Rule-Based Eligibility Assessment Module
- **Purpose**: Evaluates applicant attributes against scheme rules using mathematical and set-theoretic operators without probabilistic machine learning errors.
- **Supported Relational Operators**:
  1. `==`: Exact equality (e.g., `gender == "Female"`).
  2. `!=`: Exclusivity (e.g., `employmentStatus != "Government Employee"`).
  3. `>` & `>=`: Lower-bound numeric comparisons (e.g., `age >= 18`).
  4. `<` & `<=`: Upper-bound numeric ceilings (e.g., `annualFamilyIncome <= 250000`).
  5. `IN`: Set inclusion (e.g., `community IN ["SC", "ST", "OBC"]`).
  6. `NOT_IN`: Disqualification sets (e.g., `occupation NOT_IN ["Income Tax Payee"]`).
  7. `BETWEEN`: Closed interval verification (e.g., `age BETWEEN [18, 35]`).
  8. `EXISTS`: Document or record verification (e.g., `aadhaarLinked EXISTS`).
- **Modes of Assessment**:
  - **Single Scheme Evaluation** (`POST /api/eligibility/check-scheme/:id`): Deep, rule-by-rule breakdown detailing rule name, user profile value, statutory condition, pass/fail status, and plain-English explanation.
  - **Batch Evaluation Across All Schemes** (`POST /api/eligibility/check-all`): Concurrently evaluates applicant data across all 1,062 active schemes in a single pass, partitioning results into `Eligible Schemes`, `Ineligible Schemes`, and `Incomplete Schemes`.

---

### Module 4: Conversational Scheme Assistant (Qwen 2.5 + RAG Module)
- **Purpose**: Citizen chatbot answering complex, natural-language scheme questions without fabricating benefits.
- **Technical Pipeline**:
  1. **Query Tokenization & Stop-Word Stripping**: Strips general filler words and domain stop-words (*yojana, scheme, online, apply*) to extract core search intent.
  2. **In-Memory Information Retrieval**: Queries MongoDB for top-4 verified schemes matching extracted tokens across name, category, objectives, and beneficiary attributes.
  3. **Context Assembly**: Compiles verified database facts (Ministry, Benefits, Conditions, Documents, Official Links) alongside logged-in citizen demographics into a structured prompt block.
  4. **Generative Synthesis**: Passes the assembled context to **Qwen 2.5-7B-Instruct** with low temperature (`0.3`) and negative instruction constraints.
  5. **Offline Grounded Fallback**: If external APIs fail, a local fallback synthesizer (`generateGroundedResponse`) extracts verified structured bullet points directly from the database objects.

---

### Module 5: Hybrid RAG Personalized Scheme Recommender Module
- **Purpose**: Automatically presents high-relevance schemes to logged-in citizens based on search behavior and demographic fit.
- **Algorithmic Flow**:
  - Analyzes the citizen's latest 15 telemetry records from `SearchHistory` and viewed schemes.
  - Generates an active interest keyword vector $\mathcal{K}_u$.
  - Fetches candidate schemes and applies hard state-residency constraints.
  - Evaluates candidates through the **Rule Engine** to strictly discard schemes for which the citizen is legally disqualified.
  - Ranks surviving schemes using:
    $$\text{Score}(s) = (\text{Keyword Hits} \times 10) + (\text{Unviewed Bonus: } 5)$$
  - Maps score to a confidence percentage displayed in 3 distinct portal tabs:
    - *All Recommended*: Combined ranked recommendations.
    - *From Your Searches*: Schemes matching recent search intent.
    - *From Your Profile*: Schemes matching occupation, caste, and income.

---

### Module 6: Bookmarks & Priority Schemes Management Module
- **Purpose**: Allows citizens to curate a personal portfolio of schemes they intend to apply for.
- **Key Operations**:
  - `POST /api/bookmarks`: Adds a scheme to user's saved list.
  - `DELETE /api/bookmarks/:schemeId`: Removes a scheme from bookmarks.
  - `GET /api/bookmarks`: Displays all saved initiatives with real-time indicators for active application deadlines.

---

### Module 7: Application Reminders & Automated Background Cron Engine
- **Purpose**: Prevents citizens from missing scheme application cut-off dates.
- **Key Operations & Mechanisms**:
  - `POST /api/reminders`: Citizen schedules a specific date/time alert with custom notes for any bookmarked scheme.
  - **Cron Execution (`scheduler.js`)**: Executes every minute (`* * * * *`).
  - **Reconciliation Sweep**: Scans `bookmarks` collection for documents where:
    - `reminder.enabled === true`
    - `reminder.status === 'UPCOMING'`
    - `reminder.reminderDate <= new Date()`
  - **Action**: Generates an in-portal `Notification` record and transitions reminder status to `TRIGGERED`.
  - **Safe Startup Sweep**: Executes immediately upon server boot to catch any reminders that came due during maintenance or downtime.

---

### Module 8: Citizen Feedback Clustering & Grievance Policy Desk
- **Purpose**: Converts citizen feedback into actionable policy intelligence for portal administrators.
- **Algorithmic Flow**:
  - Citizens submit feedback or report that a particular rule is too harsh via `POST /api/feedback`.
  - The system analyzes grievance text using regex classifiers and categorizes it into canonical operational topics (`income_limit`, `age_criteria`, `land_holding`, `documentation`, `community_category`, `gender_criteria`, `portal_link`).
  - Compounds the key: `SchemeId + FeedbackType + CanonicalTopic`.
  - When **$\ge 5$ distinct registered citizens** report the same issue, the system automatically creates an `AdminRecommendation` card.
  - The card displays an alert to officials, lists citizen complaints, and offers a 1-click link to adjust the threshold in the Rule Builder.

---

### Module 9: Admin Console, Verification & Visual Rule Builder
- **Purpose**: Administrative interface for scheme lifecycle governance and condition configuration.
- **Key Features**:
  - **Scheme Lifecycle Management**: Create, edit, draft, and publish schemes.
  - **Visual Rule Builder**: Interface allowing non-technical officials to select a field, choose an operator, input an expected value, set mandatory flags, and publish rules without writing code.
  - **Scheme Verification Desk**: Audit queue where administrators verify official government circulars, update verification badges (`VERIFIED`), and confirm portal URLs.
  - **User & Audit Management**: Monitor citizen registrations, manage accounts, and inspect immutable audit logs for all administrative actions.

---

## 4. Master End-to-End Workflow Diagrams

### Workflow 1: Citizen Onboarding & Profile Setup

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen User
    participant UI as React Frontend
    participant Auth as Auth Controller
    participant DB as MongoDB Atlas
    
    Citizen->>UI: Enter Full Name, Email, Password
    UI->>Auth: POST /api/auth/register
    Auth->>Auth: Hash Password with bcrypt (Salt: 10)
    Auth->>DB: Save User Document (Role: CITIZEN)
    Auth->>DB: Initialize Empty UserProfile Document
    Auth-->>UI: Return JWT Token & User Context
    UI->>UI: Store Token in localStorage / AuthContext
    
    Citizen->>UI: Complete Profile (DOB, State, Income, Caste, Land)
    UI->>Auth: PUT /api/profiles/me (Bearer Token)
    Auth->>DB: Update UserProfile Document
    Auth-->>UI: Confirmation Toast: "Profile Updated"
```

---

### Workflow 2: Scheme Discovery & Multi-Facet Filtering

```mermaid
flowchart TD
    Start["Citizen visits /schemes"] --> Input["Enter search keywords OR select filters (State, Ministry, Category)"]
    Input --> API["Frontend calls GET /api/schemes?search=...&state=...&sortBy=..."]
    API --> Mongo["MongoDB executes compound query: isActive=true + Regex Matching + State Filter"]
    Mongo --> Sort["Sort results (A-Z / Newest / Relevance) & Apply Pagination (Skip/Limit)"]
    Sort --> Return["API returns JSON with 12 schemes per page + Total Count + Pagination Metadata"]
    Return --> Render["Vite SPA renders SchemeCards with Department Badges, Categories & Official Links"]
    Render --> Action{"Citizen Action"}
    Action -->|Click Card| Detail["Navigate to /schemes/:id (Full Overview & Requirements)"]
    Action -->|Click Check Eligibility| Eval["Navigate to /eligibility?schemeId=..."]
    Action -->|Click Bookmark| Bookmark["Save to Personal Portfolio"]
```

---

### Workflow 3: Deterministic Eligibility Evaluation (Single & Batch)

```mermaid
flowchart TD
    Citizen["Citizen opens /eligibility"] --> Mode{"Select Mode"}

    subgraph SingleMode["Single Scheme Evaluation"]
        Mode -->|Evaluate Specific Scheme| PickScheme["Select Scheme from Searchable Dropdown (1,062 schemes)"]
        PickScheme --> Params1["Confirm Profile Parameters (Age, Income, State, Land)"]
        Params1 --> PostSingle["POST /api/eligibility/check-scheme/:id"]
        PostSingle --> FetchRules["Fetch Active Rules from eligibilityrules collection"]
        FetchRules --> LoopRules["For each rule: Compare Actual vs. Expected using Operator"]
        LoopRules --> Verdict1{"Any Mandatory Rule Failed?"}
        Verdict1 -->|Yes| ResFailed["Overall Status: NOT_ELIGIBLE (List violated rules & reasons)"]
        Verdict1 -->|No, but missing data| ResInc["Overall Status: INCOMPLETE (List required missing documents)"]
        Verdict1 -->|No, all passed| ResPassed["Overall Status: ELIGIBLE (Display Congratulations & Apply Link)"]
        ResFailed & ResInc & ResPassed --> SaveHist["Record Assessment in eligibility_checks collection"]
    end

    subgraph BatchMode["Batch Assessment Across All Schemes"]
        Mode -->|Check Eligibility Across All Schemes| Params2["Confirm Profile Parameters"]
        Params2 --> PostBatch["POST /api/eligibility/check-all"]
        PostBatch --> FetchAll["Fetch all 1,062 active schemes & all active rules in parallel"]
        FetchAll --> Group["Group rules by schemeId in memory"]
        Group --> EvalLoop["Evaluate profile against each scheme's rule-set"]
        EvalLoop --> Partition["Partition schemes into 3 sets: Eligible, Ineligible, Incomplete"]
        Partition --> ReturnBatch["Return structured JSON with summary counts & scheme cards"]
        ReturnBatch --> RenderTabs["Render interactive UI with Eligible Schemes sorted on top"]
    end
```

---

### Workflow 4: Conversational Scheme Assistant (RAG Pipeline)

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen User
    participant ChatUI as Assistant Chat Page
    participant Server as Node.js Backend API
    participant IR as In-Memory IR Retriever
    participant DB as MongoDB Atlas
    participant Qwen as Qwen 2.5 LLM (OpenRouter)
    
    Citizen->>ChatUI: Types: "I am a female student in Bihar, can I get laptop aid?"
    ChatUI->>Server: POST /api/assistant/chat (message + conversation history)
    Server->>IR: Tokenize Query & Prune Stop-Words (strip 'laptop', 'aid', etc.)
    IR->>DB: Query schemes collection for Bihar + Education + Laptop/Student
    DB-->>IR: Return Top Verified Scheme Documents (Benefits, Rules, Documents)
    Server->>DB: Fetch Logged-in Citizen Profile (Gender: Female, State: Bihar)
    Server->>Server: Construct Grounded System Prompt with Injected Context
    
    alt Cloud API Accessible
        Server->>Qwen: POST /v1/chat/completions (temperature=0.3, max_tokens=1024)
        Qwen-->>Server: Synthesized Factual Answer with Official Portal Links
    else Cloud API Disconnected / Rate Limited
        Server->>Server: Activate Local Fallback Synthesizer (generateGroundedResponse)
        Server->>Server: Assemble Structured Markdown from DB Objects
    end
    
    Server-->>ChatUI: Return Verified Scheme Answer & Matched Scheme Badges
    ChatUI-->>Citizen: Render Conversational Message with Direct Application Links
```

---

### Workflow 5: Hybrid Personalized Scheme Recommendation

```mermaid
flowchart TD
    User["Citizen logs into portal"] --> OpenRec["Navigate to /recommendations"]
    OpenRec --> API["GET /api/schemes/rag-recommendations?limit=30"]
    API --> Profile["Fetch Citizen Demographic Profile from DB"]
    API --> History["Fetch Citizen's Last 15 Search & Viewed Records from searchhistories"]
    
    History --> Tokenize["Extract distinct semantic keywords & remove domain stop-words"]
    Profile --> StateConst["Identify Citizen Home State"]
    
    Tokenize & StateConst --> CandidateQuery["Query MongoDB for active schemes matching keywords + State residency"]
    CandidateQuery --> Candidates["Retrieve Candidate Scheme Set (up to 80 schemes)"]
    
    Candidates --> RuleFilter["Evaluate each candidate through Symbolic Rule Engine"]
    RuleFilter --> Qualified{"Does Citizen qualify under statutory rules?"}
    Qualified -->|No| Discard["Discard scheme (Do not recommend ineligible schemes)"]
    Qualified -->|Yes| Score["Calculate Relevance Score: (Keyword Hits * 10) + Novelty Bonus"]
    
    Score --> Sort["Sort descending by score and compute Match Percentage (70% - 98%)"]
    Sort --> Partition["Organize into Portal Tabs: All Recommended, From Searches, From Profile"]
    Partition --> Render["Render citizen dashboard with high-match recommendations"]
```

---

### Workflow 6: Application Reminder & Automated Cron Notification

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen User
    participant UI as React Frontend
    participant API as Reminders Controller
    participant DB as MongoDB Atlas
    participant Cron as Node-Cron Background Scheduler
    
    Citizen->>UI: Clicks "Set Reminder" on Scheme Detail Page
    UI->>Citizen: Display Reminder Modal (Select Date & Custom Notes)
    Citizen->>UI: Chooses Date: 2026-11-05 & Note: "Submit income certificate"
    UI->>API: POST /api/reminders (schemeId, reminderDate, message)
    API->>DB: Update Bookmark document (reminder: { enabled: true, status: 'UPCOMING', date, note })
    API-->>UI: Toast: "Reminder scheduled successfully"
    
    loop Every Minute (* * * * *)
        Cron->>DB: Query bookmarks where enabled=true, status='UPCOMING', reminderDate <= now
        alt Due Reminders Found
            Cron->>DB: Insert Notification Document (type: 'REMINDER', title, body, schemeId)
            Cron->>DB: Update Bookmark reminder.status = 'TRIGGERED'
            Cron->>Cron: Log: "[Reminder Job] Successfully triggered reminder"
        else No Due Reminders
            Cron->>Cron: Sleep until next minute tick
        end
    end
    
    Citizen->>UI: Refreshes Portal or Checks Notifications Bell
    UI->>API: GET /api/notifications
    API->>DB: Query notifications for current userId (sorted newest first)
    DB-->>UI: Return notifications list
    UI-->>Citizen: Display Alert Badge & Direct Link to Apply
```

---

### Workflow 7: Citizen Grievance Clustering & Policy Escalation

```mermaid
flowchart TD
    Grievance["Citizens submit feedback on scheme: 'Income ceiling of 1 Lakh is too strict'"] --> Submit["POST /api/feedback"]
    Submit --> SaveFB["Save Document in feedback collection"]
    SaveFB --> NLP["NLP Normalizer extracts canonical category: income_limit"]
    NLP --> Compound["Form Topic Key: [Scheme_ID]_[FeedbackType]_[income_limit]"]
    
    Compound --> Match["Query feedback collection for identical Topic Key"]
    Match --> Count["Count distinct registered citizens who submitted feedback"]
    
    Count --> Threshold{"Distinct Citizens >= 5?"}
    Threshold -->|No| Accumulate["Accumulate grievance count (Wait for more telemetry)"]
    Threshold -->|Yes| Recommendation{"Admin Recommendation already active?"}
    
    Recommendation -->|No| CreateRec["Create AdminRecommendation document:
    - Title: 'Eligibility Rule Discrepancy on [Scheme]'
    - Description: '5 distinct citizens reported income rule too strict'
    - Suggested Action: 'Review annualFamilyIncome in Rule Builder'
    - Status: IN_REVIEW"]
    
    Recommendation -->|Yes| UpdateRec["Append new feedback ID to existing recommendation record"]
    
    CreateRec & UpdateRec --> AlertAdmin["Display highlighted card on Admin Recommendations Dashboard"]
    AlertAdmin --> AdminAction{"Admin clicks Open in Rule Builder"}
    AdminAction --> AdjustRule["Admin relaxes income threshold condition"]
    AdjustRule --> Resolve["Admin clicks Mark Implemented"]
```

---

### Workflow 8: Admin Scheme Publishing & Visual Rule Configuration

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Portal Administrator
    participant UI as Admin Portal
    participant API as Admin Controller
    participant DB as MongoDB Atlas
    
    Admin->>UI: Fills Scheme Form (Name, Ministry, Department, Benefits, Documents, URL)
    UI->>API: POST /api/schemes (Bearer Admin JWT)
    API->>DB: Save Scheme Document (isActive: false / DRAFT)
    API-->>UI: Created Scheme Object with new Scheme ID
    
    Admin->>UI: Clicks "Configure Eligibility Rules"
    UI->>UI: Open Visual Rule Builder (/admin/rules?schemeId=...)
    Admin->>UI: Select Field: annualFamilyIncome, Operator: <=, Value: 250000, Mandatory: true
    UI->>API: POST /api/eligibility-rules
    API->>DB: Insert EligibilityRule Document linked to Scheme ID
    
    Admin->>UI: Adds Age Condition (Field: age, Operator: >=, Value: 18)
    UI->>API: POST /api/eligibility-rules
    API->>DB: Insert Second EligibilityRule Document
    
    Admin->>UI: Clicks "Verify & Publish Scheme"
    UI->>API: PATCH /api/schemes/:id/verification (status: VERIFIED, isActive: true)
    API->>DB: Update Scheme verificationStatus='VERIFIED' and isActive=true
    API->>DB: Record immutable entry in audit_logs collection
    API-->>UI: Toast: "Scheme Verified and Published to Public Catalog"
```

---

## 5. State Transition Lifecycle Models

### 5.1 Scheme Eligibility Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Unchecked: Citizen browses scheme
    Unchecked --> Evaluating: Citizen runs Eligibility Assessment
    
    Evaluating --> Eligible: All mandatory rules pass
    Evaluating --> NotEligible: One or more mandatory rules fail
    Evaluating --> Incomplete: Mandatory rule missing profile data
    
    NotEligible --> ProfileUpdated: Citizen updates credentials or certificate
    Incomplete --> ProfileUpdated: Citizen enters missing attributes
    ProfileUpdated --> Evaluating: Citizen clicks Re-evaluate
    
    Eligible --> Applied: Citizen clicks Official Application Portal link
```

### 5.2 Application Reminder Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Created: Citizen schedules reminder for scheme
    Created --> Upcoming: Stored in database with future trigger date
    
    Upcoming --> Triggered: Cron engine detects reminderDate <= current_time
    Upcoming --> Cancelled: Citizen deletes reminder or unbookmarks scheme
    
    Triggered --> NotificationDelivered: In-portal notification record generated
    NotificationDelivered --> Acknowledged: Citizen views alert and marks as read
```

---

## 6. Complete Database Entity-Relationship (ER) Model

```mermaid
erDiagram
    USER ||--|| USER_PROFILE : "has"
    USER ||--o{ BOOKMARK : "creates"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ SEARCH_HISTORY : "generates"
    USER ||--o{ FEEDBACK : "submits"
    USER ||--o{ ELIGIBILITY_CHECK : "performs"
    USER ||--o{ AUDIT_LOG : "triggers"

    DEPARTMENT ||--o{ SCHEME : "administers"
    SCHEME ||--o{ ELIGIBILITY_RULE : "defines"
    SCHEME ||--o{ BOOKMARK : "is_saved_in"
    SCHEME ||--o{ FEEDBACK : "receives_complaints"
    SCHEME ||--o{ ADMIN_RECOMMENDATION : "generates_policy_alert"
    SCHEME ||--o{ ELIGIBILITY_CHECK : "evaluated_in"

    USER {
        ObjectId _id PK
        string fullName
        string email
        string password
        string role "CITIZEN | ADMIN"
        boolean isActive
        date createdAt
    }

    USER_PROFILE {
        ObjectId _id PK
        ObjectId userId FK
        date dateOfBirth
        string gender
        string state
        string district
        number annualFamilyIncome
        string occupation
        string employmentStatus
        string community
        boolean disabilityStatus
    }

    DEPARTMENT {
        ObjectId _id PK
        string departmentName
        string slug
        string ministryName
        string officialWebsite
    }

    SCHEME {
        ObjectId _id PK
        string schemeName
        string slug
        string category
        string schemeLevel "Central | State"
        string[] applicableStates
        ObjectId departmentId FK
        string ministry
        string shortDescription
        string fullDescription
        array benefits
        array requiredDocuments
        string verificationStatus "PENDING | VERIFIED"
        boolean isActive
    }

    ELIGIBILITY_RULE {
        ObjectId _id PK
        ObjectId schemeId FK
        string ruleName
        string field
        string operator "==, !=, >, >=, <, <=, IN, NOT_IN, BETWEEN, EXISTS"
        mixed expectedValue
        boolean isMandatory
        boolean isActive
    }

    BOOKMARK {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId schemeId FK
        boolean reminderEnabled
        date reminderDate
        string reminderMessage
        string reminderStatus "UPCOMING | TRIGGERED"
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId userId FK
        string title
        string message
        string notificationType "REMINDER | SYSTEM | SCHEME_UPDATE"
        boolean isRead
        date createdAt
    }

    ADMIN_RECOMMENDATION {
        ObjectId _id PK
        ObjectId schemeId FK
        string topicKey
        string title
        string description
        ObjectId[] feedbackIds
        number citizenCount
        string status "IN_REVIEW | IMPLEMENTED | DISMISSED"
    }
```

---

## 7. Role-Based Access Control (RBAC) Interaction Matrix

| Platform Capability | Public Guest (Unauthenticated) | Registered Citizen User | Portal Administrator |
| :--- | :---: | :---: | :---: |
| **Browse 1,062 Scheme Directory** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Filter by Ministry / State / Category** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Single Scheme Eligibility Assessment** | ✅ Yes (Manual input form) | ✅ Yes (Auto-fills from profile) | ✅ Yes |
| **Batch Eligibility Assessment Across All Schemes** | ❌ Requires Profile / Login | ✅ Yes (1-Click Evaluation) | ✅ Yes |
| **AI Scheme Assistant (Conversational Chatbot)** | ✅ Yes (Guest context) | ✅ Yes (Personalized demographic context) | ✅ Yes |
| **Personalized Hybrid Recommendations** | ❌ No | ✅ Yes (Profile & Search driven) | ✅ Yes |
| **Save Schemes / Manage Bookmarks** | ❌ No | ✅ Yes | ✅ Yes |
| **Schedule Application Reminders** | ❌ No | ✅ Yes | ✅ Yes |
| **Receive In-Portal Deadline Notifications** | ❌ No | ✅ Yes | ✅ Yes |
| **Submit Scheme Grievance & Feedback** | ❌ No | ✅ Yes | ✅ Yes |
| **Create / Edit / Publish Schemes** | ❌ No | ❌ Forbidden | ✅ Full Admin Access |
| **Create & Modify Rules in Visual Rule Builder** | ❌ No | ❌ Forbidden | ✅ Full Admin Access |
| **Inspect Citizen Grievance Clustering Desk** | ❌ No | ❌ Forbidden | ✅ Full Admin Access |
| **Audit Logs & Verification Management** | ❌ No | ❌ Forbidden | ✅ Full Admin Access |

---

## 8. Fault Tolerance, Edge Cases & Resilience Mechanisms

### 8.1 Cloud AI API Latency & Outage Resilience
- **Challenge**: External LLM inference APIs (OpenRouter / Hugging Face) may experience network timeouts or rate-limiting during peak usage.
- **Solution**: GSEE includes an automated fallback pipeline. If the primary cloud inference endpoint does not respond within 5,000ms or returns an HTTP error, the system automatically redirects execution to the local grounder (`generateGroundedResponse`). This engine constructs structured, verified markdown responses directly from the MongoDB schema, ensuring the chatbot never crashes.

### 8.2 Safe Server Restart & Overdue Reminder Recovery
- **Challenge**: If the backend server restarts for deployment or maintenance, scheduled reminders that came due during downtime could be missed.
- **Solution**: The `initReminderScheduler()` function executes an immediate database sweep (`processDueReminders()`) upon initialization before activating the standard per-minute cron listener. Any reminders with `reminderDate <= new Date()` and status `'UPCOMING'` are immediately processed and notifications dispatched.

### 8.3 Legal Explainability & Mandatory Condition Gating
- **Challenge**: An applicant might meet 4 optional criteria (e.g., student status, correct state, valid ID) but exceed the maximum family income limit.
- **Solution**: The Symbolic Rule Engine classifies rules into `isMandatory: true` and `isMandatory: false`. If even a single mandatory threshold fails, the system strictly outputs `NOT_ELIGIBLE` and flags the exact failed condition. It does not permit non-mandatory passes to override a legal disqualification.

### 8.4 Deterministic Route Redirection in Production SPA
- **Challenge**: Modern Single Page Applications hosted on static CDNs (Vercel) return HTTP 404 errors when users refresh deep URLs (such as `/admin/recommendations` or `/eligibility?schemeId=...`).
- **Solution**: GSEE includes production SPA redirect configurations ([`frontend/vercel.json`](frontend/vercel.json) and [`frontend/public/_redirects`](frontend/public/_redirects)) mapping all incoming routes (`/*`) to `/index.html`, preserving browser client-side routing across all devices.
