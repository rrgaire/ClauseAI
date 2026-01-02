import React, { useState, useEffect } from 'react';
import { Zap, Trash2, FileUp, Check, ShieldAlert, Search, History } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// PDF Worker Initialization
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

const RiskGauge = ({ score }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 10) * circumference;
  const color = score > 7 ? '#ef4444' : score > 4 ? '#f59e0b' : '#10b981';

  return (
    <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
      <svg className="w-full h-full -rotate-90">
        <circle cx="64" cy="64" r={radius} stroke="#1e293b" strokeWidth="10" fill="transparent" />
        <circle 
          cx="64" cy="64" r={radius} 
          stroke={color} 
          strokeWidth="12" 
          fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          strokeLinecap="round" 
          className="gauge-anim" 
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-white leading-none">{score}</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Score</span>
      </div>
    </div>
  );
};

const Workbench = () => {
  const [text, setText] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // PDF Extraction Logic
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const typedarray = new Uint8Array(event.target.result);
      const pdf = await pdfjsLib.getDocument(typedarray).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(' ') + '\n';
      }
      setText(fullText.trim());
    };
    reader.readAsArrayBuffer(file);
  };

  // Backend API Call
  const runAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clause_text: text }),
      });
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* 1. LEFT SIDEBAR: Context & History */}
      <aside className="w-64 border-r border-slate-800 bg-[#000414] flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-black italic text-white">C</div>
            <h1 className="text-sm font-black tracking-widest uppercase italic">ClauseAI</h1>
          </div>
          <button onClick={() => document.getElementById('pdf-in').click()} 
                  className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-95">
            <FileUp size={14} className="text-indigo-400" /> EXTRACT PDF
          </button>
          <input id="pdf-in" type="file" className="hidden" accept=".pdf" onChange={handlePdfUpload} />
        </div>
        <div className="flex-1 p-4">
          <p className="px-2 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2"><History size={12}/> History</p>
          <div className="bg-indigo-500/10 border-l-2 border-indigo-500 p-3 rounded-r-lg text-xs font-bold text-indigo-400 cursor-pointer">
            Indemnity_Clause_MSA.pdf
          </div>
        </div>
      </aside>

      {/* 2. CENTER PANEL: Editor (38% Fixed Width) */}
      <section className="w-[38%] flex flex-col bg-slate-950 border-r border-slate-800 relative z-10 shadow-2xl">
        <div className="h-12 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-900/10">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Source Input</span>
          <button onClick={() => setText('')} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} 
                  className="flex-1 w-full p-10 font-serif italic text-slate-300 text-lg leading-relaxed outline-none resize-none bg-transparent placeholder:text-slate-900"
                  placeholder="Paste clause or extract PDF..." />
        
        {/* Analyze Button Anchored Bottom Right */}
        <div className="absolute bottom-8 right-8">
          <button onClick={runAnalysis} disabled={loading || !text}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-600/30 flex items-center gap-3 active:scale-95 transition-all">
            {loading ? "Analyzing..." : "Analyze Clause"} <Zap size={16} className={loading ? "animate-pulse" : ""} />
          </button>
        </div>
      </section>

      {/* 3. RIGHT PANEL: Intelligence Panel (Remaining Space) */}
      <section className="flex-1 overflow-y-auto p-12 space-y-12 bg-slate-950 custom-scrollbar">
        {results ? (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
            
            {/* Risk Card */}
            <div className="glass-card p-10 rounded-[2.5rem] border-l-8 border-l-red-500 flex items-center gap-12 shadow-2xl">
              <RiskGauge score={results.risk_score} />
              <div>
                <span className="bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-red-500/20">Critical Exposure Found</span>
                <h2 className="text-3xl font-bold mt-4 tracking-tight uppercase italic">{results.clause_type} Violation</h2>
                <p className="text-slate-500 text-sm mt-2 italic leading-relaxed">System identified {results.reasons?.length || 0} specific legal vulnerabilities based on precedent.</p>
              </div>
            </div>

            {/* Optimized Rewrite */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 tracking-[0.2em]">Optimized Revision</h3>
              <div className="rounded-[2.5rem] overflow-hidden border border-indigo-500/20 bg-indigo-500/5 shadow-2xl">
                <div className="p-10 text-2xl font-serif italic text-indigo-100 leading-relaxed border-b border-slate-800/50">
                  "{results.safer_rewrite}"
                </div>
                <div className="bg-slate-900/40 px-10 py-6 flex justify-between items-center">
                  <span className="text-xs text-slate-500 flex items-center gap-2 italic"><Check size={16} className="text-emerald-500" /> Suggested Redline Available</span>
                  <div className="flex gap-4 uppercase tracking-widest">
                    <button className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase">Dismiss</button>
                    <button onClick={() => setText(results.safer_rewrite)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl text-[10px] font-black shadow-lg shadow-indigo-600/20 transition-all active:scale-95">Apply Change</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence (RAG) Grid */}
            <div className="space-y-4 pb-12">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 tracking-[0.2em]">Semantic Precedents (RAG)</h3>
                <div className="grid grid-cols-2 gap-6">
                    {results.evidence?.map((item, idx) => (
                        <div key={idx} className="glass-card p-6 rounded-[2rem] hover:border-indigo-500/30 transition-all group">
                            <div className="flex justify-between items-center mb-4 uppercase">
                                <span className="text-[10px] font-mono text-indigo-400 font-bold tracking-widest">{item.cuad_id || 'REF-402'}</span>
                                <Search size={12} className="text-slate-700 group-hover:text-indigo-400" />
                            </div>
                            <p className="text-xs text-slate-400 italic leading-relaxed line-clamp-4">"{item.text}"</p>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
            <ShieldAlert size={120} strokeWidth={1} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting Analysis</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Workbench;