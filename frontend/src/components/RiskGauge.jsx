import React from 'react';

export const RiskGauge = ({ score = 0, reasons = [] }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 10) * circumference;
  
  // Color for the SVG Circle
  const color = score > 7 ? '#ef4444' : score > 4 ? '#f59e0b' : '#10b981';

  // Tailwind Class for the Left Border
  // We use score to stay consistent with your gauge logic
  const borderColorClass = score > 7 
    ? 'border-l-red-500' 
    : score > 4 
    ? 'border-l-amber-500' 
    : 'border-l-emerald-500';

  return (
    <div className={`flex items-center gap-10 p-8 rounded-[2.5rem] bg-slate-900/40 border border-slate-800/50 border-l-8 shadow-2xl transition-all duration-500 ${borderColorClass}`}>
      {/* Circle HUD */}
      <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90">
          <circle cx="64" cy="64" r={radius} stroke="#1e293b" strokeWidth="10" fill="transparent" />
          <circle 
            cx="64" cy="64" r={radius} stroke={color} strokeWidth="12" fill="transparent" 
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" 
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-black text-white leading-none">
            {score}<span className="text-sm text-slate-500">/10</span>
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-widest">Score</span>
        </div>
      </div>

      {/* Reasoning Segment inside the Score Area */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-white uppercase italic tracking-tight mb-3">Analysis Findings</h2>
        <ul className="space-y-2">
          {reasons.map((reason, idx) => (
            <li key={idx} className="text-xs text-slate-400 italic flex gap-2">
              <span className="text-indigo-500 font-bold">•</span> {reason}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};