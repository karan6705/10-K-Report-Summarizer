# backend/your_pipeline.py

import os
import json
from pathlib import Path
from datetime import datetime
from typing import List, Optional

import PyPDF2
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from markdown2 import markdown
from weasyprint import HTML
from google import genai
from google.genai import types

# 1. Load environment
HERE = Path(__file__).parent.resolve()
load_dotenv(HERE / '.env.proj')

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set in .env.proj")

# 2. Initialize GenAI client
client = genai.Client(api_key=API_KEY)

# 3. Define the data schema
class AnnualReport(BaseModel):
    company_name: str = Field(..., description="Name of the company as reported in the 10-K")
    cik: str = Field(..., description="Central Index Key (CIK) identifier assigned by the SEC")
    fiscal_year_end: datetime = Field(..., description="Fiscal year end date")
    filing_date: datetime = Field(..., description="Date when the 10-K was filed with the SEC")
    total_revenue: Optional[float] = Field(None, description="Total revenue for the fiscal year (in USD)")
    net_income: Optional[float] = Field(None, description="Net income (profit) for the fiscal year (in USD)")
    total_assets: Optional[float] = Field(None, description="Total assets at fiscal year end (in USD)")
    total_liabilities: Optional[float] = Field(None, description="Total liabilities at fiscal year end (in USD)")
    operating_cash_flow: Optional[float] = Field(None, description="Net cash provided by operating activities (in USD)")
    cash_and_equivalents: Optional[float] = Field(None, description="Cash and cash equivalents at fiscal year end (in USD)")
    num_employees: Optional[int] = Field(None, description="Number of employees reported")
    auditor: Optional[str] = Field(None, description="Name of the external auditor")
    business_description: Optional[str] = Field(None, description="Company’s business overview (Item 1)")
    risk_factors: Optional[List[str]] = Field(None, description="Key risk factors (Item 1A)")
    management_discussion: Optional[str] = Field(None, description="Management’s Discussion & Analysis (Item 7)")

# 4. PDF → text
def load_file(path: str) -> str:
    with open(path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        return "".join(page.extract_text() or "" for page in reader.pages)

# 5. Core pipeline function
def generate_annual_report(pdf_path: str, model_name: str) -> str:
    # 5.1 Extract text
    text = load_file(pdf_path)

    # 5.2 Build prompt + schema hint
    schema_json = json.dumps(
        AnnualReport.model_json_schema(), indent=2, ensure_ascii=False
    )
    prompt = (
        f"Analyze the following 10-K and fill the data model based on it:\n\n"
        f"{text}\n\n"
        f"Output must strictly conform to this JSON schema:\n\n{schema_json}\n\n"
        "No extra fields allowed."
    )

    # 5.3 Configure GenAI call with Pydantic schema
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=AnnualReport,
    )

    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
        config=config,
    )

    # 5.4 Parse directly into Pydantic model
    ar: AnnualReport = response.parsed

    # 5.5 Build Markdown
    md_lines = [
        f"# {ar.company_name} Annual Report {ar.fiscal_year_end.year}",
        f"**CIK:** {ar.cik}",
        f"**Fiscal Year End:** {ar.fiscal_year_end.strftime('%Y-%m-%d')}",
        f"**Filing Date:** {ar.filing_date.strftime('%Y-%m-%d')}",
        "## Financials"
    ]
    if ar.total_revenue is not None:
        md_lines.append(f"- **Total Revenue:** ${ar.total_revenue:,.2f}")
    if ar.net_income is not None:
        md_lines.append(f"- **Net Income:** ${ar.net_income:,.2f}")
    if ar.total_assets is not None:
        md_lines.append(f"- **Total Assets:** ${ar.total_assets:,.2f}")
    if ar.total_liabilities is not None:
        md_lines.append(f"- **Total Liabilities:** ${ar.total_liabilities:,.2f}")
    if ar.operating_cash_flow is not None:
        md_lines.append(f"- **Operating Cash Flow:** ${ar.operating_cash_flow:,.2f}")
    if ar.cash_and_equivalents is not None:
        md_lines.append(f"- **Cash & Equivalents:** ${ar.cash_and_equivalents:,.2f}")
    if ar.num_employees is not None:
        md_lines.append(f"- **Number of Employees:** {ar.num_employees}")
    if ar.auditor:
        md_lines.append(f"- **Auditor:** {ar.auditor}")

    if ar.business_description:
        md_lines += ["\n## Business Description", ar.business_description]
    if ar.risk_factors:
        md_lines += ["\n## Risk Factors"] + [f"- {rf}" for rf in ar.risk_factors]
    if ar.management_discussion:
        md_lines += ["\n## Management Discussion & Analysis", ar.management_discussion]

    md = "\n\n".join(md_lines)

    # 5.6 Render to PDF
    html = markdown(md)
    company_slug = ar.company_name.replace(" ", "_")
    out_name = f"annual_report_{company_slug}_{ar.fiscal_year_end.year}.pdf"
    HTML(string=html).write_pdf(out_name)

    return out_name
