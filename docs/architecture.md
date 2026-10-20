# Architecture Documentation: Government Scheme Eligibility Engine

## 1. System Overview

The **Government Scheme Eligibility Engine** is a full-stack, modular web application built for Indian citizens to discover, assess eligibility, bookmark, and track government welfare schemes and grants across central and state ministries.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CITIZEN / ADMIN CLIENT                        │
│   React.js 18 (Vite) + Tailwind CSS + Lucide Icons + React Router DOM   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                              RESTful HTTP / JSON
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                       EXPRESS.JS BACKEND (Node.js)                     │
│  ┌───────────────────┬────────────────────────┬──────────────────────┐ │
│  │ Auth & JWT Guard  │ Scheme & Dept Router   │ Eligibility Engine   │ │
│  ├───────────────────┼────────────────────────┼──────────────────────┤ │
│  │ Bookmarks & Notifs│ Audit Logging & System │ node-cron Scheduler  │ │
│  └───────────────────┴────────────────────────┴──────────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                 Mongoose
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                           MONGODB DATABASE                             │
│  - users             - user_profiles        - departments              │
│  - schemes           - eligibility_rules    - bookmarks                │
│  - notifications     - search_history       - feedback                 │
│  - system_notifs     - eligibility_checks   - audit_logs               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Principles

1. **Modular Separation**:
   - The frontend and backend run as independent services.
   - Frontend communicates with backend strictly via REST APIs using Axios with standard Bearer JWT authorization headers.

2. **Deterministic, Rule-Based Eligibility Engine**:
   - Evaluates scheme requirements using declarative database rules without executing arbitrary user code.
   - Operators supported: `==`, `!=`, `>`, `>=`, `<`, `<=`, `IN`, `NOT_IN`, `BETWEEN`, `EXISTS`.
   - Age is dynamically calculated from `dateOfBirth`.
   - Three result states:
     - `ELIGIBLE`: All mandatory rules passed.
     - `NOT_ELIGIBLE`: At least one mandatory condition failed.
     - `INCOMPLETE`: Required profile information is missing, which does **not** fail the applicant.

3. **Background Reminder Processing**:
   - Powered by `node-cron` with a sweep on server startup and periodic evaluation.
   - Due reminders are automatically transformed into persistent user notifications and tagged as `TRIGGERED`.

4. **Strict Scope Compliance (No ML/AI in this phase)**:
   - No Python dependencies, embeddings, or vector databases.
   - Scheme Assistant is rendered as a clean placeholder interface stating scheduled integration.
   - Recommendations are delivered as standard filtered discovery.

---

## 3. Technology Stack Breakdown

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Runtime** | React 18, Vite | High performance Single Page Application |
| **Styling & UI** | Tailwind CSS v3, Lucide React | Modern gov design system (#173B67, #2563EB, #F7F9FC) |
| **Routing & State** | React Router DOM v6, React Context | Client routing, AuthContext, ToastContext |
| **Backend Runtime** | Node.js (ES Modules), Express.js | REST API server |
| **Database** | MongoDB 7+, Mongoose ODM | Document storage, validation, compound indexes |
| **Security** | JWT, bcryptjs, Helmet, CORS, Rate-Limiting | Authentication, password hashing, and endpoint protection |
| **Scheduler** | node-cron | Background reminder evaluation |
