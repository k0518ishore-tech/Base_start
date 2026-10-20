# API Documentation: Government Scheme Eligibility Engine

Base URL: `http://localhost:5000/api`

## Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new citizen | Public |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT | Public |
| `POST` | `/api/auth/logout` | Invalidate session | Public |
| `GET` | `/api/auth/me` | Current user & profile info | Bearer JWT |

---

## Schemes (`/api/schemes`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/schemes` | List schemes with search, category, state, pagination | Public / Auth |
| `GET` | `/api/schemes/recommended` | Curated discovery schemes by category & region | Public / Auth |
| `GET` | `/api/schemes/:id` | Get scheme details by ID or slug with rules count | Public / Auth |
| `POST` | `/api/schemes` | Create new government scheme | Admin Only |
| `PUT` | `/api/schemes/:id` | Update scheme details | Admin Only |
| `DELETE` | `/api/schemes/:id` | Delete scheme & associated rules | Admin Only |
| `PATCH` | `/api/schemes/:id/verification` | Update verification status | Admin Only |

---

## Departments (`/api/departments`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/departments` | List all departments with active scheme count | Public |
| `GET` | `/api/departments/:id` | Get department details by ID or slug | Public |
| `GET` | `/api/departments/:id/schemes` | List all schemes belonging to department | Public |
| `POST` | `/api/departments` | Add new department | Admin Only |
| `PUT` | `/api/departments/:id` | Update department details | Admin Only |
| `DELETE` | `/api/departments/:id` | Delete or deactivate department | Admin Only |

---

## Eligibility Engine (`/api/eligibility`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/eligibility/check-scheme/:schemeId` | Evaluate single scheme against profile | Public / Auth |
| `POST` | `/api/eligibility/check-all` | Batch evaluate all schemes against profile | Public / Auth |
| `GET` | `/api/eligibility/history` | Get user's past evaluation history | Bearer JWT |

### Sample Evaluation Response

```json
{
  "success": true,
  "data": {
    "schemeId": "65b...",
    "schemeName": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    "overallStatus": "ELIGIBLE",
    "summary": {
      "totalRules": 2,
      "passedCount": 2,
      "failedCount": 0,
      "incompleteCount": 0
    },
    "passedRules": [
      {
        "ruleName": "Farmer Occupation Check",
        "field": "occupation",
        "operator": "==",
        "expectedValue": "Farmer",
        "actualValue": "Farmer",
        "status": "PASSED",
        "explanation": "Passed: Your occupation (Farmer) matches the requirement (Farmer)."
      }
    ],
    "failedRules": [],
    "incompleteRules": []
  }
}
```

---

## Bookmarks & Reminders (`/api/bookmarks`, `/api/reminders`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/bookmarks` | List user's saved schemes | Bearer JWT |
| `POST` | `/api/bookmarks` | Add scheme to bookmarks | Bearer JWT |
| `POST` | `/api/bookmarks/toggle/:schemeId` | Toggle bookmark status | Bearer JWT |
| `DELETE` | `/api/bookmarks/:schemeId` | Remove scheme from bookmarks | Bearer JWT |
| `POST` | `/api/reminders` | Schedule reminder on a scheme | Bearer JWT |
| `PUT` | `/api/reminders/:id` | Update reminder date or message | Bearer JWT |
| `PATCH` | `/api/reminders/:id/cancel` | Cancel an upcoming reminder | Bearer JWT |
| `PATCH` | `/api/reminders/:id/complete` | Mark reminder as completed | Bearer JWT |
| `GET` | `/api/reminders/upcoming` | List upcoming reminders | Bearer JWT |
| `GET` | `/api/reminders/history` | List completed & triggered reminders | Bearer JWT |

---

## Notifications & Feedback (`/api/notifications`, `/api/feedback`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/notifications` | Get user notifications | Bearer JWT |
| `GET` | `/api/notifications/unread-count` | Get count of unread notifications | Bearer JWT |
| `PATCH` | `/api/notifications/:id/read` | Mark notification as read | Bearer JWT |
| `PATCH` | `/api/notifications/read-all` | Mark all notifications read | Bearer JWT |
| `DELETE` | `/api/notifications/:id` | Delete notification | Bearer JWT |
| `POST` | `/api/feedback` | Submit feedback / support ticket | Bearer JWT |
| `GET` | `/api/feedback/my` | View user's submitted feedback | Bearer JWT |
| `GET` | `/api/feedback` | List all feedback tickets (Admin) | Admin Only |
| `PATCH` | `/api/feedback/:id` | Reply to feedback and update status | Admin Only |

---

## Admin Endpoints (`/api/admin`, `/api/users`, `/api/eligibility-rules`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Administrative overview metrics | Admin Only |
| `GET` | `/api/admin/audit-logs` | Administrative action audit trails | Admin Only |
| `GET` | `/api/admin/system-notifications` | Automated system events log | Admin Only |
| `GET` | `/api/users` | List citizen users with pagination | Admin Only |
| `PATCH` | `/api/users/:id/status` | Suspend or activate citizen user | Admin Only |
| `POST` | `/api/eligibility-rules` | Create eligibility rule | Admin Only |
| `PUT` | `/api/eligibility-rules/:id` | Edit eligibility rule | Admin Only |
| `DELETE` | `/api/eligibility-rules/:id` | Delete eligibility rule | Admin Only |
