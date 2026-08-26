# InvoiceFlow — AI-Powered Enterprise Invoice & Accounts Payable Platform

**InvoiceFlow** is an enterprise-grade accounts payable automation platform designed to streamline invoice ingestion, AI extraction, duplicate risk detection, multi-tier manager approvals, and payment queue execution.

---

## 🌟 Key Features & Capabilities

### 1. AI Multimodal Document Extraction (Gemini + OCR Pipeline)
- **Google Gemini Multimodal Vision**: Extracts structured data from PDF documents, PNG, and JPEG files using `@google/genai`.
- **Automatic Fallback OCR**: Integrated Tesseract OCR fallback engine ensures high availability during AI service congestion.
- **Comprehensive Field Ingestion**: Automatically extracts Vendor Details, GSTIN/Tax ID, Invoice Number, Issue & Due Dates, Payment Terms, Subtotal, GST/Tax, Discounts, Line Items, and Total Amounts.

### 2. Cross-User Duplicate Risk Engine
- **Pre-Flight Duplicate Detection**: Scans database records before submission to prevent double-payments and duplicate entries.
- **Audit Context**: Highlights uploader identity, existing approval status (e.g., Pending, Approved, Paid), and direct references to original invoice records.

### 3. Role-Based Access Control (RBAC) Workflows

| Role | Core Responsibilities & Workflow |
| :--- | :--- |
| **Finance Executive** | Upload invoices, inspect AI extraction, edit line items, handle correction requests, submit to Manager Queue, and execute final payment disbursements. |
| **Manager** | Review approval queue, perform side-by-side PDF document review, approve invoices, or send for correction/reject with structured modal notes and reference linking. |

### 4. Interactive Rejection & Correction Workflows
- **Structured Rejection Reasons**: Select specific rejection types (`CORRECTION_REQUIRED`, `ALREADY_SUBMITTED`, `ALREADY_PAID`).
- **Correction Queue**: Allows Finance Executives to fix flagged items ("Fix & Resubmit") and send updated revisions back into the approval pipeline.

### 5. Global Context Search & Real-Time Notifications
- **Global Search Palette**: Instantly search invoices by invoice number, vendor, amount, or status with context-aware navigation.
- **Notification Center**: Operational drawer for real-time workflow alerts with single-click **Read All** auto-dismiss.

### 6. Analytics & Financial Ledger
- **Expense Analytics**: Spend distribution curves, category breakdowns, and monthly financial metrics.
- **Master Ledger & Audit Trail**: Full status tracking, payment history logs, pagination, and export capabilities.

---

## 🏗️ System Architecture

```
                               ┌──────────────────────────┐
                               │ React 19 + Tailwind CSS  │
                               │  (Vite Client Application)│
                               └────────────┬─────────────┘
                                            │ HTTP / REST API (Axios Interceptors)
                                            ▼
                               ┌──────────────────────────┐
                               │  Node.js + Express Server │
                               │  (JWT RBAC & Validation) │
                               └─────┬──────────┬─────────┘
                                     │          │
         ┌───────────────────────────┘          └──────────────────────────┐
         ▼                                                                 ▼
┌──────────────────────────┐                               ┌──────────────────────────┐
│     MongoDB Database     │                               │ Google Gemini AI Vision  │
│  (Mongoose Persistence & │                               │   (Multimodal Document  │
│     Duplicate Checker)   │                               │         Parsing)         │
└──────────────────────────┘                               └──────────────────────────┘
```

---

## ⚙️ Tech Stack

- **Frontend**: React 19, Vite 7, Tailwind CSS, Lucide React, Axios
- **Backend**: Node.js, Express.js, JWT Authentication, Express Validator
- **Database**: MongoDB, Mongoose ORM
- **AI Services**: Google Gemini Multimodal Vision API (`@google/genai`)
- **Cloud Media**: Cloudinary CDN / Base64 Document Storage

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas Connection String
- **Google Gemini API Key**: From [Google AI Studio](https://aistudio.google.com/)

---

### Environment Setup

#### 1. Backend Environment (`backend/.env`)
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/invoiceflow
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key_here
```

#### 2. Frontend Environment (`.env`)
```env
VITE_API_URL=http://localhost:5001/api
```

---

### Installation & Execution

#### 1. Clone Repository
```bash
git clone https://github.com/Jeelkathiria/invoiceflow.git
cd invoiceflow
```

#### 2. Start Backend Server
```bash
cd backend
npm install
npm run server
```
*Backend runs on `http://localhost:5001`*

#### 3. Start Frontend Application
```bash
# In the project root directory
npm install
npm run dev
```
*Frontend application runs on `http://localhost:5173`*

---

## 🔐 Credentials & Quick Access

- **Finance Executive**: Register via `/signup` or use Quick Demo Login.
- **Manager Account**:
  - **Email**: `Manager@gmail.com`
  - **Password**: `Manager`

---

## 📁 Repository & Maintainer

- **GitHub Repository**: [InvoiceFlow Repo](https://github.com/Jeelkathiria/invoiceflow)
- **Developer**: Jeel Kathiria

---

## 📄 License

This project is licensed under the MIT License.
