# FinanceAssist - Personal Finance Management Platform

## 📋 Project Overview

FinanceAssist is a comprehensive full-stack web application designed to help users manage their personal finances effectively. Built with modern technologies, it provides a complete suite of financial management tools including expense tracking, budget planning, investment portfolio management, tax calculations, recurring transaction automation, advanced analytics, and AI-powered financial advice.

The platform follows clean architecture principles, RESTful API design, and production-ready code standards, making it scalable and maintainable.

---

## 🚀 Core Features

### 1. User Authentication & Profile Management

#### Secure Authentication
- **User Registration**: Email-based registration with validation
- **JWT Authentication**: Stateless token-based authentication
- **Password Security**: BCrypt password hashing
- **Session Management**: Automatic token refresh on email change
- **Protected Routes**: Authentication-based access control

#### Profile Management
- **Edit Profile**: Update name, email, and password
- **Password Change**: Secure password update with current password verification
- **Email Uniqueness**: Validation to prevent duplicate email addresses

---

### 2. Expense Tracker Dashboard

#### Transaction Management
- **Add Transactions**: Record income, expenses, and investments
  - Title/Description
  - Amount with validation
  - Category classification
  - Type (Income/Expense/Investment)
  - Automatic date tracking
- **Edit Transactions**: Update existing transaction details
- **Delete Transactions**: Remove transactions with confirmation
- **Transaction Categories**: Organize by custom categories (Food, Travel, Entertainment, etc.)

#### Financial Overview
- **Real-time Statistics**: 
  - Total Balance calculation
  - Income tracking
  - Expense tracking
  - Investment tracking
- **Visual Analytics**:
  - Interactive pie chart showing expense breakdown by category
  - Color-coded transaction cards
  - Responsive charts with tooltips
- **Transaction History**: 
  - Chronological listing
  - Newest transactions first
  - Detailed transaction information

#### Dashboard Feature Cards
Quick access cards for navigating to key features:
- **Budgets** - Manage monthly budgets
- **Analytics** - Financial insights and trends
- **Investments** - Portfolio tracking
- **Recurring** - Recurring transactions
- **Reports** - Financial reports

---

### 3. Budget Planning & Alerts

#### Monthly Budget Management
- **Category-wise Budgets**: Set budgets for different categories (Food, Travel, Rent, Entertainment, Shopping, Bills, Healthcare, Education, etc.)
- **Monthly Tracking**: Track budgets per month and year
- **Real-time Calculation**: Automatic calculation of spent vs remaining budget
- **Visual Progress**: 
  - Progress bars showing budget usage
  - Percentage indicators
  - Color-coded status (safe/warning/exceeded)

#### Smart Alert System
- **Warning Alert**: Triggered when budget reaches 80%
- **Exceeded Alert**: Triggered when budget exceeds 100%
- **UI Notifications**: Toast/banner alerts for budget warnings
- **Alert Dashboard**: View all budget alerts in one place

---

### 4. Recurring Transactions

#### Automated Transaction Management
- **Transaction Types**: Support for monthly rent, EMIs, subscriptions, and other recurring payments
- **Frequency Configuration**:
  - Daily recurring transactions
  - Weekly recurring transactions
  - Monthly recurring transactions
- **Flexible Scheduling**:
  - Start date configuration
  - Optional end date
  - Automatic transaction generation via scheduled job
- **Management Features**:
  - Pause/resume functionality
  - Edit recurring transactions
  - Duplicate prevention
  - Last generated date tracking
- **Automated Generation**: Scheduled job runs daily at midnight to generate transactions

---

### 5. Advanced Analytics Dashboard

#### Comprehensive Financial Insights
- **Month-wise Expense Trend**: Line chart showing spending patterns over time
- **Income vs Expense Comparison**: Bar chart comparing income and expenses
- **Category Growth Analysis**: Track category-wise spending changes with trend indicators (↑/↓)
- **Savings Rate**: Calculate and display savings rate percentage
- **Interactive Features**: 
  - Date range filters
  - Tooltips and legends
  - Responsive design
  - Real-time data updates

---

### 6. Investment Portfolio Tracker

#### Portfolio Management
- **Asset Types Supported**:
  - Mutual Funds
  - Stocks (manual entry)
  - Gold
  - Crypto (optional)
- **Tracking Features**:
  - Track invested amount
  - Track current value (manual input)
  - Calculate profit/loss
  - Calculate profit/loss percentage
  - Quantity and price tracking
- **Visualization**:
  - Asset allocation pie chart
  - Portfolio summary dashboard
  - Individual investment cards with P&L display
- **Portfolio Summary**: 
  - Total invested amount
  - Current portfolio value
  - Total profit/loss
  - Overall return percentage

---

### 7. Income Tax Estimator (India 🇮🇳)

#### Dual Regime Tax Calculation
- **Old Regime Support**:
  - Tax calculation with deductions
  - Section 80C (max ₹1,50,000)
  - Section 80D (Health Insurance)
  - Section 24B (Home Loan Interest)
  - Other deductions support
- **New Regime Support**:
  - Simplified tax calculation
  - No deductions required
- **Comparison Features**:
  - Side-by-side comparison of both regimes
  - Tax savings calculation
  - Recommended regime suggestion
  - Detailed tax breakdown (tax, cess, total)

---

### 8. Multi-Year Financial Reports

#### Comprehensive Reporting
- **Year-wise Comparison**: Income & expense comparison across multiple years
- **Net Worth Growth**: Track net worth over time including investments
- **Tax History**: Annual tax paid history tracking
- **Export Options**:
  - **PDF Export**: Professional PDF reports using jsPDF
  - **Excel Export**: Formatted Excel files using xlsx
- **Interactive Charts**: 
  - Bar charts for year-wise comparison
  - Line charts for net worth growth
  - Visual representation of financial data
- **Summary Tables**: Comprehensive data tables with all financial metrics

---

### 9. SIP & GST Calculators

#### SIP Calculator
- **SIP Mode**: Calculate returns for monthly systematic investments
- **Lumpsum Mode**: Calculate returns for one-time investments
- **Customizable Parameters**:
  - Monthly/Total investment amount
  - Annual interest rate
  - Investment duration in years
- **Visual Returns**: Interactive area chart showing growth over time

#### GST Calculator
- **Tax Calculation Types**:
  - GST Exclusive: Calculate GST on base amount
  - GST Inclusive: Extract GST from total amount
- **Tax Slabs**: Support for 5%, 12%, 18%, and 28% GST rates
- **GSTR-3B Report Generation**:
  - Professional report formatting
  - Business details inclusion
  - Excel and PDF export options

---

### 10. AI Assistant

#### Financial Advisory
- **24/7 AI Support**: Chat-based interface for financial queries
- **Floating Action Button**: Always accessible AI assistant button with bounce animation
- **Smart Responses**: Contextual financial advice
- **Interactive Chat**:
  - User and AI message bubbles
  - Real-time typing indicators
  - Message history
  - Smooth scrolling
- **Financial Guidance**: Get advice on budgeting, investments, savings, tax planning, and more

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite 7+
- **Styling**: Tailwind CSS 4+
- **UI Components**: Custom component library with Radix UI
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router v7
- **State Management**: React Hooks
- **Notifications**: React Hot Toast
- **Charts**: Recharts
- **PDF Generation**: jsPDF + jspdf-autotable
- **Excel Export**: SheetJS (xlsx)

### Backend
- **Framework**: Spring Boot 3.3.5
- **Language**: Java 21
- **Database**: MongoDB
- **Security**: Spring Security with JWT
- **API**: RESTful API design
- **Validation**: Jakarta Validation
- **Build Tool**: Maven
- **Scheduling**: Spring Scheduling (for recurring transactions)

### Security
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: BCrypt
- **CORS Configuration**: Cross-origin resource sharing
- **Token Management**: Automatic token refresh
- **Session Handling**: Stateless authentication

---

## 📁 Project Structure

```
FinanceAssist/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # Reusable UI components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   └── Input.jsx
│   │   │   ├── Layout/
│   │   │   │   └── Layout.jsx         # Main layout with navigation
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── ExpensePlanner.jsx     # Main dashboard
│   │   │   ├── BudgetPlanning.jsx
│   │   │   ├── RecurringTransactions.jsx
│   │   │   ├── AnalyticsDashboard.jsx
│   │   │   ├── InvestmentPortfolio.jsx
│   │   │   ├── TaxCalculator.jsx
│   │   │   ├── FinancialReports.jsx
│   │   │   ├── SIPCalculator.jsx
│   │   │   ├── GSTCalculator.jsx
│   │   │   └── AIChat.jsx
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── transactionService.js
│   │   │   ├── profileService.js
│   │   │   ├── budgetService.js
│   │   │   ├── recurringTransactionService.js
│   │   │   ├── analyticsService.js
│   │   │   ├── investmentService.js
│   │   │   ├── taxService.js
│   │   │   └── reportService.js
│   │   ├── lib/
│   │   │   ├── axios.js               # API configuration
│   │   │   └── utils.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── FinanceAssist/
    └── src/
        └── main/
            ├── java/com/example/FinanceAssist/
            │   ├── config/
            │   │   └── SecurityConfig.java
            │   ├── controller/
            │   │   ├── AuthController.java
            │   │   ├── UserController.java
            │   │   ├── TransactionController.java
            │   │   ├── ProfileController.java
            │   │   ├── BudgetController.java
            │   │   ├── RecurringTransactionController.java
            │   │   ├── AnalyticsController.java
            │   │   ├── InvestmentController.java
            │   │   ├── TaxCalculatorController.java
            │   │   ├── ReportController.java
            │   │   └── HealthController.java
            │   ├── model/
            │   │   ├── User.java
            │   │   ├── Transaction.java
            │   │   ├── Budget.java
            │   │   ├── RecurringTransaction.java
            │   │   └── Investment.java
            │   ├── repository/
            │   │   ├── UserRepository.java
            │   │   ├── TransactionRepository.java
            │   │   ├── BudgetRepository.java
            │   │   ├── RecurringTransactionRepository.java
            │   │   └── InvestmentRepository.java
            │   ├── service/
            │   │   ├── AuthService.java
            │   │   ├── UserService.java
            │   │   ├── TransactionService.java
            │   │   ├── BudgetService.java
            │   │   ├── RecurringTransactionService.java
            │   │   ├── AnalyticsService.java
            │   │   ├── InvestmentService.java
            │   │   ├── TaxCalculatorService.java
            │   │   └── ReportService.java
            │   ├── dto/
            │   │   ├── AuthResponse.java
            │   │   ├── LoginRequest.java
            │   │   ├── RegisterRequest.java
            │   │   ├── UpdateProfileRequest.java
            │   │   └── UserDTO.java
            │   ├── util/
            │   │   └── JwtUtil.java
            │   ├── security/
            │   │   └── JwtAuthenticationFilter.java
            │   ├── exception/
            │   │   └── GlobalExceptionHandler.java
            │   └── FinanceAssistApplication.java
            └── resources/
                └── application.properties
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/validate` - Validate JWT token

### User Management
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update user profile
- `GET /api/users` - Get all users (admin)
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/by-email` - Get user by email

### Transactions
- `GET /api/transactions` - Get all transactions (with optional userId, accountId filters)
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/{id}` - Get transaction by ID
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction
- `GET /api/transactions/stats` - Get transaction statistics

### Budgets
- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/month` - Get budgets by month/year
- `GET /api/budgets/{id}` - Get budget by ID
- `GET /api/budgets/{id}/with-alerts` - Get budget with alert information
- `GET /api/budgets/alerts` - Get all budget alerts for user
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget

### Recurring Transactions
- `GET /api/recurring-transactions` - Get all recurring transactions
- `GET /api/recurring-transactions/active` - Get active recurring transactions
- `GET /api/recurring-transactions/{id}` - Get recurring transaction by ID
- `POST /api/recurring-transactions` - Create recurring transaction
- `PUT /api/recurring-transactions/{id}` - Update recurring transaction
- `PUT /api/recurring-transactions/{id}/pause` - Pause recurring transaction
- `PUT /api/recurring-transactions/{id}/resume` - Resume recurring transaction
- `DELETE /api/recurring-transactions/{id}` - Delete recurring transaction

### Analytics
- `GET /api/analytics/expense-trend` - Get month-wise expense trend
- `GET /api/analytics/income-expense-comparison` - Get income/expense comparison
- `GET /api/analytics/category-growth` - Get category growth analysis
- `GET /api/analytics/savings-rate` - Get savings rate
- `GET /api/analytics/dashboard` - Get comprehensive dashboard data

### Investments
- `GET /api/investments` - Get all investments
- `GET /api/investments/type` - Get investments by asset type
- `GET /api/investments/{id}` - Get investment by ID
- `GET /api/investments/{id}/profit-loss` - Get profit/loss for investment
- `GET /api/investments/portfolio/summary` - Get portfolio summary
- `POST /api/investments` - Create investment
- `PUT /api/investments/{id}` - Update investment
- `DELETE /api/investments/{id}` - Delete investment

### Tax Calculator
- `POST /api/tax/calculate/old-regime` - Calculate Old Regime tax
- `POST /api/tax/calculate/new-regime` - Calculate New Regime tax
- `POST /api/tax/compare` - Compare both regimes

### Reports
- `GET /api/reports/year-wise-comparison` - Get year-wise comparison
- `GET /api/reports/net-worth-growth` - Get net worth growth
- `GET /api/reports/tax-history` - Get tax history
- `GET /api/reports/comprehensive` - Get comprehensive report

### Health Check
- `GET /` - API health check

---

## 🎨 User Interface & Experience

### Design Features
- **Dark Mode Support**: 
  - Full dark mode implementation
  - Automatic theme detection
  - Manual theme toggle
  - Persistent theme preference
- **Responsive Design**:
  - Mobile-first approach
  - Tablet and desktop optimization
  - Collapsible mobile navigation
- **Modern UI Components**:
  - Glass morphism effects
  - Gradient buttons and cards
  - Smooth animations and transitions
  - Interactive hover effects
  - Loading states and spinners

### Navigation Structure
- **Main Navigation Bar**: 
  - Dashboard
  - Tax Calculator
  - SIP Calculator
  - GST Calculator
- **Dashboard Feature Cards**: Quick access to:
  - Budgets
  - Analytics
  - Investments
  - Recurring Transactions
  - Reports
- **Floating AI Assistant**: Always accessible with bounce animation
- **Protected Routes**: Authentication-based route access

---

## 🔒 Security Features

1. **Authentication**:
   - JWT-based secure authentication
   - Token expiration handling
   - Automatic logout on token expiry
   - Protected route access

2. **Data Protection**:
   - Password encryption with BCrypt
   - Secure token storage
   - HTTPS ready
   - Input sanitization and validation

3. **Authorization**:
   - User-specific data access
   - API endpoint protection
   - Role-based access control (ready for expansion)

---

## 📊 Key Functionalities

### Expense Tracking System
1. **Transaction Recording**:
   - Categorize transactions (Food, Transport, Entertainment, etc.)
   - Track multiple transaction types (Income, Expense, Investment)
   - Automatic date stamping
   - Amount validation

2. **Financial Analytics**:
   - Real-time balance calculation
   - Expense categorization with visual charts
   - Monthly/yearly summaries
   - Spending pattern analysis

3. **Dashboard Features**:
   - Quick overview cards
   - Interactive pie charts
   - Transaction filtering
   - Feature navigation cards

### Budget Management
1. **Budget Creation**:
   - Category-wise monthly budgets
   - Month and year tracking
   - Budget limit setting

2. **Budget Monitoring**:
   - Real-time spent calculation
   - Progress tracking
   - Alert system (80% warning, 100% exceeded)

### Investment Planning
1. **Portfolio Tracking**:
   - Multiple asset type support
   - Profit/loss calculations
   - Asset allocation visualization

2. **Calculators**:
   - SIP calculator with compound interest
   - Yearly growth projections
   - Visual representation of investment growth

### Tax Management
1. **GST Calculations**:
   - Multiple tax slab support
   - Inclusive and exclusive calculations
   - CGST, SGST breakdown
   - Real-time tax computation

2. **Income Tax (India)**:
   - Old and New regime support
   - Deduction calculations
   - Regime comparison

3. **Report Generation**:
   - Professional GSTR-3B format
   - Excel and PDF exports
   - Complete tax summaries

### AI Integration
1. **Chat Interface**:
   - Real-time messaging
   - Context-aware responses
   - Financial advice generation
   - Query history

---

## 🚀 Performance Features

- **Fast Loading**: Vite build optimization
- **Code Splitting**: Route-based code splitting
- **Efficient Rendering**: React optimization techniques
- **Caching**: LocalStorage for preferences and auth tokens
- **Database Optimization**: MongoDB aggregation pipelines for analytics
- **Scheduled Jobs**: Efficient recurring transaction generation

---

## 🔧 Configuration

### Environment Variables
- `VITE_API_URL`: Frontend API base URL (default: http://localhost:8081/api)
- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DATABASE`: Database name
- `JWT_SECRET`: JWT token secret key
- `JWT_EXPIRATION`: Token expiration time (default: 24 hours)
- `ALLOWED_ORIGINS`: CORS allowed origins

### Application Properties
- Server port: 8081
- MongoDB auto-configuration
- CORS configuration
- JWT settings
- Scheduled job configuration

---

## 📈 Architecture & Design Patterns

### Backend Architecture
- **Layered Architecture**: Controller → Service → Repository
- **DTO Pattern**: Data Transfer Objects for API communication
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic separation
- **Scheduled Jobs**: Spring Scheduling for automation
- **Exception Handling**: Global exception handler

### Frontend Architecture
- **Component-Based**: Reusable React components
- **Service Layer**: API communication abstraction
- **Custom Hooks**: Reusable logic (where applicable)
- **Protected Routes**: Authentication-based routing
- **State Management**: React Hooks and Context

### Database Design
- **MongoDB Collections**:
  - `users` - User accounts
  - `transactions` - Financial transactions
  - `budgets` - Monthly budgets
  - `recurring_transactions` - Recurring transaction templates
  - `investments` - Investment portfolio

---

## 🎯 Use Cases

1. **Personal Finance Management**: Track daily expenses and income
2. **Budget Planning**: Set and monitor monthly budgets with alerts
3. **Investment Planning**: Track portfolio and calculate SIP returns
4. **Tax Compliance**: Generate GST reports and calculate income tax
5. **Financial Advisory**: Get AI-powered financial advice
6. **Budget Tracking**: Monitor spending against budgets with real-time alerts
7. **Financial Reporting**: Generate detailed multi-year financial reports
8. **Recurring Payments**: Automate recurring transactions (rent, EMIs, subscriptions)

---

## 📝 Development Notes

- The application uses MongoDB for flexible data storage
- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- Financial calculations are performed server-side for accuracy
- Reports can be exported in multiple formats for record-keeping
- The AI assistant provides general financial guidance (not professional advice)
- Scheduled jobs run daily at midnight to generate recurring transactions
- All features follow RESTful API best practices
- Clean architecture ensures maintainability and scalability

---

## 🔄 Version History

- **v2.0.0**: Enhanced release with advanced features
  - Budget Planning & Alerts
  - Recurring Transactions with automated generation
  - Advanced Analytics Dashboard
  - Investment Portfolio Tracker
  - Income Tax Estimator (India)
  - Multi-Year Financial Reports
  - Floating AI Assistant button
  - Improved navigation structure
  - Code cleanup and optimization

- **v1.0.0**: Initial release with core features
  - User authentication
  - Expense tracking
  - SIP calculator
  - GST calculator
  - AI assistant
  - Profile management

---

## 🚀 Getting Started

### Prerequisites
- Java 21
- Node.js 18+
- MongoDB
- Maven 3.6+

### Backend Setup
```bash
cd FinanceAssist/FinanceAssist
./mvnw spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:8081
- Health Check: http://localhost:8081/

---

**Built with ❤️ using Spring Boot and React**

---

## 📄 License

This project is for educational and portfolio purposes.
