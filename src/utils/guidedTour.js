import { driver } from "driver.js";
import "driver.js/dist/driver.css";

// Configure steps for each page
const getStepsForPath = (path) => {
    switch (path) {
        case "/dashboard/home":
            return [
                // Sidebar Steps
                {
                    element: "#tour-sidebar-home",
                    popover: {
                        title: "Dashboard Overview",
                        description: "Your financial home base. Click here at any time to return to this dashboard and view a high-level summary of your financial status.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: "#tour-sidebar-accounts",
                    popover: {
                        title: "Accounts & Wallets",
                        description: "Manage all your payment methods, including cash wallets, bank accounts, and credit cards, in one secure place.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: "#tour-sidebar-transactions",
                    popover: {
                        title: "Transactions Registry",
                        description: "Track your day-to-day income, transfers, and expenses. You can also filter, search, and export your transaction history.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: "#tour-sidebar-categories",
                    popover: {
                        title: "Smart Category Budgets",
                        description: "Organize your expenses into customized categories. Define personalized category colors and icons to keep your tracking visual and clean.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: "#tour-sidebar-budget",
                    popover: {
                        title: "Monthly Budgets",
                        description: "Set and monitor limits for different expense areas. Keeping track of your budget usage has never been easier.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: "#tour-sidebar-goals",
                    popover: {
                        title: "Savings Goals",
                        description: "Create targets for savings, track progress dynamically as you save, and celebrate when you reach your milestones.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: "#tour-sidebar-reports",
                    popover: {
                        title: "Financial Reports",
                        description: "Analyze patterns in your expenses over time. Export professional summaries, and review cash flow statistics.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: "#tour-sidebar-analytics",
                    popover: {
                        title: "Advanced Analytics",
                        description: "Get a deeper understanding of your habits. View trend lines, forecasting models, and comprehensive distribution charts.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: "#tour-sidebar-profile",
                    popover: {
                        title: "User Settings",
                        description: "Configure your display name, email preferences, default currency, and manage security settings.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: "#tour-sidebar-collapse",
                    popover: {
                        title: "Toggle Sidebar Width",
                        description: "Collapse the navigation bar to maximize your screen space, or expand it for full item labels.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: "#tour-sidebar-logout",
                    popover: {
                        title: "Secure Log Out",
                        description: "Sign out of your session securely to protect your private financial records on this device.",
                        side: "right",
                        align: "start"
                    }
                },

                // Header Steps
                {
                    element: "#tour-header-location",
                    popover: {
                        title: "Navigation Path",
                        description: "Shows you exactly which dashboard view you are currently exploring.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: "#tour-header-theme",
                    popover: {
                        title: "Theme Toggle",
                        description: "Instantly switch between Moniq's warm cream light theme and our dark theme for comfortable nighttime viewing.",
                        side: "bottom",
                        align: "end"
                    }
                },
                {
                    element: "#tour-header-notifications",
                    popover: {
                        title: "Activity Alerts",
                        description: "Stay updated on budget limits, achieved savings targets, and system notifications.",
                        side: "bottom",
                        align: "end"
                    }
                },
                {
                    element: "#tour-header-help",
                    popover: {
                        title: "Guided Walkthrough",
                        description: "Click this icon at any time to relaunch this interactive tour and refresh your memory on the application's layout.",
                        side: "bottom",
                        align: "end"
                    }
                },
                {
                    element: "#tour-header-avatar",
                    popover: {
                        title: "User Profile Details",
                        description: "View your active profile card, display credentials, and log out or adjust account details.",
                        side: "bottom",
                        align: "end"
                    }
                },

                // Home Page Steps
                {
                    element: "#home-welcome-heading",
                    popover: {
                        title: "Welcome Section",
                        description: "Greeting you back and showing the quick month selector. Use this picker to see data from previous months.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: "#home-month-picker",
                    popover: {
                        title: "Month Selector",
                        description: "Quickly toggle between different months to review historical financial logs and compare monthly progress.",
                        side: "bottom",
                        align: "end"
                    }
                },
                {
                    element: "#home-card-balance",
                    popover: {
                        title: "Total Combined Balance",
                        description: "The sum of all active accounts and wallets. The percentage indicator shows your net worth change versus last month.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#home-card-income",
                    popover: {
                        title: "Total Month Income",
                        description: "A roll-up of all earnings recorded this month across your configured sources.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#home-card-expenses",
                    popover: {
                        title: "Total Month Expenses",
                        description: "A summarized amount of all expenditures and transaction count registered this month.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#home-card-savings",
                    popover: {
                        title: "Active Month Savings",
                        description: "Displays money allocated toward your savings goals during this monthly period.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#tour-home-cashflow",
                    popover: {
                        title: "Cash Flow Visualizer",
                        description: "A weekly comparison of your incoming versus outgoing funds. Use this bar chart to check if you are spending within your means.",
                        side: "top",
                        align: "center"
                    }
                },
                {
                    element: "#tour-home-budgethealth",
                    popover: {
                        title: "Monthly Budget Health",
                        description: "A visual health meter showing what percentage of your set budgets you have consumed so far this month.",
                        side: "top",
                        align: "center"
                    }
                },
                {
                    element: "#home-recent-tx-title",
                    popover: {
                        title: "Recent Transactions",
                        description: "Your most recent transactions list. Click 'View All' to open the complete ledger and search through entries.",
                        side: "top",
                        align: "center"
                    }
                },
                {
                    element: "#home-top-categories-title",
                    popover: {
                        title: "Top Categories Breakdown",
                        description: "Find out where your money is going. Shows your top spending categories sorted by percentage of total expenses.",
                        side: "top",
                        align: "center"
                    }
                },
                {
                    element: "#home-active-goals-title",
                    popover: {
                        title: "Savings Goals Progress",
                        description: "Tracks your current versus target amounts for active savings goals. You can add goals directly from here!",
                        side: "top",
                        align: "center"
                    }
                }
            ];

        case "/dashboard/accounts":
            return [
                {
                    element: "#accounts-tab-active",
                    popover: {
                        title: "Active Accounts Tab",
                        description: "Click here to see all your active checking, savings, cash, or credit accounts.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: "#accounts-tab-archived",
                    popover: {
                        title: "Archived Accounts Tab",
                        description: "Click here to access archived accounts that are currently hidden but stored historically.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: "#tour-accounts-add",
                    popover: {
                        title: "Add New Account",
                        description: "Create a new wallet, bank account, or card. Give it a starting balance, color, and representational icon.",
                        side: "left",
                        align: "center"
                    }
                },
                {
                    element: "#tour-accounts-list",
                    popover: {
                        title: "Accounts Cards",
                        description: "A card display showing each account name, type, active balance, monthly transactions, and quick action options (Edit, Archive, Set Default, Delete).",
                        side: "top",
                        align: "center"
                    }
                },
                {
                    element: "#tour-accounts-transfer",
                    popover: {
                        title: "Quick Account Transfer",
                        description: "Easily move money from one account to another. Moniq automatically logs the transaction pair.",
                        side: "top",
                        align: "center"
                    }
                }
            ];

        case "/dashboard/transactions":
            return [
                {
                    element: "#tour-txn-hint",
                    popover: {
                        title: "Default Account Hint",
                        description: "Displays your current default transaction account and its balance. You can change this setting in the profile tab.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: "#tour-txn-export",
                    popover: {
                        title: "Export Spreadsheet",
                        description: "Instantly export your filtered transaction ledger into a standard Excel file for offline tracking.",
                        side: "left",
                        align: "center"
                    }
                },
                {
                    element: "#tour-txn-add",
                    popover: {
                        title: "Log Transaction",
                        description: "Log your income, transfers, and expenses. Allocate categories, select payment methods, and add hashtags.",
                        side: "left",
                        align: "center"
                    }
                },
                {
                    element: "#tour-txn-filters",
                    popover: {
                        title: "Search & Filter Panel",
                        description: "Search transaction descriptions, filter by types, specific categories, accounts, or date ranges.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#tour-txn-table",
                    popover: {
                        title: "Activity Ledger",
                        description: "Displays logged activities chronologically. Click row action icons to view details, edit fields, or delete entries.",
                        side: "top",
                        align: "center"
                    }
                }
            ];

        case "/dashboard/categories":
            return [
                {
                    element: "#tour-cat-hint",
                    popover: {
                        title: "Categories Hint",
                        description: "Reminds you to define monthly budget warning limits for newly created categories in the Budgets section.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: "#tour-cat-toggles",
                    popover: {
                        title: "Active / Archived View",
                        description: "Toggle category tables between active tracked categories and historically archived categories.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#tour-cat-export",
                    popover: {
                        title: "Export Spreadsheet",
                        description: "Export the categories catalog, color styles, and monthly transaction counts to an Excel sheet.",
                        side: "left",
                        align: "center"
                    }
                },
                {
                    element: "#tour-cat-add",
                    popover: {
                        title: "Create Category",
                        description: "Add a custom category by selecting color palettes, symbols, and setting whether it tracks income or expenses.",
                        side: "left",
                        align: "center"
                    }
                },
                {
                    element: "#tour-cat-filters",
                    popover: {
                        title: "Search & Type Filters",
                        description: "Quickly locate categories by entering their title or filter the list by category type.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#tour-cat-table",
                    popover: {
                        title: "Categories List",
                        description: "Manage, edit, or archive categories. Star categories to make them default for new transactions.",
                        side: "top",
                        align: "center"
                    }
                }
            ];

        case "/dashboard/budgets":
            return [
                {
                    element: "#tour-budgets-monthnav",
                    popover: {
                        title: "Month Navigation",
                        description: "Navigate back and forth between months to set, review, and adjust historical budgets.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#tour-budgets-add",
                    popover: {
                        title: "Add Budget Limit",
                        description: "Set a monthly spending warning limit on any categories that are currently unbudgeted.",
                        side: "left",
                        align: "center"
                    }
                },
                {
                    element: "#tour-budgets-overview",
                    popover: {
                        title: "Monthly Budget Snapshot",
                        description: "Shows your overall monthly budget limit, total spent, remaining status badges, and active days remaining in the month.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#tour-budgets-progress",
                    popover: {
                        title: "Total Budget Usage",
                        description: "Visualizes the percentage and ratio of your aggregate spending against your combined monthly budget limits.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#tour-budgets-filters",
                    popover: {
                        title: "Search & Status Filters",
                        description: "Search budgets by name or filter cards by track status (On Track, At Risk, Over Budget) to isolate issues.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#tour-budgets-grid",
                    popover: {
                        title: "Active Budgets Grid",
                        description: "Shows your category warning cards detailing limits, spent amounts, color progress indicators, and active rollovers.",
                        side: "top",
                        align: "center"
                    }
                }
            ];

        case "/dashboard/goals":
            return [
                {
                    element: "#tour-goals-add",
                    popover: {
                        title: "Create Savings Goal",
                        description: "Define a savings target, choose target amount, color theme, icons, deadline dates, and link to a specific account.",
                        side: "left",
                        align: "center"
                    }
                },
                {
                    element: "#tour-goals-overall",
                    popover: {
                        title: "Accumulated Summary",
                        description: "Highlights the total amount saved across all active goals and the aggregate target values.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#tour-goals-list",
                    popover: {
                        title: "Goal Progress Cards",
                        description: "Track current contributions, percentage progress lines, monthly savings speed requirements, and goals status.",
                        side: "top",
                        align: "center"
                    }
                },
                {
                    element: "#tour-goals-suggestions",
                    popover: {
                        title: "Smart Suggestions",
                        description: "Personalized tips based on spending habits to help you allocate funds and accelerate savings.",
                        side: "left",
                        align: "center"
                    }
                },
                {
                    element: "#tour-goals-milestones",
                    popover: {
                        title: "Achieved Milestones",
                        description: "Celebrates goals you have successfully fully funded, highlighting achievements and dates completed.",
                        side: "left",
                        align: "center"
                    }
                }
            ];

        case "/dashboard/reports":
            return [
                {
                    element: "#tour-reports-typebtn",
                    popover: {
                        title: "Report Configuration Picker",
                        description: "Select between 7 report setups: Monthly Summary, Category Report, Account Statement, Budget Performance, Goals Progress, Income & Expense.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: "#tour-reports-periodpills",
                    popover: {
                        title: "Report Timeframe Pills",
                        description: "Quickly set report boundaries (this month, last month, last 3M, this year, or custom windows).",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#tour-reports-exportbtn",
                    popover: {
                        title: "Download Excel Report",
                        description: "Click to generate and download a clean spreadsheet containing the current report's rows and structures.",
                        side: "left",
                        align: "center"
                    }
                },
                {
                    element: "#tour-reports-content",
                    popover: {
                        title: "Report Summary View",
                        description: "Shows detailed summaries, adherence tables, chronological ledgers, health scores, and charts based on the chosen report type.",
                        side: "top",
                        align: "center"
                    }
                }
            ];

        case "/dashboard/analytics":
            return [
                {
                    element: "#tour-analysis-kpi",
                    popover: {
                        title: "Analytics KPIs",
                        description: "Monitor key metrics like net savings, average daily expense, income-to-expense ratios, and variance indicators.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#tour-analysis-cashflow",
                    popover: {
                        title: "Cash Flow Trajectory",
                        description: "Interactive chart comparing weekly income versus expenses to track your net wealth trend.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#tour-analysis-categories",
                    popover: {
                        title: "Expense Distribution",
                        description: "Doughnut chart paired with spending lists showing the largest category allocations this period.",
                        side: "top",
                        align: "center"
                    }
                },
                {
                    element: "#tour-analysis-heatmap",
                    popover: {
                        title: "Spending Heatmap",
                        description: "Visualizes transaction frequencies and volumes to detect high-activity spending days.",
                        side: "top",
                        align: "center"
                    }
                },
                {
                    element: "#tour-analysis-patterns",
                    popover: {
                        title: "Income & Spending Patterns",
                        description: "Details your primary income streams and patterns (e.g. morning vs night, weekdays vs weekends).",
                        side: "top",
                        align: "center"
                    }
                },
                {
                    element: "#tour-analysis-accounts",
                    popover: {
                        title: "Account Performance",
                        description: "Compares cash flows, incomes, and spending shares across all checking and savings accounts.",
                        side: "top",
                        align: "center"
                    }
                },
                {
                    element: "#tour-analysis-tags",
                    popover: {
                        title: "Tags Highlights",
                        description: "Analyze micro-spending trends using your custom transaction tags and highlights.",
                        side: "top",
                        align: "center"
                    }
                }
            ];

        case "/dashboard/profile":
            return [
                {
                    element: "#tour-profile-summary",
                    popover: {
                        title: "Profile Card",
                        description: "Displays your display photo, name, email, preferred currency, and active theme badge.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#tour-profile-tabs",
                    popover: {
                        title: "Preferences Tabs",
                        description: "Switch panels between Personal Info settings, Security Settings (email password reset), and system preferences.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#tour-profile-content",
                    popover: {
                        title: "Configuration Form",
                        description: "Input fields to edit your personal profile, select default accounts, date formats, or choose languages.",
                        side: "top",
                        align: "center"
                    }
                }
            ];

        default:
            return [];
    }
};

export const startDashboardTour = () => {
    const path = window.location.pathname;
    const steps = getStepsForPath(path);

    if (steps.length === 0) return;

    // Filter steps to verify elements exist in the DOM (driver.js fails on missing elements)
    const activeSteps = steps.filter((step) => {
        const el = document.querySelector(step.element);
        return !!el;
    });

    if (activeSteps.length === 0) return;

    const driverObj = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        popoverClass: "moniq-tour-popover",
        overlayColor: "rgba(45, 20, 9, 0.45)",
        steps: activeSteps
    });

    driverObj.drive();
};
