# Government Scheme Eligibility Engine

A full-stack, transparent web platform designed for Indian citizens to discover government schemes, explore initiatives by ministry or department, assess personalized eligibility criteria using a rule-based engine, bookmark schemes, schedule date-based application reminders, and access verified government portals.

---

## Key Highlights

- **Visual Quality & Design System**: Custom design system adhering to the official palette (`#173B67` deep primary navy, `#2563EB` secondary blue, `#F7F9FC` background), clean Inter typography, responsive tables, cards, dialogs, and alerts.
- **Automated Rule-Based Eligibility Engine**: Evaluates applicant attributes (annual income, occupation, community category, age calculated from DOB, state, and disability) against conditions using operators: `==`, `!=`, `>`, `>=`, `<`, `<=`, `IN`, `NOT_IN`, `BETWEEN`, `EXISTS`.
- **Three Result States**: `ELIGIBLE`, `NOT_ELIGIBLE`, and `INCOMPLETE` (with explicit reasons for passed, failed, and missing information).
- **Background Scheduled Reminders**: Powered by `node-cron` with safe startup sweeps for overdue reminders, generating persistent in-portal user notifications.
- **Department-Wise Discovery**: Comprehensive Department Directory where every scheme is strictly associated with its administering government department (`departmentId`).
- **Comprehensive Admin Console**: Manage schemes, departments, visual eligibility rules, citizen accounts, verification quality, and feedback desk.
- **Strict Scope Compliance**: No machine learning, embeddings, or vector databases. Transparent non-AI discovery and professional placeholder interface for Scheme Assistant.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, React Router DOM v6, Axios
- **Backend**: Node.js (ES Modules), Express.js, JWT, bcryptjs, Helmet, CORS, Morgan, node-cron
- **Database**: MongoDB, Mongoose 8.x
- **Testing & Tooling**: Node test scripts, PostCSS, Autoprefixer

---

## Default Test Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Citizen User** | `citizen@schemegov.in` | `Citizen@12345` | Citizen Dashboard, Profile, Bookmarks, Reminders, Eligibility Checker |
| **Portal Admin** | `admin@schemegov.in` | `Admin@12345` | Admin Console, Scheme CRUD, Rules Builder, Dept CRUD, User Management |

---

## Project Structure

```text
government-scheme-engine/
│
├── frontend/
│   ├── public/
│   │   └── assets/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Button, Badge, Card, Input, Select, Modal, Tabs, EmptyState, LoadingSpinner
│   │   │   ├── cards/         # SchemeCard, DepartmentCard
│   │   │   ├── dialogs/       # ReminderModal
│   │   │   └── navigation/    # Navbar, Footer, UserSidebar, AdminSidebar
│   │   ├── layouts/           # PublicLayout, UserLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── public/        # LandingPage, SchemesPage, SchemeDetailPage, DepartmentsPage, etc.
│   │   │   ├── auth/          # LoginPage, RegisterPage
│   │   │   ├── user/          # UserDashboard, UserProfilePage, BookmarksPage, RemindersPage, etc.
│   │   │   └── admin/         # AdminDashboard, AdminSchemesPage, AdminDepartmentsPage, AdminRulesPage, etc.
│   │   ├── services/          # api.js (Axios instance with Bearer interceptor)
│   │   ├── context/           # AuthContext, ToastContext
│   │   ├── routes/            # ProtectedRoute
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/            # db.js, jwt.js
│   │   ├── models/            # 12 Mongoose models: User, Scheme, Department, EligibilityRule, etc.
│   │   ├── controllers/       # Auth, Schemes, Departments, Eligibility, Reminders, Bookmarks, etc.
│   │   ├── routes/            # Express routers for all modules
│   │   ├── middleware/        # auth, admin, errorHandler, rateLimiter
│   │   ├── services/          # eligibility engine, reminder scheduler, notification service
│   │   ├── utils/             # seedData.js
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
│
├── docs/
│   ├── architecture.md
│   ├── database-schema.md
│   ├── api-documentation.md
│   └── setup-guide.md
│
├── .env.example
├── .gitignore
└── README.md
```

---

## Getting Started

1. **Seed the database:**
   ```bash
   cd backend
   npm run seed
   ```

2. **Start the backend server:**
   ```bash
   cd backend
   npm start
   # API running on http://localhost:5000
   ```

3. **Start the frontend application:**
   ```bash
   cd frontend
   npm run dev
   # Web App running on http://localhost:5173
   ```

Refer to [`docs/setup-guide.md`](docs/setup-guide.md) for full instructions and [`docs/api-documentation.md`](docs/api-documentation.md) for endpoint details.
