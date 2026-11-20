import React from 'react';
  import { NavLink } from 'react-router-dom';
  import {
    LayoutDashboard,
    Database,
    BarChart3,
    Lightbulb,
    BookOpen,
    Activity,
    Layers,
    Server,
    X,
  } from 'lucide-react';

  export default function Sidebar({ dbStatus = 'connected', isOpen = true, onClose }) {
    const navItems = [
      {
        path: '/',
        label: 'Dashboard',
        icon: LayoutDashboard,
        desc: 'KPIs & Overview',
      },
      {
        path: '/data',
        label: 'Data Management',
        icon: Database,
        desc: 'CSV Upload & Table',
      },
      {
        path: '/analytics',
        label: 'Analytics',
        icon: BarChart3,
        desc: 'Aggregation Pipelines',
      },
      {
        path: '/insights',
        label: 'Data Insights',
        icon: Lightbulb,
        desc: 'Automated Analytics',
      },
      {
        path: '/about',
        label: 'System Architecture',
        icon: BookOpen,
        desc: 'Documentation & FAQ',
      },
    ];

    return (
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#090e1c] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 flex flex-col h-full">
          {/* Logo / Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight leading-none">
                  BDA Analytics
                </h1>
                <p className="text-[11px] text-cyan-400 font-mono mt-1">MongoDB Pipeline</p>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 flex-1 space-y-1.5 overflow-y-auto pr-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Core Modules
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/5'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/80 hover:border-slate-800/60 border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-5 h-5 transition-colors ${
                          isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <div className="flex flex-col text-left">
                        <span className="leading-tight">{item.label}</span>
                        <span className="text-[10px] text-slate-500 font-normal leading-tight">
                          {item.desc}
                        </span>
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Database & Stack Status Pill in Footer */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center space-x-2 text-slate-400">
                  <Server className="w-3.5 h-3.5 text-slate-400" />
                  <span>MongoDB Engine</span>
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    dbStatus === 'connected'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse ${
                      dbStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  {dbStatus === 'connected' ? 'Connected' : 'Connecting'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                Port: 27017 • Aggregations Active
              </p>
            </div>

            <div className="flex items-center justify-between px-2 text-[11px] text-slate-500">
              <span>Enterprise Edition</span>
              <span className="font-mono text-cyan-500/80">v1.0.0</span>
            </div>
          </div>
        </div>
      </aside>
    );
  }

