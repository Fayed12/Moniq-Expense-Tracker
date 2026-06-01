# 📊 Moniq — Analysis & Reports Pages: Complete UI/AI Build Guide

> **Purpose of this document:** to build the Analysis page and the Reports page for the Moniq personal finance web app. Every section, every card, every chart, every data field, every interaction, and every query is described in full detail — from header to footer.

---

## 🗄️ Database Reference (Supabase — `moniq` project)

Before building any component, understand the real tables powering these pages:

| Table | Key Columns Used in These Pages |
|---|---|
| `transactions` | `id`, `uid`, `title`, `amount`, `type` (income/expense/transfer), `category_id`, `account_id`, `date`, `tags`, `category_name`, `category_color`, `category_icon`, `account_name` |
| `accounts` | `id`, `uid`, `name`, `type`, `balance`, `currency`, `color`, `icon`, `total_income`, `total_expense`, `transaction_count` |
| `categories` | `id`, `uid`, `name`, `icon`, `color`, `type` (income/expense/both) |
| `budgets` | `id`, `uid`, `category_id`, `month` (format: `YYYY-MM`), `limit_amount`, `spent`, `rollover`, `rollover_amount`, `category_name`, `category_color` |
| `goals` | `id`, `uid`, `name`, `target_amount`, `current_amount`, `deadline`, `is_completed`, `total_contributions`, `contribution_count`, `color` |
| `goal_contributions` | `id`, `uid`, `goal_id`, `amount`, `date`, `account_id` |
| `users` | `monthly_budget_limit`, `currency`, `locale` |

All queries must be **scoped to the authenticated user** via `uid = auth.uid()`. RLS is enabled on all tables.

---

# PAGE 1 — ANALYSIS PAGE (`/analytics`)

> **Purpose:** Deep-dive into the user's financial behavior over time. Answers "Where is my money going?" and "How am I doing vs previous periods?"

---

## SECTION 1 — Page Header

**Layout:** Full-width top bar, sticky on scroll (blurs background with `backdrop-filter: blur(12px)`).

**Left side:**
- Page title: `"Analysis"` in Display font (Syne), size 28px, weight 700
- Subtitle below: `"Track your financial patterns and behavior"` in Body font (DM Sans), size 13px

**Right side — Period Selector (most important UI control on this page):**
- A pill-style segmented control with these tabs: `This Week` | `This Month` | `Last Month` | `Last 3 Months` | `Last 6 Months` | `This Year` | `Custom`
- use custom made react select to create this segmented control 
- Active tab has background color from index.css colors
- Inactive tabs: dark surface background, hover lightens text
- When "Custom" is selected, a compact date-range picker slides in beneath (two calendar inputs: From / To)
- This period selector controls **ALL charts and cards** on the entire page
- Default selection: **This Month**

**Right side — Account Filter (secondary control):**
- A dropdown button labeled `"All Accounts"` with a bank icon with react select
- Opens a popover showing all the user's accounts (from `accounts` table) as checkboxes with color dot + account name + balance
- Selecting specific accounts re-filters all data on the page
- Multi-select supported

---

## SECTION 2 — KPI Summary Row (Top Stat Cards)

**Layout:** 4 cards in a horizontal row. On mobile: 2×2 grid. Each card is equal width.

All data is computed from `transactions` table filtered by `uid`, `date` within selected period, and selected `account_id`s.

---

### Card 1 — Total Income
- **Icon:** Arrow pointing up-right, color from theme, on a soft green circle background
- **Label:** `"Total Income"` — Text Secondary, 12px, uppercase, letter-spacing 1px
- **Big Number:** Sum of `amount` where `type = 'income'` — Display font, 32px, bold, color from theme
- **Format:** User's currency symbol + locale formatting (from `users.currency` + `users.locale`)
- **Trend Badge:** Compare to previous equivalent period. If income increased: green badge `▲ +12.4%`. If decreased: red badge `▼ -8.1%`
- **Subtext:** `"vs previous period"` — Muted, 11px
- **Bottom bar:** Thin gradient line, green, 3px height, full card width

---

### Card 2 — Total Expenses
- **Icon:** Arrow pointing down-right, color from theme, on soft red circle background
- **Label:** `"Total Expenses"`
- **Big Number:** Sum of `amount` where `type = 'expense'` — color from theme
- **Trend Badge:** If expenses decreased it's good (green badge). If increased: red badge
- **Subtext:** `"vs previous period"`
- **Bottom bar:** Gradient line, red

---

### Card 3 — Net Balance (Savings)
- **Icon:** Scale/balance icon, color from theme
- **Label:** `"Net Balance"`
- **Big Number:** (Total Income) − (Total Expenses) — color is green if positive, red if negative
- **Formula shown below number:** `"Income − Expenses"` in muted text
- **Trend Badge:** Compare net balance to previous period
- **Bottom bar:** Gradient line, violet

---

### Card 4 — Savings Rate
- **Icon:** Percentage/target icon, color from theme
- **Label:** `"Savings Rate"`
- **Big Number:** `(Net Balance / Total Income) × 100` formatted as `"34.2%"` — Display font, color from theme
- **Context ring:** A tiny circular progress ring around the number (SVG donut, 48px) showing the percentage visually
- **Benchmark text:** If rate ≥ 20%: `"🎯 Great savings habit"`. If 10–20%: `"⚠️ Room to improve"`. If < 10%: `"🔴 Low savings rate"`
- **Bottom bar:** Gradient line, amber

---

## SECTION 3 — Income vs Expense Chart (Main Chart)

**Layout:** Full-width card, height ~340px.

**Title Row (inside card):**
- Left: `"Income vs Expenses"` — 16px bold,color from theme
- Subtitle: `"Monthly comparison over selected period"` — muted, 12px
- Right: Chart type toggle — two icon buttons: `Bar Chart` | `Line Chart`. Default: Bar. Clicking smoothly transitions the chart.

**Chart: Grouped Bar Chart (default)**
- X-axis: Time periods (weeks if "This Month" selected, months if "Last 6 Months", days if "This Week")
- Y-axis: Amount in user currency
- Two bars per group: Income and Expense, color from theme with gradient background for both
- Bars have rounded top corners (radius 6px)
- Tooltip on hover: Shows exact period, Income amount, Expense amount, and Net Savings with a divider line
- Grid lines: subtle dashed horizontal lines, color from theme
- Animated on load: bars grow upward with spring easing, 600ms

**Alternative: Line Chart**
- Two smooth curved lines (cubic bezier) — same colors
- Each line has a soft gradient area fill beneath it (opacity 0.15)
- Data points show dots on hover

**Data query:**
```sql
SELECT
  DATE_TRUNC('month', date) AS period,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
FROM transactions
WHERE uid = auth.uid()
  AND date BETWEEN [start] AND [end]
GROUP BY period
ORDER BY period ASC
```

---

## SECTION 4 — Category Breakdown (Two-Column Layout)

**Layout:** Two cards side by side. Left: 55% width. Right: 45% width.

---

### Left Card — Expense Categories Donut Chart

**Title:** `"Spending by Category"` + small filter: `[Expenses ▾]` dropdown (can switch to Income)

**Chart:** Donut chart, 260px diameter, center hole large enough to show summary text
- Center text (two lines): Total spent amount (large, bold, red) + `"Total Expenses"` label
- Each slice represents one category
- Slice color = `category_color` from transactions/categories table
- Slice has rounded outer edge (CSS trick)
- On hover: slice expands outward 8px, tooltip shows category name + amount + percentage
- Animated on load: slices sweep in with 800ms stagger

**Legend (right of donut):**
- Vertical list of categories, max 8 shown, rest collapsed under "Show more"
- Each legend item: colored square dot (8px) + category name + amount (bold) + percentage pill
- Clicking a legend item highlights that slice and dims others

**Data query:**
```sql
SELECT
  category_name,
  category_color,
  category_icon,
  SUM(amount) AS total,
  COUNT(*) AS tx_count
FROM transactions
WHERE uid = auth.uid()
  AND type = 'expense'
  AND date BETWEEN [start] AND [end]
GROUP BY category_name, category_color, category_icon
ORDER BY total DESC
```

---

### Right Card — Top Categories Ranked List

**Title:** `"Top Spending Categories"` + `"This Period"` badge

**Layout:** Vertical list, each row is a category bar item.

**Each row contains:**
- Rank number: `01`, `02`, `03`... in monospace font, muted
- Category icon (emoji or React Icon component) + color circle background (from `category_color`)
- Category name: 14px, white
- Transaction count: small pill — `"8 transactions"` — muted
- Progress bar: horizontal bar showing percentage of total spending. Width = `(category_total / max_category_total) * 100%`. Color = category color. Height 6px, rounded, animated
- Amount: right-aligned, bold, monospace, 15px — red for expense
- Percentage of total: right-aligned, small, muted — `"23.4%"`

**Max 6 rows shown.** A `"View all categories →"` link at bottom navigates to transactions page filtered by category.

---

## SECTION 5 — Daily Spending Heatmap

**Layout:** Full-width card.

**Title:** `"Daily Spending Heatmap"` — shows which days of the week and which weeks of the month you spend the most.

**Chart type:** Calendar heatmap (GitHub-contribution style)
- Grid of days for the selected period
- Each cell = one day
- Color intensity = spending amount that day (using a 5-step gradient from theme colors)
- Empty days (no transactions): very dark, near-black
- Weekend columns slightly highlighted with a subtle border
- Hover tooltip on each cell: `"Mon, Jan 15 — $234.50 (4 transactions)"`
- Cell size: 18×18px with 3px gap, rounded corners 3px

**Below heatmap — two stats:**
- `"Most Expensive Day"`: Day name + date + total spent
- `"Average Daily Spending"`: Total expense / number of days in period

**Data query:**
```sql
SELECT
  DATE(date) AS day,
  SUM(amount) AS daily_total,
  COUNT(*) AS tx_count
FROM transactions
WHERE uid = auth.uid()
  AND type = 'expense'
  AND date BETWEEN [start] AND [end]
GROUP BY day
ORDER BY day ASC
```

---

## SECTION 6 — Income Sources & Expense Patterns (Two-Column)

**Layout:** Two equal-width cards side by side.

---

### Left Card — Income Sources Breakdown

**Title:** `"Income Sources"`

**Chart:** Horizontal bar chart (not grouped — one bar per income category)
- Each bar: full rounded ends, height 32px, color from `category_color`
- Label left of bar: category icon + name
- Value right of bar: amount (bold) + percentage
- Bars animate width from 0 on load with staggered delay
- Shows top 5 income categories

---

### Right Card — Spending Pattern by Time of Day

**Title:** `"When Do You Spend?"`

**Chart:** Radial/clock chart or simplified bar chart split into time blocks:
- `Morning (6am–12pm)`, `Afternoon (12pm–6pm)`, `Evening (6pm–10pm)`, `Night (10pm–6am)`
- Each block: one bar or radial segment
- Color: distinct per block, using the accent palette
- Shows % of transactions and % of total amount
- Tooltip: "Afternoon — 42% of transactions, avg $45 per transaction"

**Data computation (client-side):** Extract hour from `transactions.date`, bucket into 4 groups, aggregate.

---

## SECTION 7 — Account Performance

**Layout:** Full-width card with horizontal scrollable rows.

**Title:** `"Account Performance"` + subtitle `"Balance flow across your accounts"`

**Each account row:**
- Account icon + color dot (from `accounts.icon` + `accounts.color`)
- Account name + account type badge pill (`Checking`, `Savings`, etc.)
- Mini sparkline chart (60px wide, 28px tall) — line showing balance trend over period (computed from transaction history on that account)
- Income total for period (green)
- Expense total for period (red)
- Net change: `+$1,240` or `-$340` with colored directional arrow
- Current balance (from `accounts.balance`)
- Transaction count for period

**Data query:**
```sql
SELECT
  a.id, a.name, a.type, a.balance, a.color, a.icon,
  SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) AS period_income,
  SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) AS period_expense,
  COUNT(t.id) AS period_tx_count
FROM accounts a
LEFT JOIN transactions t ON t.account_id = a.id
  AND t.date BETWEEN [start] AND [end]
WHERE a.uid = auth.uid()
GROUP BY a.id, a.name, a.type, a.balance, a.color, a.icon
```

---

## SECTION 8 — Transaction Tags Analysis

**Layout:** Mid-width card (60%) + small card (40%) side by side.

---

### Left — Tag Cloud / Tag Bar Chart

**Title:** `"Transaction Tags"`

- Horizontal bar chart showing which tags appear most across transactions
- Each bar: tag name (pill style with `#` prefix) + transaction count + total amount
- Uses `transactions.tags` array column — unnested and aggregated
- Color coded by whether tag appears mostly in income (green tint) or expense (red tint)

**Data query:**
```sql
SELECT
  UNNEST(tags) AS tag,
  COUNT(*) AS usage_count,
  SUM(amount) AS total_amount,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense_total
FROM transactions
WHERE uid = auth.uid()
  AND date BETWEEN [start] AND [end]
GROUP BY tag
ORDER BY usage_count DESC
LIMIT 10
```

---

### Right — Quick Stats Panel

**Title:** `"Period Highlights"`

4 small stat tiles stacked vertically:

1. **Largest Single Expense:** Amount (red bold) + transaction title + date
2. **Largest Single Income:** Amount (green bold) + title + date
3. **Most Active Day:** Weekday name (e.g. "Friday") + avg transactions that day
4. **Avg Transaction Amount:** Total amount / count, by type toggle

---

---

# PAGE 2 — REPORTS PAGE (`/reports`)

> **Purpose:** Generate, view, and export structured financial reports. More formal and document-oriented than the Analysis page. Answers "Give me a summary I can save, share, or review."

---

## SECTION 1 — Page Header

**Layout:** Same sticky header pattern as Analysis page.

**Left side:**
- Page title: `"Reports"` — Display font, 28px bold
- Subtitle: `"Generate structured financial summaries and exports"` — muted, 13px

**Right side — Report Controls:**

**1. Report Type Selector (dropdown button):**
- Label: current selection, e.g. `"Monthly Summary ▾"`
- Options in dropdown:
  - 📅 Monthly Summary
  - 📊 Category Report
  - 🏦 Account Statement
  - 💰 Budget Performance
  - 🎯 Goals Progress Report
  - 🔄 Recurring Transactions Report
  - 📈 Income & Expense Report
- Each option has an icon + name + one-line description

**2. Period Selector:** Same segmented control as Analysis page. Default: `"This Month"`

**3. Export Button Group:**
- Primary button: `"Export PDF"` — violet background, PDF icon, slight glow on hover
- Secondary button: `"Export CSV"` — surface background, CSV icon
- Both buttons trigger download of report data formatted for that type
- Export PDF: generates a styled print-ready document (uses `window.print()` or a PDF library like `jsPDF`)

---

## SECTION 2 — Report Overview Banner

**Layout:** Full-width banner card with a gradient background (dark violet to dark navy, left to right). Height ~120px.

**Content (3 columns):**

**Left column:**
- Report title (large): e.g. `"Monthly Summary"` — Display font, 22px, white
- Period description: e.g. `"June 2025 · All Accounts"` — muted, 13px
- Generated timestamp: `"Generated on June 1, 2026 at 14:32"` — muted, 11px

**Middle column (centered):**
- 3 micro-stats inline:
  - `Total Transactions: 47`
  - `Active Accounts: 2`
  - `Active Categories: 9`

**Right column:**
- User display name + avatar (from `users.display_name` + `users.photo_url`)
- `"Personal Finance Report"` label below name

---

## SECTION 3 — Report Body (Changes Based on Report Type)

Each report type renders a different set of sections below the header. Here is the full spec for each:

---

### REPORT A: Monthly Summary

**Section A1 — Executive Summary Cards (3 cards in a row)**

Same style as Analysis KPI cards but slightly larger:
- Total Income (green)
- Total Expenses (red)
- Net Savings (violet or green/red depending on sign)

Each card also shows: previous month comparison arrow + percentage change.

---

**Section A2 — Budget Performance Overview**

**Title:** `"Budget Adherence — [Month]"`

**Data source:** `budgets` table filtered by `month = 'YYYY-MM'` joined with category data.

Table layout with columns:
| Category | Budget Limit | Spent | Remaining | % Used | Status |
|---|---|---|---|---|---|
| Food & Dining | $500 | $423 | $77 | 84.6% | 🟡 On Track |
| Transport | $200 | $267 | -$67 | 133% | 🔴 Over Budget |

- `Status` column uses colored pill badges: `🟢 Under Budget`, `🟡 On Track (>70%)`, `🔴 Over Budget`
- Rows sorted by `% Used` descending
- A summary row at the bottom: Total budget vs total spent + overall % used
- Mini horizontal progress bar in `% Used` column, capped at 100% visually but showing over-budget in red

**Data query:**
```sql
SELECT
  b.id, b.category_name, b.category_color, b.category_icon,
  b.limit_amount, b.spent,
  b.limit_amount - b.spent AS remaining,
  ROUND((b.spent / b.limit_amount) * 100, 1) AS pct_used,
  b.rollover, b.rollover_amount
FROM budgets b
WHERE b.uid = auth.uid()
  AND b.month = '[YYYY-MM]'
ORDER BY pct_used DESC
```

---

**Section A3 — Top Transactions Table**

**Title:** `"Largest Transactions This Period"` — toggle: `[Expenses ▾]` / `[Income]`

Table columns: Date | Account | Category | Title | Amount
- 10 rows max, sorted by amount descending
- Each row clickable (navigates to transaction detail or opens transaction modal)
- Category shown as colored icon pill
- Amount colored red/green by type

---

**Section A4 — Monthly Trend Mini Chart**

Compact line chart (height 160px) showing the last 6 months of income vs expense trend.
Provides context for where this month sits historically.

---

### REPORT B: Category Report

**Section B1 — Category KPIs (4 cards)**
- Total Categories Used (count of distinct categories in period)
- Highest Spending Category (name + amount)
- Lowest Spending Category (name + amount)
- Average per Category (total expense / categories count)

---

**Section B2 — Category Deep Dive Table**

Full table with all expense categories:

| # | Category | Transactions | Total Spent | Avg per Tx | % of Total | vs Last Period |
|---|---|---|---|---|---|---|
| 1 | 🍔 Food | 14 | $423 | $30.2 | 28.4% | ▲ +12% |

- Expandable rows: clicking a row expands to show all individual transactions for that category inline
- Sortable columns (click header to sort)
- Each category row has the category color as a left border accent (4px colored left border)

---

**Section B3 — Income Categories Table**

Same table structure but for income type transactions.

---

**Section B4 — Category Comparison Chart**

Grouped bar chart: current period vs previous period per category.
Shows visually which categories grew or shrank.

---

### REPORT C: Account Statement

**For each account (one section per account, collapsible):**

**Account Header Card:**
- Account name + type + icon + color
- Opening balance (computed: current balance minus net change in period)
- Closing balance (current `accounts.balance`)
- Net change (green if positive, red if negative)
- Total income in period + Total expenses in period

**Transaction Ledger Table:**
Full chronological table of all transactions for this account in the period:

| Date | Description | Category | Type | Amount | Running Balance |
|---|---|---|---|---|---|
| Jun 1 | Salary | Income | +$3,200 | $5,200 |
| Jun 3 | Groceries | Food | Expense | -$78 | $5,122 |

- Running balance column computed client-side by iterating sorted transactions
- Alternating row colors for readability
- Type column shows colored pill badge
- Pagination: 25 rows per page with next/prev controls

---

### REPORT D: Budget Performance Report

**Section D1 — Overall Budget Health Score**

A large circular gauge (SVG donut) showing overall budget health:
- Score 0–100 computed as: average of `MIN(100, spent/limit_amount * 100)` for all budgets, inverted (100 = perfect)
- Color: green >80, amber 60-80, red <60
- Center: big number + `"/ 100"` + label `"Budget Health"`

**Section D2 — Budget Cards Grid (2 or 3 column)**

One card per budget, showing:
- Category icon (large, 32px) + name
- Month label
- Limit amount (gray, top)
- Spent amount (colored based on status, bold, large)
- Remaining amount (green or red)
- Horizontal progress bar (full width of card), color transitions from green → amber → red as % increases
- Bar turns red and shows overflow indicator when `spent > limit_amount`
- Rollover badge: if `rollover = true`, show `"↩ Rollover: $XX"` pill at bottom
- Animation: progress bar fills on page load

**Section D3 — Budget Trend (Last 3–6 Months)**

For each category that has budgets in multiple months:
- Small multi-month chart showing `limit_amount` (dashed line) vs `spent` (solid bar) over months
- Helps identify if overspending is a recurring pattern

---

### REPORT E: Goals Progress Report

**Section E1 — Goals Overview (3 KPI Cards)**
- Active Goals count
- Total Saved Across All Goals (sum of `goals.current_amount`)
- Total Target Amount (sum of `goals.target_amount`)

**Section E2 — Goals Grid**

One card per goal from `goals` table:

**Each Goal Card:**
- Top: Goal icon (large, 36px, circle with `goal.color` background) + goal name (16px bold) + status badge (`Active`, `Completed`, `Paused`)
- Completion percentage large: `"67%"` in Display font, 28px, color matching `goal.color`
- Large circular progress ring (SVG): outer ring = target, filled arc = current, animated on load
- Current amount vs target: `"$6,700 / $10,000"` in monospace
- Deadline row: calendar icon + `"Deadline: Dec 31, 2025"` + days remaining pill `"213 days left"` (amber if <60 days, red if <14 days)
- Contribution stats: `"Contributed [N] times"` + `"Total contributions: $6,700"`
- Mini sparkline (80px wide): contribution history over time

**Completed goals:** Shown in a separate `"Completed Goals"` collapsible section, greyed out with a ✅ checkmark ribbon.

**Section E3 — Contribution Timeline**

A chronological list of all goal contributions across all goals:
Date | Goal Name (colored pill) | Amount | Account Used

---

### REPORT F: Recurring Transactions Report

**Section F1 — Recurring Summary Cards (3 cards)**
- Active Rules count
- Monthly Committed (sum of all active recurring expenses, normalized to monthly)
- Monthly Expected Income (sum of all active recurring income, normalized to monthly)

**Section F2 — Upcoming Due Dates**

Sorted list of recurring rules by `next_due` date (ascending — soonest first):

Each row:
- Due date badge (red if overdue, amber if due within 7 days, green otherwise)
- Rule title + category icon
- Frequency badge: `"Monthly"`, `"Weekly"`, etc.
- Amount (red for expense, green for income)
- Account name
- `auto_log` toggle indicator: shows if it auto-logs or requires manual action

**Section F3 — Recurring Rules Full Table**

All recurring rules (active and inactive) in a sortable table:

| Status | Title | Type | Category | Amount | Frequency | Last Logged | Total Logged | Next Due |
|---|---|---|---|---|---|---|---|---|

- `Status` column: green dot for active, gray dot for inactive
- Frequency shown as colored pill: `Daily` (red), `Weekly` (amber), `Monthly` (green), `Yearly` (blue)
- `Total Logged` shows how many times this rule has generated a transaction

---

### REPORT G: Income & Expense Report

**Section G1 — Summary Bar (full-width strip)**
Income total | Expense total | Net | Savings Rate

**Section G2 — Income Breakdown**
Horizontal bar chart of all income categories + amounts.
Below: full table with transaction-level detail.

**Section G3 — Expense Breakdown**
Horizontal bar chart of all expense categories.
Below: full table with transaction-level detail.

**Section G4 — Daily Totals Table**
One row per day in selected period:
| Date | Income | Expense | Net | Running Total |

---

## SECTION 4 — Export & Actions Footer (Reports Page)

**Layout:** Sticky bottom bar that appears when scrolling down, OR a fixed action bar at the bottom of the report content.

**Contents:**
- Left: `"Report ready to export"` label + report type chip
- Right: Three action buttons:
  1. `"🖨️ Print"` — triggers browser print with a `@media print` CSS that hides navigation, formats cleanly
  2. `"📥 Export CSV"` — downloads a CSV of the main data table in the current report
  3. `"📄 Export PDF"` — generates a PDF using `jsPDF` + `html2canvas` of the report content area
- All buttons have loading spinners during export processing

---

## SECTION 5 — Empty States

Every section/chart/table must handle empty data gracefully:

**Empty Chart:**
- Show a dimmed version of the chart area
- Large centered icon (relevant to the data type, e.g. chart icon)
- Primary text: `"No data for this period"` — 15px, white
- Secondary text: `"Transactions you add will appear here"` — muted, 13px
- Optional CTA button: `"Add a Transaction +"` — ghost button style

**Empty Report:**
- Full-page empty state centered vertically
- Illustration-style icon (SVG of a document with magnifying glass)
- Text: `"Nothing to report yet"` + helper text
- Two CTA buttons: `"Add Transaction"` and `"Change Period"`

---

## SECTION 6 — Shared UI Patterns

### Loading States
Every card and chart has a **skeleton loader** (not a spinner):
- Skeleton uses `background: linear-gradient(90deg, #1E2235 25%, #2A2D3E 50%, #1E2235 75%)` with `background-size: 200% 100%` animated left-to-right (shimmer effect)
- Chart area skeleton: rectangle with rounded corners matching chart height
- Card skeleton: matches the exact card layout with placeholder blocks

### Tooltips
All chart tooltips use a dark floating card:
- Background: `#1E2235`
- Border: `1px solid #2A2D3E`
- Border radius: 10px
- Box shadow: `0 8px 24px rgba(0,0,0,0.4)`
- Content: bold amount top, muted label below, with a colored left border stripe matching the data series color

### Animations
- Page load: cards fade in and slide up 12px with staggered delay (`animation-delay: 0ms, 80ms, 160ms, 240ms`)
- Chart data: all bars/lines animate from zero on initial mount
- Period change: charts fade out (150ms) → re-render → fade in (250ms)
- Number change: counts animate from old value to new value (300ms ease-out)
- Hover on cards: `transform: translateY(-2px)` + slightly lighter background + stronger shadow

### Responsive Behavior
- Desktop (>1280px): Full multi-column layouts as described
- Tablet (768–1280px): 2-column max, charts full width, tables scroll horizontally
- Mobile (<768px): Single column, period selector becomes a dropdown, charts maintain height but compress width, font sizes scale down by ~15%

---

## SECTION 7 — Data Fetching Architecture Notes

- All queries must filter by `uid = auth.uid()` via Supabase RLS (already enforced server-side)
- Use Supabase JS client with `.select()`, `.eq('uid', user.id)`, `.gte('date', startDate)`, `.lte('date', endDate)`
- Period comparison (for trend badges) requires **two parallel queries**: current period + previous equivalent period
- Cache results per period in component state — avoid re-fetching when switching chart types
- Show loading skeletons immediately while queries are pending
- Handle Supabase errors gracefully — show a subtle error banner at top of section, not full page error
- For large datasets (e.g. full year reports), use `.range()` for pagination or aggregate in SQL to avoid client-side data size issues

---

## SECTION 8 — Navigation & Integration

- Both pages live in the main app sidebar/nav under a `"Insights"` group
- Analysis page = `"Analysis"` nav item (icon: line chart)
- Reports page = `"Reports"` nav item (icon: document with bar chart)
- Both pages share the same period state when navigating between them (persist in URL params: `?from=2025-06-01&to=2025-06-30`)
- Clicking any category in Analysis → navigates to Reports with that category pre-selected in Category Report
- Clicking any account in Analysis → navigates to Reports with Account Statement pre-selected for that account

---

*End of Moniq Analysis & Reports Page Guide — All sections powered by real Supabase schema.*
