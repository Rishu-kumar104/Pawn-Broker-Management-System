# Mini Pawn Broker Management System

A production-quality web application for managing pawn broker operations — loans, payments, interest calculations, and double-entry accounting.

## Project Overview

This system helps pawn brokers:

- Issue new loans against pledged items (gold/jewelry)
- Track loan balances, interest accrual, and payment history
- Allocate payments to interest first, then principal
- Maintain a day book with double-entry journal entries
- View dashboard metrics at a glance

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 15+ (App Router) | Full-stack React framework |
| TypeScript | Type-safe development |
| Prisma ORM | Database access and migrations |
| PostgreSQL | Production-ready hosted database (Neon/Supabase/Vercel Postgres) |
| Tailwind CSS | Utility-first styling |
| Zod | Request validation |
| date-fns | Date calculations |

## Installation

### Prerequisites

- Node.js 18+
- npm

### Steps

```bash
# Clone or navigate to the project
cd pawn-broker

# Install dependencies
npm install

# Set up environment variables
# Copy .env.example to .env and set your Postgres URL
# DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"

# Create tables in your Postgres database (first setup)
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Vercel Deployment

For full production deployment steps (Neon, Supabase, Vercel Postgres, env vars, and troubleshooting), see:

- **[VERCEL_SETUP.md](./VERCEL_SETUP.md)** — step-by-step fresh Vercel deploy (start here)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — detailed database and troubleshooting guide

Quick checklist:

1. Create a hosted Postgres database (Neon recommended).
2. Set `DATABASE_URL` in Vercel with the **real** connection string (not `HOST` placeholder).
3. Run `npm run db:verify` locally once to create tables.
4. Push to GitHub and redeploy on Vercel.

## Environment Setup

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
```

## Prisma Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Push schema to database (first setup / simple deploy)
npx prisma db push

# Create and apply migrations (recommended during development)
npx prisma migrate dev --name init

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

## Run Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Database Design

### Loan

Stores pawn loan details including customer info, pledged item weights, loan amount, and interest rate.

| Field | Description |
|---|---|
| customerName | Borrower name |
| loanDate | Date loan was issued |
| loanAmount | Principal amount disbursed |
| interestRate | Monthly interest rate (%) |
| pledgedItem | Item description |
| grossWeight / stoneWeight / netWeight | Weight in grams |
| estimatedValue | Appraised item value |
| paymentMode | Cash or Bank |

### Payment

Records each payment as a separate immutable row. Payments are never updated or deleted.

| Field | Description |
|---|---|
| amount | Total payment received |
| principalPaid | Portion applied to principal |
| interestPaid | Portion applied to interest |
| paymentDate | Date of payment |

### Journal

Double-entry bookkeeping records linked to loans.

| Field | Description |
|---|---|
| voucherNo | Auto-generated (JV0001, RV0001) |
| account | Account name |
| debit / credit | Entry amounts |
| date | Transaction date |

## Accounting Logic

### Loan Created (Journal Voucher — JV)

When a loan is issued:

| Account | Debit | Credit |
|---|---|---|
| Loan Receivable | Loan Amount | — |
| Cash / Bank | — | Loan Amount |

### Payment Received (Receipt Voucher — RV)

When a payment of ₹2,000 is received (₹300 interest + ₹1,700 principal):

| Account | Debit | Credit |
|---|---|---|
| Cash / Bank | 2,000 | — |
| Interest Income | — | 300 |
| Loan Receivable | — | 1,700 |

Voucher numbers auto-increment: `JV0001`, `JV0002`, `RV0001`, `RV0002`, etc.

## Interest Calculation

Interest is calculated using exact days between dates:

```
Interest = (Principal × Rate × Days) / (30 × 100)
```

- **Principal** — current balance principal (outstanding amount)
- **Rate** — monthly interest rate (%)
- **Days** — exact calendar days from last activity date to today
- Result is rounded to 2 decimal places

After each payment, interest accrues from the payment date on the remaining balance.

## Payment Allocation

When a payment is received:

1. **Interest first** — pending interest is paid up to the payment amount
2. **Principal second** — any remaining amount reduces the loan balance

**Example:** Interest due = ₹500, Payment = ₹2,000

- Interest Paid = ₹500
- Principal Paid = ₹1,500

**Example:** Interest due = ₹500, Payment = ₹200

- Interest Paid = ₹200
- Principal Paid = ₹0

Payments are rejected if the loan is already fully paid (zero balance and zero pending interest).

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/loans` | List all loans (optional `?search=`) |
| POST | `/api/loans` | Create a new loan |
| GET | `/api/loans/[id]` | Get loan details |
| GET | `/api/payments` | List payments (optional `?loanId=`) |
| POST | `/api/payments` | Record a payment |
| GET | `/api/daybook` | List journal entries |

## Project Structure

```
pawn-broker/
├── app/                  # Next.js App Router pages and API routes
├── components/           # Reusable React components
├── lib/                  # Business logic, Prisma client, validations
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## Business Rules

- Transaction history is never deleted
- Payment records are never updated — always insert new rows
- Balance Principal = Loan Amount − Total Principal Paid
- Total Amount Payable = Balance Principal + Pending Interest
