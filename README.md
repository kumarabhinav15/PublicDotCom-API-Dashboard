# Public Dashboard
A **financial activity dashboard** that provides clear visibility into brokerage account activity — including trades, dividends, fees, and cash movement — in a single, easy-to-understand interface.

The dashboard is designed for **safety, transparency, and scalability**. It aggregates account activity from brokerage systems, stores it as a persistent event ledger, and presents both detailed history and high-level summaries without allowing any trading or account changes.

---

## Key Features
- 📊 **Unified activity feed** for trades, dividends, transfers, and fees  
- 🔍 **Read-only by design** — no trading or account mutations  
- 🧾 **Persistent event history** for reliable tracking and auditability  
- 🔁 **Broker-agnostic architecture** using adapter interfaces  
- 🧮 **Derived analytics** such as cash flow, income, and activity summaries  
- ⚙️ **Background ingestion** independent of user interaction  
- 🧪 **Automated testing** (unit, integration, and UI smoke tests)  
- 🚀 **CI/CD pipelines** with staging, production, and health checks  

---

## Who This Is For
- Investors who want a clear, organized view of account activity  
- Engineers building financial dashboards or fintech tools  
- Teams that need a safe, read-only financial reporting layer  
- Anyone interested in modern, production-ready web architecture  

---

## Technology Overview
- **Language:** TypeScript  
- **Front End:** React / Next.js 14  
- **Back End:** Node.js / Next.js API routes  
- **Database:** SQLite (local), PostgreSQL (staging & production)  
- **ORM:** Prisma  
- **CI/CD:** GitHub Actions  

---

## Design Philosophy
This project intentionally separates **data ingestion**, **persistence**, **analytics**, and **presentation**.  
By storing immutable activity events and deriving analytics dynamically, the system remains flexible, auditable, and easy to extend — including support for additional broker integrations in the future.

---

## Getting Started
This project is designed to run locally with minimal setup and no external dependencies.

### Prerequisites
- Node.js 18+
- npm
- Git

### Local Setup
Clone the repository:

```bash
git clone https://github.com/<your-username>/public-dashboard.git
cd public-dashboard
npm install
npx prisma migrate dev --name init
npm run dev

Open browser to: **http://localhost:3000**
