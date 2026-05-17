# Moniq — Full UI/UX Design Prompt for Google Stitch

---

## MASTER PROMPT

Design the complete UI/UX for **Moniq**, a modern personal finance and expense tracking web application. The design must be production-ready, premium quality, and fully consistent across all screens. Follow every instruction below precisely.

---

## 1. BRAND IDENTITY & DESIGN LANGUAGE

**App name:** Moniq
**Tagline:** "Your money, clearly."

### Color Palette — White & Warm Brown

**Primary brand color:** Sienna brown `#A0522D`
**Full brown scale to use:**
- Brown 50: `#FDF8F3` — page background tint
- Brown 100: `#F5E8D5` — subtle surface backgrounds
- Brown 200: `#E8CCAC` — dividers, light borders
- Brown 300: `#D4A87A` — inactive states, placeholders
- Brown 400: `#C08050` — secondary actions, dark mode primary
- Brown 500: `#A0522D` — primary brand, CTA buttons, active states
- Brown 600: `#8B4423` — hover states
- Brown 700: `#6B3218` — pressed states, dark headings
- Brown 800: `#4A2210` — sidebar active background
- Brown 900: `#2D1409` — darkest text on light

**Neutral whites & creams:**
- App background: `#F5ECE0` (warm cream, never pure white)
- Card surface: `#FEFCFA` (near white with warmth)
- Pure white: `#FFFFFF` (inputs, modals)

**Status colors:**
- Income / success: `#3D8C5A` (muted green)
- Expense / danger: `#C0392B` (muted red)
- Warning: `#B07D1A` (amber)
- Transfer / info: `#7B68EE` (soft purple)

**Chart colors (ordered):**
`#A0522D`, `#C08050`, `#D4A87A`, `#E8CCAC`, `#3D8C5A`, `#2471A3`, `#7B68EE`, `#C0392B`

---

### Glassmorphism Design System

Every card, panel, sidebar, modal, and surface must use **glassmorphism**:

**Light mode glass:**
- Background: `rgba(255, 255, 255, 0.65)` with `backdrop-filter: blur(20px)`
- Border: `1px solid rgba(255, 255, 255, 0.70)`
- Box shadow: `0 8px 32px rgba(107, 50, 24, 0.12), 0 2px 8px rgba(107, 50, 24, 0.08)`
- On hover: background becomes `rgba(255, 255, 255, 0.82)`, shadow deepens

**Dark mode glass:**
- Background: `rgba(36, 21, 8, 0.70)` with `backdrop-filter: blur(20px)`
- Border: `1px solid rgba(212, 168, 122, 0.15)`
- Box shadow: `0 8px 32px rgba(0,0,0,0.40)`

**Background behind all glass surfaces:**
- Light: warm cream `#F5ECE0` with two subtle radial gradient blobs in `rgba(160,82,45,0.12)` and `rgba(107,50,24,0.10)` at opposing corners — creates depth behind glass
- Dark: very dark warm brown `#1A0F07` with matching low-opacity blobs

**Glass rules:**
- Never use flat opaque backgrounds on cards — always glass
- Nested glass uses slightly stronger opacity than parent
- Sidebar and topbar use the strongest glass (blur: 32px, opacity: 0.88)
- Modals and drawers use medium glass (blur: 20px, opacity: 0.80) over a blurred overlay scrim
- Tags, chips, and badges use the brown-tinted glass: `rgba(160,82,45,0.08)` background, `rgba(160,82,45,0.20)` border

---

### Typography

**Primary typeface:** DM Sans — weights 300, 400, 500, 600, 700
**Display typeface:** DM Serif Display — italic variant for large hero numbers and landing headlines
**Monospace:** JetBrains Mono — for amount values in transaction rows and balance displays

**Type scale:**
- xs: 12px — timestamps, helper text, labels inside chips
- sm: 14px — body text, list items, input placeholder
- base: 16px — default body, form labels
- md: 18px — subheadings, section titles
- lg: 20px — card headings
- xl: 24px — page titles
- 2xl: 30px — dashboard stats
- 3xl: 36px — hero section subheading
- 4xl: 48px — landing hero primary headline
- 5xl: 60px — landing display number (DM Serif Display, italic)

**Spacing:** 4px base unit. All padding, margin, gap values must be multiples of 4px.

---

### Border Radius

- Inputs: 12px
- Buttons: 12px (pill on FAB: 9999px)
- Cards: 20px
- Modals / drawers: 24px top corners
- Chips / badges: 9999px (full pill)
- Avatar: 50%
- Small icons in containers: 8px

---

### Iconography

Use **react-icons** — specifically `react-icons/fa` (Font Awesome 5) for all icons. Every icon must be consistent in visual weight (regular/solid, never outline mixed with solid on the same screen). Icon sizes: 14px (inline), 18px (nav), 20px (card), 24px (page heading).

---

### Micro-interactions & Motion

- Page transitions: fade + subtle Y-axis slide (8px upward, 350ms ease-out)
- Cards: scale 1.0 → 1.005 on hover, shadow deepens
- Buttons: scale 0.97 on press, 120ms
- Modal open: scale 0.95 → 1.0 with fade, 200ms ease-out
- Toast notifications: slide in from bottom-right, auto-dismiss with progress bar
- Chart bars/segments: animate in on mount (staggered, 600ms total)
- Progress bars (budget, goals): animated fill left-to-right on page enter
- Number counters on dashboard: count up from 0 to final value on mount (800ms)
- Sidebar nav items: left border slides in on active state
- FAB button: subtle pulse ring animation when idle for 3 seconds

---

## 2. LAYOUT SYSTEM

### App Shell (authenticated screens)

```
┌─────────────────────────────────────────────────────┐
│  TOPBAR (height: 64px, full width, glass-strong)    │
├──────────────┬──────────────────────────────────────┤
│              │                                       │
│  SIDEBAR     │   MAIN CONTENT AREA                   │
│  260px       │   (scrollable, padding: 32px)         │
│  glass-strong│                                       │
│              │                                       │
│              │                                       │
└──────────────┴──────────────────────────────────────┘
```

**Topbar contains (left to right):**
- Hamburger icon (collapse sidebar on desktop, open drawer on mobile)
- Page title (DM Sans 600, 20px)
- Breadcrumb below title (sm, muted)
- Spacer
- Global search bar (glass input, 280px wide, with search icon, Ctrl+K shortcut hint)
- Notification bell (with unread count badge — brown background, white number)
- Theme toggle (sun / moon icon, smooth transition)
- User avatar with dropdown (name + email + sign out)

**Sidebar contains (top to bottom):**
- Logo area: "Moniq" wordmark in DM Serif Display + small brown square icon, 24px padding
- Divider
- Navigation section label "MAIN" (10px, wider letter-spacing, muted, uppercase)
- Nav items: Dashboard, Accounts, Transactions, Analytics, Budget
- Navigation section label "MANAGEMENT"
- Nav items: Goals, Recurring, Reports
- Spacer (flex-grow)
- Navigation section label "SETTINGS"
- Nav items: Settings
- Divider
- User profile card at bottom: avatar (40px) + name + role + chevron

**Active nav item style:**
- Brown-tinted glass background: `rgba(160,82,45,0.12)`
- Left border: 3px solid `#A0522D`
- Icon color: `#A0522D`
- Text color: `#6B3218`, weight 600
- Inactive: muted text, no border, transparent background

**Mobile (< 768px):**
- Sidebar becomes bottom navigation bar with 5 primary icons
- Topbar loses sidebar toggle, gains logo center
- FAB for add transaction stays bottom-right above nav bar
- Remaining pages accessible from bottom nav "More" tab

---

## 3. SCREEN DESIGNS — DETAILED SPECIFICATIONS

---

### SCREEN 1: Landing Page

**Layout:** Full-width, no sidebar. Dark background with warm cream sections alternating.

**Section 1 — Hero:**
- Full viewport height
- Background: deep warm brown `#2D1409` with animated floating orbs (blurred circles `rgba(160,82,45,0.15)`, slow drift animation)
- Left column (60% width):
  - Eyebrow text: "Personal Finance, Simplified" — uppercase, tracking-widest, brown-300, sm
  - Main headline (DM Serif Display, italic, 60px, white, leading-tight): "Know where your money goes."
  - Subtitle (DM Sans 18px, brown-300, leading-relaxed): "Moniq tracks your income, expenses, and savings in one beautiful dashboard — completely free."
  - Two CTA buttons side by side:
    - Primary: "Get Started Free" — brown-500 background, white text, 52px height, 24px radius
    - Secondary: "See how it works" — glass button with white border, white text, same size, play icon
  - Below buttons: "No credit card required · Free forever" — xs, muted, with shield icon
- Right column (40% width):
  - Floating dashboard card preview — glass card showing a mini dashboard with balance, donut chart, and 3 transaction rows. Slight 3D tilt (rotateX 8deg, rotateY -12deg). Subtle shadow beneath. Animation: gentle float up and down (4s loop).
  - Behind the card: blurred color blobs matching chart colors

**Section 2 — Stats bar:**
- Full width, brown-100 background
- Three stats centered: "100% Free", "All Data Local & Secure", "Works on All Devices"
- Each stat: large number / icon (48px, brown-500) + label below (sm, brown-700)
- Subtle separator lines between

**Section 3 — Features:**
- White background section
- Section heading (center): "Everything you need to manage money" — DM Serif Display, 36px, brown-800
- 6 feature cards in 3×2 grid — each is a glass card (light glass on white bg)
  - Card: icon (24px, brown-500 in brown-100 circle background 48px) + heading (lg, semibold) + description (sm, muted)
  - Features: Dashboard overview, Transaction management, Budget tracking, Analytics & charts, Savings goals, Recurring transactions

**Section 4 — App preview:**
- Brown-800 background
- Large centered heading: "A dashboard that actually makes sense" — white, DM Serif Display
- Full-width browser mockup frame (glass border, browser chrome at top) showing the dashboard screen
- Behind frame: radial glow in brown-500 color

**Section 5 — How it works:**
- Cream background
- 3 steps horizontally: Add transactions → Set budgets → Reach your goals
- Each step: large step number (DM Serif Display, 80px, brown-200, behind card) + glass card with icon, title, description
- Connecting dotted line between steps

**Section 6 — CTA Banner:**
- Brown-500 background, slight noise texture
- Center: "Start tracking for free today" — DM Serif Display, 42px, white
- Subtitle + single large white CTA button

**Section 7 — Footer:**
- Dark brown `#1A0F07` background
- Logo + tagline left
- Link columns: Product, Company, Legal
- Bottom bar: copyright + "Made with care"

---

### SCREEN 2: Auth Pages

**Layout:** Centered, no sidebar. Warm cream background with animated background blob.

**Sign Up / Log In:**
- Left side (hidden on mobile): decorative panel — brown-700 background + floating glass cards showing app features + Moniq logo + tagline
- Right side: centered form card (glass-strong, 480px max-width, 40px padding, 24px radius)
  - Logo mark (40px) + "Welcome back" heading (DM Serif Display, 28px)
  - Subtitle: "Sign in to your account" (muted)
  - Google OAuth button: full width, white background, Google icon, "Continue with Google", border
  - Divider: "— or continue with email —"
  - Email input (full width)
  - Password input (with show/hide toggle icon)
  - "Forgot password?" link (right-aligned, sm)
  - Submit button: full width, brown-500, white text, 52px height
  - Footer: "Don't have an account? Sign up" link

**Onboarding Wizard (3 steps):**
- Same centered layout
- Progress indicator: 3 dots at top, current dot filled brown-500
- Step 1: "Tell us about yourself" — name field + currency dropdown (flag + code, searchable)
- Step 2: "Set up your accounts" — add account cards (type selector: Bank/Cash/Credit/Savings + name + initial balance). Can add multiple. Skip option.
- Step 3: "Set a monthly budget" — optional overall spending limit input + "I'll do this later" ghost button
- Each step has illustrated icon at top (40px in brown-100 circle)
- Navigation: Back / Continue buttons at bottom

---

### SCREEN 3: Dashboard

**Layout:** App shell with sidebar + topbar.

**Page content grid:**
```
Row 1: [Net Worth card — wide] [Income card] [Expenses card] [Savings card]
Row 2: [Spending Trend (line chart) — 2/3 width] [Budget Health — 1/3 width]
Row 3: [Recent Transactions — 1/2] [Top Categories donut — 1/2]
Row 4: [Active Goals — 1/2] [Upcoming Recurring — 1/2]
```

**Net Worth Card (glass, wider than others):**
- "Net Worth" label (xs, muted, uppercase)
- Large balance number (DM Serif Display italic, 42px, brown-800 / cream in dark)
- Currency code suffix (sm, muted)
- Small green/red delta from last month: "▲ +EGP 320 vs last month"
- Background: subtle brown gradient from brown-50 to transparent
- Right side: small sparkline (past 6 months, brown-500)

**Summary Cards (Income, Expenses, Savings):**
- Each: icon (in colored circle, 40px) + label + amount (DM Serif Display, 24px) + vs-last-month delta
- Income: green icon (FaArrowDown), green accent
- Expenses: red icon (FaArrowUp), red accent
- Savings: brown icon (FaPiggyBank), brown accent
- Glass card, identical height, equal column width

**Spending Trend Chart:**
- Glass card
- Header: "Spending Trend" + period selector tabs (7D / 30D / 90D)
- Recharts LineChart — two lines: income (green) and expenses (red-brown)
- Custom tooltip: glass-strong bg, shows date + income amount + expense amount
- Axes: muted labels, no grid lines (or very subtle gray)
- Animated: line draws in left-to-right on mount

**Budget Health Card:**
- "Monthly Budget" heading
- Large circle progress gauge (donut style, brown-500 fill, remaining gray): shows % of overall budget used
- Center of gauge: "68% used" (semibold) + "EGP 1,360 of 2,000" (sm, muted) below
- Bottom: 3 mini category progress bars (Food, Transport, Shopping) — each is a thin progress bar with category name, icon, amount, and percentage
- Overspent categories highlighted in red

**Recent Transactions:**
- "Recent Transactions" heading + "View all" link (right)
- 5 transaction rows:
  - Left: category icon in colored circle (36px)
  - Center: transaction title (base, semibold) + account name + date (xs, muted)
  - Right: amount colored (green for income, red for expense) + type badge (xs pill)
- Hover row: subtle brown-tinted glass background
- Empty state: centered illustration (piggy bank outline) + "No transactions yet" + "Add your first" button

**Top Categories Donut Chart:**
- "Spending by Category" heading + month display
- Recharts PieChart (donut, inner radius 55%, outer radius 80%) with chart colors
- Right of chart: legend list (color dot + category name + amount + percentage)
- Hover segment: expand slightly + tooltip with exact amount and % of total
- Center of donut: "Total" label + total amount (DM Serif, semibold)

**Active Goals:**
- "My Goals" heading + "Add goal" link
- 2 goal cards per row — each: icon (32px) + goal name + progress ring (SVG circle, 56px) + amount text + deadline badge
- Progress ring: colored stroke (goal color), animated fill on mount
- Completed goals: checkmark overlay on ring, green accent

**Upcoming Recurring:**
- "Upcoming" heading + "7 days" badge
- List of max 5 recurring items: icon + name + frequency + next date + amount (red for expense, green for income)
- "Due today" items highlighted with warning amber background

**Floating Action Button (FAB):**
- Bottom-right, 56px diameter, brown-500 background, white + icon (FaPlus), 9999px radius
- Drop shadow + hover: scale 1.05, shadow deepens
- On click: expands into 3 mini FABs (Add Income / Add Expense / Add Transfer) — GSAP stagger animation

---

### SCREEN 4: Accounts Page

**Header area:** Page title + "Add Account" button (right, brown-500)

**Account Cards Grid (2 columns on desktop, 1 on mobile):**
Each account card (glass, 20px radius):
- Top: account type icon (32px, white on colored circle matching account.color) + account name + type badge (pill, muted)
- Large balance number (DM Serif, 28px)
- Currency code (sm, muted)
- Bottom row: "X transactions" + income arrow up (green) + expense arrow down (red)
- Overflow menu (3 dots): Edit / Transfer / Archive
- Archived accounts shown with grayscale + "Archived" badge

**Transfer Between Accounts:**
- Modal: From account dropdown → amount input with swap icon button → To account dropdown
- Live preview: "Your [Account A] balance will go from EGP X to EGP Y"

**Add/Edit Account Modal:**
- Account type selector: 4 tiles (Bank / Cash / Credit / Savings) — icon + label, selected = brown border + bg tint
- Name input
- Initial balance input
- Currency dropdown
- Color picker: 8 preset swatches (shades of browns, greens, blues, purples)
- Icon picker: grid of 12 react-icons options

---

### SCREEN 5: Transactions Page

**Header row:** "Transactions" title + transaction count badge + "Add Transaction" button

**Filter bar (glass, full width, below header):**
- Search input (left, with search icon, clear X)
- Filter dropdowns (horizontal, pill style): Type | Category | Account | Date range
- Sort dropdown (right): Date ↓ / Amount ↓ / Category
- Active filters shown as dismissible chips below filter bar

**Transactions Table:**
- Table header row: sticky, glass-strong, columns: Date / Title+Category / Account / Tags / Amount / Actions
- Each row: glass hover effect (brown-tinted)
  - Date: month abbr + day number stacked, muted color
  - Title: bold + category icon + category name below (xs, muted)
  - Account: account color dot + name
  - Tags: up to 2 tag chips, "+N more" if overflow
  - Amount: colored bold (green income, red expense, purple transfer) + type badge
  - Actions: edit pencil icon + delete trash icon (appear on row hover)
- Row click: opens detail drawer (right side panel)

**Transaction Detail Drawer (right panel, slides in):**
- 400px wide on desktop, full screen on mobile
- Glass-strong background
- Header: close X + "Transaction Details"
- Category icon (large, 56px in colored circle) + title (xl, semibold)
- Amount (DM Serif Display, 36px, colored)
- Info grid: Date / Account / Category / Type / Tags / Note
- Receipt image (if attached): thumbnail that expands on click
- Edit button (brown) + Delete button (red ghost)

**Bulk actions bar (appears when rows are selected):**
- Slides up from bottom of table
- Shows: "X selected" + Delete selected / Change category / Export selection

**Empty state:**
- Illustrated empty inbox
- "No transactions found"
- If filters active: "Try clearing your filters" with clear button
- If no transactions at all: "Add your first transaction" button

---

### SCREEN 6: Add / Edit Transaction (Modal)

**Trigger:** FAB → type picker, or "Add Transaction" button
**Format:** Center modal, 560px max-width, glass-strong, 24px top radius

**Layout:**
- Top: close X + modal title ("New Transaction" or "Edit Transaction")
- Type selector (3 tabs at top, full width): Income | Expense | Transfer — selected tab has brown-500 underline + text color
- Amount field (hero, center): large input (DM Serif Display, 32px) with currency symbol prefix. Tap to enter number. Accepts decimals.
- Two-column grid below:
  - Title input
  - Category dropdown (shows icon + name, searchable)
  - Account dropdown (shows color dot + name)
  - Date + Time picker (side by side)
  - Tags input (chip-style multi-select, type to create new)
  - Note textarea (optional, sm)
- Receipt upload: dashed border drop zone, "Attach receipt" with FaCamera icon. Shows thumbnail preview on upload.
- Recurring toggle (switch):
  - Off: hidden
  - On: frequency selector row appears (Daily / Weekly / Biweekly / Monthly / Yearly) + optional end date
- Transfer-specific: shows "From Account" + swap icon + "To Account" instead of single account
- Footer: Cancel (ghost) + Save Transaction (brown-500, full width)

---

### SCREEN 7: Analytics Page

**Header:** "Analytics" + date range selector (pill buttons: This Week / This Month / This Quarter / This Year / Custom)

**Row 1 — Summary numbers:**
4 metric cards: Total Income / Total Expenses / Net Savings / Savings Rate %
- Each: icon + label + number (DM Serif, 28px) + delta vs previous period

**Row 2 — Main charts (two cards side by side):**

**Income vs Expenses Bar Chart (2/3 width):**
- Grouped bar chart (Recharts BarChart)
- X-axis: months (Jan–Dec or last 12 months)
- Two bars per month: Income (green) / Expenses (red-brown)
- Custom tooltip: glass background, shows both values + net
- Legend: colored dots + labels

**Spending by Category Donut (1/3 width):**
- Interactive donut — click segment → highlights and shows drill-down below chart
- Legend below chart: rank list with color, name, amount, % bar

**Row 3 — Trend line chart (full width):**
- Area chart showing cash flow over selected period
- Three shaded areas: income (green tint), expenses (red tint), net savings (brown tint)
- Hover: vertical line + tooltip with all three values
- Bottom: small range selector slider

**Row 4 — Heatmap + Top categories:**

**Day-of-week heatmap (1/2):**
- Grid: 7 columns (Mon–Sun) × N weeks
- Each cell: colored square, darker = more spending
- Brown color scale: brown-50 (none) → brown-500 (high)
- Hover: tooltip with date + amount

**Top spending categories ranked list (1/2):**
- Rank number + category icon in circle + name + progress bar (brown) + amount + % of total
- Top 6 categories shown
- "View all" link

**Row 5 — Smart Insights panel (full width):**
- Glass card with FaLightbulb icon header
- 2–3 plain-language insight cards (horizontal scroll on mobile):
  - "You spent 23% more on Food this month vs last month"
  - "Your savings rate improved to 28% — great work!"
  - "Transport costs are your fastest-growing category"
- Each insight card: icon + text + relevant amount delta

---

### SCREEN 8: Budget Page

**Header:** "Budget" + month navigator (← March 2025 →) + "Edit Budgets" button

**Overview card (full width, glass, brown gradient tint):**
- Left: overall budget gauge (large donut, 120px, brown fill)
- Center: "EGP 1,450 spent of EGP 2,000" (large) + remaining amount + days left in month
- Right: 3 stats: Budgets on track / Over budget / No budget set (with counts)

**Category budgets grid (2 columns):**
Each budget card (glass):
- Category icon (in colored circle, 36px) + category name + status badge ("On track" green / "At risk" amber / "Over budget" red)
- Budget amount (right-aligned, sm, muted)
- Animated progress bar (full width, 8px height, rounded):
  - Normal: brown-400 fill
  - At risk (>75%): amber fill
  - Over budget (>100%): red fill + overflows with red extension
- Below bar: "EGP X spent" (left) + "EGP Y left" or "EGP Z over" (right, colored)
- Overspent: card border turns red-tinted, subtle red glow in shadow

**Add/Edit Budget Modal:**
- Category selector (large tiles with icons)
- Amount input
- Rollover toggle
- Month (defaults to current)

**Historical Performance chart:**
- Collapsed accordion below page — click to expand
- Line chart: % of budget used per month for past 6 months per category

---

### SCREEN 9: Goals Page

**Header:** "My Goals" + "Add Goal" button

**Goals grid (2 columns desktop, 1 mobile):**

**Goal Card (glass, 20px radius):**
- Top row: goal icon (32px, white on `goal.color` circle) + goal name (lg, semibold) + overflow menu (edit / pause / delete)
- Large progress ring (SVG, 80px diameter) — centered below header:
  - Stroke color: `goal.color`
  - Shows percentage inside (semibold)
  - Animated fill on mount
- Amount progress: "EGP X of EGP Y" (sm, below ring)
- Deadline row: FaCalendar icon + "Due in X days" or "Overdue" (red)
- Bottom: "Add contribution" ghost button (full width)
- Completed goal: ring becomes full, checkmark overlay, green confetti particles, "Completed!" badge

**Goal Detail Drawer (right panel):**
- Progress ring (120px)
- All goal details
- Contribution history timeline (date + amount + note for each)
- "Add contribution" button → quick modal: amount + note
- Projected completion date calculation shown

---

### SCREEN 10: Recurring Transactions Page

**Header:** "Recurring" + "Add Rule" button

**Upcoming Calendar Strip (horizontal, full width):**
- Glass card
- 7 day columns showing current week
- Each day: date number + list of mini event pills (colored by type: income green / expense red)
- "Today" column has brown-tinted background

**Rules List:**
Each rule row (glass card, horizontal):
- Left: category icon (36px circle)
- Title + frequency badge (e.g. "Monthly") + account name (xs, muted)
- Center: next due date chip (if today: amber "Due today!")
- Right: amount (colored) + auto-log badge (green "Auto" or amber "Manual")
- Toggle switch (enable/disable rule)
- Overflow menu: Edit / Delete

**Overdue alert banner (if any rules overdue):**
- Amber glass banner at top of list
- "2 recurring transactions are overdue" + "Review" button

---

### SCREEN 11: Reports Page

**Header:** "Reports"

**Report type selector (3 large tiles):**
- Monthly Report / Annual Summary / Custom Range
- Each tile: icon + title + description (sm)
- Selected: brown border + brown-50 bg tint

**Report Preview Card (full width, glass):**
- Report header with Moniq logo + report title + date range
- Summary stat cards (4 inline): Income / Expenses / Net / Savings Rate
- Bar chart preview
- Top 5 categories table (rank + name + amount + % of total)
- "Export PDF" button (brown) + "Export CSV" ghost button

---

### SCREEN 12: Settings Page

**Layout:** Left tab list (vertical, 200px) + right content panel

**Tab nav items (left panel, glass card):**
Profile / Accounts / Categories / Currency & Locale / Notifications / Appearance / Data

**Profile Tab:**
- Avatar uploader (80px circle, click to change, FaCamera overlay)
- Display name input
- Email (read-only, with "Change email" link)
- Save button

**Appearance Tab (showcase this tab in detail):**
- Theme selector: 3 tiles (Light / Dark / System) with preview thumbnails of the glass UI
- Accent color (not needed — brand is fixed brown, show note "Moniq uses its signature brown palette")

**Data Tab:**
- Export data card: "Export all your data as JSON" — FaDownload button
- Import card: "Import transactions from CSV" — upload dropzone + field mapping step
- Reset card: "Reset all data" — red danger zone with confirmation dialog (type "DELETE" to confirm)

---

## 4. DESIGN SYSTEM COMPONENTS (Design all states)

Design the following components at all states:

**Button:**
- Variants: Primary (brown-500 fill) / Secondary (ghost, brown border) / Danger (red) / Ghost (transparent)
- States: Default / Hover / Active/Press / Disabled / Loading (spinner replaces text)
- Sizes: SM (36px) / MD (44px) / LG (52px)

**Input:**
- States: Default (glass bg) / Hover (stronger glass) / Focus (brown border, soft glow ring) / Error (red border + red helper text below) / Disabled (opacity 50%)
- Variants: Standard / With prefix icon / With suffix action (clear X, show/hide)

**Dropdown / Select:**
- Closed state same as input
- Open: glass panel drops below, option list with hover states, selected = brown-tinted + checkmark

**Badge / Chip:**
- Transaction type: Income (green bg) / Expense (red bg) / Transfer (purple bg) — xs, semibold, pill
- Category: category color dot + name, brown-tinted glass bg
- Status: On track / At risk / Overdue with appropriate colors
- Dismissible tag (× button inside)

**Toast Notification:**
- Bottom-right, slides in, 4 variants: success / warning / error / info
- Glass background with left colored border (4px)
- Auto-dismiss progress bar at bottom of toast

**Modal / Dialog:**
- Glass-strong background
- Top: title + close X
- Body: scrollable if content overflows
- Footer: action buttons (right-aligned)
- Overlay: blurred scrim `rgba(107,50,24,0.35)` + backdrop blur 4px

**Empty States (illustrate at least 3):**
- No transactions: envelope/receipt outline illustration, warm brown color
- No goals: target/flag illustration
- No data for chart: chart with question marks
- Each: centered illustration (120px) + primary message (lg, semibold) + secondary message (muted) + optional CTA button

**Loading States:**
- Skeleton screens: shimmer animation on card shapes, matching layout of content
- Spinner: brown-500 ring spinner for button loading
- Page loader: centered Moniq logo + animated dots

---

## 5. MOBILE DESIGN SPECIFICATIONS

All screens must have responsive mobile variants (375px width):

- Bottom navigation bar: 5 icons (Dashboard / Transactions / [FAB center] / Analytics / More)
- FAB: center of bottom nav, raised, brown-500, 56px
- Cards: full width, reduced padding (16px)
- Charts: simplified (donut only, bar chart scrollable horizontally)
- Tables become card list view (each row becomes a card)
- Modals become bottom sheets (slide up from bottom, 90% height, 24px top radius)
- Sidebar becomes hamburger drawer (slides from left over content)
- Filter bar becomes horizontal scroll of pill filters

---

## 6. DARK MODE SPECIFICATIONS

Every screen must have a dark mode variant using these rules:
- App background: `#1A0F07` (very dark warm brown)
- Card surface: `rgba(36,21,8,0.70)` glass
- Text primary: `#FAF2EB`
- Text secondary: `#D4B898`
- All status colors: lightened 15% from light-mode versions
- Charts: same colors, slightly increased opacity
- Background blobs: same positions, opacity reduced to 0.06
- Input background: `rgba(36,21,8,0.70)` glass
- Show light AND dark designs for: Dashboard, Transactions, Add Transaction modal

---

## 7. DESIGN DELIVERABLES CHECKLIST

Design every single one of the following screens:

**Landing & Auth:**
☐ Landing page (desktop full scroll)
☐ Sign Up page
☐ Log In page
☐ Onboarding Step 1, 2, 3

**App (Light mode, Desktop):**
☐ Dashboard
☐ Accounts page
☐ Transactions page (with data)
☐ Add Transaction modal (Expense)
☐ Add Transaction modal (Transfer)
☐ Analytics page
☐ Budget page
☐ Goals page
☐ Recurring page
☐ Reports page
☐ Settings → Appearance tab
☐ Settings → Data tab

**App (Dark mode, Desktop):**
☐ Dashboard (dark)
☐ Transactions page (dark)
☐ Analytics page (dark)

**Mobile (Light mode):**
☐ Dashboard mobile
☐ Transactions mobile (card list)
☐ Add Transaction bottom sheet
☐ Analytics mobile

**Components sheet:**
☐ All button states and variants
☐ All input states
☐ All badge/chip types
☐ Toast notifications
☐ Empty states (3 variants)
☐ Loading skeleton screens

---

## 8. DESIGN CONSTRAINTS & RULES

1. Never use a flat white or flat gray background — always warm cream or glass
2. Every card must use glassmorphism — no solid opaque card surfaces
3. Brown palette only — no blue, purple, or teal as primary actions (status colors are ok)
4. Charts must always be inside glass cards with proper padding (24px)
5. Typography: never use font-weight below 400 in body content
6. Numbers showing money values: always use DM Serif Display or JetBrains Mono
7. Income amounts: always green `#3D8C5A`
8. Expense amounts: always red `#C0392B`
9. All interactive elements must show a visible hover state (no invisible hover)
10. Icon sizes must be consistent per context (see Section 1)
11. Bottom navigation on mobile must always be visible, never hidden by content
12. FAB must always float above all content (z-index highest)
13. No lorem ipsum — use realistic financial data in all mockups (realistic amounts, transaction names like "Grocery Store", "Netflix", "Monthly Salary")
14. Use Egyptian Pound (EGP) as the demo currency in all mockups
15. Dark mode must not be an afterthought — every screen needs a full dark variant

---

## 9. DESIGN INSPIRATION REFERENCES

The overall aesthetic should feel like a fusion of:
- **Linear app** (clean glass, precision typography, sidebar nav)
- **Notion** (readable, spacious, warm neutrals)
- **Revolut** (financial data presented beautifully, card-based layout)
- **Craft** (glassmorphism depth, beautiful spacing)

But distinctly Moniq's own with the **warm brown palette** instead of cold grays or blues.

---

*Design with intention. Every pixel should feel earned.*