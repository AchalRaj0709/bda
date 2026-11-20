# MongoDB-Based Big Data Storage, Processing, and Analysis System

A full-stack enterprise MERN application for big data storage, high-throughput stream ingestion, multi-stage aggregation pipeline processing, and interactive dashboard analytics. Built with modern SaaS architecture and production-ready data pipelines.

---

## 🌟 Key Features

1. **Massive Data Storage & Indexing**:
   - High-throughput MongoDB document collection (`sales`).
   - Compound B-tree indexes on `(category, region, orderDate)` and `(orderDate, sales)` for sub-millisecond query execution.
2. **Bulk CSV Ingestion & Streaming**:
   - Ingest files containing thousands of records using `Multer` and `csv-parser`.
   - Batch writes via Mongoose `bulkWrite` with `upsert` and `$setOnInsert` to prevent duplicate `orderId` errors.
3. **Synthetic Dataset Generator**:
   - Generate and insert 1,000 to 50,000+ realistic transaction records directly into MongoDB in batches of 2,000 using `insertMany`.
4. **MongoDB Aggregation Pipeline Analytics**:
   - Real-time computing of Total Sales, Profit, Average Order Value (AOV), and unique SKU counts.
   - Grouping operations by Category, Region, and Monthly chronological intervals.
   - Built-in Aggregation Query Inspector displaying the raw MongoDB queries (`$match`, `$group`, `$sort`, `$project`, `$limit`).
5. **Heuristic Data Insights**:
   - Automated business rules for top revenue category, most profitable region, margin warnings, and peak transaction months.
6. **Modern Dark Navy UI**:
   - Glassmorphism design system built with React, Vite, Tailwind CSS, Recharts, and Lucide icons.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React.js 18 + Vite | Modular UI components, client-side routing, responsive layout |
| **Styling** | Tailwind CSS | Dark navy SaaS theme with glassmorphism effects |
| **Charts** | Recharts | Line charts, Bar charts, Pie charts, and Horizontal Bar charts |
| **Icons** | Lucide React | Modern interface iconography |
| **Backend API** | Node.js + Express.js | REST API endpoints, streaming CSV parsing, error handling |
| **Database** | MongoDB + Mongoose | Document storage, compound indexes, aggregation pipelines |
| **File Processing** | Multer + csv-parser | Multi-part uploads and stream-based memory-safe CSV ingestion |

---

## 📁 Project Structure

```text
BDA/
├── client/                      # React + Vite Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI (Sidebar, Navbar, KPICard, Modal, Pagination)
│   │   ├── pages/               # Dashboard, DataManagement, Analytics, DataInsights, AboutProject
│   │   ├── layouts/             # MainLayout with shared states and modals
│   │   ├── services/            # Axios API client
│   │   ├── utils/               # Currency, number, and date formatters
│   │   ├── App.jsx              # Client routing
│   │   └── main.jsx             # Entry point
│   ├── tailwind.config.js       # Tailwind theme colors and glassmorphism
│   ├── vite.config.js           # Vite dev server with backend API proxy
│   └── package.json
├── server/                      # Node.js + Express Backend
│   ├── config/                  # MongoDB Mongoose connection
│   ├── models/                  # Sales Mongoose model with schema and indexes
│   ├── controllers/             # salesController, analyticsController
│   ├── routes/                  # REST API routes (/api/sales, /api/analytics)
│   ├── middleware/              # Multer upload configuration and central error handler
│   ├── services/                # generatorService (synthetic 10k batch generator)
│   ├── utils/                   # csvHelper (streaming CSV import and preview)
│   ├── server.js                # Express app entry point
│   ├── .env                     # Server environment variables
│   └── package.json
├── sample-data/                 # Pre-generated sample dataset ready for upload testing
│   └── sales_sample_dataset.csv # 2,500 sample records
├── package.json                 # Root script runners
└── README.md
```

---

## 🚀 Quick Setup & Installation Guide

### 1. Prerequisites
- **Git**: Installed and configured
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Community Server (v6.0+) running locally on port `27017` or a MongoDB Atlas URI

---

### 2. Clone the Repository
```bash
git clone https://github.com/AchalRaj0709/bda.git
cd bda
```

---

### 3. Install Dependencies
Install packages for both the backend server and the frontend client:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

### 4. Configure Environment Variables
Create a `.env` file in the `server` directory (you can copy the provided `.env.example`):

```bash
# Inside the server directory
cp .env.example .env
```

Ensure your `server/.env` contains:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/bigdata_analytics
NODE_ENV=development
```

---

### 5. Configure & Start MongoDB
Ensure MongoDB is running locally:
- **Windows**:
  ```powershell
  mongod --dbpath "C:\data\db" --port 27017
  ```
- **macOS / Linux**:
  ```bash
  sudo systemctl start mongod
  # or
  brew services start mongodb/brew/mongodb-community
  ```

---

### 6. Run the Application
Open two separate terminal windows:

#### Terminal 1 — Start Backend Server:
```bash
cd server
npm run dev
```
Backend API will be running at: **`http://localhost:5000`**

#### Terminal 2 — Start Frontend Client:
```bash
cd client
npm run dev
```
Frontend Dashboard will be accessible at: **`http://localhost:5173`**

---

## 📊 How to Generate & Import Sample Data

You have two convenient methods to populate the database:

### Method A: One-Click Generator (Fastest)
1. In the top navigation bar, click the **"Generate Data"** button.
2. Select **10,000 records** (or custom count up to 50,000) and click **"Generate & Storing..."**.
3. Batches of 2,000 records will be inserted concurrently via `insertMany`.

### Method B: Upload Sample CSV File
1. Navigate to **Data Management** (`/data`).
2. Click on the upload box and select the provided sample dataset:
   `sample-data/sales_sample_dataset.csv`
3. Click **"Preview"** to inspect the first 10 rows.
4. Click **"Import to DB"** to stream and batch-insert records into MongoDB using `bulkWrite`.

---

## 💼 System Walkthrough & Feature Tour

When presenting or reviewing the system capabilities:

1. **High-Volume Ingestion (`client/src/pages/DataManagement.jsx`)**:
   - Demonstrates streaming CSV parsing with constant memory overhead.
   - Highlights `bulkWrite` handling unique order ID constraints to prevent duplicate data insertion.
2. **Real-Time Aggregations (`client/src/pages/Analytics.jsx`)**:
   - Change Category, Region, and Date Range filters to observe dynamic updates computed by MongoDB pipelines.
   - Inspect the **"MongoDB Aggregation Pipeline Query Inspector"** for execution stages:
     - `$match`: Filters by criteria using compound B-tree index scans.
     - `$group`: Groups and computes accumulators (`$sum`, `$avg`).
     - `$project`: Calculates profit margin expressions `($profit / $sales) * 100`.
     - `$sort`: Orders documents descending.
3. **Automated Business Insights (`client/src/pages/DataInsights.jsx`)**:
   - Evaluates 5 core business questions automatically using backend calculations with zero external AI API dependency.
4. **Architecture & Schema Optimization (`client/src/pages/AboutProject.jsx`)**:
   - Inspect the Mongoose model schema and explain how compound indexing on `(category, region, orderDate)` delivers sub-millisecond query performance.

