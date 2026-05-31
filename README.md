# Loan Management System

A Next-Gen, role-based lending protocol featuring automated borrower validation, real-time interest calculation, and step-by-step loan processing. 

Built with **Next.js (App Router, Turbopack, Tailwind CSS)** on the frontend, and **Node.js (Express, TypeScript, MongoDB, Mongoose)** on the backend.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **API Client**: Axios with JWT Request/Response Interceptors

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB & Mongoose ORM
- **Security**: JWT Authentication & Role-Based Access Control (RBAC) Middleware
- **Logs**: Winston & Morgan logger streams

---

## 🔑 Default Login Credentials

All test accounts share the same password: **`Password@123`**

| Role | Email Address | Password | Functionality |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@test.com` | `Password@123` | Master analytics dashboard, global metrics, and complete loans log view. |
| **Borrower** | `borrower@test.com` | `Password@123` | Borrower profile management, multi-step application wizard, upload salary slips. |
| **Sanction Officer** | `sanction@test.com` | `Password@123` | Review applied loans, examine salary slips, and approve/reject applications. |
| **Disbursement Officer**| `disbursement@test.com` | `Password@123` | Process fund transfers for sanctioned applications. |
| **Collection Officer** | `collection@test.com` | `Password@123` | Record repayments using Unique Transaction References (UTR) and close active loans. |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on port `27017` (or MongoDB Atlas)

### 1. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables in `.env` (already configured to local MongoDB fallback by default):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/loan_management_system
   JWT_SECRET=your_jwt_secret_key_change_in_production_at_least_32_chars
   JWT_EXPIRES_IN=1d
   ALLOWED_ORIGINS=http://localhost:3000
   ```
4. Seed the default test accounts (described in credentials section):
   ```bash
   npm run seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
   *The backend will boot up at `http://localhost:5000/api/v1`.*

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify your environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend will run at `http://localhost:3000`.*

---

## 🧪 Full Loan Lifecycle Testing Guide

Follow this sequence of steps to test the application end-to-end:

### Step 1: Borrower — Apply for a Loan
1. Navigate to `http://localhost:3000/login` and log in with the **Borrower** client credentials.
2. Under your profile page, click **Get Started** or **Apply for New Loan** to open the wizard.
3. **Step 1 (Personal Details)**: Enter your details. Ensure DOB falls in the age range of 23–50, monthly salary is at least 25,000, and PAN matches regex format `ABCDE1234F`. Click **Next**.
4. **Step 2 (Salary Slip)**: Upload any sample document/image file and click **Next**.
5. **Step 3 (Loan Configuration)**: Configure your principal amount and tenure. Simple Interest (flat 12% p.a.) will be computed dynamically. Click **Next**.
6. **Step 4 (Review)**: Review your configurations and click **Submit**. The application status is recorded as **`Applied`**.

### Step 2: Sanction Officer — Evaluate & Approve
1. Log out of the Borrower account and log back in using the **Sanction Officer** credentials.
2. Select your borrower's application under **Pending Applications** on the left.
3. Add review comments in the textbox and click **Approve Loan**.
4. The application status changes to **`Sanctioned`**.

### Step 3: Disbursement Officer — Pay Out Capital
1. Log out and log back in using the **Disbursement Officer** credentials.
2. Under **Sanctioned Applications**, select the approved loan.
3. Click **Disburse Loan Capital** to verify and execute the transfer.
4. The application status transitions to **`Disbursed`** and the debt becomes active.

### Step 4: Collection Officer — Repayment & Closure
1. Log out and log back in using the **Collection Officer** credentials.
2. Select the active loan from the list.
3. Record a repayment:
   - **UTR (Unique Transaction Reference)**: Add a dummy reference (e.g. `UTR987654321`).
   - **Amount**: Add the payback amount.
   - **Payment Date**: Select today's date.
4. Click **Record Payment**. Once outstanding debt balance is reduced to 0, the status transitions to **`Closed`**.

### Step 5: System Admin — Analytics
1. Log in using the **System Admin** credentials.
2. Access global analytics cards (Registered Borrowers, Total Applications, Total Sanctioned Principal, and Active Outstanding Debt) and track all historical logs.
