# 10-K Report Summarizer

[![Python Version](https://img.shields.io/badge/python-3.9%2B-blue)](https://www.python.org/)  [![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

A FastAPI service that ingests a U.S. SEC 10-K PDF, uses Google Gemini GenAI to extract key fields into a Pydantic schema, and renders a clean annual-report PDF for download.

---

## 📋 Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Server](#running-the-server)
5. [API Usage](#api-usage)
6. [Project Structure](#project-structure)
7. [Data Schema](#data-schema)
8. [Contributing](#contributing)
9. [License](#license)

---

## ✨ Features

* **Upload any 10-K PDF** via HTTP POST
* **Extract text** using PyPDF2
* **Generate JSON** strictly conforming to a Pydantic `AnnualReport` model
* **Compose Markdown** with financials, business overview, risk factors, MD\&A
* **Render to PDF** with WeasyPrint
* **Serve reports** under `/reports`

---

## 🔧 Installation

```bash
# 1. Clone the repo
git clone https://github.com/karan6705/10-K-Report-Summarizer.git
cd 10-K-Report-Summarizer/backend

# 2. (Optional) Create & activate a virtual environment
python -m venv .venv
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt
```

---

## ⚙️ Configuration

Create a file named `.env.proj` in the `backend/` directory:

```bash
cat > .env.proj << EOF
GEMINI_API_KEY=your_google_genai_api_key_here
EOF
```

The app will load this via python-dotenv.

---

## ▶️ Running the Server

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API will be live at `http://localhost:8000`.

---

## 📡 API Usage

### POST `/api/extract`

* **Form fields**

  * `report` (file): your 10-K PDF
  * `model` (string, optional): GenAI model name (default: `gemini-2.0-flash`)

* **Success Response**

  ```json
  {
    "pdfUrl": "http://localhost:8000/reports/annual_report_CompanyName_2024.pdf"
  }
  ```

#### Example curl

```bash
curl -X POST "http://localhost:8000/api/extract" \
  -F "report=@/path/to/10-K.pdf" \
  -F "model=gemini-2.0-flash"
```

Once you receive the `pdfUrl`, fetch it:

```bash
curl -O "http://localhost:8000/reports/annual_report_CompanyName_2024.pdf"
```

---

## 📂 Project Structure

```
backend/
├── app.py              # FastAPI app and static `/reports` mount
├── your_pipeline.py    # PDF→text→GenAI→Pydantic→Markdown→PDF logic
├── requirements.txt    # Python dependencies
└── .env.proj           # (gitignored) Gemini API key
```

Generated PDFs are saved as:

```
annual_report_<Company>_<Year>.pdf
```

---

## 🗂️ Data Schema

The `AnnualReport` Pydantic model includes:

| Field                   | Type         | Description                          |
| ----------------------- | ------------ | ------------------------------------ |
| `company_name`          | `str`        | Company name as reported in the 10-K |
| `cik`                   | `str`        | SEC Central Index Key                |
| `fiscal_year_end`       | `datetime`   | Fiscal year end date                 |
| `filing_date`           | `datetime`   | SEC filing date                      |
| `total_revenue`         | `float?`     | Total revenue (USD)                  |
| `net_income`            | `float?`     | Net income (USD)                     |
| `total_assets`          | `float?`     | Total assets at year end (USD)       |
| `total_liabilities`     | `float?`     | Total liabilities at year end (USD)  |
| `operating_cash_flow`   | `float?`     | Cash from operations (USD)           |
| `cash_and_equivalents`  | `float?`     | Cash & equivalents at year end (USD) |
| `num_employees`         | `int?`       | Number of employees                  |
| `auditor`               | `str?`       | External auditor name                |
| `business_description`  | `str?`       | Item 1 business overview             |
| `risk_factors`          | `List[str]?` | Item 1A risk factors                 |
| `management_discussion` | `str?`       | Item 7 MD\&A                         |

---

## 🤝 Contributing

1. Fork this repository
2. Create a branch:

   ```bash
   git checkout -b feat/my-feature
   ```
3. Commit your changes:

   ```bash
   git commit -m "Add awesome feature"
   ```
4. Push and open a Pull Request
5. Run `black` & `flake8`

---

## 📄 License

This project is released under the [MIT License](LICENSE).
