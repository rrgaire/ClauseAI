

import React from 'react';
import { Search, FileText } from 'lucide-react';

export const EvidenceCard = ({ item }) => {
  const formatTitle = (rawId) => {
    if (!rawId) return { company: "REFERENCE", type: "Precedent" };
    
    // Split by double underscore to isolate the Clause Type
    const parts = rawId.split('__');
    // Get the first word of the first part (Company Name)
    const companyInfo = parts[0] ? parts[0].split('_')[0] : "UNKNOWN";
    const clauseType = parts[1] || "General Clause";
    
    return {
      company: companyInfo.replace(/([A-Z])/g, ' $1').trim(),
      type: clauseType
    };
  };

  const { company, type } = formatTitle(item.cuad_id);

  return (
    <div className="p-6 rounded-[2rem] bg-slate-900/40 border border-slate-800 hover:border-indigo-500/30 transition-all group h-full flex flex-col shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
            {company}
          </span>
          <span className="text-xs font-bold text-white tracking-tight leading-tight">
            {type}
          </span> {/* FIXED: Was </div>, now </span> */}
        </div>
        <div className="bg-slate-800 p-2 rounded-lg group-hover:bg-indigo-600/20 transition-colors">
          <Search size={14} className="text-slate-500 group-hover:text-indigo-400" />
        </div>
      </div>
      
      <div className="relative flex-1 mb-4">
        <p className="text-xs text-slate-400 leading-relaxed italic line-clamp-4 pl-4 border-l border-slate-700/50">
          "{item.text}"
        </p>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-800/50 flex justify-between items-center">
        <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">
          Source: CUAD Database
        </span>
        <FileText size={12} className="text-slate-700" />
      </div>
    </div>
  );
};