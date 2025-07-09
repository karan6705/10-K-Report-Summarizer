# 10-K Report Summarizer

A FastAPI-powered service that ingests a U.S. SEC 10-K PDF, extracts key fields via Google’s Gemini GenAI model, and renders a concise annual-report PDF for download.

## Table of Contents

- [Features](#features)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Clone & Install](#clone--install)  
  - [Environment Variables](#environment-variables)  
- [Usage](#usage)  
  - [Run the Server](#run-the-server)  
  - [API Endpoint](#api-endpoint)  
  - [Example Request](#example-request)  
  - [Download the Report](#download-the-report)  
- [How It Works](#how-it-works)  
- [Project Structure](#project-structure)  
- [Schema](#schema)  
- [Contributing](#contributing)  
- [License](#license)

---

## Features

- Upload any 10-K PDF via a simple HTTP POST  
- Automatically parse text with **PyPDF2**  
- Call Google Gemini GenAI to fill a strict Pydantic schema  
- Generate a human-readable Markdown summary  
- Render to PDF with **WeasyPrint**  
- Serve generated reports under `/reports`

---

## Getting Started

### Prerequisites

- Python 3.9+  
- [Poetry](https://python-poetry.org/) **or** `pip` & `venv`  
- A valid **GEMINI_API_KEY** with access to the Gemini 2.0 model

### Clone & Install

```bash
git clone https://github.com/karan6705/10-K-Report-Summarizer.git
cd 10-K-Report-Summarizer/backend
# (optional) python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
Environment Variables
Create a file named .env.proj in backend/ with:

GEMINI_API_KEY=your_google_genai_api_key_here
The app will load this via python-dotenv.

Usage

Run the Server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
API Endpoint
POST /api/extract

Form fields
report (file): the 10-K PDF
model (string, optional): GenAI model name (default: gemini-2.0-flash)
Response
{
  "pdfUrl": "http://localhost:8000/reports/annual_report_CompanyName_2024.pdf"
}
Example Request
curl -X POST "http://localhost:8000/api/extract" \
  -F "report=@/path/to/10-K.pdf" \
  -F "model=gemini-2.0-flash"
Download the Report
Open the returned pdfUrl in your browser or via curl to fetch the generated summary PDF.

How It Works

Extract Text
Uses PyPDF2 to pull raw text from each page.
Build Prompt
Embeds the text and a JSON schema (from a Pydantic AnnualReport model) in a single prompt.
GenAI Call
Sends prompt to Google’s GenAI client, requesting strictly-typed JSON.
Parse & Validate
Loads the JSON directly into the AnnualReport Pydantic model.
Markdown Generation
Formats key fields (revenue, net income, risk factors, etc.) into Markdown.
PDF Rendering
Converts Markdown to HTML via markdown2 and renders to PDF with WeasyPrint.
Project Structure

backend/
├── app.py                # FastAPI app & static mount
├── your_pipeline.py      # Core extract→summarize→PDF pipeline
├── requirements.txt      # Python dependencies
└── .env.proj             # (not checked in) Gemini API key
app.py defines the /api/extract endpoint and serves /reports.
your_pipeline.py handles PDF reading, GenAI calls, schema definition, Markdown building, and PDF output.
Generated PDFs are written to backend/ as annual_report_<Company>_<Year>.pdf and served at http://localhost:8000/reports/.
Schema

The Pydantic AnnualReport model includes:

Field	Type	Description
company_name	str	Company name as reported in the 10-K
cik	str	SEC Central Index Key
fiscal_year_end	datetime	Fiscal year end date
filing_date	datetime	SEC filing date
total_revenue	float?	Total revenue (USD)
net_income	float?	Net income (USD)
total_assets	float?	Total assets at year end (USD)
total_liabilities	float?	Total liabilities at year end (USD)
operating_cash_flow	float?	Cash from operations (USD)
cash_and_equivalents	float?	Cash & equivalents at year end (USD)
num_employees	int?	Number of employees
auditor	str?	External auditor name
business_description	str?	Item 1 overview
risk_factors	List[str]?	Item 1A risk factors
management_discussion	str?	Item 7 MD&A
Contributing

Fork the repo
Create a feature branch (git checkout -b feat/my-change)
Commit changes (git commit -m "Add new feature")
Push (git push origin feat/my-change) and open a Pull Request
Please run black and flake8 to keep code style consistent.
