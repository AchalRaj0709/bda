import React from 'react';
import {
  BookOpen,
  Database,
  Layers,
  Cpu,
  BarChart3,
  Server,
  Code2,
  CheckCircle2,
  GitBranch,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export default function AboutProject() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Hero Header */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-navy-900/80 to-[#070b14]">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono">
            <span>Production Data Platform</span>
            <span>•</span>
            <span>Big Data Analytics Engine</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            MongoDB-Based Big Data Storage, Processing, and Analysis System
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            A comprehensive MERN stack enterprise-grade data platform demonstrating high-volume document storage in MongoDB, multi-stage aggregation pipelines (OLAP), bulk dataset ingestion via streaming, and interactive data visualization.
          </p>
        </div>
      </div>

      {/* 1. Project Objective & Core Concepts */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">1. Project Objective & Scope</h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Modern enterprise systems handle millions of sales transactions where traditional relational systems face performance bottlenecks. The objective of this project is to develop a high-throughput, low-latency analytics solution leveraging <strong>MongoDB</strong> as a document-oriented database. The application enables users to:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>Store tens of thousands of sales orders with schema validation in MongoDB.</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>Process large CSV uploads with streaming chunking and duplicate order rejection.</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>Execute multi-dimensional grouping and math via MongoDB Aggregation Framework.</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>Present dynamic, responsive interactive visualizations with Recharts and Tailwind CSS.</span>
          </div>
        </div>
      </div>

      {/* 2. Technologies Used */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">2. Technology Stack Breakdown</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Frontend</span>
            <h4 className="text-sm font-semibold text-white">React.js + Vite</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              High-performance component architecture, rapid HMR bundling, and custom state hooks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Styling</span>
            <h4 className="text-sm font-semibold text-white">Tailwind CSS</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Utility-first modern dark navy theme with responsive glassmorphism aesthetic.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider">Backend API</span>
            <h4 className="text-sm font-semibold text-white">Node.js + Express</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              RESTful microservice routing, Multer multi-part parser, and centralized error handling.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Database</span>
            <h4 className="text-sm font-semibold text-white">MongoDB + Mongoose</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Document collection with B-tree indexing on compound query keys and aggregation pipelines.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Data Processing Architecture & Aggregation Pipeline */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <GitBranch className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">3. MongoDB Aggregation Pipeline Architecture</h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The core differentiator between conventional relational SQL query engines and Big Data NoSQL architectures is the <strong>Aggregation Pipeline</strong>. Documents enter a multi-stage pipeline that transforms the documents into aggregated results.
        </p>

        {/* Pipeline Stage Cards */}
        <div className="space-y-2.5">
          {[
            {
              stage: '$match',
              desc: 'Filters the document stream to allow only matching documents to pass into the next pipeline stage (uses index scans for high speed).',
            },
            {
              stage: '$group',
              desc: 'Separates documents into groups by category, region, or date periods, and computes accumulator expressions ($sum, $avg, $max).',
            },
            {
              stage: '$project',
              desc: 'Reshapes documents by adding computed fields like profit margins: ($totalProfit ÷ $totalSales) * 100, rounding to 2 decimal places.',
            },
            {
              stage: '$sort',
              desc: 'Orders the resulting group statistics by descending revenue, profitability, or chronological order.',
            },
            {
              stage: '$limit',
              desc: 'Restricts output size (e.g., retrieving precisely the Top 10 products by sales).',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start space-x-3 text-xs">
              <span className="font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 shrink-0">
                {item.stage}
              </span>
              <span className="text-slate-300 leading-relaxed">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Technical Architecture FAQ */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">4. Technical Architecture & Engineering FAQ</h3>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
            <p className="font-semibold text-cyan-300">Q1: Why use MongoDB instead of MySQL for this big data system?</p>
            <p className="text-slate-300 leading-relaxed">
              <strong>Answer:</strong> MongoDB offers flexible JSON/BSON document modeling, horizontal scaling through sharding, native support for nested multi-dimensional analytics via Aggregation Pipelines, and high-throughput write performance via bulkWrite operations without schema locking.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
            <p className="font-semibold text-cyan-300">Q2: How does indexing improve MongoDB aggregation speed?</p>
            <p className="text-slate-300 leading-relaxed">
              <strong>Answer:</strong> Placing compound indexes on <code className="text-white font-mono">category</code>, <code className="text-white font-mono">region</code>, and <code className="text-white font-mono">orderDate</code> allows the first stage (<code className="text-white font-mono">$match</code>) to execute an indexed collection scan (IXSCAN) rather than a full collection scan (COLLSCAN), reducing query latency from seconds to milliseconds.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
            <p className="font-semibold text-cyan-300">Q3: How are duplicate order IDs handled during CSV ingestion?</p>
            <p className="text-slate-300 leading-relaxed">
              <strong>Answer:</strong> A unique index is enforced on the <code className="text-white font-mono">orderId</code> field. During bulk ingestion, the backend executes an <code className="text-white font-mono">updateOne</code> with <code className="text-white font-mono">$setOnInsert</code> and <code className="text-white font-mono">upsert: true</code> in batches of 1,000, seamlessly ignoring existing duplicate order IDs without aborting the entire stream.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
            <p className="font-semibold text-cyan-300">Q4: How does the MongoDB Aggregation Pipeline compare to MapReduce?</p>
            <p className="text-slate-300 leading-relaxed">
              <strong>Answer:</strong> MongoDB previously used JavaScript-based MapReduce. The Aggregation Pipeline replaces MapReduce with native C++ compiled execution operators, providing significantly faster throughput, lower memory overhead, and declarative syntax.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

