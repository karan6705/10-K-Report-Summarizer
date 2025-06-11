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
    <div className="font-sans text-gray-800">
      {/* Hero */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl font-extrabold mb-4">
            Annual Report Extractor
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Instantly turn any SEC 10-K PDF into a beautifully formatted summary and data model.
            Upload your filing, choose your AI model, and download your report in seconds.
          </p>
          <button
            onClick={() =>
              document.getElementById('upload-zone')
                .scrollIntoView({ behavior: 'smooth' })
            }
            className="px-8 py-3 bg-indigo-600 text-white rounded-full shadow hover:bg-indigo-700 transition"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Upload & Options */}
      <section id="upload-zone" className="bg-gray-50 py-16">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Extract Your Report</h2>

          {/* Drag & Drop Box */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6 hover:border-indigo-400 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto mb-2 h-12 w-12 text-gray-400"
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
            <p className="text-gray-600">Drag & drop your 10-K PDF here, or</p>
            <label className="mt-2 inline-block px-4 py-2 bg-indigo-600 text-white rounded cursor-pointer hover:bg-indigo-700">
              Choose File
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {file && (
              <p className="mt-2 text-sm text-gray-800">{file.name}</p>
            )}
          </div>

          {/* Model Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Select AI Model
            </label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-2.0-pro">Gemini 2.0 Pro</option>
            </select>
          </div>

          {/* Extract Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !file}
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? 'Processing Report…' : 'Extract & Download'}
          </button>

          {/* Error & Download Link */}
          {error && (
            <p className="mt-4 text-red-500 text-center">{error}</p>
          )}
          {outputUrl && (
            <a
              href={outputUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="mt-4 block text-center text-indigo-600 underline hover:text-indigo-800"
            >
              Download Your Extracted PDF
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          Powered by Google Generative AI • Built with ❤️ using FastAPI & React
        </div>
      </footer>
    </div>
);
}

