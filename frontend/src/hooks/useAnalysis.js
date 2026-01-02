import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { callAnalyzeAPI } from '../api/analyze';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

export const useAnalysis = () => {
  const [text, setText] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Extracts text from PDF files
  const handlePdfUpload = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const typedarray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let extractedText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          extractedText += content.items.map(item => item.str).join(' ') + '\n';
        }
        setText(extractedText.trim());
      } catch (err) {
        console.error("PDF Extraction Error:", err);
        alert("Failed to extract text from PDF.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Triggers the FastAPI /analyze endpoint
  const runAnalysis = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const data = await callAnalyzeAPI(text);
      setResults(data);
    } catch (err) {
      console.error("API Error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { text, setText, results, loading, handlePdfUpload, runAnalysis };
};