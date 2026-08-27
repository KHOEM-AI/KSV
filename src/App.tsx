import React from 'react';
import { Shield, Activity, Cpu, Globe, Lock, AlertTriangle, CheckCircle, Server } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-blue-400">KSV Operations Dashboard</h1>
          <p className="text-xs text-slate-400">Universal Secure Control Platform</p>
        </div>
        <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-500/20">
          System Active
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Cpu className="w-4 h-4" />
            <span className="text-xs font-medium">Devices</span>
          </div>
          <p className="text-lg font-bold">12,847</p>
          <span className="text-[10px] text-emerald-400">↑ 2.4%</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium">Safety Rules</span>
          </div>
          <p className="text-lg font-bold">342</p>
          <span className="text-[10px] text-emerald-400">↑ 12 new</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <Server className="w-4 h-4" />
            <span className="text-xs font-medium">Gateways</span>
          </div>
          <p className="text-lg font-bold">86 <span className="text-xs text-slate-500 font-normal">/ 87</span></p>
          <span className="text-[10px] text-rose-400">↓ 1 offline</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-2 text-purple-400 mb-1">
            <Globe className="w-4 h-4" />
            <span className="text-xs font-medium">Countries</span>
          </div>
          <p className="text-lg font-bold">41 <span className="text-xs text-slate-500 font-normal">/ 195</span></p>
          <span className="text-[10px] text-emerald-400">↑ 3 added</span>
        </div>
      </div>

      {/* Protocol Health */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" /> Protocol Health
        </h2>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
            <span>Bluetooth</span>
            <span className="text-emerald-400 font-mono">99.97%</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
            <span>Wi-Fi</span>
            <span className="text-emerald-400 font-mono">99.92%</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span>MQTT</span>
            <span className="text-emerald-400 font-mono">99.99%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
