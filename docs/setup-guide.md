# Setup & Deployment Guide: Government Scheme Eligibility Engine

## Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: v6.0 or higher running on `mongodb://localhost:27017`

---

## 1. Quick Installation & Setup

### Step 1: Install Dependencies

From the project root:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 2: Environment Configuration

Verify or create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/government_scheme_db
JWT_SECRET=super_secret_jwt_key_gov_scheme_engine_2026_secure
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
CRON_SCHEDULE="* * * * *"
```

---

### Step 3: Seed the Database

Run the automated seeder to load verified government ministries, schemes, eligibility rules, and demo accounts:

```bash
cd backend
npm run seed
```

This will seed:
- **Admin Account**: `admin@schemegov.in` / `Admin@12345`
- **Citizen Account**: `citizen@schemegov.in` / `Citizen@12345`
- 8 Verified Ministries & Departments
- 8 Authentic Central Schemes (PM-KISAN, AB-PMJAY, PMAY-U, PM SVANidhi, MUDRA, Post-Matric Scholarship, SSY, PM Vishwakarma)
- 11 Deterministic Eligibility Rules

---

### Step 4: Run the Application

In two separate terminals:

**Terminal 1 (Backend Server):**
```bash
cd backend
npm start
# Server starts on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Vite server starts on http://localhost:5173
```

Open your browser at [http://localhost:5173](http://localhost:5173).

---

## 2. Production Build

To build the client for production deployment:

```bash
cd frontend
npm run build
```

This outputs static assets into `frontend/dist/` ready to be served by NGINX, Cloudflare Pages, or Express static middleware.
