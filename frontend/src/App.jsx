// frontend/src/App.jsx

import React, { useState } from 'react';
import './index.css';  // Tailwind imports

export default function App() {
  const [file, setFile] = useState(null);
  const [model, setModel] = useState('gemini-2.0-flash');
  const [loading, setLoading] = useState(false);
  const [outputUrl, setOutputUrl] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setOutputUrl('');
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append('report', file);
    form.append('model', model);

    try {
      const resp = await fetch('/api/extract', {
        method: 'POST',
        body: form,
      });
      if (!resp.ok) throw new Error(`Server error ${resp.status}`);
      const { pdfUrl } = await resp.json();
      setOutputUrl(pdfUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans text-[#5A514A] bg-[#F5F4F1] min-h-screen">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-4 text-[#8B7D7A]">
            Annual Report Extractor
          </h1>
          <p className="text-lg text-[#7D706A] mb-8">
            Transform any SEC 10‑K PDF into a styled summary effortlessly.
            Upload your report, select an AI model, and download within seconds.
          </p>
          <button
            onClick={() => document.getElementById('upload-zone').scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 bg-[#D1CFC9] hover:bg-[#C1BBB3] text-[#5A514A] rounded-full shadow transition"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Upload & Options */}
      <section id="upload-zone" className="py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Extract Your Report</h2>

          {/* Upload Box */}
          <div className="border-2 border-dashed border-[#D1CFC9] rounded-lg p-6 text-center mb-6 hover:border-[#C1BBB3] transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto mb-2 h-8 w-8 text-[#A3958E]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v8m0-8l-3 3m3-3l3 3M16 5l-4-4m0 0L8 5m4-4v12"
              />
            </svg>
            <p className="text-[#7D706A] mb-2">Drag & drop your PDF here, or</p>
            <label className="inline-block px-4 py-2 bg-[#D1CFC9] hover:bg-[#C1BBB3] text-[#5A514A] rounded cursor-pointer transition">
              Choose File
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {file && <p className="mt-2 text-sm">{file.name}</p>}
          </div>

          {/* Model Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Select AI Model</label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full border border-[#D1CFC9] rounded-lg p-3 focus:ring-[#D1CFC9] focus:border-[#C1BBB3]"
            >
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-2.0-pro">Gemini 2.0 Pro</option>
            </select>
          </div>

          {/* Action Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !file}
            className="w-full py-3 bg-[#D1CFC9] hover:bg-[#C1BBB3] text-[#5A514A] font-medium rounded-lg shadow disabled:opacity-50 transition"
          >
            {loading ? 'Processing…' : 'Extract & Download'}
          </button>

          {/* Error & Download */}
          {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
          {outputUrl && (
            <a
              href={outputUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="mt-4 block text-center text-[#8B7D7A] underline hover:text-[#5A514A]"
            >
              Download Extracted PDF
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-[#7D706A]">
        Powered by Google Generative AI • Built with ❤️ using FastAPI & React
      </footer>
    </div>
  );
}

