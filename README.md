# Government Scheme Eligibility Engine (GSEE)

[![Live App](https://img.shields.io/badge/Live%20Website-Vercel-black?style=for-the-badge&logo=vercel)](https://base-start-red.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=for-the-badge&logo=render)](https://base-start.onrender.com)
[![Database](https://img.shields.io/badge/Cloud%20Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/cloud/atlas)

A full-stack, transparent web platform designed for Indian citizens to discover government schemes, explore initiatives by ministry or department, assess personalized eligibility criteria using a rule-based engine, receive intelligent RAG-based recommendations, bookmark schemes, schedule date-based application reminders, and access verified government portals.

---

## 🌐 Live Deployment Links

- **Production Frontend**: [https://base-start-red.vercel.app](https://base-start-red.vercel.app)
- **Admin Recommendations**: [https://base-start-red.vercel.app/admin/recommendations](https://base-start-red.vercel.app/admin/recommendations)
- **Backend API (Render)**: [https://base-start.onrender.com](https://base-start.onrender.com)
- **API Health Check**: [https://base-start.onrender.com/api/health](https://base-start.onrender.com/api/health)

---

## 🔑 Default Test Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Portal Admin** | `admin@govscheme.in` | `admin123` | Full Admin Console, Scheme CRUD, Rules Builder, Recommendations, Verification & Audits |
| **Citizen User** | `k0518kishore@gmail.com` | `password123` | Citizen Dashboard, Profile, Bookmarks, Reminders, Eligibility Checker |

---

## 🚀 Key Highlights & Architecture

- **1,062 Central & State Schemes**: Comprehensive directory streaming from MongoDB Atlas cloud across multiple ministries and departments.
- **Rule-Based Eligibility Engine**: Evaluates applicant attributes (annual income, occupation, community category, age calculated from DOB, state, land ownership, and disability) against conditions using operators: `==`, `!=`, `>`, `>=`, `<`, `<=`, `IN`, `NOT_IN`, `BETWEEN`, `EXISTS`.
- **Hybrid RAG Scheme Recommendations**: Citizen discovery powered by profile-based criteria, search query history intelligence, and department clustering.
- **AI Scheme Assistant**: Powered by Alibaba's **Qwen 2.5 Instruct** Large Language Model with live database retrieval grounding (RAG).
- **Official Pillar Watermark**: Authentic, high-resolution national emblem watermark background across citizen and administration portals.
- **Automated Reminder Cron Engine**: Runs background sweeps for overdue scheme deadlines with persistent citizen notifications.
- **Three Deterministic Result States**: `ELIGIBLE`, `NOT_ELIGIBLE`, and `INCOMPLETE` with transparent line-by-line rule explanations.

> 📖 **Comprehensive Project Reports**:
> - **[AI & Machine Learning Architecture (`AI_ML_MODELS.md`)](AI_ML_MODELS.md)**: Mathematical formulations, Qwen 2.5 LLM, RAG framework, Hybrid Recommendation algorithms, Symbolic AI, and viva voce defense cheat-sheet.
> - **[System Functionalities & Workflow Engineering (`FUNCTIONALITIES_AND_WORKFLOW.md`)](FUNCTIONALITIES_AND_WORKFLOW.md)**: Module specifications, 8 end-to-end Mermaid workflow diagrams, state lifecycles, and database ER model.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, React Router DOM v6, Axios
- **Backend**: Node.js (ES Modules), Express.js, JWT, bcryptjs, Helmet, CORS, Morgan, node-cron
- **Database**: MongoDB Atlas Cloud, Mongoose 8.x
- **Hosting**: Vercel (Frontend SPA) + Render (Node.js API)

---

## 📂 Project Structure

```text
government-scheme-engine/
│
├── frontend/
│   ├── public/
│   │   ├── government-watermark.png  # Grand official emblem watermark
│   │   └── _redirects                # SPA client-side routing for production
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Button, Badge, Card, Input, Select, Modal, GlobalWatermark
│   │   │   ├── cards/         # SchemeCard, DepartmentCard
│   │   │   ├── dialogs/       # ReminderModal
│   │   │   └── navigation/    # Navbar, Footer, UserSidebar, AdminSidebar
│   │   ├── layouts/           # PublicLayout, UserLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── public/        # LandingPage, SchemesPage, SchemeDetailPage, EligibilityCheckerPage
│   │   │   ├── auth/          # LoginPage, RegisterPage
│   │   │   ├── user/          # UserDashboard, UserProfilePage, BookmarksPage, RemindersPage
│   │   │   └── admin/         # AdminDashboard, AdminSchemesPage, AdminRulesPage, AdminRecommendationsPage
│   │   ├── services/          # api.js (Axios instance with Bearer interceptor)
│   │   └── context/           # AuthContext, ToastContext
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/            # db.js, jwt.js
│   │   ├── models/            # 13 Mongoose models (Scheme, User, EligibilityRule, Department, etc.)
│   │   ├── controllers/       # Auth, Schemes, Departments, Eligibility, Recommendations, etc.
│   │   ├── routes/            # Express routers for all modules
│   │   ├── middleware/        # auth, admin, errorHandler
│   │   ├── services/          # Rule engine, RAG recommender, reminder scheduler
│   │   ├── utils/             # Seed data & Atlas cloud migration utilities
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
│
├── docs/                      # Architecture, schema, and API documentation
└── README.md
```

---

## 💻 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/k0518ishore-tech/Base_start.git
   cd Base_start
   ```

2. **Configure environment variables:**
   - In `backend/.env`:
     ```env
     PORT=5000
     MONGODB_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_jwt_secret
     NODE_ENV=development
     CLIENT_URL=http://localhost:5173
     OPENROUTER_API_KEY=your_key
     QWEN_MODEL=qwen/qwen-2.5-7b-instruct
     ```
   - In `frontend/.env`:
     ```env
     VITE_API_URL=http://localhost:5000/api
     ```

3. **Install dependencies and run:**
   ```bash
   # In terminal 1 (Backend)
   cd backend
   npm install
   npm start

   # In terminal 2 (Frontend)
   cd frontend
   npm install
   npm run dev
   ```
