# Moniq — Personal Finance & Expense Tracking Platform

> A modern, free personal finance application. Track income, expenses, accounts, and goals — with powerful analytics, smart insights, and a stunning glass UI.

---

## Vision

Moniq empowers anyone to take control of their financial life. From students tracking monthly expenses to freelancers managing variable income — the platform delivers clarity, not complexity. Every design decision prioritizes speed, trust, and genuine usefulness. **Moniq is fully free for all users.**

---

## Pages & Screens

### 1. Landing Page
Public-facing marketing page that converts visitors into users.

- Hero section with animated dashboard preview (GSAP)
- Feature highlights with scroll-triggered reveal animations
- Testimonials / social proof
- FAQ accordion
- CTA → Sign Up / Log In
- Footer with links

---

### 2. Auth Pages
- **Sign Up** — email + password, Google OAuth (Firebase Auth)
- **Log In** — with "Remember me", forgot password flow
- **Onboarding Wizard** — 3-step flow after first login:
  - Step 1: Set your display name and base currency
  - Step 2: Create your first accounts (Bank, Cash, Credit Card)
  - Step 3: Set initial balances and optional monthly budget limit

---

### 3. Dashboard
The command center. A single glance shows where you stand.

- Net worth card (all accounts combined)
- Income / Expenses / Savings summary cards for current month
- Spending trend sparkline (last 30 days)
- Budget health bar (% of monthly budget used)
- Recent 5 transactions with quick-edit
- Top 3 spending categories this month
- Active goals with progress rings
- Upcoming recurring transactions (next 7 days)
- Floating action button → Add Transaction

---

### 4. Accounts Page
Manage multiple financial accounts separately.

- List of accounts: Bank, Cash, Credit Card, Savings
- Per-account balance, type icon, and transaction count
- Add / Edit / Archive accounts
- Transfer between accounts (does not count as income or expense)
- Account color and icon customization

---

### 5. Transactions Page
Full transaction management with search, filter, and bulk actions.

- Virtualized list (handles large datasets smoothly)
- Search by title, note, or amount
- Filters: Category, Type (Income / Expense / Transfer), Account, Date range, Tags
- Sort by: Date, Amount, Category
- Bulk actions: delete, re-categorize, export selection
- Inline edit on row click
- CSV / PDF export of filtered view
- Transaction detail drawer (with receipt attachment preview)

---

### 6. Add / Edit Transaction
Available as a modal dialog or dedicated page.

**Fields:**
- Title (required)
- Amount (required)
- Type: Income / Expense / Transfer
- Category (built-in + custom)
- Account (from user's account list)
- Date & Time (defaults to now)
- Tags (free-form, multi-select chips)
- Note (optional)
- Receipt attachment (image upload, max 5MB)
- Recurring toggle: None / Daily / Weekly / Monthly / Yearly
  - If recurring: optional end date

---

### 7. Analytics Page
Deep-dive financial intelligence with interactive charts.

- Date range selector (this week / month / quarter / year / custom)
- Income vs Expenses comparison (grouped bar chart)
- Spending by category (donut chart with drill-down)
- Monthly cash flow trend (line chart, 12 months)
- Day-of-week spending heatmap
- Top spending categories ranked
- Savings rate over time (area chart)
- Smart insights: plain-language summaries (e.g. "You spent 23% more on food this month")

---

### 8. Budget Page
Set limits, track spending, stay in control.

- Monthly budget by category with animated progress bars
- Overspend alert badges
- Rollover budget option
- Overall monthly spending limit card
- Budget vs actual comparison chart
- Historical budget performance
- Quick-copy last month's budget

---

### 9. Goals Page
Save toward what matters.

- Create named savings goals (Emergency fund, New laptop, Trip…)
- Target amount + optional deadline
- Linked account (optional)
- Contribution history timeline
- Progress visualization with filled ring + milestone celebrations (GSAP confetti)
- Projected completion date based on current savings rate
- Pause / archive goals

---

### 10. Recurring Transactions Page
Automate predictable money flows.

- List of all active recurring rules
- Next scheduled date and amount
- Enable / disable / delete rules
- Auto-log toggle (log automatically vs prompt to confirm)
- Calendar view for next 30 days of upcoming entries
- Overdue alerts for recurring income not received

---

### 11. Reports Page
Generate and export financial summaries.

- Monthly report: income, expenses, net savings, top categories
- Annual summary with month-by-month breakdown
- Custom date range report
- Export as PDF (formatted) or CSV (raw data)

---

### 12. Settings Page

**Tabs:**
- **Profile** — display name, avatar, email
- **Accounts** — manage financial accounts
- **Categories** — create, rename, reorder, delete categories
- **Currency & Locale** — base currency, date format, number format
- **Notifications** — budget alerts, recurring reminders, weekly digest
- **Appearance** — dark / light / system theme, accent color
- **Data** — export all data (JSON), import from CSV, reset app data

---

## Feature Specification

### Core (MVP — Free)
- User authentication (email + Google OAuth)
- Add / edit / delete transactions
- Income, expense, and transfer tracking
- Multi-account balance management
- Custom category management
- Full-text search across transactions
- Advanced filtering and sorting
- Budget creation and tracking per category
- Financial goals with progress tracking
- Recurring transactions with auto-log
- Interactive charts: Pie, Bar, Line, Area
- Receipt image attachments
- Tags on transactions
- Data persistence via Firestore
- Offline support (localStorage cache)
- Responsive design (mobile-first)
- Dark / light mode
- PWA (installable, push notifications)

### Enhanced (Free — Post-MVP)
- Smart insights (plain-language summaries)
- Spending heatmaps
- Monthly and annual reports with PDF/CSV export
- In-app notifications (budget overspend, goal reached, recurring due)
- Onboarding wizard
- Import transactions from CSV (bank statement)
- Bulk transaction actions
- Currency converter for travel
- WCAG 2.1 AA accessibility

### Future
- AI-powered category auto-detection
- Bank integration (Plaid)
- Shared wallets (couples, families)
- Multi-currency with live exchange rates
- Financial health score

---

## Tech Stack

### Frontend
| Concern | Library | Version |
|---|---|---|
| Framework | React | 19 |
| Language | JavaScript (ES2022+) | — |
| Build Tool | Vite | 6 |
| UI Components | MUI (Material UI) | v6 |
| Styling | CSS Modules | — |
| Global Styles | index.css (CSS variables) | — |
| Routing | React Router | v7 |
| Animation | GSAP | 3 |
| Charts | Recharts | 2 |
| Icons | react-icons | 5 |

### State & Data
| Concern | Library |
|---|---|
| Global state | Redux Toolkit |
| Async / thunks | Redux Toolkit (createAsyncThunk) |
| Forms | React Hook Form |
| Dates | date-fns |

### Backend (Firebase — Free Tier)
| Service | Usage |
|---|---|
| Firebase Auth | Email/password + Google OAuth |
| Firestore | All user data |
| Firebase Storage | Receipt images |
| Firebase Cloud Messaging | Push notifications (PWA) |
| Firebase Hosting | Deployment |

### Testing
| Layer | Tool |
|---|---|
| Unit tests | Vitest |
| Component tests | React Testing Library |
| E2E | Playwright |

---

## Redux Store Structure

```
store/
├── slices/
│   ├── authSlice.js          → user, loading, error
│   ├── accountsSlice.js      → accounts[], loading, selected
│   ├── transactionsSlice.js  → transactions[], filters, pagination
│   ├── categoriesSlice.js    → categories[]
│   ├── budgetsSlice.js       → budgets[], currentMonth
│   ├── goalsSlice.js         → goals[]
│   ├── recurringSlice.js     → recurringRules[]
│   ├── analyticsSlice.js     → derived stats, date range
│   ├── notificationsSlice.js → notifications[], unreadCount
│   └── uiSlice.js            → theme, sidebar open, modal state
└── store.js                  → configureStore, persistReducer
```

---

## Project Structure

```
src/
├── assets/
│   └── images/
├── components/
│   ├── common/          # Button, Input, Card, Modal, Badge, Chip…
│   ├── charts/          # BarChart, PieChart, LineChart, AreaChart wrappers
│   ├── forms/           # TransactionForm, BudgetForm, GoalForm
│   ├── layout/          # AppLayout, Sidebar, TopBar, PageWrapper
│   └── animations/      # GSAP wrapper components
├── pages/
│   ├── Landing/
│   ├── Auth/            # Login, Register, Onboarding
│   ├── Dashboard/
│   ├── Accounts/
│   ├── Transactions/
│   ├── Analytics/
│   ├── Budget/
│   ├── Goals/
│   ├── Recurring/
│   ├── Reports/
│   └── Settings/
├── store/               # Redux slices + store config
├── services/            # Firebase API abstraction layer
│   ├── auth.service.js
│   ├── transactions.service.js
│   ├── accounts.service.js
│   ├── budgets.service.js
│   ├── goals.service.js
│   └── storage.service.js
├── hooks/               # useAuth, useTransactions, useTheme, useDebounce…
├── utils/               # formatCurrency, calcBalance, calcSavingsRate…
├── constants/           # DEFAULT_CATEGORIES, CURRENCIES, ICONS_MAP
├── config/              # firebase.js, theme.js (MUI theme), routes.js
├── styles/              # index.css (CSS variables, global resets, glass)
└── main.jsx
```

---

## Target Audience

| User | Key Pain Point | Features That Help |
|---|---|---|
| Students | Tracking vs fixed allowance | Budget page, category breakdown |
| Salaried employees | Savings habits, monthly review | Dashboard, goals, reports |
| Freelancers | Variable income, tax data | Income tracking, tags, CSV export |
| General users | Understanding where money goes | Analytics, smart insights |

---

## Project Goals

1. Help users understand spending habits through honest, visual data
2. Make adding a transaction as fast as unlocking a phone
3. Deliver numbers users can fully trust (tested calculation utils)
4. Ship a polished, production-ready free product
5. Build a foundation ready for future monetization without tech debt

