# 🗄️ Database Documentation - FinanceAssist

This document provides details about the database configuration and structure for the FinanceAssist platform.

## 📊 Database Overview

-   **Database Type**: MongoDB (NoSQL)
-   **Database Name**: `finance_assist`
-   **Driver**: Spring Data MongoDB

## 🌐 Connection Details

| Attribute | Local Configuration | Cloud / Environment Variable |
| :--- | :--- | :--- |
| **URI** | `mongodb://localhost:27017` | `MONGODB_URI` |
| **Database** | `finance_assist` | `MONGODB_DATABASE` |
| **Port** | `27017` | Configurable via URI |

> [!NOTE]
> The application uses a fallback mechanism where it defaults to the local MongoDB instance if environment variables are not provided.

## 📁 Collections Schema

The database consists of the following primary collections:

### 1. `users`
Stores user profile and authentication information.
-   **Fields**: `id`, `name`, `email`, `password` (BCrypt hashed), `createdAt`, `updatedAt`.

### 2. `transactions`
Stores all financial records (Income, Expense, Investment).
-   **Fields**: `id`, `userId`, `title`, `amount`, `category`, `type`, `date`, `description`.

### 3. `budgets`
Stores monthly budget configurations and limits.
-   **Fields**: `id`, `userId`, `category`, `limit`, `month`, `year`.

### 4. `recurring_transactions`
Stores templates for automated transactions.
-   **Fields**: `id`, `userId`, `title`, `amount`, `category`, `type`, `frequency`, `startDate`, `endDate`, `lastGeneratedDate`, `status` (Active/Paused).

### 5. `investments`
Stores portfolio data for various asset classes.
-   **Fields**: `id`, `userId`, `assetName`, `assetType`, `investedAmount`, `currentValue`, `quantity`, `buyPrice`.

## 🚀 Cloud Setup (MongoDB Atlas)

If you are using MongoDB Atlas (Cloud), ensure your `MONGODB_URI` follows this format:
```
mongodb+srv://<username>:<password>@<cluster-url>/finance_assist?retryWrites=true&w=majority
```

## 🛠️ Management Tools

To manage and visualize the data, you can use:
1.  **MongoDB Compass**: GUI for local/cloud management ([Download](https://www.mongodb.com/products/compass))
2.  **MongoDB Atlas UI**: Web interface for cloud-hosted databases ([Login](https://www.mongodb.com/cloud/atlas))
3.  **Spring Data Repositories**: Abstracted data access layer within the Java backend.
