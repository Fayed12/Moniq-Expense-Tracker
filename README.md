# Moniq — Personal Finance & Expense Tracking Platform

> **Moniq** is a premium, modern, personal finance and wealth management platform. Built with a stunning glassmorphic UI, real-time database synchronization, and deep analytical capabilities, Moniq provides users with clear, interactive financial control. Fully free and open-source.


> ## By [Mohamed Fayed](https://github.com/Fayed12)
---

## 📖 Table of Contents
1. [Overview & Core Vision](#-overview--core-vision)
2. [Key Features (A to Z)](#-key-features-a-to-z)
3. [Technology Stack](#-technology-stack)
4. [Architecture & Folder Structure](#-architecture--folder-structure)
5. [Database & Real-time Synchronization](#-database--real-time-synchronization)
6. [Security & Robustness Actions](#-security--robustness-actions)
7. [Installation & Local Setup](#-installation--local-setup)
8. [License](#-license)

---

## 🎯 Overview & Core Vision

Moniq is designed to dismantle the complexity of personal budgeting. From students tracking simple allowances to freelancers managing multi-account cash flows, Moniq delivers visual, trustable, and lightning-fast financial indicators. By using custom-tailored Sienna HSL palettes, smooth micro-animations (GSAP), and responsive layouts, the application stands out as a state-of-the-art Web App that makes managing money feel premium.

---

## 🚀 Key Features (A to Z)

*   **Accounts Command Center**: Create, edit, and archive custom financial accounts (Cash, Bank, Credit Card, Savings). Customize accounts with harmonious colors and icons, count transaction volumes, and execute internal transfers safely.
*   **Analytics Deep-Dive**: Visual charts (Bar, Line, Donut, Area charts) tracking category spending breakdowns, monthly cash flows, daily heatmaps, top category ranking, and savings rate percentages.
*   **Auth & Self-Healing Profile**: Secure user registrations and Google OAuth login flows with auto-recovery mechanisms to self-heal missing database records or schema interruptions.
*   **Budgeting Suite**: Set monthly limits per category with warning threshold badges (At-Risk >= 85%, Over Budget > 100%), rollover budget logic, and overall global warnings limit.
*   **Categories Manager**: Flexible creation, editing, and archiving of category badges (Expense, Income, or Transfer categories) complete with semantic coloring and custom icon sets.
*   **Financial Reports**: Generate customized statements for specific accounts, category-focused summaries, and monthly budget progress reviews. Export compiled statistics directly as formatted PDF reports or raw Excel sheets.
*   **Guided Interactive Tour**: Integration with `driver.js` providing step-by-step walkthrough hints across the primary interface screens to onboard users gracefully.
*   **In-App Alerts & Weekly Digest**: Dynamic background notification processor triggering warnings for low account balances, milestones on savings targets (25%, 50%, 75%), budget overruns, and a weekly financial recap.
*   **Onboarding Wizard**: A step-by-step startup flow enabling first-time users to set preferred display names, configure default base currency, establish primary accounts, and configure initial balances.
*   **Savings Goals**: Create progress trackers for personal financial goals (e.g. Emergency Fund, Travel, Gadgets). Set deadlines, link accounts, log contributions, and celebrate milestones with animated UI effects.
*   **Transactions Ledger**: Virtualized list capable of rendering thousands of entries smoothly. Advanced search filters (by category, account, tag, note, date, or amount type) and bulk actions (bulk delete).
*   **User Preferences**: Custom preferences including dark/light theme options, local date formatting standards, and notification toggle controls.

---

## 🛠 Technology Stack

### Frontend Core
*   **React 19**: Utilizing modern hooks, lazy loading, Suspense, and state transitions.
*   **Vite 6**: Super-fast bundle builder and hot-module reloading.
*   **Redux Toolkit (RTK)**: Centralized state manager for handling asynchronous thunks, theme toggling, accounts, transactions, budgets, goals, and notification items.
*   **React Router v7**: Declarative routing system with client-side guarding.
*   **React Hook Form**: Performant form handlers with built-in client-side validation rules.

### Design, Charts & Motion
*   **CSS Modules**: Component-scoped styling preventing style leakage.
*   **GSAP (GreenSock Animation Platform) 3**: Custom micro-animations and smooth transition entrance states.
*   **Recharts 2**: Interactive SVG data chart rendering.
*   **Material UI (MUI v9)**: Premium layout scaffolding, avatars, dropdown components, and modals.
*   **SweetAlert2**: Customized Sienna/glassmorphic notification dialogues.

### Database Backend
*   **Supabase (PostgreSQL)**: Reliable cloud database storing transactional ledgers, user profiles, goals, and categories.
*   **Supabase Auth**: Secure authentication engine featuring Email/Password credentials, password reset processes, and Google OAuth redirect listeners.
*   **Supabase Storage**: Secure file hosting for transaction receipt attachments.

---

## 📂 Architecture & Folder Structure

```
Moniq/
├── src/
│   ├── components/            # Reusable UI & Page Subsections
│   │   ├── common/            # Custom buttons, glass panels, and input frames
│   │   ├── charts/            # CashFlowChart and BudgetHealthChart wrappers
│   │   ├── dashboard/         # Sidebar navigation, header bars, and footers
│   │   ├── analysisPageComponents/ # Detailed graphs, rankings, and heatmap panels
│   │   └── reportsPageComponents/  # Account statement tables and progress charts
│   ├── config/                # Global configurations
│   │   ├── supabase.js        # Supabase Client connection pool
│   │   └── theme.js           # MUI color overrides and overrides
│   ├── hooks/                 # Custom Hooks & Page Controllers
│   │   ├── authHook.js        # Auth state listener and self-healing engine
│   │   ├── analysisPageData.js# Analysis indicators compiler
│   │   ├── reportsPageData.js # Statement formatting aggregator
│   │   └── use[Model].js      # Real-time event subscribers for Redux items
│   ├── layout/                # Root containers
│   │   └── dashboardLayout.js # Main dashboard layout grid
│   ├── pages/                 # Full Screen Pages
│   │   ├── Landing/           # Marketing screen
│   │   ├── Onboarding/        # Start wizard
│   │   ├── Auth/              # Login, register, forgot/reset password
│   │   └── dashboard-pages/   # Home, accounts, budgets, goals, reports, profile...
│   ├── redux/                 # Redux Toolkit Slices
│   │   ├── store.js           # Store configuration
│   │   └── slices/            # Slices (auth, user, accounts, transactions, budgets, etc.)
│   ├── services/              # Supabase database query layers
│   │   ├── Accounts/          # Account reads/writes & transfers (RPC)
│   │   ├── Budgets/           # Budget limits and rollover handlers
│   │   ├── Transactions/      # Ledger queries & receipt attachments
│   │   └── users/             # Profile fetch & avatar upload services
│   ├── utils/                 # Utility files
│   │   ├── guidedTour.js      # Walkthrough steps configurations
│   │   └── reactSelectStyles.js# Sienna glass theme styles for React-Select
│   ├── App.jsx                # Main wrapper initializing listeners
│   ├── main.jsx               # React DOM root entrypoint
│   └── index.css              # Glass design system tokens & resets
```

---

## 🔄 Database & Real-time Synchronization

Moniq keeps your web interface synchronized with database changes across multiple open tabs or servers. It sets up dedicated **Supabase Realtime Channel listeners** (`postgres_changes`) that fire alerts to Redux slices on inserts, updates, or deletes.

Real-time hooks in the code include:
*   `useAccounts(userId)`
*   `useTransactions(userId)`
*   `useBudgets(userId)`
*   `useCategories(userId)`
*   `useGoals(userId)`
*   `useNotifications(userId)`

If you edit a transaction or add a savings contribution on one tab, the rest of the application (balances, progress rings, budget health percentages) immediately updates without page refreshes.

---

## 🔒 Security & Robustness Actions

1.  **Row Level Security (RLS)**: The database is secured via PostgreSQL Row Level Security. Users can only query, insert, update, or delete records that match their authenticated `auth.uid()`, preventing unauthorized data access.
2.  **Self-Healing Profile Sync**: If a user creates an account and logs in but a network error fails to write their public user profile row, Moniq detects the missing database row during the session initialization, catches the error, and automatically creates the profile row with default settings (`onboarding_completed: false`) on-the-fly.
3.  **Environment Isolation**: Supabase endpoint credentials and publishable API keys are isolated in standard `.env` configuration structures.
4.  **No Hardcoded Secrets**: Secrets are read exclusively from `import.meta.env` keys.
5.  **Client-Side Guards**: All routes under `/dashboard` and `/onboarding` are guarded using Redux session verification. Unauthenticated requests are immediately redirected back to the `/login` portal.

---

## ⚙️ Installation & Local Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Step 1: Clone & Install
```bash
# Clone the repository
git clone https://github.com/Fayed12/Moniq-Expense-Tracker.git
cd Moniq-Expense-Tracker

# Install dependencies
npm install
```

### Step 2: Configure Environment Variables
Create a file named `.env` in the root folder (or copy `ex.env` to `.env`):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Step 3: Run Dev Server
```bash
# Launch Vite development server
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Step 4: Build for Production
```bash
# Build production bundle
npm run build

# Preview build locally
npm run preview
```

---

## 📄 License
This project is licensed under the MIT License. See the LICENSE file for details.
