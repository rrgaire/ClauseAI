import { useState } from 'react';
import { callAnalyzeAPI } from '../api/analyze';

export const useClauseStore = () => {
  const [clauses, setClauses] = useState([
    { id: '1', title: 'New Clause', text: '', results: null, loading: false }
  ]);
  const [activeId, setActiveId] = useState('1');

  const activeClause = clauses.find(c => c.id === activeId);

  const updateActiveText = (newText) => {
    setClauses(prev => prev.map(c => c.id === activeId ? { ...c, text: newText } : c));
  };

  const addClause = () => {
    const newId = Date.now().toString();
    setClauses([...clauses, { id: newId, title: 'Untitled Clause', text: '', results: null, loading: false }]);
    setActiveId(newId);
  };

  const deleteClause = (id) => {
    if (clauses.length === 1) return;
    const filtered = clauses.filter(c => c.id !== id);
    setClauses(filtered);
    if (activeId === id) setActiveId(filtered[0].id);
  };

  const runAnalysis = async () => {
    if (!activeClause.text) return;
    
    // Set loading for only the active clause
    setClauses(prev => prev.map(c => c.id === activeId ? { ...c, loading: true } : c));

    try {
      const data = await callAnalyzeAPI(activeClause.text);
      setClauses(prev => prev.map(c => 
        c.id === activeId ? { ...c, results: data, loading: false, title: data.clause_type } : c
      ));
    } catch (err) {
      setClauses(prev => prev.map(c => c.id === activeId ? { ...c, loading: false } : c));
      alert("Analysis failed. Ensure FastAPI is running.");
    }
  };

  return { clauses, activeId, setActiveId, activeClause, updateActiveText, addClause, deleteClause, runAnalysis };
};