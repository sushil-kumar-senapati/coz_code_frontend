# People's Priorities AI — Copilot Context (Frontend)

> This file is automatically read by GitHub Copilot to understand the project context.
> **DO NOT DELETE** — It ensures every team member gets full context in Copilot Chat.

---

## PROJECT OVERVIEW

**People's Priorities AI** is a multilingual AI platform for constituency development planning under India's MPLADS scheme (₹5 Crore/year per MP). It converts unstructured citizen complaints (text/audio/image in 13 Indian languages) into transparent, data-driven MP funding recommendations.

### Core Problem
No systematic way for MPs to collect citizen demands → funds misallocated, unheard voices, no accountability. This platform is the missing decision-support layer.

---

## ARCHITECTURE (6 Layers)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PEOPLE'S PRIORITIES AI                            │
├─────────────┬───────────────────────────────────────┬───────────────┤
│  FRONTEND   │          BACKEND SERVICES              │   DATABASE   │
│  (React)    │                                        │   (MySQL)    │
│             │  ┌──────────────┐  ┌────────────────┐  │              │
│  Layer 1 ──►│  │ backend-api  │  │  scheduler     │  │  19 tables   │
│  Layer 6 ──►│  │ (FastAPI)    │  │  (Layers 2-5)  │  │  7 triggers  │
│             │  │ Port: 8000   │  │  23:30 nightly  │  │  6 views     │
│  Port: 5173 │  └──────────────┘  └────────────────┘  │  Port: 3306  │
└─────────────┴───────────────────────────────────────┴───────────────┘
```

### Three Repos
1. **`coz_code_backend`** — FastAPI backend for Layer 1 (citizen intake) + Layer 6 (MP dashboard). Port 8000.
2. **`coz_code_scheduler`** — Python scheduler for Layers 2-5. Nightly at 23:30.
3. **`coz_code_frontend`** (THIS REPO) — React + Vite UI on port 5173. Citizen submission + dashboards.

---

## THIS REPO: FRONTEND (`coz_code_frontend`)

### Tech Stack
- **Framework:** React 19 + Vite
- **Routing:** react-router-dom v7
- **Styling:** CSS variables (dark/light theme via `data-theme` attribute)
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Icons:** Phosphor Icons (@phosphor-icons/react)
- **i18n:** i18next + react-i18next (13 languages)
- **Port:** 5173

### Project Structure
```
coz_code_frontend/
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
├── public/
└── src/
    ├── main.jsx              # React entry point
    ├── App.jsx               # Routes + layout
    ├── index.css             # Complete theme system (dark/light CSS vars)
    ├── api/
    │   └── client.js         # All API calls to backend (:8000)
    ├── components/
    │   └── Navbar.jsx        # Logo, nav links, language selector, theme toggle
    ├── contexts/
    │   ├── AuthContext.jsx    # Global auth state (login/register/logout)
    │   └── ThemeContext.jsx   # Dark/light theme toggle
    ├── data/
    │   └── dummyData.js      # Fallback dummy data (replaced by API)
    ├── i18n/
    │   ├── index.js          # i18n config
    │   └── locales/          # 13 language JSON files
    │       ├── en.json       # English (complete)
    │       ├── hi.json       # Hindi
    │       ├── or.json       # Odia
    │       ├── bn.json       # Bengali
    │       ├── ta.json       # Tamil
    │       ├── te.json       # Telugu
    │       ├── mr.json       # Marathi
    │       ├── gu.json       # Gujarati
    │       ├── kn.json       # Kannada
    │       ├── ml.json       # Malayalam
    │       ├── pa.json       # Punjabi
    │       ├── as.json       # Assamese
    │       └── ur.json       # Urdu
    └── pages/
        ├── Home.jsx              # Landing page (hero, how-it-works, features, stats)
        ├── Login.jsx             # Phone + password login
        ├── Register.jsx          # Phone + PIN + password (auto-fill location)
        ├── SubmitIssue.jsx       # Text/audio/image submission with PIN lookup
        ├── CitizenDashboard.jsx  # KPIs, submissions table, area stats, charts
        └── MpDashboard.jsx       # Ranked clusters, budget gauge, approve/reject
```

### Pages & Routes

| Route | Page | Role | Description |
|-------|------|------|-------------|
| `/` | Home | Public | Hero + "How It Works" + features + stats |
| `/login` | Login | Public | Phone + password → JWT auth |
| `/register` | Register | Public | Phone + PIN + password → auto-fill location |
| `/submit` | SubmitIssue | Citizen | Text/audio/image submission with PIN lookup |
| `/dashboard` | CitizenDashboard | Citizen | KPIs, submissions, area stats, category charts |
| `/mp-dashboard` | MpDashboard | MP | Ranked clusters, budget gauge, approve/reject modal |

### Key UI Features
- **Premium design** — glassmorphism navbar, gradient typography, smooth animations
- **Dark/Light theme** — CSS variables, defaults to dark, persisted to localStorage (`pp_theme`)
- **13 Indian languages** — full i18n for UI labels, form fields remain English
- **Audio recording** — Browser MediaRecorder API, real-time timer, max 60s, + upload fallback
- **Image upload** — Drag & drop + click to select, preview
- **PIN auto-fill** — Real-time lookup from India Post API via backend
- **Responsive** — Mobile-friendly layout

### API Client (`src/api/client.js`)

Backend base URL: `http://localhost:8000`

```javascript
// Auth
pinLookup(pinCode)                    // GET /auth/pin-lookup/{pin}
registerUser({ phone, password, name, home_pin_code })  // POST /auth/register
loginUser({ phone, password })        // POST /auth/login
getMe()                               // GET /auth/me

// Submissions
submitIssue({ submission_pin_code, input_type, raw_text, raw_language, audio_file, image_file })
getMySubmissions()                    // GET /submissions/my
getSubmission(id)                     // GET /submissions/{id}
editSubmission(id, raw_text)          // PUT /submissions/{id}

// Citizen Dashboard
getCitizenDashboard()                 // GET /citizen/dashboard
getNotifications()                    // GET /citizen/notifications
markNotificationRead(id)              // PUT /citizen/notifications/{id}/read

// MP Dashboard
getMpDashboard()                      // GET /mp/dashboard
getMpClusters()                       // GET /mp/clusters
getMpClusterDetail(clusterId)         // GET /mp/clusters/{id}
decideMpCluster(clusterId, { decision, reason, allocated_amount })  // POST /mp/clusters/{id}/decide
getMpDecisions()                      // GET /mp/decisions
getMpBudget()                         // GET /mp/budget
```

### Auth Context (`src/contexts/AuthContext.jsx`)
- Global state: `user`, `isAuthenticated`, `isMp`
- Methods: `login()`, `register()`, `logout()`
- Persists to localStorage as `pp_user`
- JWT token included in all API calls via `Authorization: Bearer {token}`

### Theme Context (`src/contexts/ThemeContext.jsx`)
- `darkMode` state (defaults to `true`)
- `toggleTheme()` method
- Sets `data-theme="dark"` or `data-theme="light"` on `<html>`
- Persists to localStorage as `pp_theme`

---

## BACKEND API ENDPOINTS (Port 8000)

### Auth (`/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/auth/pin-lookup/{pin}` | No | Auto-fill location from PIN |
| POST | `/auth/register` | No | Register citizen |
| POST | `/auth/login` | No | Login → JWT |
| GET | `/auth/me` | JWT | Current user profile |

### Submissions (`/submissions`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/submissions/` | JWT(user) | Submit issue (multipart form) |
| GET | `/submissions/my` | JWT(user) | My submissions list |
| GET | `/submissions/{id}` | JWT(user) | Detail + media + history |
| PUT | `/submissions/{id}` | JWT(user) | Edit (same-day, before 23:30) |

### Citizen (`/citizen`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/citizen/dashboard` | JWT(user) | KPIs + area stats |
| GET | `/citizen/notifications` | JWT(user) | Notifications |
| PUT | `/citizen/notifications/{id}/read` | JWT(user) | Mark read |

### MP (`/mp`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/mp/dashboard` | JWT(mp) | Dashboard KPIs + budget + trends |
| GET | `/mp/clusters` | JWT(mp) | Ranked clusters |
| GET | `/mp/clusters/{id}` | JWT(mp) | Cluster detail + submissions + scores |
| POST | `/mp/clusters/{id}/decide` | JWT(mp) | Approve/reject |
| GET | `/mp/decisions` | JWT(mp) | Recent decisions |
| GET | `/mp/budget` | JWT(mp) | Budget overview |

### Scheduler (`/scheduler`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/scheduler/run` | No | Trigger Layer 2→5 pipeline |

---

## TEST CREDENTIALS

- **Citizen:** `9876543210` / `test1234` (also 9876543211-9876543215)
- **MP (Jagatsinghpur):** `9000000001` / `mp123456`

---

## DATABASE SCHEMA (for understanding API responses)

**Schema diagram:** https://dbdiagram.io/d/69305fd5d6676488ba74c3e8

### Key Tables the Frontend Interacts With (via API)
- `users` — phone, name, role (user/mp), home_constituency
- `raw_submissions` — tracking_id (PP-2026-XXXXX), input_type, raw_text, status
- `submission_media` — media_type, file_url, file_name, mime_type
- `demand_clusters` — constituency, representative_text, priority_score, rank, mplads_category_code
- `cluster_scores` — 7-factor breakdown, priority_score_10
- `mp_decisions` — decision (approved/rejected), reason, allocated_amount
- `budget_tracker` — total_budget (₹5Cr), total_allocated, remaining
- `notifications` — notification_type, title, message, is_read

### Submission Status Flow
```
submitted → processing → processed → clustered → categorized → scored → approved/rejected
```

---

## SCORING ENGINE (Layer 5 — shown in MP Dashboard)

### 7-Factor Weighted Formula
| Factor | Weight | Description |
|--------|--------|-------------|
| Demand (D) | 0.18 | Unique citizen count, log-scaled |
| Severity (S) | 0.20 | Category importance (Water=1.0, Roads=0.75) |
| Vulnerability (V) | 0.15 | SC/ST%, BPL%, literacy composite |
| Infrastructure Gap (I) | 0.20 | Reality vs govt standard (anti-gaming) |
| Feasibility (F) | 0.10 | Budget + cost + eligibility |
| Recency (R) | 0.07 | Age + trend of the issue |
| Historical Bias (H) | 0.10 | Boosts underfunded sectors |

Score displayed as **X.X out of 10** on MP Dashboard.

---

## MPLADS CATEGORIES (14 sectors)

Used in dashboard filters, category charts, and cluster categorization:

| Code | Display Name | Severity |
|------|-------------|----------|
| DRINKING_WATER | Drinking Water | 1.00 |
| HEALTH | Health & Family Welfare | 0.95 |
| SANITATION | Sanitation | 0.90 |
| EDUCATION | Education | 0.85 |
| ROADS_PATHWAYS_BRIDGES | Roads, Pathways & Bridges | 0.75 |
| ELECTRICITY | Electricity & Solar | 0.70 |
| IRRIGATION | Irrigation & Flood Control | 0.65 |
| SPORTS | Sports & Community | 0.40 |
| COMMUNITY_INFRASTRUCTURE | Community Infrastructure | 0.40 |
| WOMEN_CHILD_WELFARE | Women & Child Welfare | — |
| DISABILITY_WELFARE | Disability Welfare | — |
| SC_ST_WELFARE | SC/ST Welfare | — |
| RAILWAYS | Railway Related | 0.35 |
| DISASTER_RELIEF | Disaster Relief | — |

---

## KEY DESIGN DECISIONS

1. **Dark theme default** — premium feel, toggle to light available
2. **13 languages** — i18n labels only, form data stays in native language
3. **PIN auto-fill** — real India Post API lookup, shows location grid
4. **Audio recording** — Browser MediaRecorder API + file upload option
5. **Multipart form** — `FormData` for file uploads (audio/image)
6. **Role-based routing** — citizen → `/dashboard`, MP → `/mp-dashboard`
7. **JWT in localStorage** — `pp_user` key, sent as Bearer token
8. **Framer Motion** — page transitions + component animations
9. **Recharts** — pie charts (area stats), bar charts (category), gauge (budget)
10. **CSS variables** — `--bg-primary`, `--text-primary`, `--accent` etc. per theme
