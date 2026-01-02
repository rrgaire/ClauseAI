import React from 'react';
import { Zap, FileUp, Trash2, Plus, Loader2, ShieldAlert, CheckCircle } from 'lucide-react';
import { useClauseStore } from './hooks/useClauseStore';
import { RiskGauge } from './components/RiskGauge';
import { EvidenceCard } from './components/EvidenceCard';

export default function App() {
  const { 
    clauses, 
    activeId, 
    setActiveId, 
    activeClause, 
    updateActiveText, 
    addClause, 
    deleteClause, 
    runAnalysis 
  } = useClauseStore();

  // Helper to determine badge colors based on the risk score
  const getSeverityStyles = (score) => {
    if (score > 7) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (score > 4) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  };

  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-200 overflow-hidden font-sans">
      
      {/* LEFT NAVIGATION: Clause Manager */}
      <aside className="w-64 border-r border-slate-800 bg-[#000414] flex flex-col shrink-0">
        <div className="p-6 flex flex-col gap-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-[10px] font-black italic">C</div>
            <h1 className="text-xl font-black italic text-indigo-500 uppercase tracking-tighter">ClauseAI</h1>
          </div>
          <button onClick={addClause} className="w-full bg-indigo-600 hover:bg-indigo-500 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20">
            <Plus size={14}/> New Clause
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2 mb-4">Document History</p>
          {clauses.map(c => (
            <div 
              key={c.id} 
              onClick={() => setActiveId(c.id)}
              className={`group flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all border-l-4 ${
                activeId === c.id 
                ? 'bg-indigo-500/10 border-indigo-500 shadow-lg' 
                : 'hover:bg-slate-900 border-transparent'
              }`}
            >
              <div className="flex flex-col truncate">
                <span className={`text-xs font-bold truncate ${activeId === c.id ? 'text-indigo-400' : 'text-slate-500'}`}>
                  {c.title || "Untitled Clause"}
                </span>
                <span className="text-[9px] text-slate-700 uppercase font-black">
                  {c.results ? c.results.clause_type : 'Draft'}
                </span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteClause(c.id); }} 
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-500 transition-opacity"
              >
                <Trash2 size={12}/>
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* CENTER: Editor (Analyze Button Top-Right) */}
      <section className="w-[38%] flex flex-col bg-slate-950 border-r border-slate-800 relative shadow-2xl z-10">
        <div className="h-12 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/10">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Input Workbench</span>
          
          <button 
            onClick={runAnalysis} 
            disabled={activeClause.loading || !activeClause.text} 
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg font-black text-[10px] uppercase shadow-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:bg-slate-800"
          >
            {activeClause.loading ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
            {activeClause.loading ? "Analyzing..." : "Analyze Clause"}
          </button>
        </div>
        <textarea 
          value={activeClause.text} 
          onChange={(e) => updateActiveText(e.target.value)} 
          className="flex-1 p-10 font-serif italic text-slate-300 text-lg leading-relaxed outline-none resize-none bg-transparent placeholder:text-slate-900"
          placeholder="Paste legal text here for intelligence analysis..." 
        />
      </section>

      {/* RIGHT: Results Panel */}
      <section className="flex-1 overflow-y-auto p-12 bg-[#020617] custom-scrollbar">
        {activeClause.results ? (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
            
            {/* 1. Header with Dynamic Severity Badge */}
            <div className="flex justify-between items-end px-2">
              <div>
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Analysis Report</h2>
                <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
                  {activeClause.results.clause_type}
                </h1>
              </div>
              <span className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getSeverityStyles(activeClause.results.risk_score)}`}>
                <ShieldAlert size={12} />
                {activeClause.results.risk_score > 7 ? 'Critical Risk' : 
                 activeClause.results.risk_score > 4 ? 'Moderate Risk' : 'Low Risk'}
              </span>
            </div>

            {/* 2. Risk Gauge with Dynamic Border */}
            <RiskGauge 
              score={activeClause.results.risk_score} 
              reasons={activeClause.results.reasons} 
            />

            {/* 3. Safer Rewrite Section */}
            <div className="space-y-4">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">AI-Optimized Redline</h3>
               <div className="rounded-[2.5rem] overflow-hidden border border-indigo-500/20 bg-indigo-500/5 shadow-2xl">
                <div className="p-10 text-2xl font-serif italic text-indigo-100 leading-relaxed italic">
                  "{activeClause.results.safer_rewrite}"
                </div>
                <div className="bg-slate-900/40 px-10 py-6 flex justify-between items-center border-t border-slate-800/50">
                  <span className="text-xs text-slate-500 italic flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-500" /> 
                    Suggested revision to mitigate identified risks
                  </span>
                  <button 
                    onClick={() => updateActiveText(activeClause.results.safer_rewrite)} 
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                  >
                    Apply Suggestion
                  </button>
                </div>
              </div>
            </div>

            {/* Updated Evidence Section in App.jsx */}
            <div className="space-y-6 pb-20">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  Semantic Precedents & Evidence (Top 6 Matches)
                </h3>
                <span className="text-[10px] text-slate-700 font-bold uppercase">Source: RAG Engine</span>
              </div>

              {/* Grid set to 3 columns to perfectly fit 6 cards (2 rows of 3) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeClause.results.evidence && activeClause.results.evidence.slice(0, 6).map((item, idx) => (
                  <EvidenceCard key={idx} item={item} />
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
            <ShieldAlert size={120} strokeWidth={1} className="text-slate-400 mb-4" />
            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-slate-500">Ready for Intelligence Analysis</h2>
          </div>
        )}
      </section>
    </div>
  );
}