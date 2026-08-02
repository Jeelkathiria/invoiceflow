# InvoiceFlow - AI-Powered Invoice Lifecycle Engine

InvoiceFlow automates invoice processing, extraction, validation, duplicate detection, and manager approval workflows for accounts payable operations.

## Overview

InvoiceFlow is an enterprise SaaS platform built to automate the accounts payable lifecycle. Powered by Google Gemini AI Multimodal Vision, MongoDB, and Role-Based Access Control (RBAC), InvoiceFlow transforms manual invoice entry into an automated, audit-ready workflow.

---

## Key Capabilities

### 1. AI Multimodal Document Extraction
- Parses unstructured PDF documents, PNGs, and JPEGs using Google Gemini AI.
- Extracts vendor details, GSTIN, invoice numbers, invoice dates, due dates, subtotal, GST tax calculations, discounts, payment terms, and itemized line items.
- Built-in fallback heuristics handle high API traffic without service interruptions.

### 2. Cross-User Duplicate Risk Engine
- Cross-checks vendor name, invoice number, and total amounts against all persisted invoices in MongoDB.
- Flags duplicate risk with real-time audit details:
  - Uploader Name: Identifies the Finance Executive who previously submitted the invoice.
  - Approval Status: Indicates whether the matching invoice is Pending or Already Approved.
- Automatically cleans up unsubmitted draft invoices when files are discarded.

### 3. Enterprise Role-Based Access Control (RBAC)
- Finance Executive Role: Upload documents, inspect OCR outputs, edit line items, manage draft cleanup, and submit verified invoices for approval.
- Manager Role: Review approval queue, inspect original PDF documents side-by-side with line items, approve/reject with remarks, and monitor company-wide metrics.

### 4. Real-Time Analytics Dashboard
- Interactive financial charts built with SVG visualizations:
  - Monthly expense trend curves.
  - Spend distribution by category (Software, Hardware, Consulting, Office Supplies).
  - Quick action widgets for upcoming payments and recent uploads.

### 5. Audit Trail & Ledger Management
- Complete action history recording upload, edit, submission, approval, and rejection events with user timestamps.
- Master Ledger with filtering, status tags, and pagination.

---

## System Architecture

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

## End-to-End Invoice Lifecycle Workflow

```
[ Upload PDF / Image Invoice ] 
       │
       ▼
[ Gemini AI OCR Extraction ] 
       │
       ▼
[ Finance Executive Verification & Line Item Edits ] 
       │
       ▼
[ Duplicate Risk Engine Check ]
       │
  ┌────┴─────────────────────────────┐
  │                                  │
  ▼ (Duplicate Found)                ▼ (No Duplicate)
[ Flag Risk Banner & Uploader ]    [ Submit to Manager Approval Queue ]
  │                                  │
  └──────────────────┬───────────────┘
                     ▼
       [ Manager Side-by-Side Review ]
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
   [ Approved ]             [ Rejected ]
         │                       │
         └───────────┬───────────┘
                     ▼
   [ Analytics Dashboard & Audit Trail ]
```

---

## Tech Stack

| Domain | Technology / Library |
| :--- | :--- |
| Frontend | React 19, Vite 7, Tailwind CSS, Lucide React, Framer Motion, Axios |
| Backend | Node.js, Express.js, JSON Web Tokens (JWT), Bcrypt, Express Validator |
| Database | MongoDB, Mongoose ORM |
| AI Service | Google Gemini AI Vision (`@google/genai`) |
| Cloud Storage | Cloudinary CDN |

---

## Getting Started

### Prerequisites
- Node.js: v18.x or higher
- MongoDB: Local instance or MongoDB Atlas URI
- Google Gemini API Key: From Google AI Studio

---

### Environment Setup

#### Backend Configuration (`backend/.env`)
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/invoiceflow
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Frontend Configuration (`.env`)
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
Backend server runs on `http://localhost:5001`

#### 3. Start Frontend Client
```bash
# In project root
npm install
npm run dev
```
Frontend client runs on `http://localhost:5173`

---

## Account Registration & User Credentials

- Finance Executive Role: Finance Executives register their own workspace account via the Public Signup Page (`/signup`). Any new user who registers on the platform receives a Finance Executive role to upload invoices, edit line items, and submit bills for approval.
- Manager Role: Manager accounts use the fixed demo credentials (`Manager@gmail.com` / `Manager`) to access the Manager Approval Queue, review original invoice PDFs side-by-side, and approve or reject submissions with remarks.

| Role | Registration / Credentials | Access Rights |
| :--- | :--- | :--- |
| Finance Executive | Register on `/signup` or use Quick Demo Access | Upload Invoices, Inspect OCR, Edit Line Items, Draft Cleanup, Submit to Manager |
| Manager | `Manager@gmail.com` / `Manager` | View Approval Queue, Side-by-Side PDF Review, Approve/Reject, Analytics |

---

## Repository

- GitHub Repository: https://github.com/Jeelkathiria/invoiceflow
- Developer: Jeel Kathiria

---

## License

This project is licensed under the MIT License.
